import { FormEvent, useState } from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const amounts = [200, 500, 1000, 2500];

export function DonationsPage() {
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const startDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phone.replace(/[\s-]/g, '');
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(normalizedPhone)) {
      setMessage('Enter a valid Kenyan mobile number.');
      return;
    }
    if (!apiBase) {
      setMessage('Online donations are not connected yet. No payment prompt was sent.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/payments/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, amount, purpose: 'donation' }),
      });
      if (!response.ok) throw new Error('Payment prompt could not be started.');
      setMessage('Prompt requested. Complete it on your phone, then wait for the payment confirmation.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment prompt could not be started.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="container mx-auto grid gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_390px] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-800">NAVSTAR DIGITAL HUB / COMMUNITY</p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold text-slate-950 sm:text-4xl">Help more people get connected to digital skills</h1>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">Your contribution can support learning materials, supervised computer access, and practical technology training.</p>
            <div className="mt-8 flex items-start gap-3 border-l-2 border-emerald-700 pl-4 text-sm text-slate-600"><HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" /><p>Donations are voluntary. A payment must be confirmed by the payment provider before it is recorded as received.</p></div>
          </div>
          <form onSubmit={startDonation} className="border bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-950">Make a contribution</h2>
            <p className="mt-1 text-sm text-slate-600">Choose an amount and the phone to receive the prompt.</p>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-slate-800">Amount (KSh)</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {amounts.map((option) => <button key={option} type="button" onClick={() => setAmount(option)} aria-pressed={amount === option} className={`min-h-11 border px-3 text-sm font-semibold ${amount === option ? 'border-emerald-800 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{option.toLocaleString()}</button>)}
              </div>
            </fieldset>
            <div className="mt-4 space-y-2">
              <Label htmlFor="donation-amount">Other amount</Label>
              <Input id="donation-amount" type="number" min="1" max="150000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="donation-phone">M-Pesa phone number</Label>
              <Input id="donation-phone" autoComplete="tel" inputMode="tel" placeholder="07xx xxx xxx" value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
            <Button className="mt-6 w-full bg-emerald-800 hover:bg-emerald-900" type="submit" disabled={loading || amount < 1}>{loading ? 'Requesting prompt…' : `Request KSh ${amount.toLocaleString()} prompt`}</Button>
            {message && <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}
            <p className="mt-5 flex items-start gap-2 border-t pt-4 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Enter your M-Pesa PIN only on the official prompt on your phone. NAVSTAR will never ask for your PIN on this website.</p>
          </form>
        </div>
      </section>
    </main>
  );
}