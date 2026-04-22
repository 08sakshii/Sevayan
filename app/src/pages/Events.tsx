import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CalendarX } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import type { Event, EventFilters } from '@/types';

export function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const { getUpcomingEvents, isLoading } = useEvents();

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const initialFilters: EventFilters = {};
    if (category) initialFilters.category = category;
    if (city) initialFilters.city = city;
    setFilters(initialFilters);
  }, [searchParams]);

  const fetchEvents = useCallback(async () => {
    const upcomingEvents = await getUpcomingEvents(filters);
    setEvents(upcomingEvents);
  }, [getUpcomingEvents, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Upcoming Events
          </h1>
          <p className="text-gray-600">
            Discover social impact events happening across Maharashtra
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            showSearch={true}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {isLoading ? (
              'Loading events...'
            ) : (
              <>Showing <span className="font-semibold">{events.length}</span> events</>
            )}
          </p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn&apos;t find any events matching your filters. 
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
