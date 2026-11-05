import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Bell, BookOpen, BriefcaseBusiness, CircleDollarSign, ImagePlus, LayoutDashboard, Plus, Save, Settings, ShieldAlert, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INITIAL_COURSES } from '@/data/courses';
import type { Course } from '@/types';

type Section = 'overview' | 'courses' | 'services' | 'enrollments' | 'finance' | 'gallery' | 'users' | 'settings';
type ServiceItem = { id: string; name: string; category: string; price: string; status: 'Active' | 'Paused' };
type PortalUser = { id: string; name: string; email: string; role: string; status: string };

const initialServices: ServiceItem[] = [
  { id: 's1', name: 'Computer access', category: 'Cyber cafe', price: 'KSh 50 / hour', status: 'Active' },
  { id: 's2', name: 'Printing and scanning', category: 'Document desk', price: 'From KSh 10', status: 'Active' },
  { id: 's3', name: 'Online application support', category: 'Digital support', price: 'From KSh 100', status: 'Active' },
];

const sections: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'services', label: 'Services', icon: BriefcaseBusiness },
  { id: 'enrollments', label: 'Students & admissions', icon: Users },
  { id: 'finance', label: 'Donations & cashout', icon: CircleDollarSign },
  { id: 'gallery', label: 'Gallery & branding', icon: ImagePlus },
  { id: 'users', label: 'Portal accounts', icon: Users },
  { id: 'settings', label: 'Notifications & settings', icon: Settings },
];

