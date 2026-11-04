import { Monitor, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white">
              <Monitor className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">NAVSTAR DIGITAL HUB</span>
            </Link>
            <p className="mt-4 text-sm leading-6">
              Empowering the next generation of digital professionals through quality education and accessible technology services.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/courses" className="text-sm hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/donations" className="text-sm hover:text-white transition-colors">Donations</Link></li>
              <li><Link to="/portals" className="text-sm hover:text-white transition-colors">Portals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Courses</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/courses" className="text-sm hover:text-white transition-colors">Computer Basics</Link></li>
              <li><Link to="/courses" className="text-sm hover:text-white transition-colors">Graphics Design</Link></li>
              <li><Link to="/courses" className="text-sm hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/courses" className="text-sm hover:text-white transition-colors">Cyber Security</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm">Main Street, Tech Plaza, 2nd Floor, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm">+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm">info@navstar.hub</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NAVSTAR DIGITAL HUB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}