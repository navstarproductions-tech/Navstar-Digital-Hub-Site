import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_COURSES } from '@/data/courses';
import { Link } from 'react-router-dom';
import { Clock, GraduationCap, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import type { Course } from '@/types';

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState(INITIAL_COURSES);

  useEffect(() => {
    let active = true;
    fetch('/api/courses')
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ courses?: (Course & { status?: string })[] }>;
      })
      .then((result) => {
        if (active && result?.courses?.length) setCourses(result.courses.filter((course) => course.status !== 'archived'));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Professional Courses</h1>
          <p className="mt-4 text-lg text-slate-600">
            Gain the skills you need for the future of work. Enroll today and start learning immediately.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              className="pl-10 h-12 bg-white" 
              placeholder="Search for a course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col h-full border-none shadow-sm hover:shadow-lg transition-all">
              <div className="relative aspect-video">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <Badge className="absolute top-4 left-4 bg-primary/90 hover:bg-primary">{course.category}</Badge>
              </div>
              <CardHeader className="flex-1">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  <GraduationCap className="h-3 w-3" />
                  <span>Certification Course</span>
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="h-1 w-1 bg-slate-300 rounded-full" />
                  <div>KSh {course.price.toLocaleString()}</div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-6">
                <Button asChild className="w-full h-11 text-base">
                  <Link to={`/enroll/${course.id}`}>Enroll Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}