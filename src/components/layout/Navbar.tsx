import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, Monitor, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Notification = { id: string; title: string; message: string; read_at: string | null; created_at: string };

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Services', to: '/services' },
  { label: 'Donations', to: '/donations' },
  { label: 'Portals', to: '/portals' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [brandName, setBrandName] = useState('NAVSTAR DIGITAL HUB');
  const [logoUrl, setLogoUrl] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setSignedIn(false);
    setNotifications([]);
    navigate('/');
  };

  useEffect(() => {
    let active = true;
    const loadHeaderData = async () => {
      try {
        const settingsResponse = await fetch('/api/site-settings');
        if (settingsResponse.ok) {
          const result = await settingsResponse.json() as { settings?: { schoolName?: string; logoAssetId?: string } };
          if (active && result.settings) {
            setBrandName(result.settings.schoolName || 'NAVSTAR DIGITAL HUB');
            if (result.settings.logoAssetId) setLogoUrl(`/api/media/${result.settings.logoAssetId}`);
          }
        }
        const sessionResponse = await fetch('/api/auth/me');
        if (!sessionResponse.ok) return;
        const session = await sessionResponse.json() as { user?: { mustChangePassword?: boolean } };
        if (!active || !session.user) return;
        setSignedIn(true);
        if (session.user.mustChangePassword) return;
        const response = await fetch('/api/admin/notifications');
        if (response.ok) {
          const result = await response.json() as { notifications?: Notification[] };
          if (active) setNotifications(result.notifications ?? []);
        }
      } catch {
        // The public header remains usable when the backend has not been connected.
      }
    };
    void loadHeaderData();
    return () => { active = false; };
  }, []);

  const markNotificationsRead = async () => {
    const unread = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (!unread.length) return;
    const response = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread }),
    });
    if (response.ok) setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
  };

  const notificationPanel = (
    <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] border bg-white p-4 text-slate-900 shadow-lg">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Notifications</p><button onClick={markNotificationsRead} className="text-xs font-medium text-emerald-800 hover:underline">Mark all read</button></div>
      <div className="mt-3 max-h-72 overflow-y-auto border-t">
        {notifications.length ? notifications.map((item) => <div key={item.id} className={`border-b py-3 last:border-0 ${item.read_at ? '' : 'bg-emerald-50/60'}`}><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>) : <p className="py-4 text-sm text-slate-600">{signedIn ? 'You are all caught up.' : 'Sign in to see account notifications.'}</p>}
      </div>
      {!signedIn && <Link to="/login" className="mt-3 inline-block text-sm font-semibold text-emerald-800" onClick={() => setNotificationsOpen(false)}>Sign in</Link>}
    </div>
  );

  const notificationButton = (
    <div className="relative">
      <Button aria-label="Notifications" title="Notifications" variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)}>
        <Bell className="h-5 w-5" />
      </Button>
      {notifications.some((item) => !item.read_at) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />}
      {notificationsOpen && notificationPanel}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3" aria-label="NAVSTAR DIGITAL HUB home">
              {logoUrl ? <img src={logoUrl} alt="" className="h-9 w-9 object-contain" /> : <div className="rounded-md bg-emerald-700 p-2 text-white"><Monitor className="h-5 w-5" /></div>}
              <span className="text-sm font-extrabold tracking-wide text-slate-950 sm:text-base">{brandName}</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="relative ml-2">{notificationButton}</div>
              {signedIn ? <><Button asChild size="sm" variant="outline"><Link to="/portals">Portal</Link></Button><Button size="sm" className="ml-1 bg-emerald-800 hover:bg-emerald-900" onClick={signOut}>Sign out</Button></> : <Button asChild size="sm" className="ml-1 bg-emerald-800 hover:bg-emerald-900"><Link to="/login">Log in</Link></Button>}
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {notificationButton}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-white"
          >
            <div className="space-y-1 px-4 pb-3 pt-2 sm:px-6">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" onClick={() => setIsOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/portals/admissions" className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" onClick={() => setIsOpen(false)}>Admissions</Link>
              {signedIn ? <><Link to="/portals" className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" onClick={() => setIsOpen(false)}>Portal</Link><button onClick={() => { setIsOpen(false); void signOut(); }} className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-100">Sign out</button></> : <Link to="/login" className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" onClick={() => setIsOpen(false)}>Log in</Link>}
              <div className="mt-4">
                <Button asChild className="w-full bg-emerald-800 hover:bg-emerald-900">
                  <Link to="/courses" onClick={() => setIsOpen(false)}>Enroll Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}