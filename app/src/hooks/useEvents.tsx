import { useState, useCallback } from 'react';
import type { Event, EventFilters, Registration } from '@/types';
import { supabase } from '@/lib/supabase';

type EventRow = {
  id: string;
  name: string;
  description: string;
  date: string;
  duration: string;
  city: string;
  location: string;
  map_link: string | null;
  image: string | null;
  organization_name: string;
  created_by: string;
  category_id: string;
  created_at: string;
};

function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    description: row.description,
    date: row.date,
    duration: row.duration,
    city: row.city,
    location: row.location,
    mapLink: row.map_link ?? undefined,
    organizationName: row.organization_name,
    createdBy: row.created_by,
    image: row.image ?? undefined,
    createdAt: row.created_at,
  };
}

type RegistrationRow = {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
};

function rowToRegistration(row: RegistrationRow, event?: Event): Registration {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    registrationDate: row.registration_date,
    ...(event && { event }),
  };
}

export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maybeHandleAuthError = useCallback(async (err: unknown) => {
    const e = err as { status?: number; message?: string } | null | undefined;
    const message = (e?.message ?? '').toLowerCase();
    const status = e?.status;

    const isAuthRelated =
      status === 401 ||
      status === 403 ||
      message.includes('jwt') ||
      message.includes('invalid token') ||
      message.includes('token') && message.includes('expired') ||
      message.includes('refresh token');

    if (!isAuthRelated) return false;

    // Ensure stale/invalid tokens are removed and UI can recover cleanly
    setError('Your session expired. Please log in again.');
    return true;
  }, []);

  const getUpcomingEvents = useCallback(async (filters?: EventFilters): Promise<Event[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });

      if (filters?.category) query = query.eq('category_id', filters.category);
      if (filters?.city) query = query.eq('city', filters.city);
      if (filters?.date) query = query.eq('date', filters.date);

      const { data, error } = await query;
      if (error) {
        if (!(await maybeHandleAuthError(error))) {
          setError('Failed to fetch events');
        }
        return [];
      }
      return (data ?? []).map(rowToEvent);
    } catch {
      setError('Failed to fetch events');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const getEventById = useCallback(async (eventId: string): Promise<Event | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error || !data) {
        if (error) await maybeHandleAuthError(error);
        return null;
      }
      return rowToEvent(data as EventRow);
    } catch {
      setError('Failed to fetch event');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const getOrganizerEvents = useCallback(async (organizerId: string): Promise<{ upcoming: Event[]; past: Event[] }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', organizerId)
        .order('date', { ascending: true });
      if (error) {
        await maybeHandleAuthError(error);
        return { upcoming: [], past: [] };
      }
      const today = new Date().toISOString().split('T')[0];
      const all = (data ?? []).map((r) => rowToEvent(r as EventRow));
      const upcoming = all.filter((e) => e.date >= today);
      const past = all.filter((e) => e.date < today).reverse();
      return { upcoming, past };
    } catch {
      setError('Failed to fetch organizer events');
      return { upcoming: [], past: [] };
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const registerForEvent = useCallback(async (userId: string, eventId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: fetchErr } = await supabase.from('events').select('id').eq('id', eventId).single();
      if (fetchErr) {
        await maybeHandleAuthError(fetchErr);
        return { success: false, error: 'Event not found' };
      }

      const { error: insertErr } = await supabase.from('registrations').insert({
        user_id: userId,
        event_id: eventId,
      });
      if (insertErr) {
        if (insertErr.code === '23505') {
          return { success: false, error: 'You are already registered for this event' };
        }
        const message = insertErr.message?.toLowerCase() ?? '';
        if (message.includes('row-level security')) {
          return { success: false, error: 'You are not allowed to register for this event.' };
        }
        await maybeHandleAuthError(insertErr);
        return { success: false, error: insertErr.message ?? 'Registration failed. Please try again.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const getUserRegistrations = useCallback(async (userId: string): Promise<Registration[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: regData, error: regErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userId);
      if (regErr) {
        if (!(await maybeHandleAuthError(regErr))) {
          setError('Failed to fetch registrations');
        }
        return [];
      }
      const regs = (regData ?? []) as RegistrationRow[];
      if (regs.length === 0) return [];
      const eventIds = [...new Set(regs.map((r) => r.event_id))];
      const { data: eventsData, error: eventsErr } = await supabase.from('events').select('*').in('id', eventIds);
      if (eventsErr) await maybeHandleAuthError(eventsErr);
      const eventsMap = new Map(((eventsData ?? []) as EventRow[]).map((e) => [e.id, rowToEvent(e)]));
      return regs.map((r) => rowToRegistration(r, eventsMap.get(r.event_id)));
    } catch {
      setError('Failed to fetch registrations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const getEventParticipants = useCallback(async (eventId: string): Promise<Registration[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('registrations').select('*').eq('event_id', eventId);
      if (error) {
        if (!(await maybeHandleAuthError(error))) {
          setError('Failed to fetch participants');
        }
        return [];
      }
      return (data ?? []).map((r) => rowToRegistration(r as RegistrationRow));
    } catch {
      setError('Failed to fetch participants');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const createEvent = useCallback(
    async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<{ success: boolean; event?: Event; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: insertErr } = await supabase
          .from('events')
          .insert({
            name: eventData.name,
            description: eventData.description,
            date: eventData.date,
            duration: eventData.duration,
            city: eventData.city,
            location: eventData.location,
            map_link: eventData.mapLink ?? null,
            image: eventData.image ?? null,
            organization_name: eventData.organizationName,
            created_by: eventData.createdBy,
            category_id: eventData.categoryId,
          })
          .select()
          .single();
        if (insertErr) {
          await maybeHandleAuthError(insertErr);
          return { success: false, error: insertErr.message ?? 'Failed to create event. Please try again.' };
        }
        if (!data) return { success: false, error: 'Failed to create event. Please try again.' };
        return { success: true, event: rowToEvent(data as EventRow) };
      } catch {
        return { success: false, error: 'Failed to create event. Please try again.' };
      } finally {
        setIsLoading(false);
      }
    },
    [maybeHandleAuthError]
  );

  const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (eventData.name != null) payload.name = eventData.name;
      if (eventData.description != null) payload.description = eventData.description;
      if (eventData.date != null) payload.date = eventData.date;
      if (eventData.duration != null) payload.duration = eventData.duration;
      if (eventData.city != null) payload.city = eventData.city;
      if (eventData.location != null) payload.location = eventData.location;
      if (eventData.mapLink !== undefined) payload.map_link = eventData.mapLink ?? null;
      if (eventData.image !== undefined) payload.image = eventData.image ?? null;
      if (eventData.organizationName != null) payload.organization_name = eventData.organizationName;
      if (eventData.categoryId != null) payload.category_id = eventData.categoryId;

      const { error: updateErr } = await supabase.from('events').update(payload).eq('id', eventId);
      if (updateErr) {
        await maybeHandleAuthError(updateErr);
        return { success: false, error: updateErr.message ?? 'Failed to update event. Please try again.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update event. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  const deleteEvent = useCallback(async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteErr } = await supabase.from('events').delete().eq('id', eventId);
      if (deleteErr) {
        await maybeHandleAuthError(deleteErr);
        return { success: false, error: deleteErr.message ?? 'Failed to delete event. Please try again.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to delete event. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, [maybeHandleAuthError]);

  return {
    isLoading,
    error,
    getUpcomingEvents,
    getEventById,
    getOrganizerEvents,
    registerForEvent,
    getUserRegistrations,
    getEventParticipants,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
