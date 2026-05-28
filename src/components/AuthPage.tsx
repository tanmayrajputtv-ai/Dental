import React, { useState, useEffect } from 'react';
import { dbService, sendSMSToDoctor } from '../lib/db';
import { UserProfile, DentalService } from '../types';
import { Lock, Mail, Phone, ShieldCheck, User, UserPlus, Calendar, Clock, MapPin, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string, isSuccess: boolean) => void;
}

export default function AuthPage({ onLoginSuccess, onNavigate, onShowToast }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dynamicServices, setDynamicServices] = useState<DentalService[]>([]);

  // Sign In inputs (Completely empty for authentic user entries as requested)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register + Booking inputs (Completely blank and real as requested)
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    birth_date: '',
    gender: 'Male',
    address: '',
    treatment_type: '',
    appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default to 2 days from now
    appointment_time: '10:00 AM',
    notes: ''
  });

  // Success details to overlay
  const [successRecord, setSuccessRecord] = useState<{
    profile: UserProfile;
    appointmentDate: string;
    appointmentTime: string;
    treatment: string;
  } | null>(null);

  // Load clinic services dynamically on component mount
  useEffect(() => {
    const fetchClinicServices = async () => {
      try {
        const services = await dbService.getServices();
        setDynamicServices(services);
        if (services.length > 0) {
          setRegData(prev => ({ ...prev, treatment_type: services[0].name }));
        }
      } catch (err) {
        console.error('Error fetching clinical services lists:', err);
      }
    };
    fetchClinicServices();
  }, []);

  const handleRegInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      onShowToast('Please fill out all login credentials fields.', false);
      return;
    }

    setLoading(true);
    try {
      const res = await dbService.loginUser(cleanEmail, cleanPassword);
      onShowToast(`👋 Welcome back, ${res.profile.full_name}!`, true);
      onLoginSuccess(res.profile);
      
      // Redirect to correct dashboard based on role
      if (res.profile.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Login credentials evaluation failed. Please verify and retry.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Structural Validations
    if (!regData.full_name.trim()) {
      onShowToast('Please enter your full name.', false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regData.email)) {
      onShowToast('Please enter a valid patient email address format.', false);
      return;
    }
    if (regData.phone.length < 10) {
      onShowToast('Please enter a valid mobile number (min 10 digits).', false);
      return;
    }
    if (regData.password.length < 6) {
      onShowToast('Password strength warning: must be at least 6 characters.', false);
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      onShowToast('Password mismatch: confirm password must match.', false);
      return;
    }
    if (!regData.address.trim()) {
      onShowToast('Please specify your current physical residential address.', false);
      return;
    }

    setLoading(true);
    try {
      // 2. Perform Account Registration
      const rProfile = await dbService.signupUser({
        email: regData.email.trim(),
        full_name: regData.full_name.trim(),
        phone: regData.phone.trim(),
        birth_date: regData.birth_date || undefined,
        gender: regData.gender,
        address: regData.address.trim()
      }, regData.password);

      // 3. Create initial diagnostic appointment slot automatically as requested
      const chosenService = regData.treatment_type || (dynamicServices.length > 0 ? dynamicServices[0].name : 'General Consultation');
      const bookedApt = await dbService.createAppointment({
        user_id: rProfile.id,
        patient_name: rProfile.full_name,
        phone: rProfile.phone,
        email: rProfile.email,
        service: chosenService,
        preferred_date: regData.appointment_date,
        preferred_time: regData.appointment_time,
        message: regData.notes ? regData.notes.trim() : 'Patient Initial Registration Consultation request.'
      });

      // 4. Alert clinic desk via SMS dispatch emulate system on +91 7000818065
      await sendSMSToDoctor({
        patient_name: rProfile.full_name,
        service: chosenService,
        preferred_date: regData.appointment_date,
        preferred_time: regData.appointment_time,
        phone: rProfile.phone
      });

      // 5. Store parameters to show beautiful success card
      setSuccessRecord({
        profile: rProfile,
        appointmentDate: regData.appointment_date,
        appointmentTime: regData.appointment_time,
        treatment: chosenService
      });

      // Automatically authenticate the patient instantly so they do not need to re-login if they refresh/navigate
      onLoginSuccess(rProfile);

      onShowToast('🎉 Patient Profile registered & Initial Appointment scheduled!', true);
    } catch (err: any) {
      onShowToast(err.message || 'Error occurred during patient record creation.', false);
    } finally {
      setLoading(false);
    }
  };

  // Render registration success card overlay
  if (successRecord) {
    const docWhatsAppUrl = `https://wa.me/917000818065?text=${encodeURIComponent(
      `🦷 *New Patient Profile Created* 🦷\n\n` +
      `🆔 *Patient ID:* ${successRecord.profile.id}\n` +
      `👤 *Patient:* ${successRecord.profile.full_name}\n` +
      `📞 *Mobile Phone:* ${successRecord.profile.phone}\n` +
      `🦷 *Treatment Area:* ${successRecord.treatment}\n` +
      `📅 *Date:* ${successRecord.appointmentDate}\n` +
      `⏰ *Time Slot:* ${successRecord.appointmentTime}\n` +
      `🏠 *Residence:* ${successRecord.profile.address || 'None'}`
    )}`;

    return (
      <div className="fade-in py-24 bg-light/30 min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 border border-maroon/10 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 size={44} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-100 mb-2">
              📂 Patient Ledger ID: {successRecord.profile.id}
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-dark tracking-tight">Registration Complete!</h2>
            <p className="text-sm text-gray-500 font-body leading-relaxed max-w-md mx-auto">
              Your profile record has been successfully filed in the clinical directory of Rajput Dental Portal under secure key <strong>{successRecord.profile.id}</strong>.
            </p>
          </div>

          {/* Details grid */}
          <div className="bg-light/40 border border-gray-100 rounded-2xl p-5 text-left font-body text-xs space-y-3.5 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-sm text-maroon border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <span>📋</span> Medical Log Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Patient Name:</span>
                <span className="font-bold text-dark">{successRecord.profile.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unique Patient ID:</span>
                <span className="font-mono font-bold text-crimson bg-crimson/5 px-2 py-0.5 rounded border border-crimson/10">{successRecord.profile.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mobile Phone:</span>
                <span className="font-mono text-dark">{successRecord.profile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Treatment Slot:</span>
                <span className="font-bold text-dark">{successRecord.treatment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Schedule Slot:</span>
                <span className="font-semibold text-dark">{successRecord.appointmentDate} at {successRecord.appointmentTime}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Notification Link */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2.5">
            <p className="text-xs text-gray-500 font-body leading-relaxed">
              Dr. Tanmay Rajput receives automated internal summaries. Select below to send an instant message copy direct to <strong>+91 7000818065</strong>:
            </p>
            <a
              href={docWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              🚀 Coordinate via WhatsApp (+91 7000818065) →
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              // Log patient in and navigate directly to dashboard
              onLoginSuccess(successRecord.profile);
              onNavigate('dashboard');
            }}
            className="w-full max-w-sm py-4 px-6 bg-crimson hover:bg-maroon text-white font-heading font-extrabold text-sm rounded-xl tracking-wide shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            Access My Dashboard Page →
          </button>
        </div>
      </div>
    );
  }

  // Time Slots suggestions list
  const timeSlotsList = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  return (
    <div className="fade-in py-16 bg-light/30 flex items-center justify-center min-h-[90vh] px-4">
      <div className={`${isLogin ? 'max-w-md' : 'max-w-4xl'} w-full mx-auto`}>
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-maroon/5 shadow-2xl relative overflow-hidden transition-all duration-500">
          
          {/* Header Switch Toggles */}
          <div className="flex border-b border-gray-100 mb-8 pb-1">
            <button
              id="switch-login-btn"
              onClick={() => setIsLogin(true)}
              className={`flex-1 text-center pb-4 font-heading font-bold text-base transition-all duration-300 ${
                isLogin ? 'text-maroon border-b-2 border-crimson' : 'text-gray-400 hover:text-dark'
              }`}
            >
              Patient Sign In 🔑
            </button>
            <button
              id="switch-register-btn"
              onClick={() => setIsLogin(false)}
              className={`flex-1 text-center pb-4 font-heading font-bold text-base transition-all duration-300 ${
                !isLogin ? 'text-maroon border-b-2 border-crimson' : 'text-gray-400 hover:text-dark'
              }`}
            >
              New Patient Registration ✍️
            </button>
          </div>

          {isLogin ? (
            /* ================= LOGIN MODE ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-heading font-extrabold text-dark tracking-tight">Access Rajput Dental Portal</h2>
                <p className="text-xs text-gray-400 font-body mt-1">
                  Secure sign-in for registered clinic patients and clinical staff.
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5 select-none text-left font-heading">
                  <Mail size={14} className="text-crimson" /> Email / Username
                </label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Enter registered email address (e.g. name@domain.com)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/20"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5 select-none text-left font-heading">
                  <Lock size={14} className="text-crimson" /> Security Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your confidential account password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/20"
                />
              </div>

              {/* Submit Info */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-crimson hover:bg-maroon disabled:bg-gray-400 text-white font-heading font-extrabold rounded-xl text-sm shadow-md transition-all duration-300 uppercase tracking-widest mt-2 cursor-pointer"
              >
                {loading ? 'Validating account key...' : 'Access Portal Securely 🔑'}
              </button>
            </form>
          ) : (
            /* ================= REGISTER MODE ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-extrabold text-dark tracking-tight">New Patient Record Registration</h2>
                <p className="text-xs text-gray-400 font-body mt-1 max-w-lg mx-auto">
                  Provide demographic files to open your central patient record and schedule your dynamic initial dental checkup with Dr. Tanmay Rajput.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMN 1: PATIENT PERSONAL PROFILE */}
                <div className="bg-light/10 p-5 md:p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-heading font-bold text-sm text-maroon flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <User size={16} className="text-crimson" /> 1. Confidential Patient Demographics
                  </h3>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                      Full Patient Name <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={regData.full_name}
                      onChange={handleRegInputChange}
                      placeholder="Enter legal first and last name"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Email Address <span className="text-crimson">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={regData.email}
                        onChange={handleRegInputChange}
                        placeholder="patient@email.com"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Mobile Phone <span className="text-crimson">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={regData.phone}
                        onChange={handleRegInputChange}
                        placeholder="e.g. +91 7000818065"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        name="birth_date"
                        value={regData.birth_date}
                        onChange={handleRegInputChange}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={regData.gender}
                        onChange={handleRegInputChange}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white font-body"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Resident Address */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                      Residential Home Address <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={regData.address}
                      onChange={handleRegInputChange}
                      placeholder="Locality, City, State"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white"
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Login Password <span className="text-crimson">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        value={regData.password}
                        onChange={handleRegInputChange}
                        placeholder="Min 6 characters"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                        Confirm Password <span className="text-crimson">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={regData.confirmPassword}
                        onChange={handleRegInputChange}
                        placeholder="Repeat login password"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: FIRST DIAGNOSTIC SLOT APPOINTMENT */}
                <div className="bg-light/10 p-5 md:p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-heading font-bold text-sm text-maroon flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <Stethoscope size={16} className="text-crimson" /> 2. Schedule Initial Clinical Consultation
                  </h3>

                  {/* Treatment Type Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left">
                      Requested Treatment Type <span className="text-crimson">*</span>
                    </label>
                    <select
                      name="treatment_type"
                      value={regData.treatment_type}
                      onChange={handleRegInputChange}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white font-body"
                    >
                      {dynamicServices.map(s => (
                        <option key={s.id || s.name} value={s.name}>{s.name} ({s.priceClass || '₹500'})</option>
                      ))}
                      {dynamicServices.length === 0 && (
                        <>
                          <option value="General Consultation">General Diagnostic Checkup</option>
                          <option value="Scaling & Scaling">Prophylaxis Hygiene Scaling</option>
                          <option value="Root Canal Treatment">Root Canal Treatment (RCT)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Appointment Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left flex items-center gap-1">
                      <Calendar size={12} className="text-crimson" /> Consultation Preferred Date <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      required
                      value={regData.appointment_date}
                      onChange={handleRegInputChange}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-crimson focus:outline-none bg-white font-mono"
                    />
                  </div>

                  {/* Consultation Preferred Time Slot */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left flex items-center gap-1">
                      <Clock size={12} className="text-crimson" /> Prefer Time Slot <span className="text-crimson">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlotsList.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRegData(prev => ({ ...prev, appointment_time: slot }))}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border font-mono transition-all duration-200 ${
                            regData.appointment_time === slot
                              ? 'bg-crimson border-crimson text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Problem Description/Notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-dark uppercase tracking-wide block text-left flex items-center gap-1">
                      <FileText size={12} className="text-crimson" /> Clinical Notes / Problem Description
                    </label>
                    <textarea
                      name="notes"
                      rows={4}
                      value={regData.notes}
                      onChange={handleRegInputChange}
                      placeholder="e.g. Bleeding gum margins, tooth socket ache, or seeking custom restorative quotes."
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-crimson focus:outline-none bg-white font-body resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-crimson hover:bg-maroon disabled:bg-gray-400 text-white font-heading font-extrabold text-sm rounded-xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <UserPlus size={18} />
                {loading ? 'Filing Medical Ledger Accounts...' : 'Register Profile & Schedule Diagnostic Slot 🚀'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
