import { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Pricing from './components/Pricing';
import AppointmentPage from './components/AppointmentPage';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import AdminPage from './components/AdminPage';
import Contact from './components/Contact';
import { UserProfile } from './types';
import { CLINIC_INFO, CLINIC_PHOTOS } from './data';
import { Menu, X, Shield, Star, Smile, Calendar, MapPin, Phone, Mail, FileCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [preselectedService, setPreselectedService] = useState<string>('');
  
  // Mobile Nav Drawer Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll handler for sticky header shadow
  const [scrolled, setScrolled] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{ show: boolean; message: string; isSuccess: boolean }>({
    show: false,
    message: '',
    isSuccess: true
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Load active profile from local memory session if existing
    const storedUser = localStorage.getItem('rajput_clinic_active_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('rajput_clinic_active_user');
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (message: string, isSuccess: boolean = true) => {
    setToast({ show: true, message, isSuccess });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const handleNavigate = (page: string, serviceToPreselect?: string) => {
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
    
    if (serviceToPreselect) {
      setPreselectedService(serviceToPreselect);
    } else {
      setPreselectedService('');
    }
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setCurrentUser(userProfile);
    localStorage.setItem('rajput_clinic_active_user', JSON.stringify(userProfile));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rajput_clinic_active_user');
    showToast('👋 You have logged out safely. Visit soon!');
    handleNavigate('home');
  };

  const nameInitials = (name?: string): string => {
    if (!name) return 'PT';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-light font-body text-dark selection:bg-crimson selection:text-white antialiased">
      
      {/* 1. Header Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-body ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3' 
            : 'bg-white/95 border-b border-light py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button 
            onClick={() => handleNavigate('home')} 
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-maroon to-crimson text-white flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform duration-300">
              <Smile size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left font-heading">
              <span className="text-lg md:text-xl font-bold text-dark group-hover:text-maroon transition-colors block leading-tight">
                Rajput Dental
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mt-0.5">
                Dr. Tanmay Rajput
              </span>
            </div>
          </button>

          {/* Large Screen Nav Menu Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'services', label: 'Services' },
              { id: 'pricing', label: 'Pricing Programs' },
              { id: 'appointment', label: 'Appointment Form' },
              { id: 'contact', label: 'Contact Us' }
            ].map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === link.id
                    ? 'bg-maroon/10 text-maroon font-extrabold'
                    : 'text-gray-600 hover:text-dark hover:bg-light/40'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Side Identity Auth block */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-light/75 border border-maroon/5 py-1.5 pl-3 pr-2.5 rounded-full select-none shadow-sm">
                <span className="text-xs font-bold text-dark font-body">
                  👤 {currentUser.full_name} • <span className="font-mono text-crimson">{currentUser.phone}</span>
                </span>
                
                <button
                  onClick={() => handleNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className="w-8 h-8 rounded-full bg-maroon text-golden font-heading font-extrabold text-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {nameInitials(currentUser.full_name)}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout Profile"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => handleNavigate('auth')}
                className="px-5 py-2.5 bg-crimson hover:bg-maroon font-bold text-xs text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                Access Portal 🔑
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-dark hover:bg-light/50 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </header>

      {/* 2. Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[64px] z-30 lg:hidden bg-white border-b border-light shadow-xl overflow-y-auto animate-fade-in py-6 px-6 font-body flex flex-col justify-between">
          <nav className="flex flex-col gap-2.5">
            {[
              { id: 'home', label: '🏠 Home Outline' },
              { id: 'about', label: '🩺 About Dr. Tanmay' },
              { id: 'services', label: '✨ Specialized Services' },
              { id: 'pricing', label: '💎 Annual Membership Plans' },
              { id: 'appointment', label: '📅 Book Consultations' },
              { id: 'contact', label: '📍 Contact & Location' }
            ].map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                  activeTab === link.id
                    ? 'bg-maroon text-white font-extrabold'
                    : 'text-gray-600 hover:bg-light/30 hover:text-dark'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-maroon/5 pt-6 mt-6">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-maroon text-golden font-heading font-extrabold text-xs flex items-center justify-center">
                    {nameInitials(currentUser.full_name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-xs">{currentUser.full_name}</h4>
                    <span className="text-[10px] font-mono text-crimson font-semibold">{currentUser.phone}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                    className="py-2.5 text-center bg-light text-maroon font-bold text-xs rounded-xl border border-maroon/5"
                  >
                    My Panel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-2.5 text-center bg-red-50 text-red-600 font-bold text-xs rounded-xl"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('auth')}
                className="w-full text-center py-3 bg-crimson hover:bg-maroon font-bold text-sm text-white rounded-xl shadow"
              >
                Sign In Patient Portal 🔑
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Views Content Renderer */}
      <main className="flex-grow">
        {activeTab === 'home' && <Home onNavigate={handleNavigate} />}
        {activeTab === 'about' && <About />}
        {activeTab === 'services' && <Services onNavigate={handleNavigate} />}
        {activeTab === 'pricing' && <Pricing onNavigate={handleNavigate} />}
        {activeTab === 'appointment' && (
          <AppointmentPage
            currentUser={currentUser}
            preselectedService={preselectedService}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
        {activeTab === 'contact' && <Contact onShowToast={showToast} />}
        {activeTab === 'auth' && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
        {activeTab === 'dashboard' && currentUser && (
          <DashboardPage
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onProfileUpdated={handleLoginSuccess}
          />
        )}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPage
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* 4. Footer Wrapper */}
      <footer className="bg-dark text-white border-t border-maroon/20 font-body">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Clinic Tagline column */}
          <div className="space-y-4">
            <h4 className="text-xl font-heading font-extrabold text-golden">{CLINIC_INFO.name}</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Crafting sparkling healthy dental aesthetics with over 15 years of surgical specialties. Bhopal's trusted pain-free diagnostic clinic.
            </p>
            <div className="flex gap-2.5">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-golden flex items-center justify-center text-xs hover:bg-golden hover:text-dark transition-colors">📸</span>
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-golden flex items-center justify-center text-xs hover:bg-golden hover:text-dark transition-colors">📘</span>
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-golden flex items-center justify-center text-xs hover:bg-golden hover:text-dark transition-colors">💬</span>
            </div>
          </div>

          {/* Location column */}
          <div className="space-y-4 text-xs font-light">
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-sm">📍 Contact Address</h5>
            <div className="space-y-2.5 text-gray-400">
              <p className="flex items-start gap-2">
                <span className="text-crimson text-sm shrink-0">📍</span>
                <span>{CLINIC_INFO.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-crimson text-sm shrink-0">📞</span>
                <span className="font-mono font-medium text-white">{CLINIC_INFO.phone}</span>
              </p>
              <p className="flex items-center gap-2 break-all">
                <span className="text-crimson text-sm shrink-0">📧</span>
                <span className="text-white">{CLINIC_INFO.email}</span>
              </p>
            </div>
          </div>

          {/* Quick links columns */}
          <div className="space-y-4 text-xs">
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-sm">🔖 Fast Navigation</h5>
            <nav className="flex flex-col gap-2">
              {[
                { id: 'about', label: 'Doctor Academics' },
                { id: 'services', label: 'Dental Pricing List' },
                { id: 'pricing', label: 'Wellness Subscriptions' },
                { id: 'appointment', label: 'Secure Consultation Slot' },
                { id: 'contact', label: 'Google Maps Location' },
                { id: 'auth', label: 'Demo Admin Bypass Login' }
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavigate(link.id)}
                  className="w-max text-left text-gray-400 hover:text-golden font-light transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Working times column */}
          <div className="space-y-4 text-xs text-gray-400">
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-sm">⏰ Operations Hours</h5>
            <div className="space-y-2 font-light">
              <p className="flex justify-between border-b border-white/5 pb-1">
                <span>Monday – Saturday</span>
                <span className="font-medium text-white">9:00 AM – 7:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Sunday (Emergency Only)</span>
                <span className="font-medium text-white">10:00 AM – 2:00 PM</span>
              </p>
            </div>
            <div className="mt-4 bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2 text-[11px] text-golden">
              <span>🌟</span>
              <span>Sunday slot bookings must be prioritized via WhatsApp!</span>
            </div>
          </div>

        </div>

        {/* Outer bottom copyright bar */}
        <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500 font-light font-body">
          <p>Copyright © 2026 {CLINIC_INFO.name}. All Rights Reserved. Special clinical care under {CLINIC_INFO.doctor}.</p>
        </div>
      </footer>

      {/* 5. Persistent floating green WhatsApp button tag as requested */}
      <a
        href={`https://wa.me/917000818065?text=Hello%20Dr.%20Tanmay%20Rajput,%20I%20would%20like%20to%20book%20a%20dental%20appointment.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center sm:scale-105 shadow-2xl hover:shadow-green-500/30 hover:scale-110 active:scale-95 transition-all duration-300"
        title="Chat on WhatsApp with Dr. Tanmay Rajput"
      >
        <span className="text-3xl">💬</span>
      </a>

      {/* 6. Dynamic Toast Notifications Overlay */}
      {toast.show && (
        <div className="fixed bottom-24 right-6 z-50 max-w-sm w-full animate-slide-up font-body">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 transition-all duration-300 ${
              toast.isSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.isSuccess ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <span className="text-sm font-bold">{toast.isSuccess ? '✓' : '✗'}</span>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-heading font-extrabold text-sm">{toast.isSuccess ? 'Done!' : 'Notice'}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-gray-400 hover:text-dark transition-colors inline-block"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
