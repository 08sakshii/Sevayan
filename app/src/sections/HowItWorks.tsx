import { useEffect, useRef } from 'react';
import { Search, ClipboardCheck, HandHeart } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Browse events by category and city. Find social impact opportunities that match your interests and location.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    number: '02',
    title: 'Register',
    description: 'Sign up for events that interest you with a single click. Get all the details you need to participate.',
    icon: ClipboardCheck,
    color: 'bg-green-500',
  },
  {
    number: '03',
    title: 'Participate',
    description: 'Show up at the event location and make a real difference in your community. Track your impact over time.',
    icon: HandHeart,
    color: 'bg-orange-500',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = section.querySelectorAll('.step-item');
            steps.forEach((step, index) => {
              const element = step as HTMLElement;
              setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
              }, index * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    // Set initial state
    const steps = section.querySelectorAll('.step-item');
    steps.forEach((step) => {
      const element = step as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to begin your 
            journey of making a positive impact.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 opacity-30" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              
              return (
                <div
                  key={step.number}
                  className="step-item relative"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Step Number & Icon */}
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm font-bold text-gray-700">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
