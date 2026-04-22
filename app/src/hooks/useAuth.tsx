import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { supabase } from '@/lib/supabase';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileToUser(row: { id: string; name: string; email: string; role: string; created_at: string }): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User['role'],
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('id, name, email, role, created_at').eq('id', userId).single();
    if (error || !data) return null;
    return profileToUser(data);
  };

  useEffect(() => {
    let isMounted = true;

    const clearUser = () => {
      if (!isMounted) return;
      setUser(null);
    };

    const setUserFromSession = async (session: { user?: { id?: string } } | null) => {
      const userId = session?.user?.id;
      if (!userId) {
        clearUser();
        return;
      }

      const profile = await fetchProfile(userId);
      if (profile) {
        if (!isMounted) return;
        setUser(profile);
        return;
      }

      // Session exists but cannot load profile (missing/invalid) — force clean sign-out
      await supabase.auth.signOut();
      clearUser();
    };

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          clearUser();
        } else {
          await setUserFromSession(data.session);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Refresh failures can leave a stale/invalid token in storage. Clean it up globally.
      if (event === 'TOKEN_REFRESH_FAILED') {
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // continue cleanup
        } finally {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-') || key === 'seva-auth-token') {
              localStorage.removeItem(key);
            }
          });
          clearUser();
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        clearUser();
        return;
      }

      await setUserFromSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) {
        return { success: false, error: error.message ?? 'Invalid email or password' };
      }
      if (data.user?.id) {
        const profile = await fetchProfile(data.user.id);
        setUser(profile ?? null);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: data.role } },
      });
      if (signUpError) {
        return { success: false, error: signUpError.message ?? 'Registration failed' };
      }
      const userId = authData.user?.id;
      if (!userId) return { success: false, error: 'Registration failed. Please try again.' };

      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      if (profileError) {
        return { success: false, error: profileError.message ?? 'Email may already be registered' };
      }

      // If Supabase returns a session (e.g. email confirmation disabled), set user and redirect
      if (authData.session) {
        const profile = await fetchProfile(userId);
        setUser(profile ?? null);
        return { success: true };
      }
      // Email confirmation required: do not set user; show message so user knows to check email
      return {
        success: false,
        error: 'Please check your email to confirm your account, then sign in.',
      };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // continue cleanup even if signOut throws
    } finally {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key === 'seva-auth-token') {
          localStorage.removeItem(key);
        }
      });
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isOrganizer: user?.role === 'ORGANIZER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
