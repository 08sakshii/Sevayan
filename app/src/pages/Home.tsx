import { Hero } from '@/sections/Hero';
import { Categories } from '@/sections/Categories';
import { FeaturedEvents } from '@/sections/FeaturedEvents';
import { HowItWorks } from '@/sections/HowItWorks';

export function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedEvents />
      <HowItWorks />
    </main>
  );
}
