import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/8fb27cb6-b5e4-4e3a-a9bd-86137cc28585/hero-hub-b53bdca5-1776781000029.webp"
          alt="Tech Hub"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">NAVSTAR</span>
            Computer training and cyber services
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Your digital journey starts at <span className="text-primary">NAVSTAR DIGITAL HUB</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Practical computer training, cyber services, and professional support for your next step.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/courses">
                Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg" className="text-white hover:text-primary">
              <Link to="/services">
                Our Services <Monitor className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center gap-x-8 text-slate-300">
            <div className="flex items-center gap-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <span className="text-sm">500+ Students enrolled</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm">12+ Professional Courses</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}