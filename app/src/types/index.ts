// User Types
export type UserRole = 'USER' | 'ORGANIZER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Category Types (id, name, type, description match DB; icon & color are frontend-only for UI)
export type CategoryType = 'CLEANLINESS' | 'PLANTATION' | 'DONATION';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description: string;
  /** Frontend-only: Lucide icon name for display. Not in DB. */
  icon?: string;
  /** Frontend-only: Hex color for badges. Not in DB. */
  color?: string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  date: string;
  duration: string;
  city: string;
  location: string;
  mapLink?: string;
  organizationName: string;
  createdBy: string;
  image?: string;
  createdAt: string;
}

// Registration Types
export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: string;
  event?: Event;
}

// Filter Types
export interface EventFilters {
  category?: string;
  city?: string;
  date?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Form Types
export interface EventFormData {
  name: string;
  categoryId: string;
  description: string;
  date: string;
  duration: string;
  city: string;
  location: string;
  mapLink?: string;
  organizationName: string;
  image?: string;
}

// Dashboard Stats
export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalParticipants: number;
}

// City options (36 districts of Maharashtra, alphabetical)
export const MAHARASHTRA_CITIES = [
  'Ahmednagar (Ahilyanagar)',
  'Akola',
  'Amravati',
  'Aurangabad (Chhatrapati Sambhaji Nagar)',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai City',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Osmanabad (Dharashiv)',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
] as const;

export type MaharashtraCity = (typeof MAHARASHTRA_CITIES)[number];
