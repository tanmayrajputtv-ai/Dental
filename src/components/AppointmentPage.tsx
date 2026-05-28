import React, { useState, useEffect } from 'react';
import { CLINIC_INFO } from '../data';
import { dbService, sendSMSToDoctor } from '../lib/db';
import { UserProfile, DentalService } from '../types';
import { Calendar, Clock, Contact2, MessageSquare, Sparkles } from 'lucide-react';

interface AppointmentPageProps {
  currentUser: UserProfile | null;
  preselectedService?: string;
  onNavigate: (page: string) => void;
  onShowToast: (message: string, isSuccess: boolean) => void;
}

export default function AppointmentPage({
  currentUser,
  preselectedService = '',
  onNavigate,
  onShowToast
}: AppointmentPageProps) {
  const [formData, setFormData] = useState({
    patient_name: '',
    phone: '',
    email: '',
    service: '',
    preferred_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    preferred_time: '10:00 AM',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [dynamicServices, setDynamicServices] = useState<DentalService[]>([]);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [lastBookedApt, setLastBookedApt] = useState<any | null>(null);

  // Fetch active database-driven clinical services list
  useEffect(() => {
    const loadActiveServices = async () => {
      try {
        const list = await dbService.getServices();
        setDynamicServices(list);
      } catch (err) {
        console.error('Error listing treatments selection dropdown:', err);
      }
    };
    loadActiveServices();
  }, []);

  // Auto-populate logged-in patient details and dynamic dropdown defaults
  useEffect(() => {
    const fallbackService = preselectedService || (dynamicServices.length > 0 ? dynamicServices[0].name : 'General Checkup');
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        patient_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        service: fallbackService
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        service: fallbackService
      }));
    }
  }, [currentUser, preselectedService, dynamicServices]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = (slot: string) => {
    setFormData(prev => ({ ...prev, preferred_time: slot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.phone || !formData.service || !formData.preferred_date || !formData.preferred_time) {
      onShowToast('Please fill all mandatory fields marked with an asterisk (*).', false);
      return;
    }

    setLoading(true);
    try {
      // 1. Persist to database
      await dbService.createAppointment({
        user_id: currentUser ? currentUser.id : null,
        patient_name: formData.patient_name,
        phone: formData.phone,
        email: formData.email || undefined,
        service: formData.service,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        message: formData.message || undefined
      });

      // 2. Transmit Twilio dispatch
      const twilioRes = await sendSMSToDoctor({
        patient_name: formData.patient_name,
        service: formData.service,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        phone: formData.phone
      });

      console.log('Twilio SMS delivery outcome:', twilioRes);

      onShowToast('🎉 Appointment requested successfully! Dr. Tanmay Rajput will confirm shortly.', true);
      
      // Save details for success screen
      setLastBookedApt({
        patient_name: formData.patient_name,
        service: formData.service,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        phone: formData.phone,
        message: formData.message
      });
      setShowSuccessOverlay(true);

    } catch (e: any) {
      onShowToast(e.message || 'Appointment submission encountered an issue.', false);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessOverlay && lastBookedApt) {
    const whatsappMsg = encodeURIComponent(
      `🦷 *New Rajput Dental Appointment Request* 🦷\n\n` +
      `👤 *Patient:* ${lastBookedApt.patient_name}\n` +
      `📞 *Contact:* ${lastBookedApt.phone}\n` +
      `🦷 *Treatment:* ${lastBookedApt.service}\n` +
      `📅 *Date:* ${lastBookedApt.preferred_date}\n` +
      `⏰ *Time Slot:* ${lastBookedApt.preferred_time}\n` +
      `💬 *Patient Note:* ${lastBookedApt.message || 'None'}\n\n` +
      `Request logged in central app ledger.`
    );
    const whatsappUrl = `https://wa.me/917000818065?text=${whatsappMsg}`;

    return (
      <div className="fade-in py-24 bg-light/30 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 border border-maroon/10 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-100">
              🛰️ AUTO-ROUTED TO +91 7000818065
            </span>
            <h2 className="text-3xl font-heading font-extrabold text-dark mt-2">Appointment Scheduled!</h2>
            <p className="text-gray-500 font-body text-sm leading-relaxed max-w-md mx-auto">
              Your consultation request is registered. An automated SMS alert has been cataloged to **Dr. Tanmay Rajput** at **+91 7000818065**.
            </p>
          </div>

          {/* Direct WhatsApp trigger */}
          <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl space-y-3.5 text-left">
            <div className="flex gap-3">
              <span className="text-xl">💬</span>
              <div>
                <h4 className="text-sm font-bold text-dark font-heading">Interactive Mobile Instant-Alert</h4>
                <p className="text-xs text-gray-500 font-body mt-0.5">
                  Send this formatted reservation details slip directly to **+91 7000818065** via WhatsApp to secure booking confirmation instantly:
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md cursor-pointer text-center"
            >
              🚀 Send Details to WhatsApp (+91 7000818065) →
            </a>
          </div>

          {/* Details slip */}
          <div className="bg-light/40 border border-gray-100 rounded-2xl p-4 text-left font-body text-xs space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">Patient Name:</span>
              <span className="font-bold text-dark">{lastBookedApt.patient_name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">Requested Service:</span>
              <span className="font-bold text-dark">{lastBookedApt.service}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">Date/Time Slot:</span>
              <span className="font-bold text-dark">{lastBookedApt.preferred_date} • {lastBookedApt.preferred_time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">System Tracker State:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-[10px]">PENDING CONFIRMATION</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setShowSuccessOverlay(false);
                  setLastBookedApt(null);
                  onNavigate('dashboard');
                }}
                className="py-3 px-6 bg-dark hover:bg-maroon text-white font-bold text-sm rounded-xl transition-all duration-300 flex-1"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowSuccessOverlay(false);
                  setLastBookedApt(null);
                  setFormData({
                    patient_name: '',
                    phone: '',
                    email: '',
                    service: dynamicServices[0]?.name || 'General Checkup',
                    preferred_date: '',
                    preferred_time: '',
                    message: ''
                  });
                }}
                className="py-3 px-6 bg-dark hover:bg-maroon text-white font-bold text-sm rounded-xl transition-all duration-300 flex-1"
              >
                Book Another
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowSuccessOverlay(false);
                setLastBookedApt(null);
                onNavigate('home');
              }}
              className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all duration-300"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in py-20 bg-light/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        
        {/* Left column explanation & details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-crimson text-sm font-semibold uppercase tracking-wider block mb-2">📅 INSTANT OUTPATIENT ACCESS</span>
            <h1 className="text-4xl font-heading font-bold text-dark mb-4">Book Your Dental Consultation</h1>
            <p className="text-gray-600 font-body text-sm md:text-base leading-relaxed">
              Plan your physical clinic visit below. Our triage desk validates every request dynamically within 30 minutes during standard working hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-maroon/5 space-y-4">
            <h3 className="font-heading font-bold text-dark text-base">🔑 Patient Information</h3>
            <p className="text-xs text-gray-500 font-body leading-relaxed">
              If you register an online account, you can track live dental histories, view custom doctor notes, and receive priority booking queues.
            </p>
            {!currentUser && (
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="w-full text-center py-2.5 px-4 bg-maroon/10 hover:bg-maroon hover:text-white text-maroon font-bold text-xs rounded-xl transition-all duration-300"
              >
                Sign In To Automatically Autocomplete Details
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-golden/20 text-maroon flex items-center justify-center shrink-0">📞</div>
              <div>
                <h4 className="font-bold text-dark text-xs font-heading">Clinic Telephone</h4>
                <p className="text-xs text-crimson font-mono font-medium">{CLINIC_INFO.phone}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-golden/20 text-maroon flex items-center justify-center shrink-0">⏰</div>
              <div>
                <h4 className="font-bold text-dark text-xs font-heading">Opening Clock</h4>
                <p className="text-xs text-gray-500 font-body">{CLINIC_INFO.workingHours.weekdays}</p>
                <p className="text-xs text-gray-400 font-body">{CLINIC_INFO.workingHours.sunday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column Form card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-maroon/5 shadow-md">
            <h2 className="text-2xl font-heading font-bold text-dark mb-3">Patient Consultation Details</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-500 font-body">Please fill out the patient Consultation details below to book an appointment with Dr. Tanmay Rajput.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5 min-w-max">
                    <Contact2 size={14} className="text-crimson" /> Patient Name <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    required
                    value={formData.patient_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                  />
                </div>

                {/* Patient Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5 min-w-max">
                    📞 Contact Phone <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 7000818065"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors animate-pulse-once"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    📧 Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="patient@example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none"
                  />
                </div>

                {/* Target Treatment Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    🦷 Target Treatment <span className="text-crimson">*</span>
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none bg-white font-body"
                  >
                    {dynamicServices.map((s, idx) => (
                      <option key={s.id || idx} value={s.name}>
                        {s.name} ({s.priceClass})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinic Date Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-crimson" /> Preferred Date <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    required
                    min={new Date().toISOString().split('T')[0]} // Prevents bookings in the past
                    value={formData.preferred_date}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none bg-white font-body"
                  />
                </div>
              </div>

              {/* Time slots Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-crimson" /> Select a Time Slot <span className="text-crimson">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold font-body transition-all duration-300 ${
                        formData.preferred_time === slot
                          ? 'bg-crimson text-white border-crimson shadow-md scale-105'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-maroon/20 hover:bg-light/20'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Custom Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-crimson" /> Patient Custom Message (Optional)
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your pain level or dental issue..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-crimson focus:outline-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-crimson hover:bg-maroon disabled:bg-gray-400 text-white font-bold rounded-xl text-base shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing appointment request...
                    </>
                  ) : (
                    'Request Confirmed Appointment Slot 📅'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
