import type { Category, MaharashtraCity } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'cleanliness',
    name: 'Cleanliness',
    type: 'CLEANLINESS',
    description: 'Beach, river, road, and temple cleaning drives',
    icon: 'Sparkles',
    color: '#06b6d4',
  },
  {
    id: 'plantation',
    name: 'Plantation',
    type: 'PLANTATION',
    description: 'Tree plantation and plant distribution events',
    icon: 'TreePine',
    color: '#22c55e',
  },
  {
    id: 'donation',
    name: 'Donation',
    type: 'DONATION',
    description: 'Blood, food, clothes, and books donation camps',
    icon: 'Heart',
    color: '#f97316',
  },
];

/** All 36 districts of Maharashtra in alphabetical order */
export const MAHARASHTRA_CITIES: MaharashtraCity[] = [
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
];

export const CATEGORY_SUBTYPES: Record<string, string[]> = {
  cleanliness: ['River cleaning', 'Road cleaning', 'Temple/Fort cleaning', 'Village cleanliness'],
  plantation: ['Tree plantation', 'Plant distribution'],
  donation: ['Blood donation', 'Food donation', 'Clothes donation', 'Books donation'],
};

export const PLATFORM_STATS = {
  totalEvents: 500,
  totalVolunteers: 10000,
  citiesCovered: 36,
};

export const STORAGE_KEYS = {
  USER: 'seva_user',
  TOKEN: 'seva_token',
  REGISTRATIONS: 'seva_registrations',
  EVENTS: 'seva_events',
};

export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORGANIZER_DASHBOARD: '/organizer',
  CREATE_EVENT: '/organizer/events/create',
  EDIT_EVENT: '/organizer/events/:id/edit',
};

/** Fallback image when event has no image URL (avoids 404 for /placeholder-event.jpg). */
export const PLACEHOLDER_EVENT_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23e5e7eb" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EEvent%3C/text%3E%3C/svg%3E';
