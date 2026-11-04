import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { CoursesPage } from '@/pages/CoursesPage';
import { EnrollmentPage } from '@/pages/EnrollmentPage';
import { AdminPage } from '@/pages/AdminPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { DonationsPage } from '@/pages/DonationsPage';
import { PortalsPage } from '@/pages/PortalsPage';
import { LoginPage } from '@/pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/portals" element={<PortalsPage />} />
            <Route path="/portals/:role" element={<PortalsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/enroll/:id" element={<EnrollmentPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;