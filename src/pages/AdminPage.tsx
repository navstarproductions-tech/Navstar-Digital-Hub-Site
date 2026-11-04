import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Bell, BookOpen, BriefcaseBusiness, CircleDollarSign, ImagePlus, LayoutDashboard, Plus, Save, Settings, ShieldAlert, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INITIAL_COURSES } from '@/data/courses';
import type { Course } from '@/types';

type Section = 'overview' | 'courses' | 'services' | 'enrollments' | 'finance' | 'gallery' | 'settings';
type ServiceItem = { id: string; name: string; category: string; price: string; status: 'Active' | 'Paused' };

const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
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
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({ newApplication: true, paymentUpdate: true, donation: true });
  const [schoolName, setSchoolName] = useState('NAVSTAR DIGITAL HUB');
  const [contactEmail, setContactEmail] = useState('');

  const addService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!serviceName.trim()) return;
    setServices((current) => [...current, { id: crypto.randomUUID(), name: serviceName.trim(), category: serviceCategory, price: servicePrice.trim() || 'Contact us', status: 'Active' }]);
    setServiceName('');
    setServicePrice('');
    setNotice('Service added to this preview. Connect the admin API to publish it for everyone.');
  };

  const addCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseName.trim() || Number(coursePrice) < 1) return;
    setCourses((current) => [...current, { id: crypto.randomUUID(), title: courseName.trim(), description: 'New course draft. Add the public description in the course management backend.', price: Number(coursePrice), duration: 'Set duration', image: '', category: 'Professional' }]);
    setCourseName('');
    setCoursePrice('');
    setNotice('Course draft added in this preview. It is not published to the public site.');
  };

  const startCashout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiBase) {
      setNotice('Cashout is unavailable: connect an authenticated backend with role checks and approval controls first. No transfer was made.');
      return;
    }
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/admin/cashouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(cashoutAmount), destination: 'configured-server-side' }),
      });
      if (!response.ok) throw new Error('Cashout request was not accepted.');
      setNotice('Cashout request submitted for server-side approval.');
      setCashoutAmount('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Cashout request failed.');
    }
  };

  const setImage = (event: ChangeEvent<HTMLInputElement>, target: 'logo' | 'gallery') => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/')).slice(0, target === 'logo' ? 1 : 8);
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

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('Settings are shown in this browser preview only; a protected admin API is required to save site-wide changes.');
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
            <span className="inline-flex w-fit items-center gap-2 border bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"><ShieldAlert className="h-4 w-4" />Preview mode · not connected to production data</span>
          </header>

          {notice && <p role="status" className="mb-5 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">{notice}</p>}

          {active === 'overview' && <div className="space-y-6"><div className="grid gap-px border bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">{[
            ['Students', 'Backend required', 'Enrolled records'], ['Applications', 'Backend required', 'Admissions queue'], ['Courses', String(courses.length), 'Local preview catalog'], ['Services', String(services.length), 'Local preview list'],
          ].map(([label, value, caption]) => <div key={label} className="bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{caption}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Workspace summary</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use these sections to draft courses and services, preview gallery images, and configure notification preferences. Changes are local previews until server storage and role-based access are connected.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{sections.slice(1).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)} className="flex items-center justify-between border p-3 text-left text-sm font-medium hover:bg-slate-50"><span className="flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-800" />{label}</span><span aria-hidden="true">›</span></button>)}</div></section><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Important setup</h3><ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600"><li className="border-l-2 border-amber-500 pl-3">Rotate the Daraja production credentials shared in chat.</li><li className="border-l-2 border-emerald-700 pl-3">Keep all Daraja secrets in server environment variables only.</li><li className="border-l-2 border-emerald-700 pl-3">Protect admin actions with verified staff roles and audit logs.</li></ul></section></div></div>}

          {active === 'courses' && <div className="space-y-5"><form onSubmit={addCourse} className="grid gap-3 border bg-white p-4 sm:grid-cols-[1fr_160px_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="new-course">New course title</Label><Input id="new-course" value={courseName} onChange={(event) => setCourseName(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="new-course-price">Fee (KSh)</Label><Input id="new-course-price" type="number" min="1" value={coursePrice} onChange={(event) => setCoursePrice(event.target.value)} required /></div><Button type="submit" className="bg-emerald-800 hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" />Add draft</Button></form><div className="overflow-x-auto border bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Course</th><th className="p-3">Category</th><th className="p-3">Duration</th><th className="p-3">Fee</th><th className="p-3">Action</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-b last:border-0"><td className="p-3 font-semibold text-slate-900">{course.title}</td><td className="p-3">{course.category}</td><td className="p-3">{course.duration}</td><td className="p-3">KSh {course.price.toLocaleString()}</td><td className="p-3"><button aria-label={`Remove ${course.title}`} className="text-slate-500 hover:text-red-700" onClick={() => setCourses((current) => current.filter((item) => item.id !== course.id))}><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></div>}

          {active === 'services' && <div className="space-y-5"><form onSubmit={addService} className="grid gap-3 border bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_180px_180px_auto] xl:items-end"><div className="space-y-2"><Label htmlFor="service-name">Service name</Label><Input id="service-name" value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="e.g. Scanning" required /></div><div className="space-y-2"><Label htmlFor="service-category">Category</Label><select id="service-category" value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} className="h-10 w-full border border-slate-300 bg-white px-3 text-sm"><option>Cyber cafe</option><option>Document desk</option><option>Digital support</option><option>Training</option><option>Technical help</option></select></div><div className="space-y-2"><Label htmlFor="service-price">Display price</Label><Input id="service-price" value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} placeholder="From KSh 100" /></div><Button type="submit" className="bg-emerald-800 hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" />Add service</Button></form><div className="divide-y border bg-white">{services.map((service) => <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-950">{service.name}</p><p className="mt-1 text-xs text-slate-500">{service.category} · {service.price}</p></div><div className="flex items-center gap-4"><span className="text-xs font-semibold text-emerald-800">{service.status}</span><button aria-label={`Remove ${service.name}`} onClick={() => setServices((current) => current.filter((item) => item.id !== service.id))} className="text-slate-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>}

          {active === 'enrollments' && <div className="space-y-4"><div className="border bg-white p-5"><h3 className="font-bold text-slate-950">Student records and admissions</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Applications, identity documents, attendance, grades, and student records are not loaded in this public preview. Connect an authenticated API before showing real student data.</p></div><div className="grid gap-4 sm:grid-cols-2">{['Student portal', 'Tutor portal', 'Admissions portal', 'Principal portal'].map((role) => <div key={role} className="flex items-center justify-between border bg-white p-4"><div><p className="font-semibold">{role}</p><p className="mt-1 text-xs text-slate-500">Role permissions managed by backend</p></div><span className="border px-2 py-1 text-xs text-slate-500">Not connected</span></div>)}</div></div>}

          {active === 'finance' && <div className="grid gap-6 xl:grid-cols-2"><section className="border bg-white p-5"><h3 className="font-bold text-slate-950">Donations and payment reconciliation</h3><p className="mt-2 text-sm leading-6 text-slate-600">Verified contributions and enrollment payments appear after the provider callback reaches the secure backend. There are no live financial records in this preview.</p><div className="mt-5 border bg-slate-50 p-4 text-sm text-slate-600">No verified transactions connected.</div></section><form onSubmit={startCashout} className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Request cashout</h3><p className="mt-2 text-sm leading-6 text-slate-600">Cashouts require authenticated finance permissions, server-side balance checks, approval, and an audit record.</p></div><div className="space-y-2"><Label htmlFor="cashout-amount">Amount (KSh)</Label><Input id="cashout-amount" type="number" min="1" value={cashoutAmount} onChange={(event) => setCashoutAmount(event.target.value)} required /></div><Button className="bg-emerald-800 hover:bg-emerald-900" type="submit" disabled={!apiBase}><CircleDollarSign className="mr-2 h-4 w-4" />{apiBase ? 'Submit for approval' : 'Secure backend required'}</Button></form></div>}

          {active === 'gallery' && <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"><section className="space-y-4 border bg-white p-5"><h3 className="font-bold text-slate-950">Logo and site identity</h3><p className="text-sm leading-6 text-slate-600">Choose a local logo preview. It will not be published until secure media storage is connected.</p><Label htmlFor="brand-name">Display name</Label><Input id="brand-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /><Label htmlFor="logo-upload">Logo image</Label><Input id="logo-upload" type="file" accept="image/*" onChange={(event) => setImage(event, 'logo')} />{logoPreview && <img src={logoPreview} alt="Selected NAVSTAR logo preview" className="h-24 w-24 border object-contain p-2" />}<p className="text-xs text-slate-500">Recommended: transparent PNG or SVG, square format.</p></section><section className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Gallery</h3><p className="mt-1 text-sm text-slate-600">Preview up to eight images at a time. Storage is not configured.</p></div><Label htmlFor="gallery-upload">Add gallery images</Label><Input id="gallery-upload" type="file" accept="image/*" multiple onChange={(event) => setImage(event, 'gallery')} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{galleryPreview.map((url, index) => <img key={url} src={url} alt={`Gallery preview ${index + 1}`} className="aspect-square w-full border object-cover" />)}</div></section></div>}

          {active === 'settings' && <div className="grid gap-6 xl:grid-cols-2"><form onSubmit={saveSettings} className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Site settings</h3><p className="mt-1 text-sm text-slate-600">These controls update this preview only.</p></div><div className="space-y-2"><Label htmlFor="site-name">Site name</Label><Input id="site-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="contact-email">Admissions email</Label><Input id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="admissions@example.org" /></div><Button type="submit" variant="outline"><Save className="mr-2 h-4 w-4" />Save preview settings</Button></form><section className="space-y-4 border bg-white p-5"><div><h3 className="font-bold text-slate-950">Notification preferences</h3><p className="mt-1 text-sm text-slate-600">Configure which events the connected admin service should notify.</p></div>{[
            ['newApplication', 'New student application'], ['paymentUpdate', 'Payment status update'], ['donation', 'Donation received'],
          ].map(([key, label]) => <label key={key} className="flex items-center justify-between gap-4 border-b py-3 last:border-0"><span className="flex items-center gap-2 text-sm font-medium"><Bell className="h-4 w-4 text-emerald-800" />{label}</span><input type="checkbox" checked={notifications[key as keyof typeof notifications]} onChange={(event) => setNotifications((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-emerald-800" /></label>)}<p className="text-xs leading-5 text-slate-500">Browser push and SMS notifications require user permission and a notification backend.</p></section></div>}

          <footer className="mt-8 border-t pt-4 text-xs leading-5 text-slate-500">No API keys are stored in this site. Admin accounts, payment actions, student records, uploads, and settings need server-side authentication and authorization.</footer>
        </section>
      </div>
    </main>
  );
}