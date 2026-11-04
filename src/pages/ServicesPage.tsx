import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Cloud, FileText, MonitorCog, Printer, ShieldCheck, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  { icon: MonitorCog, name: 'Computer access', detail: 'Reliable workstations and internet access for study, work, applications, and everyday digital tasks.', category: 'Cyber cafe' },
  { icon: FileText, name: 'Online applications', detail: 'Assistance with online forms, account setup, document preparation, and digital submissions.', category: 'Digital support' },
  { icon: Printer, name: 'Print and document services', detail: 'Printing, scanning, photocopying, typing, formatting, and document conversion.', category: 'Document desk' },
  { icon: ShieldCheck, name: 'Digital safety support', detail: 'Practical guidance on safer accounts, device hygiene, privacy, and recognizing common scams.', category: 'Cyber safety' },
  { icon: Cloud, name: 'Digital skills coaching', detail: 'One-to-one help with email, cloud tools, office software, and online collaboration.', category: 'Learning support' },
  { icon: Wifi, name: 'Connectivity and setup', detail: 'Help connecting devices, configuring software, and resolving common connectivity issues.', category: 'Technical help' },
];

export function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / SERVICES</p>
          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Your neighborhood cyber and digital service desk</h1>
              <p className="mt-4 text-slate-600">Practical computer access, document services, online support, and guided digital learning in one place.</p>
            </div>
            <Button asChild className="w-fit bg-emerald-800 hover:bg-emerald-900"><Link to="/portals/admissions">Ask admissions <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>
      <section className="container mx-auto grid gap-px bg-slate-200 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {services.map(({ icon: Icon, name, detail, category }) => (
          <article key={name} className="bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
              <span className="text-xs font-semibold uppercase text-slate-500">{category}</span>
            </div>
            <h2 className="mt-6 text-lg font-bold text-slate-950">{name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
          </article>
        ))}
      </section>
      <section className="border-t bg-white">
        <div className="container mx-auto flex flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div><h2 className="text-xl font-bold text-slate-950">Looking for a course?</h2><p className="mt-1 text-sm text-slate-600">Explore practical programs from the training team.</p></div>
          <Button asChild variant="outline"><Link to="/courses">Browse courses <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>
      <div className="sr-only"><BadgeCheck /><BriefcaseBusiness /></div>
    </main>
  );
}