import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const roles = [
  ['student', 'Student'], ['tutor', 'Tutor'], ['admissions', 'Admissions'], ['principal', 'Principal'], ['admin', 'Administrator'],
];
const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = roles.some(([value]) => value === searchParams.get('role')) ? searchParams.get('role')! : 'student';
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiBase) {
      setStatus('Secure sign-in is not connected yet. No credentials were sent or stored.');
      return;
    }
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email: formData.get('email'), password: formData.get('password') }),
      });
      if (!response.ok) throw new Error('Sign-in could not be completed. Check your details or contact the school.');
      setStatus('Signed in. Your portal session is ready.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md border bg-white p-6 shadow-sm sm:p-8">
        <Link to="/portals" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> All portals</Link>
        <div className="mt-7 flex h-11 w-11 items-center justify-center bg-emerald-50 text-emerald-800"><LockKeyhole className="h-5 w-5" /></div>
        <p className="mt-5 text-xs font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Portal sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Select your role and use the account provided by NAVSTAR.</p>
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="role">Portal</Label><select id="role" value={role} onChange={(event) => setRole(event.target.value)} className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900">{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <Button type="submit" disabled={!apiBase || loading} className="w-full bg-emerald-800 hover:bg-emerald-900">{loading ? 'Signing in…' : apiBase ? 'Sign in securely' : 'Sign-in backend required'}</Button>
          <p role="status" className="text-sm text-slate-600">{status || 'Account access is not enabled until the authentication backend is configured.'}</p>
        </form>
      </section>
    </main>
  );
}