import { Monitor, Wifi, Printer, ShieldCheck, GraduationCap, Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Computer School',
    description: 'Comprehensive training programs from basic literacy to advanced development.',
    icon: GraduationCap,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Cyber Cafe Services',
    description: 'High-speed internet browsing, document printing, and digital applications.',
    icon: Wifi,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Hardware Maintenance',
    description: 'Professional repair and maintenance for laptops, desktops, and printers.',
    icon: Cpu,
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'Graphic Design',
    description: 'Professional branding, logo design, and promotional materials.',
    icon: Monitor,
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    title: 'Bulk Printing',
    description: 'Quality printing for exams, flyers, brochures, and company documents.',
    icon: Printer,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Cyber Security',
    description: 'Security audits, data recovery, and malware removal services.',
    icon: ShieldCheck,
    color: 'bg-cyan-500/10 text-cyan-500',
  },
];

export function Services() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Premier Services</h2>
          <p className="mt-4 text-lg text-slate-600">
            Whether you are looking to gain new skills or need professional tech assistance, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-slate-600 text-base mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/services" className="text-sm font-semibold text-emerald-800 hover:underline">View service details</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}