import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_COURSES } from '@/data/courses';
import { Link } from 'react-router-dom';
import { Clock, GraduationCap } from 'lucide-react';
import type { Course } from '@/types';

export function FeaturedCourses() {
  const [courses, setCourses] = useState(INITIAL_COURSES);

  useEffect(() => {
    let active = true;
    fetch('/api/courses')
      .then(async (response) => response.ok ? response.json() as Promise<{ courses?: Course[] }> : null)
      .then((result) => { if (active && result?.courses?.length) setCourses(result.courses); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Popular Courses</h2>
            <p className="mt-4 text-lg text-slate-600">
              Start your career in technology with our industry-recognized certification courses.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/courses">View All Courses</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, 4).map((course) => (
            <Card key={course.id} className="overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all">
              <div className="relative aspect-[16/10] overflow-hidden">
                {course.image ? <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                /> : <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-800"><GraduationCap className="h-10 w-10" /></div>}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 border-none">
                    {course.category}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  <GraduationCap className="h-3 w-3" />
                  <span>Certification Course</span>
                </div>
                <CardTitle className="text-xl line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 h-10 mt-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="text-primary font-bold text-lg">
                    KSh {course.price.toLocaleString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild className="w-full">
                  <Link to={`/enroll/${course.id}`}>Enroll Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}