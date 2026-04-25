import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TreePine, Heart, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/constants';

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  TreePine,
  Heart,
};

export function Categories() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = section.querySelectorAll('.category-card');
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
    const cards = section.querySelectorAll('.category-card');
    cards.forEach((card) => {
      const element = card as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find social impact events that match your passion and make a 
            meaningful difference in your community.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {CATEGORIES.map((category) => {
            const Icon = (category.icon && iconMap[category.icon]) || Sparkles;
            
            return (
              <Card
                key={category.id}
                className="category-card group cursor-pointer border-2 border-transparent hover:border-green-500 transition-all duration-300 hover:shadow-lg"
                onClick={() => navigate(`/events?category=${category.id}`)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon
                        className="w-8 h-8"
                        style={{ color: category.color }}
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>

                    {/* Link */}
                    <div className="flex items-center text-green-600 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Explore Events</span>
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
