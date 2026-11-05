import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BootstrapPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${String(data.get('bootstrapToken') ?? '')}`,
        },
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), password: data.get('password') }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Admin setup failed.');
      form.reset();
      navigate('/login?role=admin', { replace: true, state: { notice: 'Admin account created. Sign in with your new credentials.' } });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Admin setup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg border bg-white p-6 shadow-sm sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Sign in</Link>
        <ShieldCheck className="mt-7 h-6 w-6 text-emerald-800" />
        <p className="mt-4 text-xs font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / FIRST-TIME SETUP</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Create the first Admin account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">This one-time setup requires the bootstrap token saved in Cloudflare Secrets. The token is sent only to this HTTPS backend and is never stored in the browser.</p>
        <form onSubmit={createAdmin} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="bootstrap-token">One-time setup token</Label><Input id="bootstrap-token" name="bootstrapToken" type="password" autoComplete="off" required minLength={32} /></div>
          <div className="space-y-2"><Label htmlFor="admin-name">Admin full name</Label><Input id="admin-name" name="name" autoComplete="name" required minLength={2} /></div>
          <div className="space-y-2"><Label htmlFor="admin-email">Admin email</Label><Input id="admin-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="space-y-2"><Label htmlFor="admin-password">Create password</Label><Input id="admin-password" name="password" type="password" autoComplete="new-password" minLength={14} required /><p className="text-xs text-slate-500">Use 14 or more characters. This password is sent only to the backend and stored as a salted hash.</p></div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-800 hover:bg-emerald-900"><KeyRound className="mr-2 h-4 w-4" />{loading ? 'Creating account…' : 'Create first Admin'}</Button>
          {status && <p role="status" className="text-sm text-red-700">{status}</p>}
        </form>
      </section>
    </main>
  );
}