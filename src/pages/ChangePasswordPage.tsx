import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const newPassword = String(values.get('newPassword') ?? '');
    if (newPassword !== String(values.get('confirmPassword') ?? '')) {
      setMessage('The new passwords do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: values.get('currentPassword'), newPassword }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Password change failed.');
      navigate('/login', { replace: true, state: { notice: 'Password changed. Sign in with the new password.' } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password change failed.');
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md border bg-white p-6 shadow-sm sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Sign in</Link>
        <KeyRound className="mt-7 h-6 w-6 text-emerald-800" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Change temporary password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose a unique password with at least 14 characters. It will be stored as a salted password hash.</p>
        <form onSubmit={changePassword} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="current-password">Temporary password</Label><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required /></div>
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={14} required /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={14} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-800 hover:bg-emerald-900">{loading ? 'Updating…' : 'Update password'}</Button>
          {message && <p role="status" className="text-sm text-red-700">{message}</p>}
        </form>
      </section>
    </main>
  );
}