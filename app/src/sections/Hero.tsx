import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Animate elements on load
    const elements = hero.querySelectorAll('.animate-on-load');
    elements.forEach((el, index) => {
      const element = el as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 + index * 150);
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[600px] flex items-center pt-16 overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="animate-on-load inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Make a difference today
              </div>
              
              <h1 className="animate-on-load text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Make a Difference in{' '}
                <span className="text-green-600">Maharashtra</span>
              </h1>
              
              <p className="animate-on-load text-lg text-gray-600 max-w-xl leading-relaxed">
                Join social impact events - cleanliness drives, tree plantations, 
                and donation campaigns happening across your city. Be the change 
                you want to see in your community.
              </p>
            </div>

            {/* Stats */}
            <div className="animate-on-load flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-500">Events</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-500">Volunteers</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">36</p>
                  <p className="text-sm text-gray-500">Districts</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="animate-on-load flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                onClick={() => navigate('/events')}
              >
                Explore Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigate('/register')}
              >
                Register as Organizer
              </Button>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="animate-on-load relative hidden lg:block">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop"
                alt="Volunteers working together"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Event</p>
                    <p className="text-sm text-gray-500">Tree Plantation</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
