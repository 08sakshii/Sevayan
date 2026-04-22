import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types';
import { CATEGORIES, PLACEHOLDER_EVENT_IMAGE } from '@/constants';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

export function EventCard({ event, showActions = true }: EventCardProps) {
  const navigate = useNavigate();
  const category = CATEGORIES.find(c => c.id === event.categoryId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysLeft = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysLeft(event.date);

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image || PLACEHOLDER_EVENT_IMAGE}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Category Badge */}
        <Badge
          className="absolute top-3 left-3 text-white border-0"
          style={{ backgroundColor: category?.color || '#16a34a' }}
        >
          {category?.name || 'Event'}
        </Badge>

        {/* Days Left Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className={`text-xs font-semibold ${
            daysLeft <= 3 ? 'text-red-600' : 'text-green-600'
          }`}>
            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
          </span>
        </div>

        {/* Organization */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white/90 text-sm font-medium truncate">
            {event.organizationName}
          </p>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
          {event.name}
        </h3>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-green-600" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-green-600" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            <span className="truncate">{event.city}</span>
          </div>
        </div>

        {/* Action */}
        {showActions && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 group/btn"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
