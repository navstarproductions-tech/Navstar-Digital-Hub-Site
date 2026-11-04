import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const portals = [
  { id: 'student', title: 'Student portal', icon: GraduationCap, summary: 'Courses, attendance, learning materials, progress, and payment receipts.' },
  { id: 'tutor', title: 'Tutor portal', icon: BookOpen, summary: 'Class lists, learning resources, attendance, and student progress.' },
  { id: 'admissions', title: 'Admissions portal', icon: UserRound, summary: 'Applications, document checks, course enquiries, and applicant follow-up.' },
  { id: 'principal', title: 'Principal portal', icon: BriefcaseBusiness, summary: 'Academic overview, approvals, staff activity, and institutional reports.' },
  { id: 'admin', title: 'Admin portal', icon: ShieldCheck, summary: 'Courses, services, gallery, notifications, payment review, and site settings.' },
];

export function PortalsPage() {
  const { role } = useParams();
  const selectedPortal = portals.find((portal) => portal.id === role);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / PORTALS</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><h1 className="text-3xl font-bold text-slate-950">{selectedPortal ? selectedPortal.title : 'Choose your portal'}</h1><p className="mt-2 max-w-2xl text-slate-600">{selectedPortal ? selectedPortal.summary : 'A shared hub for students, tutors, admissions, leadership, and administrators.'}</p></div>
            <Button asChild variant="outline"><Link to="/login">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-amber-900"><UsersRound className="h-4 w-4" /><span>Portal previews use sample information. Secure accounts and live records require the school backend.</span></div>
        <div className="grid gap-px border bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map(({ id, title, icon: Icon, summary }) => (
            <article key={id} className="flex min-h-56 flex-col bg-white p-6">
              <Icon className="h-6 w-6 text-emerald-800" />
              <h2 className="mt-5 font-bold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{summary}</p>
              <div className="mt-5 flex gap-3">
                <Button asChild size="sm" className="bg-emerald-800 hover:bg-emerald-900"><Link to={`/login?role=${id}`}>Sign in</Link></Button>
                <Button asChild size="sm" variant="outline"><Link to={`/portals/${id}`}>Preview</Link></Button>
              </div>
            </article>
          ))}
        </div>
        {selectedPortal && <div className="mt-8 border bg-white p-6"><h2 className="font-bold text-slate-950">{selectedPortal.title} preview</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="border p-4"><p className="text-sm text-slate-500">Account status</p><p className="mt-1 font-semibold">Preview only</p></div><div className="border p-4"><p className="text-sm text-slate-500">Connected records</p><p className="mt-1 font-semibold">Backend required</p></div><div className="border p-4"><p className="text-sm text-slate-500">Next step</p><Link className="mt-1 inline-block font-semibold text-emerald-800" to={`/login?role=${selectedPortal.id}`}>Open sign-in</Link></div></div></div>}
      </section>
    </main>
  );
}