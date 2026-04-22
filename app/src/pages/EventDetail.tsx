import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  ArrowLeft, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import type { Event } from '@/types';
import { CATEGORIES, PLACEHOLDER_EVENT_IMAGE } from '@/constants';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const { getEventById, registerForEvent, isLoading } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const eventData = await getEventById(id);
      setEvent(eventData);
    };
    fetchEvent();
  }, [id, getEventById]);

  // Set browser tab title to event name (not UUID)
  useEffect(() => {
    const defaultTitle = 'Sevayan - Social Impact Platform';
    if (event?.name) {
      document.title = `${event.name} | Sevayan`;
    } else {
      document.title = defaultTitle;
    }
    return () => {
      document.title = defaultTitle;
    };
  }, [event?.name]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!user || !id) return;

    // Prevent organizers from registering for events
    if (isOrganizer) {
      setRegistrationStatus({
        success: false,
        message: 'Organizers cannot register for events.',
      });
      return;
    }

    setIsRegistering(true);
    setRegistrationStatus(null);

    const result = await registerForEvent(user.id, id);
    
    setRegistrationStatus({
      success: result.success,
      message: result.error || 'Successfully registered for this event!',
    });
    setIsRegistering(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  if (isLoading || !event) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </main>
    );
  }

  const category = CATEGORIES.find(c => c.id === event.categoryId);
  const daysLeft = getDaysLeft(event.date);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/events')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden">
              <img
                src={event.image || PLACEHOLDER_EVENT_IMAGE}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              

              {/* Days Left */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                <span className={`text-sm font-semibold ${
                  daysLeft <= 3 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                  {event.name}
                </h1>
                <p className="text-white/90 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  {event.organizationName}
                </p>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About This Event
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Event Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Duration</p>
                      <p className="text-gray-600">{event.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                      <p className="text-gray-500 text-sm">{event.city}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Register for this Event
                </h3>

                {registrationStatus && (
                  <Alert className={registrationStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                    <AlertDescription className="flex items-center">
                      {registrationStatus.success ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                      )}
                      <span className={registrationStatus.success ? 'text-green-800' : 'text-red-800'}>
                        {registrationStatus.message}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleRegister}
                  disabled={isRegistering || registrationStatus?.success || isOrganizer}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : !isAuthenticated ? (
                    'Login to Register'
                  ) : isOrganizer ? (
                    'Organizers cannot register'
                  ) : registrationStatus?.success ? (
                    'Registered'
                  ) : (
                    'Register Now'
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 text-center">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => navigate('/register')}
                      className="text-green-600 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Map Card */}
            {event.mapLink && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Location
                  </h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Map Preview</p>
                    </div>
                  </div>
                  <a
                    href={event.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Maps
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
