import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  LogOut, 
  Loader2, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import type { Registration, Event } from '@/types';
import { CATEGORIES, PLACEHOLDER_EVENT_IMAGE } from '@/constants';

interface RegistrationWithEvent extends Registration {
  event?: Event;
}

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getUserRegistrations, isLoading: eventsLoading } = useEvents();
  
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchRegistrations = async () => {
      if (!user) return;
      setIsLoading(true);
      const regs = await getUserRegistrations(user.id);
      setRegistrations(regs);
      setIsLoading(false);
    };

    fetchRegistrations();
  }, [user, isAuthenticated, authLoading, navigate, getUserRegistrations]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isEventPast = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate < today;
  };

  const upcomingRegistrations = registrations.filter(r => r.event && !isEventPast(r.event.date));
  const pastRegistrations = registrations.filter(r => r.event && isEventPast(r.event.date));

  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </main>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-green-600" />
                  </div>
                  
                  {/* User Info */}
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  
                  <Badge 
                    className="mt-3" 
                    variant={user.role === 'ORGANIZER' ? 'default' : 'secondary'}
                  >
                    {user.role === 'ORGANIZER' ? 'Organizer' : 'Volunteer'}
                  </Badge>

                  {/* Stats */}
                  <div className="w-full mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {registrations.length}
                        </p>
                        <p className="text-sm text-gray-500">Total Events</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {upcomingRegistrations.length}
                        </p>
                        <p className="text-sm text-gray-500">Upcoming</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <Button
                    variant="outline"
                    className="w-full mt-6 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>My Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingRegistrations.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastRegistrations.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="mt-6">
                    {isLoading || eventsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                    ) : upcomingRegistrations.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingRegistrations.map((registration) => {
                          const event = registration.event;
                          if (!event) return null;
                          const category = CATEGORIES.find(c => c.id === event.categoryId);

                          return (
                            <div
                              key={registration.id}
                              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              {/* Event Image */}
                              <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={event.image || PLACEHOLDER_EVENT_IMAGE}
                                  alt={event.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Event Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <Badge
                                      className="mb-2"
                                      style={{ 
                                        backgroundColor: `${category?.color}20`,
                                        color: category?.color,
                                        borderColor: category?.color
                                      }}
                                      variant="outline"
                                    >
                                      {category?.name}
                                    </Badge>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                      {event.name}
                                    </h3>
                                  </div>
                                  <Badge variant="outline" className="flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                    Registered
                                  </Badge>
                                </div>

                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-green-600" />
                                    {formatDate(event.date)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                    {event.duration}
                                  </div>
                                  <div className="flex items-center col-span-2 sm:col-span-1">
                                    <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                                    {event.city}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex sm:flex-col gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/events/${event.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          You haven&apos;t registered for any upcoming events.{' '}
                          <button
                            onClick={() => navigate('/events')}
                            className="text-green-600 hover:underline font-medium"
                          >
                            Browse events
                          </button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="mt-6">
                    {isLoading || eventsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                    ) : pastRegistrations.length > 0 ? (
                      <div className="space-y-4">
                        {pastRegistrations.map((registration) => {
                          const event = registration.event;
                          if (!event) return null;
                          const category = CATEGORIES.find(c => c.id === event.categoryId);

                          return (
                            <div
                              key={registration.id}
                              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg opacity-75"
                            >
                              {/* Event Image */}
                              <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={event.image || PLACEHOLDER_EVENT_IMAGE}
                                  alt={event.name}
                                  className="w-full h-full object-cover grayscale"
                                />
                              </div>

                              {/* Event Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <Badge
                                      className="mb-2"
                                      style={{ 
                                        backgroundColor: `${category?.color}20`,
                                        color: category?.color,
                                        borderColor: category?.color
                                      }}
                                      variant="outline"
                                    >
                                      {category?.name}
                                    </Badge>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                      {event.name}
                                    </h3>
                                  </div>
                                  <Badge variant="outline" className="flex-shrink-0">
                                    <XCircle className="w-3 h-3 mr-1 text-gray-500" />
                                    Completed
                                  </Badge>
                                </div>

                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-green-600" />
                                    {formatDate(event.date)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                    {event.duration}
                                  </div>
                                  <div className="flex items-center col-span-2 sm:col-span-1">
                                    <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                                    {event.city}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          No past events found. Your participation history will appear here.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
