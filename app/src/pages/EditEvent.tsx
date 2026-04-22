import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { CATEGORIES, MAHARASHTRA_CITIES } from '@/constants';
import type { Event } from '@/types';

export function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, isLoading: authLoading } = useAuth();
  const { getEventById, updateEvent, isLoading } = useEvents();

  const [_event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    date: '',
    duration: '',
    city: '',
    location: '',
    mapLink: '',
    organizationName: '',
    image:''
  });
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsFetching(true);
      const eventData = await getEventById(id);
      
      if (eventData) {
        // Check if user owns this event
        if (eventData.createdBy !== user?.id) {
          navigate('/organizer');
          return;
        }

        // Check if event is in the past
        const today = new Date().toISOString().split('T')[0];
        if (eventData.date < today) {
          navigate('/organizer');
          return;
        }

        setEvent(eventData);
        setFormData({
          name: eventData.name,
          categoryId: eventData.categoryId,
          description: eventData.description,
          date: eventData.date,
          duration: eventData.duration,
          city: eventData.city,
          location: eventData.location,
          mapLink: eventData.mapLink || '',
          organizationName: eventData.organizationName,
          image:eventData.image || '',
        });
      } else {
        navigate('/organizer');
      }
      setIsFetching(false);
    };

    if (isAuthenticated && isOrganizer) {
      fetchEvent();
    }
  }, [id, user, isAuthenticated, isOrganizer, navigate, getEventById]);

  // Wait for auth to load, then redirect if not organizer
  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </main>
    );
  }
  if (!isAuthenticated || !isOrganizer) {
    navigate('/');
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Event name is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return;
    }
    if (!formData.city) {
      setError('Please select a city');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!id) return;

    const result = await updateEvent(id, {
      name: formData.name,
      categoryId: formData.categoryId,
      description: formData.description,
      date: formData.date,
      duration: formData.duration,
      city: formData.city,
      location: formData.location,
      mapLink: formData.mapLink,
      organizationName: formData.organizationName,
      image: formData.image,
    });

    if (result.success) {
      navigate('/organizer');
    } else {
      setError(result.error || 'Failed to update event');
    }
  };

  if (isFetching) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/organizer')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-name">Event Name *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="edit-event-name"
                    name="eventName"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleChange('categoryId', value)}
                >
                  <SelectTrigger id="edit-event-category" aria-label="Category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-description">Description</Label>
                <Textarea
                  id="edit-event-description"
                  name="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Date and Duration */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-event-date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-duration">Duration *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-event-duration"
                      name="duration"
                      placeholder="e.g., 4 hours"
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* City and Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-city">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleChange('city', value)}
                  >
                    <SelectTrigger id="edit-event-city" aria-label="City">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAHARASHTRA_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-event-location"
                      name="location"
                      placeholder="Exact location address"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Map Link */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-mapLink">Google Maps Link (Optional)</Label>
                <Input
                  id="edit-event-mapLink"
                  name="mapLink"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapLink}
                  onChange={(e) => handleChange('mapLink', e.target.value)}
                />
              </div>

              {/* Organization and Image */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-organizationName">Organization Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-event-organizationName"
                      name="organizationName"
                      placeholder="Your organization name"
                      value={formData.organizationName}
                      onChange={(e) => handleChange('organizationName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-image">Image URL (optional)</Label>
                  <div className="relative">
                    <Input
                      id="edit-event-image"
                      name="image"
                      type="url"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => handleChange('image', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Event...
                    </>
                  ) : (
                    'Update Event'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/organizer')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