export function AdminPage() {
  const [active, setActive] = useState<Section>('overview');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [services, setServices] = useState(initialServices);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Cyber cafe');
  const [servicePrice, setServicePrice] = useState('');
  const [courseName, setCourseName] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [notice, setNotice] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoAssetId, setLogoAssetId] = useState('');
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({ newApplication: true, paymentUpdate: true, donation: true });
  const [schoolName, setSchoolName] = useState('NAVSTAR DIGITAL HUB');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [backendReady, setBackendReady] = useState(false);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<Record<string, unknown>[]>([]);
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});

  useEffect(() => {
    let active = true;
    const loadBackend = async () => {
      try {
        const healthResponse = await fetch('/api/health');
        if (!healthResponse.ok) return;
        const health = await healthResponse.json() as { databaseConfigured?: boolean };
        if (!active || !health.databaseConfigured) return;
        setBackendReady(true);

        const sessionResponse = await fetch('/api/auth/me');
        if (!sessionResponse.ok) return;
        const session = await sessionResponse.json() as { user?: PortalUser };
        if (!session.user || !active) return;
        setUser(session.user);

        const [courseResponse, serviceResponse, overviewResponse, userResponse, enrollmentResponse, cashoutResponse, settingsResponse, mediaResponse] = await Promise.all([
          fetch('/api/courses'), fetch('/api/services'), fetch('/api/admin/overview'), fetch('/api/admin/users'), fetch('/api/enrollments'), fetch('/api/admin/cashouts'), fetch('/api/admin/settings'), fetch('/api/admin/media'),
        ]);
        if (!active) return;
        if (overviewResponse.ok) setMetrics(await overviewResponse.json() as Record<string, unknown>);
        if (courseResponse.ok) {
          const result = await courseResponse.json() as { courses?: { id: string; title: string; price: number }[] };
          if (result.courses) setCourses(result.courses.map((course) => ({ id: course.id, title: course.title, price: course.price, description: '', duration: 'Set duration', image: '', category: 'Professional' })));
        }
        if (serviceResponse.ok) {
          const result = await serviceResponse.json() as { services?: { id: string; name: string; category: string; price: string; status: string }[] };
          if (result.services) setServices(result.services.map((service) => ({ ...service, status: service.status === 'active' ? 'Active' : 'Paused' })));
        }
        if (userResponse.ok) {
          const result = await userResponse.json() as { users?: PortalUser[] };
          if (result.users) setPortalUsers(result.users);
        }
        if (enrollmentResponse.ok) {
          const result = await enrollmentResponse.json() as { enrollments?: Record<string, unknown>[] };
          if (result.enrollments) setApplications(result.enrollments);
        }
        if (cashoutResponse.ok) {
          const result = await cashoutResponse.json() as { requests?: Record<string, unknown>[] };
          if (result.requests) setCashoutRequests(result.requests);
        }
        if (settingsResponse.ok) {
          const result = await settingsResponse.json() as { settings?: { schoolName?: string; contactEmail?: string; contactPhone?: string; address?: string; logoAssetId?: string } };
          if (result.settings) {
            setSchoolName(result.settings.schoolName ?? 'NAVSTAR DIGITAL HUB');
            setContactEmail(result.settings.contactEmail ?? '');
            setContactPhone(result.settings.contactPhone ?? '');
            setSchoolAddress(result.settings.address ?? '');
            setLogoAssetId(result.settings.logoAssetId ?? '');
            if (result.settings.logoAssetId) setLogoPreview(`/api/media/${result.settings.logoAssetId}`);
          }
        }
        if (mediaResponse.ok) {
          const result = await mediaResponse.json() as { media?: { id: string; url: string; altText: string }[] };
          if (result.media) setGalleryPreview(result.media.map((asset) => asset.url));
        }
        if (!overviewResponse.ok) setNotice('Live database connected; some dashboard metrics are not available for this role.');
      } catch {
        if (active) setNotice('Backend connection failed. Check Cloudflare Pages Functions and D1 binding.');
      }
    };
    void loadBackend();
    return () => { active = false; };
  }, []);

  const addService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!serviceName.trim()) return;
    const payload = { name: serviceName.trim(), category: serviceCategory, price: servicePrice.trim() || 'Contact us' };
    if (backendReady) {
      const response = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json() as { id?: string; amount?: number; status?: string; error?: string };
      if (!response.ok || !result.id) { setNotice(result.error ?? 'Service could not be saved.'); return; }
      setServices((current) => [...current, { id: result.id!, ...payload, status: 'Active' }]);
      setNotice('Service published successfully.');
    } else {
      setServices((current) => [...current, { id: crypto.randomUUID(), ...payload, status: 'Active' }]);
      setNotice('Service added to this preview only. Connect Cloudflare Pages Functions and D1 to publish it.');
    }
    setServiceName('');
    setServicePrice('');
  };

  const addCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseName.trim() || Number(coursePrice) < 1) return;
    const payload = { title: courseName.trim(), price: Number(coursePrice) };
    if (backendReady) {
      const response = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) { setNotice(result.error ?? 'Course could not be saved.'); return; }
      setCourses((current) => [...current, { ...payload, id: result.id!, description: '', duration: 'Set duration', image: '', category: 'Professional' }]);
      setNotice('Course published successfully.');
    } else {
      setCourses((current) => [...current, { ...payload, id: crypto.randomUUID(), description: 'New course draft for this local preview.', duration: 'Set duration', image: '', category: 'Professional' }]);
      setNotice('Course draft added to this preview only.');
    }
    setCourseName('');
    setCoursePrice('');
  };

  const removeCourse = async (courseId: string) => {
    if (backendReady) {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, { method: 'DELETE' });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setNotice(result.error ?? 'Course could not be archived.'); return; }
    }
    setCourses((current) => current.filter((item) => item.id !== courseId));
    setNotice(backendReady ? 'Course archived.' : 'Course removed from this preview only.');
  };

  const removeService = async (serviceId: string) => {
    if (backendReady) {
      const response = await fetch(`/api/services/${encodeURIComponent(serviceId)}`, { method: 'DELETE' });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setNotice(result.error ?? 'Service could not be paused.'); return; }
    }
    setServices((current) => current.filter((item) => item.id !== serviceId));
    setNotice(backendReady ? 'Service paused.' : 'Service removed from this preview only.');
  };

  const startCashout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/cashouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(cashoutAmount) }),
      });
      const result = await response.json() as { id?: string; amount?: number; status?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error ?? 'Cashout request was not accepted.');
      setCashoutRequests((current) => [{ id: result.id, amount: result.amount, status: result.status, created_at: new Date().toISOString() }, ...current]);
      setNotice('Cashout request submitted for approval. No money was transferred.');
      setCashoutAmount('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Cashout request failed.');
    }
  };

  const createPortalUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTemporaryPassword('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, role: newUserRole }),
      });
      const result = await response.json() as { user?: PortalUser; temporaryPassword?: string; error?: string };
      if (!response.ok || !result.user || !result.temporaryPassword) throw new Error(result.error ?? 'Account could not be created.');
      setPortalUsers((current) => [result.user!, ...current]);
      setTemporaryPassword(result.temporaryPassword);
      setNewUserName('');
      setNewUserEmail('');
      setNotice('Account created. Share the temporary password with that person using a separate secure channel.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Account could not be created.');
    }
  };

  const reviewCashout = async (requestId: string, status: 'approved' | 'rejected') => {
    const response = await fetch(`/api/admin/cashouts/${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setNotice(result.error ?? 'Cashout review failed.'); return; }
    setCashoutRequests((current) => current.map((item) => item.id === requestId ? { ...item, status } : item));
    setNotice(`Cashout request ${status}. This records approval only; it does not transfer money.`);
  };

  const setImage = async (event: ChangeEvent<HTMLInputElement>, target: 'logo' | 'gallery') => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/')).slice(0, target === 'logo' ? 1 : 8);
    if (backendReady) {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', target === 'logo' ? 'NAVSTAR DIGITAL HUB logo' : file.name);
        const response = await fetch('/api/admin/media', { method: 'POST', body: formData });
        const result = await response.json() as { id?: string; url?: string; error?: string };
        if (!response.ok || !result.id || !result.url) { setNotice(result.error ?? 'Image upload failed.'); return; }
        if (target === 'logo') {
          setLogoAssetId(result.id);
          setLogoPreview(result.url);
        } else {
          setGalleryPreview((current) => [...current, result.url!].slice(-8));
        }
      }
      setNotice('Image uploaded to NAVSTAR media storage. Save site settings to publish a new logo.');
      return;
    }
    const previews = files.map((file) => URL.createObjectURL(file));
    if (target === 'logo') {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(previews[0] ?? '');
      setNotice('Logo preview selected. Connect secure media storage to publish it.');
    } else {
      setGalleryPreview((current) => [...current, ...previews].slice(-8));
      setNotice('Gallery previews selected. Connect secure media storage to publish them.');
    }
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!backendReady) {
      setNotice('Settings are shown in this browser preview only; connect the backend and sign in to save site-wide changes.');
      return;
    }
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolName, contactEmail, contactPhone, address: schoolAddress, logoAssetId }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Settings could not be saved.');
      setNotice('Site settings saved.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Settings could not be saved.');
    }
  };

  const title = sections.find((section) => section.id === active)?.label ?? 'Overview';

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-r bg-slate-950 text-white">
          <div className="border-b border-white/10 px-5 py-5"><p className="text-[11px] font-bold uppercase text-emerald-300">NAVSTAR DIGITAL HUB</p><h1 className="mt-1 text-lg font-bold">Administration</h1></div>
          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto p-3 md:block md:space-y-1">
            {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { setActive(id); setNotice(''); }} aria-current={active === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-left text-sm md:w-full ${active === id ? 'bg-emerald-800 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
          </nav>
          <div className="hidden border-t border-white/10 p-4 text-xs leading-5 text-slate-400 md:block">Preview dashboard. Live records and actions require authenticated server access.</div>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-9">
          <header className="mb-6 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase text-slate-500">Admin workspace / {title}</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2></div>
            <span className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs font-semibold ${backendReady && user ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}><ShieldAlert className="h-4 w-4" />{backendReady && user ? `Connected · ${user.role}` : 'Preview mode · backend not connected'}</span>
          </header>

          {notice && <p role="status" className="mb-5 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">{notice}</p>}

          {active === 'overview' && <div className="space-y-6"><div className="grid gap-px border bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">{[
            ['Students', String(metrics.students ?? '—'), 'Registered student accounts'], ['Applications', String(metrics.applications ?? applications.length), 'Admissions queue'], ['Courses', String(metrics.courses ?? courses.length), 'Active courses'], ['Services', String(metrics.services ?? services.length), 'Active cyber services'],
          ].map(([label, value, caption]) => <div key={label} className="bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{caption}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Workspace summary</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use these sections to draft courses and services, preview gallery images, and configure notification preferences. Changes are local previews until server storage and role-based access are connected.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{sections.slice(1).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)} className="flex items-center justify-between border p-3 text-left text-sm font-medium hover:bg-slate-50"><span className="flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-800" />{label}</span><span aria-hidden="true">›</span></button>)}</div></section><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Important setup</h3><ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600"><li className="border-l-2 border-amber-500 pl-3">Rotate the Daraja production credentials shared in chat.</li><li className="border-l-2 border-emerald-700 pl-3">Keep all Daraja secrets in server environment variables only.</li><li className="border-l-2 border-emerald-700 pl-3">Protect admin actions with verified staff roles and audit logs.</li></ul></section></div></div>}

          {active === 'courses' && <div className="space-y-5"><form onSubmit={addCourse} className="grid gap-3 border bg-white p-4 sm:grid-cols-[1fr_160px_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="new-course">New course title</Label><Input id="new-course" value={courseName} onChange={(event) => setCourseName(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="new-course-price">Fee (KSh)</Label><Input id="new-course-price" type="number" min="1" value={coursePrice} onChange={(event) => setCoursePrice(event.target.value)} required /></div><Button type="submit" className="bg-emerald-800 hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" />Add course</Button></form><div className="overflow-x-auto border bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Course</th><th className="p-3">Category</th><th className="p-3">Duration</th><th className="p-3">Fee</th><th className="p-3">Action</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-b last:border-0"><td className="p-3 font-semibold text-slate-900">{course.title}</td><td className="p-3">{course.category}</td><td className="p-3">{course.duration}</td><td className="p-3">KSh {course.price.toLocaleString()}</td><td className="p-3"><button aria-label={`Archive ${course.title}`} className="text-slate-500 hover:text-red-700" onClick={() => void removeCourse(course.id)}><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></div>}

          {active === 'services' && <div className="space-y-5"><form onSubmit={addService} className="grid gap-3 border bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_180px_180px_auto] xl:items-end"><div className="space-y-2"><Label htmlFor="service-name">Service name</Label><Input id="service-name" value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="e.g. Scanning" required /></div><div className="space-y-2"><Label htmlFor="service-category">Category</Label><select id="service-category" value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} className="h-10 w-full border border-slate-300 bg-white px-3 text-sm"><option>Cyber cafe</option><option>Document desk</option><option>Digital support</option><option>Training</option><option>Technical help</option></select></div><div className="space-y-2"><Label htmlFor="service-price">Display price</Label><Input id="service-price" value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} placeholder="From KSh 100" /></div><Button type="submit" className="bg-emerald-800 hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" />Add service</Button></form><div className="divide-y border bg-white">{services.map((service) => <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-950">{service.name}</p><p className="mt-1 text-xs text-slate-500">{service.category} · {service.price}</p></div><div className="flex items-center gap-4"><span className="text-xs font-semibold text-emerald-800">{service.status}</span><button aria-label={`Pause ${service.name}`} onClick={() => void removeService(service.id)} className="text-slate-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>}

          {active === 'enrollments' && <div className="overflow-x-auto border bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Applicant</th><th className="p-3">Course</th><th className="p-3">Application</th><th className="p-3">Payment</th><th className="p-3">Received</th></tr></thead><tbody>{applications.map((application) => <tr key={String(application.id)} className="border-b last:border-0"><td className="p-3"><p className="font-semibold">{String(application.full_name ?? '')}</p><p className="text-xs text-slate-500">{String(application.email ?? '')}</p></td><td className="p-3">{courses.find((item) => item.id === application.course_id)?.title ?? String(application.course_id ?? '')}</td><td className="p-3">{String(application.status ?? '')}</td><td className="p-3">{String(application.payment_status ?? '')}</td><td className="p-3">{String(application.created_at ?? '')}</td></tr>)}{applications.length === 0 && <tr><td className="p-6 text-center text-slate-500" colSpan={5}>{backendReady ? 'No applications received yet.' : 'Connect the backend and sign in to view applications.'}</td></tr>}</tbody></table></div>}

          {active === 'users' && <div className="space-y-5"><form onSubmit={createPortalUser} className="grid gap-3 border bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_auto] xl:items-end"><div className="space-y-2"><Label htmlFor="portal-user-name">Full name</Label><Input id="portal-user-name" value={newUserName} onChange={(event) => setNewUserName(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="portal-user-email">Email</Label><Input id="portal-user-email" type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="portal-user-role">Portal role</Label><select id="portal-user-role" value={newUserRole} onChange={(event) => setNewUserRole(event.target.value)} className="h-10 w-full border border-slate-300 bg-white px-3 text-sm">{['student', 'tutor', 'admissions', 'principal', 'admin'].map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></div><Button type="submit" disabled={!backendReady || user?.role !== 'admin'} className="bg-emerald-800 hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" />Create account</Button></form>{temporaryPassword && <p role="status" className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">One-time password (shown once): <code className="select-all font-bold">{temporaryPassword}</code>. Send it to the person through a separate secure channel; they must change it after signing in.</p>}<div className="divide-y border bg-white">{portalUsers.map((portalUser) => <div key={portalUser.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{portalUser.name}</p><p className="mt-1 text-xs text-slate-500">{portalUser.email} · {portalUser.role}</p></div><span className="border px-2 py-1 text-xs">{portalUser.status}</span></div>)}{portalUsers.length === 0 && <p className="p-5 text-sm text-slate-500">{backendReady ? 'No accounts found.' : 'Connect Cloudflare Pages Functions and sign in as Admin to manage accounts.'}</p>}</div></div>}

          {active === 'finance' && <div className="grid gap-6 xl:grid-cols-2"><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Verified donations and payments</h3><p className="mt-2 text-sm leading-6 text-slate-600">Only provider callbacks mark donations and tuition as paid. No M-Pesa PIN or payment credentials are shown here.</p><p className="mt-5 border bg-slate-50 p-4 text-sm text-slate-600">Verified donations: KSh {Number(metrics.verifiedDonations ?? 0).toLocaleString()} · Verified payments: KSh {Number(metrics.verifiedPayments ?? 0).toLocaleString()}</p></section><form onSubmit={startCashout} className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Request cashout</h3><p className="mt-2 text-sm leading-6 text-slate-600">This creates an approval request only; it does not transfer funds. Never withdraw from the browser.</p></div><div className="space-y-2"><Label htmlFor="cashout-amount">Amount (KSh)</Label><Input id="cashout-amount" type="number" min="1" value={cashoutAmount} onChange={(event) => setCashoutAmount(event.target.value)} required /></div><Button className="bg-emerald-800 hover:bg-emerald-900" type="submit" disabled={!backendReady || !user}><CircleDollarSign className="mr-2 h-4 w-4" />{backendReady ? 'Submit for approval' : 'Backend required'}</Button><div className="divide-y border">{cashoutRequests.map((item) => <div key={String(item.id)} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"><span>KSh {Number(item.amount).toLocaleString()} · {String(item.status)}</span>{item.status === 'pending_approval' && user?.role === 'admin' && <span className="flex gap-2"><Button size="sm" type="button" variant="outline" onClick={() => reviewCashout(String(item.id), 'approved')}>Approve</Button><Button size="sm" type="button" variant="outline" onClick={() => reviewCashout(String(item.id), 'rejected')}>Reject</Button></span>}</div>)}{cashoutRequests.length === 0 && <p className="p-3 text-xs text-slate-500">No cashout requests.</p>}</div></form></div>}

          {active === 'gallery' && <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"><section className="space-y-4 border bg-white p-5"><h3 className="font-bold text-slate-950">Logo and site identity</h3><p className="text-sm leading-6 text-slate-600">Choose a local logo preview. It will not be published until secure media storage is connected.</p><Label htmlFor="brand-name">Display name</Label><Input id="brand-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /><Label htmlFor="logo-upload">Logo image</Label><Input id="logo-upload" type="file" accept="image/*" onChange={(event) => setImage(event, 'logo')} />{logoPreview && <img src={logoPreview} alt="Selected NAVSTAR logo preview" className="h-24 w-24 border object-contain p-2" />}<p className="text-xs text-slate-500">Recommended: transparent PNG or SVG, square format.</p></section><section className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Gallery</h3><p className="mt-1 text-sm text-slate-600">Preview up to eight images at a time. Storage is not configured.</p></div><Label htmlFor="gallery-upload">Add gallery images</Label><Input id="gallery-upload" type="file" accept="image/*" multiple onChange={(event) => setImage(event, 'gallery')} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{galleryPreview.map((url, index) => <img key={url} src={url} alt={`Gallery preview ${index + 1}`} className="aspect-square w-full border object-cover" />)}</div></section></div>}

          {active === 'settings' && <div className="grid gap-6 xl:grid-cols-2"><form onSubmit={saveSettings} className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Site settings</h3><p className="mt-1 text-sm text-slate-600">Updates are saved to NAVSTAR when the backend is connected.</p></div><div className="space-y-2"><Label htmlFor="site-name">Site name</Label><Input id="site-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="contact-email">Admissions email</Label><Input id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="admissions@example.org" /></div><div className="space-y-2"><Label htmlFor="contact-phone">Contact phone</Label><Input id="contact-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+254 7xx xxx xxx" /></div><div className="space-y-2"><Label htmlFor="school-address">Address</Label><Input id="school-address" value={schoolAddress} onChange={(event) => setSchoolAddress(event.target.value)} placeholder="Town, county" /></div><Button type="submit" variant="outline" disabled={!backendReady || user?.role !== 'admin'}><Save className="mr-2 h-4 w-4" />Save site settings</Button></form><section className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Notification preferences</h3><p className="mt-1 text-sm text-slate-600">Configure which events the connected admin service should notify.</p></div>{[
            ['newApplication', 'New student application'], ['paymentUpdate', 'Payment status update'], ['donation', 'Donation received'],
          ].map(([key, label]) => <label key={key} className="flex items-center justify-between gap-4 border-b py-3 last:border-0"><span className="flex items-center gap-2 text-sm font-medium"><Bell className="h-4 w-4 text-emerald-800" />{label}</span><input type="checkbox" checked={notifications[key as keyof typeof notifications]} onChange={(event) => setNotifications((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-emerald-800" /></label>)}<p className="text-xs leading-5 text-slate-500">Browser push and SMS notifications require user permission and a notification backend.</p></section></div>}

          <footer className="mt-8 border-t pt-4 text-xs leading-5 text-slate-500">Daraja secrets stay server-side. User accounts, student records, uploads, and finance operations require authenticated role access.</footer>
        </section>
      </div>
    </main>
  );
}