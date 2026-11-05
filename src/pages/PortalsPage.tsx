import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const portals = [
  { id: 'student', title: 'Student portal', icon: GraduationCap, summary: 'Courses, admissions status, and payment receipts.' },
  { id: 'tutor', title: 'Tutor portal', icon: BookOpen, summary: 'Class lists, learning resources, attendance, and student progress.' },
  { id: 'admissions', title: 'Admissions portal', icon: UserRound, summary: 'Applications, document checks, course enquiries, and applicant follow-up.' },
  { id: 'principal', title: 'Principal portal', icon: BriefcaseBusiness, summary: 'Academic overview, approvals, staff activity, and institutional reports.' },
  { id: 'admin', title: 'Admin portal', icon: ShieldCheck, summary: 'Courses, services, gallery, notifications, payment review, and site settings.' },
];

type SessionUser = { id: string; name: string; email: string; role: string; mustChangePassword?: boolean };
type Enrollment = { id: string; full_name: string; course_id: string; status: string; payment_status: string; created_at: string };
type Overview = { students: number; applications: number; verifiedPayments: number; verifiedDonations: number; courses: number; services: number };

export function PortalsPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const selectedPortal = portals.find((portal) => portal.id === role);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [status, setStatus] = useState('Checking your secure session…');

  useEffect(() => {
    if (!selectedPortal) return;
    let active = true;
    const loadPortal = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/me');
        const session = await sessionResponse.json() as { user?: SessionUser; error?: string };
        if (!sessionResponse.ok || !session.user) {
          if (active) setStatus(session.error ?? 'Sign in to open this portal.');
          return;
        }
        if (session.user.mustChangePassword) {
          navigate('/change-password', { replace: true });
          return;
        }
        if (session.user.role !== selectedPortal.id) {
          if (active) setStatus('This account does not have access to the selected portal. Sign in with an authorized account.');
          return;
        }
        if (active) {
          setUser(session.user);
          setStatus('');
        }
        if (['student', 'admissions', 'principal'].includes(session.user.role)) {
          const response = await fetch('/api/enrollments');
          const result = await response.json() as { enrollments?: Enrollment[] };
          if (response.ok && active) setEnrollments(result.enrollments ?? []);
        }
        if (['admin', 'principal'].includes(session.user.role)) {
          const response = await fetch('/api/admin/overview');
          const result = await response.json() as Overview;
          if (response.ok && active) setOverview(result);
        }
      } catch {
        if (active) setStatus('The portal service could not be reached. Try again after the backend is connected.');
      }
    };
    void loadPortal();
    return () => { active = false; };
  }, [navigate, selectedPortal]);

  if (!selectedPortal) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / PORTALS</p>
            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><h1 className="text-3xl font-bold text-slate-950">Choose your portal</h1><p className="mt-2 max-w-2xl text-slate-600">A shared hub for students, tutors, admissions, leadership, and administrators.</p></div>
              <Button asChild variant="outline"><Link to="/login">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-600"><UsersRound className="h-4 w-4 text-emerald-800" /><span>Each account can only open its assigned role.</span></div>
          <div className="grid gap-px border bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {portals.map(({ id, title, icon: Icon, summary }) => <article key={id} className="flex min-h-56 flex-col bg-white p-6"><Icon className="h-6 w-6 text-emerald-800" /><h2 className="mt-5 font-bold text-slate-950">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{summary}</p><div className="mt-5 flex gap-3"><Button asChild size="sm" className="bg-emerald-800 hover:bg-emerald-900"><Link to={`/login?role=${id}`}>Sign in</Link></Button><Button asChild size="sm" variant="outline"><Link to={`/portals/${id}`}>Open portal</Link></Button></div></article>)}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="container mx-auto flex flex-col justify-between gap-4 px-4 py-10 sm:flex-row sm:items-end sm:px-6 lg:px-8">
          <div><p className="text-sm font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / {selectedPortal.id}</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{selectedPortal.title}</h1><p className="mt-2 text-slate-600">{user ? `Welcome, ${user.name}` : status}</p></div>
          {!user && <Button asChild className="w-fit bg-emerald-800 hover:bg-emerald-900"><Link to={`/login?role=${selectedPortal.id}`}>Sign in</Link></Button>}
          {user?.role === 'admin' && <Button asChild variant="outline"><Link to="/admin">Open admin workspace</Link></Button>}
        </div>
      </section>
      <section className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {user && overview && <div className="grid gap-px border bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">{[['Students', overview.students], ['Applications', overview.applications], ['Verified payments', `KSh ${overview.verifiedPayments.toLocaleString()}`], ['Active courses', overview.courses]].map(([label, value]) => <div key={String(label)} className="bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p></div>)}</div>}
        {user && <section className="border bg-white p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-bold text-slate-950">{user.role === 'student' ? 'My applications' : user.role === 'tutor' ? 'My classes' : 'Admissions queue'}</h2><p className="mt-1 text-sm text-slate-600">{user.role === 'tutor' ? 'Class rosters are shown once a principal assigns classes to your account.' : 'Live records from the NAVSTAR admissions database.'}</p></div><span className="border px-2 py-1 text-xs uppercase text-slate-500">{user.role}</span></div>
          {user.role === 'tutor' ? <p className="mt-5 border bg-slate-50 p-4 text-sm text-slate-600">No classes are assigned to this tutor account yet.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Applicant</th><th className="p-3">Course ID</th><th className="p-3">Application</th><th className="p-3">Payment</th><th className="p-3">Date</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3 font-medium">{item.full_name}</td><td className="p-3">{item.course_id}</td><td className="p-3">{item.status}</td><td className="p-3">{item.payment_status}</td><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td></tr>)}{enrollments.length === 0 && <tr><td className="p-5 text-center text-slate-500" colSpan={5}>No applications to show.</td></tr>}</tbody></table></div>}
        </section>}
        {!user && <div role="status" className="border bg-white p-5 text-sm text-slate-700">{status || 'Sign in is required to view private portal records.'} <Link to={`/login?role=${selectedPortal.id}`} className="ml-2 font-semibold text-emerald-800">Go to sign in</Link></div>}
      </section>
    </main>
  );
}