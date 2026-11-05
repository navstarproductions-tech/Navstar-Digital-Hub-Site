import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { FeaturedCourses } from '@/components/home/FeaturedCourses';
import { Gallery } from '@/components/home/Gallery';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      
      {/* About Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/8fb27cb6-b5e4-4e3a-a9bd-86137cc28585/hero-hub-b53bdca5-1776781000029.webp" 
                  alt="Students learning" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 bg-primary p-8 rounded-2xl shadow-xl z-20 hidden md:block">
                <p className="text-white text-3xl font-bold mb-1">10+</p>
                <p className="text-primary-foreground/80 text-sm">Years of excellence in IT training across Kenya.</p>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply opacity-70 animate-blob" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                Why Choose NAVSTAR DIGITAL HUB?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We bridge the digital divide by providing affordable, high-quality computer education and essential cyber services to our community.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Hands-on practical learning with 1:1 student-to-computer ratio.',
                  'Industry-certified trainers with real-world experience.',
                  'Job placement assistance and career guidance.',
                  'High-speed fiber internet and modern workstations.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild size="lg">
                <Link to="/services">Explore Our Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FeaturedCourses />
      <Gallery />

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to upgrade your skills?</h2>
          <p className="text-primary-foreground/90 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of successful graduates who started their tech journey with us.
          </p>
          <Button asChild size="lg" variant="secondary" className="px-10 h-14 text-lg">
            <Link to="/courses">Browse All Courses</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}