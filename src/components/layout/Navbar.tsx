import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, Monitor, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3" aria-label="NAVSTAR DIGITAL HUB home">
              <div className="rounded-md bg-emerald-700 p-2 text-white">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="text-sm font-extrabold tracking-wide text-slate-950 sm:text-base">NAVSTAR DIGITAL HUB</span>
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
              <div className="relative ml-2">
                <Button aria-label="Notifications" title="Notifications" variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 border bg-white p-4 shadow-lg">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <p className="mt-3 border-t pt-3 text-sm text-slate-600">Admissions are open. Browse courses or contact the admissions team.</p>
                    <Link to="/portals/admissions" className="mt-3 inline-block text-sm font-semibold text-emerald-800" onClick={() => setNotificationsOpen(false)}>Open admissions portal</Link>
                  </div>
                )}
              </div>
              <Button asChild size="sm" className="ml-1 bg-emerald-800 hover:bg-emerald-900">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <div className="relative">
              <Button aria-label="Notifications" title="Notifications" variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="h-5 w-5" />
              </Button>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 border bg-white p-4 text-slate-900 shadow-lg">
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="mt-3 border-t pt-3 text-sm text-slate-600">Admissions are open. Browse courses or contact the admissions team.</p>
                  <Link to="/portals/admissions" className="mt-3 inline-block text-sm font-semibold text-emerald-800" onClick={() => setNotificationsOpen(false)}>Open admissions portal</Link>
                </div>
              )}
            </div>
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
              <Link to="/login" className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" onClick={() => setIsOpen(false)}>Log in</Link>
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