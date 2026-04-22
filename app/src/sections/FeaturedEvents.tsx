import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import type { Event } from '@/types';

export function FeaturedEvents() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const { getUpcomingEvents, isLoading } = useEvents();

  useEffect(() => {
    const fetchEvents = async () => {
      const upcomingEvents = await getUpcomingEvents();
      setEvents(upcomingEvents.slice(0, 6));
    };
    fetchEvents();
  }, [getUpcomingEvents]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = section.querySelectorAll('.event-card-wrapper');
            cards.forEach((card, index) => {
              const element = card as HTMLElement;
              setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    // Set initial state
    const cards = section.querySelectorAll('.event-card-wrapper');
    cards.forEach((card) => {
      const element = card as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });

    return () => observer.disconnect();
  }, [events]);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Find social impact events near you and be part of the change.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 sm:mt-0 border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => navigate('/events')}
          >
            View All Events
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="event-card-wrapper">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No upcoming events found.</p>
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/events')}
            >
              Browse All Events
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
