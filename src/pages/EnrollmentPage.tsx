import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INITIAL_COURSES } from '@/data/courses';
import type { Course } from '@/types';

export function EnrollmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [registrationId, setRegistrationId] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadCourse = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const result = await response.json() as { courses?: Course[] };
          const found = result.courses?.find((item) => item.id === id);
          if (found) {
            if (active) setCourse(found);
            return;
          }
        }
      } catch {
        // Fall back to the bundled catalog while the backend is unavailable.
      }
      const sampleCourse = INITIAL_COURSES.find((item) => item.id === id);
      if (sampleCourse && active) setCourse(sampleCourse);
      else if (active) navigate('/courses', { replace: true });
    };
    void loadCourse();
    return () => { active = false; };
  }, [id, navigate]);

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const normalizedPhone = String(formData.get('phone') ?? '').replace(/[\s-]/g, '');
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(normalizedPhone)) {
      setStatus('Enter a valid Kenyan mobile number to continue.');
      return;
    }
    if (!course) return;
    setPhone(normalizedPhone);
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(formData.entries()),
          phone: normalizedPhone,
          courseId: course.id,
          courseTitle: course.title,
        }),
      });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error ?? 'The application could not be submitted. Please contact admissions.');
      setRegistrationId(result.id ?? 'Submitted');
      setStatus('Application submitted securely. You can now request an M-Pesa payment prompt.');
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The application could not be submitted.');
    } finally {
      setLoading(false);
    }
  };

  const requestPayment = async () => {
    if (!registrationId || !course) return;
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/payments/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: course.price, purpose: 'enrollment', reference: registrationId }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? 'The payment prompt could not be requested. Please contact the school.');
      setStatus(result.message ?? 'Payment prompt sent. Approve it on your phone. Payment status will update after provider confirmation.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The payment prompt could not be requested.');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Courses</Link>
        <div className="mb-8 mt-5 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / ADMISSIONS</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Student application</h1>
            <p className="mt-2 text-slate-600">Complete the details for {course.title}. Required fields are marked.</p>
          </div>
          <span className="w-fit border bg-white px-3 py-2 text-sm font-semibold text-slate-700">Application · 01</span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={submitApplication} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Personal details</CardTitle><CardDescription>Use the contact details you want admissions to use.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="full-name">Full legal name *</Label><Input id="full-name" name="fullName" autoComplete="name" required /></div>
                <div className="space-y-2"><Label htmlFor="email">Email address *</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
                <div className="space-y-2"><Label htmlFor="phone">M-Pesa phone number *</Label><Input id="phone" name="phone" inputMode="tel" autoComplete="tel" placeholder="07xx xxx xxx" required /></div>
                <div className="space-y-2"><Label htmlFor="birth-date">Date of birth *</Label><Input id="birth-date" name="dateOfBirth" type="date" required /></div>
                <div className="space-y-2"><Label htmlFor="national-id">National ID or passport</Label><Input id="national-id" name="identityNumber" autoComplete="off" /></div>
                <div className="space-y-2"><Label htmlFor="gender">Gender</Label><select id="gender" name="gender" className="h-10 w-full border border-slate-300 bg-white px-3 text-sm"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Another identity</option></select></div>
                <div className="space-y-2"><Label htmlFor="nationality">Nationality</Label><Input id="nationality" name="nationality" autoComplete="country-name" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Course and education</CardTitle><CardDescription>Tell admissions how you plan to study.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="course-title">Selected course</Label><Input id="course-title" value={course.title} readOnly /></div>
                <div className="space-y-2"><Label htmlFor="study-mode">Study mode *</Label><select id="study-mode" name="studyMode" required className="h-10 w-full border border-slate-300 bg-white px-3 text-sm"><option value="">Select mode</option><option>On campus</option><option>Online</option><option>Hybrid</option></select></div>
                <div className="space-y-2"><Label htmlFor="education-level">Highest education level *</Label><select id="education-level" name="educationLevel" required className="h-10 w-full border border-slate-300 bg-white px-3 text-sm"><option value="">Select level</option><option>Primary</option><option>Secondary</option><option>Certificate</option><option>Diploma</option><option>Degree or higher</option></select></div>
                <div className="space-y-2"><Label htmlFor="intake">Preferred intake</Label><Input id="intake" name="preferredIntake" type="month" /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="experience">Relevant experience or learning goals</Label><textarea id="experience" name="experience" rows={3} className="w-full border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Share anything that will help us support your learning." /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Address and emergency contact</CardTitle><CardDescription>Use a trusted contact who can be reached if needed.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="county">County *</Label><Input id="county" name="county" autoComplete="address-level1" required /></div>
                <div className="space-y-2"><Label htmlFor="town">Town or area *</Label><Input id="town" name="town" autoComplete="address-level2" required /></div>
                <div className="space-y-2"><Label htmlFor="address">Postal or physical address</Label><Input id="address" name="address" autoComplete="street-address" /></div>
                <div className="space-y-2"><Label htmlFor="emergency-name">Emergency contact name *</Label><Input id="emergency-name" name="emergencyContactName" required /></div>
                <div className="space-y-2"><Label htmlFor="emergency-phone">Emergency contact phone *</Label><Input id="emergency-phone" name="emergencyContactPhone" inputMode="tel" required /></div>
                <div className="space-y-2"><Label htmlFor="relationship">Relationship</Label><Input id="relationship" name="emergencyContactRelationship" /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="support-needs">Accessibility or learning support needs</Label><textarea id="support-needs" name="supportNeeds" rows={3} className="w-full border border-slate-300 bg-white px-3 py-2 text-sm" /></div>
              </CardContent>
            </Card>

            <label className="flex items-start gap-3 border bg-white p-4 text-sm leading-6 text-slate-700"><input type="checkbox" name="consent" required className="mt-1 accent-emerald-800" /><span>I agree that admissions may contact me about this application and confirm that the information provided is accurate.</span></label>
            <Button className="w-full bg-emerald-800 hover:bg-emerald-900 sm:w-auto" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit application'}</Button>
            {status && <p role="status" className="border bg-white p-4 text-sm text-slate-700">{status}</p>}
            {registrationId && <Card className="border-emerald-200"><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-700" />Application received</CardTitle><CardDescription>Reference: {registrationId}</CardDescription></CardHeader><CardContent><Button type="button" className="bg-emerald-800 hover:bg-emerald-900" onClick={requestPayment} disabled={loading}>Request M-Pesa prompt</Button></CardContent></Card>}
          </form>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card><CardHeader><CardTitle className="text-lg">Application summary</CardTitle></CardHeader><CardContent className="space-y-4"><div className="aspect-video overflow-hidden bg-slate-100"><img src={course.image} alt={course.title} className="h-full w-full object-cover" /></div><div><h2 className="font-bold text-slate-950">{course.title}</h2><p className="mt-1 text-sm text-slate-500">{course.duration} · {course.category}</p></div><div className="flex justify-between border-t pt-4 text-sm"><span className="text-slate-600">Course fee</span><strong>KSh {course.price.toLocaleString()}</strong></div><p className="text-xs leading-5 text-slate-500">Fees are shown for planning. Payment is not marked received until the provider confirms it.</p></CardContent></Card>
            <div className="border-l-2 border-emerald-700 bg-white p-4 text-sm text-slate-700"><div className="flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4 text-emerald-800" />M-Pesa safety</div><p className="mt-2 leading-5">A prompt can only be sent by a configured secure backend. Enter your PIN only on the official prompt on your phone.</p></div>
            <div className="flex items-start gap-2 text-xs leading-5 text-slate-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />Application data is sent to the configured NAVSTAR admissions backend.</div>
            <div className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0" />Student information must be stored server-side with access controls.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}