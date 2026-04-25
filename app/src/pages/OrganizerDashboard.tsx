import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Edit2, 
  Trash2, 
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import type { Event } from '@/types';
import { CATEGORIES, PLACEHOLDER_EVENT_IMAGE } from '@/constants';

export function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, isLoading: authLoading } = useAuth();
  const { getOrganizerEvents, getEventParticipants, deleteEvent, isLoading: eventsLoading } = useEvents();
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [participantsMap, setParticipantsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isOrganizer) {
      navigate('/');
      return;
    }

    const fetchEvents = async () => {
      if (!user) return;
      setIsLoading(true);
      const { upcoming, past } = await getOrganizerEvents(user.id);
      setUpcomingEvents(upcoming);
      setPastEvents(past);

      // Get participant counts
      const counts: Record<string, number> = {};
      await Promise.all(
        [...upcoming, ...past].map(async (event) => {
          const participants = await getEventParticipants(event.id);
          counts[event.id] = participants.length;
        })
      );
      setParticipantsMap(counts);

      setIsLoading(false);
    };

    fetchEvents();
  }, [user, isAuthenticated, isOrganizer, authLoading, navigate, getOrganizerEvents, getEventParticipants]);

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    const result = await deleteEvent(eventToDelete.id);
    if (result.success) {
      setUpcomingEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setPastEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setParticipantsMap(prev => {
        const next = { ...prev };
        delete next[eventToDelete.id];
        return next;
      });
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalParticipants = Object.values(participantsMap).reduce((a, b) => a + b, 0);

  if (authLoading || !user || !isOrganizer) {
    if (authLoading) {
      return (
        <main className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </main>
      );
    }
    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your events and track participation</p>
          </div>
          <Button
            className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/organizer/events/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {upcomingEvents.length + pastEvents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {upcomingEvents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Past Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pastEvents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Participants</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalParticipants}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>My Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastEvents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6">
                {isLoading || eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      
                      const participants = participantsMap[event.id] || 0;

                      return (
                        <div
                          key={event.id}
                          className="flex flex-col lg:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          {/* Event Image */}
                          <div className="w-full lg:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
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
                                {/* <Badge
                                  className="mb-2"
                                  style={{ 
                                    backgroundColor: `${category?.color}20`,
                                    color: category?.color,
                                    borderColor: category?.color
                                  }}
                                  variant="outline"
                                >
                                  {category?.name}
                                </Badge> */}
                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                  {event.name}
                                </h3>
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-green-600" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                {event.duration}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                                {event.city}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 text-purple-600" />
                                {participants} registered
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(event)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>No upcoming events. Create your first event to get started.</span>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/organizer/events/create')}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Event
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                {isLoading || eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                ) : pastEvents.length > 0 ? (
                  <div className="space-y-4">
                    {pastEvents.map((event) => {
                      const category = CATEGORIES.find(c => c.id === event.categoryId);
                      const participants = participantsMap[event.id] || 0;

                      return (
                        <div
                          key={event.id}
                          className="flex flex-col lg:flex-row gap-4 p-4 border rounded-lg opacity-75"
                        >
                          {/* Event Image */}
                          <div className="w-full lg:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
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
                              <Badge variant="secondary">Completed</Badge>
                            </div>

                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-green-600" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                {event.duration}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                                {event.city}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 text-purple-600" />
                                {participants} participated
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
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
                      No past events found. Your completed events will appear here.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{eventToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
