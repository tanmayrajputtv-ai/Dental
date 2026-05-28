import React, { useState, useEffect } from 'react';
import { dbService, ClinicDatabase } from '../lib/db';
import { Appointment, UserProfile, DentalService } from '../types';
import { CLINIC_INFO } from '../data';
import { 
  Users, Calendar, CheckSquare, Clock, 
  Settings, LogOut, CheckCircle, XCircle, 
  MessageCircle, ClipboardList, ShieldAlert,
  Database, Info, AlertOctagon, Plus, Trash2, Copy
} from 'lucide-react';

interface AdminPageProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string, isSuccess: boolean) => void;
}

export default function AdminPage({ onLogout, onNavigate, onShowToast }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'users' | 'services' | 'settings'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [doctorNote, setDoctorNote] = useState('');

  // Add Service Form - Preseeded with gorgeous dummy treatment data
  const [newSrv, setNewSrv] = useState({ 
    name: 'Laser Whitening Treatment', 
    description: 'An ultra-advanced, safe laser scan procedure that clears long-standing enamel stains and deeply whitens teeth in under 45 minutes.', 
    priceClass: '₹3,000–₹5,000', 
    icon: '✨' 
  });

  // Credentials config values
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [twSid, setTwSid] = useState('');
  const [twAuth, setTwAuth] = useState('');
  const [twPhone, setTwPhone] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const listApt = await dbService.getAppointments();
      const listUsers = await dbService.getUsers();
      const listServices = await dbService.getServices();
      setAppointments(listApt);
      setUsers(listUsers);
      setServices(listServices);
    } catch (e) {
      console.error('Failed to load admin dataset:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load existing settings
    setSbUrl(localStorage.getItem('rajput_clinic_supabase_url') || '');
    setSbKey(localStorage.getItem('rajput_clinic_supabase_key') || '');
    setTwSid(localStorage.getItem('rajput_clinic_twilio_sid') || '');
    setTwAuth(localStorage.getItem('rajput_clinic_twilio_token') || '');
    setTwPhone(localStorage.getItem('rajput_clinic_twilio_phone') || '');
  }, []);

  const handleSaveCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.saveSupabaseCredentials(sbUrl, sbKey);
      
      if (twSid && twAuth && twPhone) {
        localStorage.setItem('rajput_clinic_twilio_sid', twSid);
        localStorage.setItem('rajput_clinic_twilio_token', twAuth);
        localStorage.setItem('rajput_clinic_twilio_phone', twPhone);
      } else {
        localStorage.removeItem('rajput_clinic_twilio_sid');
        localStorage.removeItem('rajput_clinic_twilio_token');
        localStorage.removeItem('rajput_clinic_twilio_phone');
      }

      onShowToast('🔌 Credentials successfully saved! Reconnected core service panels.', true);
      loadData();
    } catch (err: any) {
      onShowToast('Could not reload configurations properly.', false);
    }
  };

  const handleResetCredentials = () => {
    setSbUrl('');
    setSbKey('');
    setTwSid('');
    setTwAuth('');
    setTwPhone('');
    localStorage.removeItem('rajput_clinic_supabase_url');
    localStorage.removeItem('rajput_clinic_supabase_key');
    localStorage.removeItem('rajput_clinic_twilio_sid');
    localStorage.removeItem('rajput_clinic_twilio_token');
    localStorage.removeItem('rajput_clinic_twilio_phone');
    
    // Trigger reconstruct fallback
    dbService.saveSupabaseCredentials('', '');
    onShowToast('🧹 Connection credentials reset back to Local DB sandbox mode.', true);
    loadData();
  };

  // Open note modal and queue selected id
  const openApproveModal = (id: string) => {
    setSelectedAptId(id);
    setDoctorNote('');
    setModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedAptId) return;
    try {
      await dbService.updateAppointmentStatus(selectedAptId, 'approved', doctorNote);
      onShowToast('🎉 Appointment officially approved and patient notified!', true);
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      onShowToast(e.message || 'Error executing status alteration.', false);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this patient appointment request?')) {
      try {
        await dbService.updateAppointmentStatus(id, 'rejected');
        onShowToast('❌ Patient appointment has been labeled rejected.', true);
        loadData();
      } catch (e: any) {
        onShowToast(e.message || 'Error executing status alteration.', false);
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrv.name || !newSrv.description || !newSrv.priceClass) {
      onShowToast('⚠️ Please fill out all fields to register the new service.', false);
      return;
    }
    try {
      await dbService.createService({
        name: newSrv.name,
        description: newSrv.description,
        priceClass: newSrv.priceClass,
        icon: newSrv.icon || '🦷'
      });
      onShowToast(`✨ Dental Service "${newSrv.name}" successfully activated!`, true);
      setNewSrv({ name: '', description: '', priceClass: '', icon: '🦷' });
      await loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Error injecting clinical service.', false);
    }
  };

  const handleDeleteService = async (id: string, srvName: string) => {
    if (confirm(`🗑️ Are you sure you want to permanently delete "${srvName}"? Patients won't be able to book it anymore.`)) {
      try {
        await dbService.deleteService(id);
        onShowToast(`🗑️ "${srvName}" has been deleted from active portfolio.`, true);
        await loadData();
      } catch (err: any) {
        onShowToast(err.message || 'Error removing dynamic service.', false);
      }
    }
  };

  // Metrics
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const rejectedCount = appointments.filter(a => a.status === 'rejected').length;
  const totalRegUsers = users.length;

  return (
    <div className="fade-in min-h-screen bg-light/20 flex flex-col md:flex-row mt-16 font-body text-xs md:text-sm">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-dark text-white p-6 md:min-h-[calc(100vh-64px)] shrink-0 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-heading font-extrabold text-golden flex items-center gap-1.5 uppercase tracking-wide">
              <span>🩺 DR. RAJPUT PANELS</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mt-1">Admin command board</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                activeTab === 'overview' ? 'bg-maroon text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ClipboardList size={18} /> Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                activeTab === 'appointments' ? 'bg-maroon text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar size={18} /> Manage Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                activeTab === 'users' ? 'bg-maroon text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users size={18} /> Patients Database ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                activeTab === 'services' ? 'bg-maroon text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <CheckSquare size={18} /> Manage Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                activeTab === 'settings' ? 'bg-maroon text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={18} /> Sync & Integrations
            </button>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 font-body">
          <p className="text-[10px] text-gray-400">Log out to secure panels:</p>
          <button
            onClick={onLogout}
            className="w-full mt-2 py-2 px-3 bg-red-800 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-all duration-300"
          >
            <LogOut size={14} /> Exit Admin Space
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 p-6 md:p-10">
        
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-crimson border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 mt-4">Connecting to secure storage...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TAB OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-heading font-extrabold text-dark">Clinical Dashboard</h1>
                  <p className="text-gray-500 font-body text-xs">Real-time stats and metrics analysis</p>
                </div>

                {/* Scorecard grids */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border border-maroon/5 rounded-2xl shadow-sm space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Total Bookings</span>
                    <p className="text-3xl font-heading font-bold text-dark">{appointments.length}</p>
                    <span className="text-[10px] text-gray-400 font-body">Cumulative visits filed</span>
                  </div>
                  <div className="p-6 bg-white border border-yellow-200 rounded-2xl shadow-sm space-y-2 bg-yellow-50/10">
                    <span className="text-[10px] uppercase font-mono text-yellow-600 block">Pending Reviews</span>
                    <p className="text-3xl font-heading font-bold text-yellow-700">{pendingCount}</p>
                    <span className="text-[10px] text-yellow-600 font-body font-bold">Action required! ⚠️</span>
                  </div>
                  <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-sm space-y-2 bg-emerald-50/10">
                    <span className="text-[10px] uppercase font-mono text-emerald-600 block">Approved Slots</span>
                    <p className="text-3xl font-heading font-bold text-emerald-700">{approvedCount}</p>
                    <span className="text-[10px] text-emerald-600 font-body">Confirmed clinical slots</span>
                  </div>
                  <div className="p-6 bg-white border border-maroon/5 rounded-2xl shadow-sm space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Registered Patients</span>
                    <p className="text-3xl font-heading font-bold text-dark">{totalRegUsers}</p>
                    <span className="text-[10px] text-gray-400 font-body">Bhopal files registered</span>
                  </div>
                </div>

                {/* Integration Info Banner */}
                <div className="p-5 bg-gradient-to-r from-maroon/5 to-crimson/5 border border-maroon/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-3 items-start md:items-center">
                    <Database className="text-maroon shrink-0" />
                    <div>
                      <h4 className="font-heading font-bold text-dark text-sm">Database System Connection Status:</h4>
                      <p className="text-xs text-gray-500 font-body">
                        {dbService.getIsSupabaseConnected() 
                          ? '✅ Connected live to your Supabase tables. Real-time data processing is active.' 
                          : '🔌 Sandbox local storage mode is active. (No database limits. Pre-loaded with diagnostic mock files.)'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-maroon hover:bg-crimson text-white font-bold text-xs rounded-lg transition-all duration-300 font-body shrink-0 inline-flex items-center gap-1"
                  >
                    Configure Database Real-Keys
                  </button>
                </div>

                {/* Recent Pending Table */}
                <div className="bg-white rounded-2xl border border-maroon/5 p-6 shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-dark text-base">Quick-Review Pending Appointments</h3>
                  {appointments.filter(a => a.status === 'pending').length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No pending requests awaiting approval right now.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-500 font-body divide-y">
                        <thead>
                          <tr className="bg-light/30 text-dark font-bold">
                            <th className="p-3">Patient</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Time Slot</th>
                            <th className="p-3 text-center">Operation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {appointments.filter(a => a.status === 'pending').slice(0, 5).map((apt, idx) => (
                            <tr key={idx} className="hover:bg-light/10">
                              <td className="p-3">
                                <div className="font-bold text-dark">{apt.patient_name}</div>
                                <div className="text-[10px] font-mono text-gray-400">{apt.phone}</div>
                              </td>
                              <td className="p-3 font-medium text-dark">{apt.service}</td>
                              <td className="p-3">
                                <div>{apt.preferred_date}</div>
                                <div className="text-[10px] text-gray-400">{apt.preferred_time}</div>
                              </td>
                              <td className="p-3 text-center flex justify-center gap-2">
                                <button
                                  onClick={() => openApproveModal(apt.id)}
                                  className="p-1 px-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded font-bold transition-all text-[11px]"
                                >
                                  Approve ✓
                                </button>
                                <button
                                  onClick={() => handleReject(apt.id)}
                                  className="p-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded font-bold transition-all text-[11px]"
                                >
                                  Reject ✗
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB ALL APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-maroon/5 shadow-sm">
                  <div>
                    <h1 className="text-2xl font-heading font-extrabold text-dark">Manage Appointments Pipeline</h1>
                    <p className="text-gray-500 font-body text-xs">Authorize, reject, or edit consultation bookings</p>
                  </div>
                  <span className="text-xs font-bold text-maroon bg-golden/25 px-3 py-1.5 rounded-full border border-golden/5 font-body">
                    Count: {appointments.length} Total slots
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-maroon/5 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500 font-body divide-y">
                      <thead>
                        <tr className="bg-light text-dark font-extrabold">
                          <th className="p-4">Patient Name</th>
                          <th className="p-4">Service Required</th>
                          <th className="p-4">Requested Datetime</th>
                          <th className="p-4">Contact Detail</th>
                          <th className="p-4">Status Map</th>
                          <th className="p-4 text-center">Action Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {appointments.map((apt, idx) => (
                          <tr key={idx} className="hover:bg-light/10 font-body">
                            <td className="p-4">
                              <div className="font-bold text-dark text-sm">{apt.patient_name}</div>
                              {apt.message && <p className="text-[10px] text-gray-400 max-w-xs mt-1 italic font-light">"{apt.message}"</p>}
                              {apt.doctor_note && <p className="text-[10px] text-emerald-600 font-medium max-w-xs mt-1">🩺 Notes: "{apt.doctor_note}"</p>}
                            </td>
                            <td className="p-4 text-dark font-bold text-xs">{apt.service}</td>
                            <td className="p-4">
                              <div className="font-medium text-dark">{apt.preferred_date}</div>
                              <div className="text-gray-400 text-[10px]">{apt.preferred_time}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-mono text-dark font-medium">{apt.phone}</div>
                              <div className="text-[11px] text-gray-400">{apt.email || 'Guest booking'}</div>
                            </td>
                            <td className="p-4">
                              {apt.status === 'pending' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-yellow-800 bg-yellow-50 border border-yellow-200">
                                  Pending Review
                                </span>
                              )}
                              {apt.status === 'approved' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-green-800 bg-green-50 border border-green-200">
                                  Approved
                                </span>
                              )}
                              {apt.status === 'rejected' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-red-800 bg-red-50 border border-red-200">
                                  Rejected
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center justify-center">
                              <div className="flex gap-1.5 justify-center">
                                {apt.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => openApproveModal(apt.id)}
                                      className="p-1 px-2 text-[10px] font-bold bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                                    >
                                      Approve ✓
                                    </button>
                                    <button
                                      onClick={() => handleReject(apt.id)}
                                      className="p-1 px-2 text-[10px] font-bold bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                    >
                                      Reject ✗
                                    </button>
                                  </>
                                )}
                                {apt.status === 'approved' && (
                                  <button
                                    onClick={() => openApproveModal(apt.id)}
                                    className="p-1 px-2 text-[10px] font-bold bg-light text-maroon hover:bg-maroon hover:text-white border border-maroon/10 rounded transition-colors"
                                  >
                                    Amend Notes 📝
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    alert(`In-Depth Consultation Log:\n---------------------\nPatient Name: ${apt.patient_name}\nSelected Service: ${apt.service}\nChosen Slot: ${apt.preferred_date} @ ${apt.preferred_time}\nActive Mobile: ${apt.phone}\nUser Email: ${apt.email || 'None'}\nMessage Case: ${apt.message || 'None'}\nClinical Notes: ${apt.doctor_note || 'None'}`);
                                  }}
                                  className="p-1 px-2 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB PATIENTS DATABASE */}
            {activeTab === 'users' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-heading font-extrabold text-dark">Patient Record Directories</h1>
                  <p className="text-gray-500 font-body text-xs">Verify registered clients health portfolios and contact files</p>
                </div>

                <div className="bg-white rounded-2xl border border-maroon/5 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500 font-body divide-y">
                      <thead>
                        <tr className="bg-light text-dark font-extrabold">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email Address</th>
                          <th className="p-4">Contact Phone</th>
                          <th className="p-4 text-center">Identity Sex</th>
                          <th className="p-4 text-center">Blood Group</th>
                          <th className="p-4">Living Address</th>
                          <th className="p-4">Birth Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map((u, idx) => (
                          <tr key={idx} className="hover:bg-light/10 font-body">
                            <td className="p-4">
                              <div className="font-bold text-dark text-sm">{u.full_name}</div>
                              <span className="text-[9px] text-gray-400 block font-mono">Reg ID: {u.id}</span>
                            </td>
                            <td className="p-4 text-dark font-medium">{u.email}</td>
                            <td className="p-4 font-mono text-dark">{u.phone}</td>
                            <td className="p-4 text-center font-bold text-dark">{u.gender || 'Not set'}</td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded font-bold text-maroon bg-orange/10 border border-orange/10 font-mono">
                                {u.blood_group || 'O+'}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">{u.address || 'Awadhpuri, Bhopal'}</td>
                            <td className="p-4 font-mono text-dark">{u.birth_date || 'Not set'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB INTEGRATION SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-heading font-extrabold text-dark">Sync & Integrations Panel</h1>
                  <p className="text-gray-500 font-body text-xs">Hook up live databases (Supabase) and real message senders (Twilio)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-body text-xs">
                  {/* Left explanation card */}
                  <div className="p-8 bg-gradient-to-br from-dark to-maroon text-white rounded-3xl space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-golden font-bold block uppercase tracking-widest text-[9px]">💡 PRODUCTION BRIDGES</span>
                      <h3 className="text-xl font-heading font-bold text-white">Why configure keys?</h3>
                      <p className="text-gray-300 leading-relaxed text-xs">
                        This clinic website is preloaded with an intelligent, sandboxed, high-performance in-browser local storage system. It acts 100% like a real database out-of-the-box so you can book, log in, sign up, approve/reject appointments, and append logs!
                      </p>
                      <p className="text-gray-300 leading-relaxed text-xs">
                        However, if you wish to hook up actual persistent cloud files (Supabase tables) or transmit real live WhatsApp/SMS alerts to Dr. Tanmay Rajput via your Twilio account, paste your configuration credentials in the fields.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-golden text-xs flex items-center gap-1">
                        <Info size={14} /> Quick-Check Connection State:
                      </h4>
                      <div className="text-[10px] text-gray-300 font-mono space-y-1">
                        <p>Database: <strong className={dbService.getIsSupabaseConnected() ? 'text-green-400' : 'text-yellow-400'}>
                          {dbService.getIsSupabaseConnected() ? 'CONNECTED TO CLOUD SUPABASE' : 'SANDBOX SIMULATOR (LOCAL DB)'}
                        </strong></p>
                        <p>Credentials loaded: <strong className={sbUrl ? 'text-green-400' : 'text-gray-300'}>{sbUrl ? 'Yes' : 'No'}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Right form card */}
                  <div className="p-8 bg-white border border-maroon/5 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-heading font-extrabold text-dark mb-6">Database & SMS Credentials</h3>
                    
                    <form onSubmit={handleSaveCredentialsSubmit} className="space-y-4 font-body">
                      
                      {/* Supabase Host */}
                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Supabase Project URL</label>
                        <input
                          type="url"
                          value={sbUrl}
                          onChange={e => setSbUrl(e.target.value)}
                          placeholder="https://yourprojectid.supabase.co"
                          className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white"
                        />
                      </div>

                      {/* Supabase Anon Key */}
                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Supabase Anonymous Public Key</label>
                        <input
                          type="password"
                          value={sbKey}
                          onChange={e => setSbKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white font-mono"
                        />
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-4 mt-6">
                        <span className="text-[10px] font-bold text-crimson block uppercase tracking-wider mb-3">💬 TWILIO GATEWAY INTEGRATION</span>
                      </div>

                      {/* Twilio account SID */}
                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Twilio Account SID</label>
                        <input
                          type="text"
                          value={twSid}
                          onChange={e => setTwSid(e.target.value)}
                          placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* Twilio token */}
                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Twilio Secret Auth Token</label>
                        <input
                          type="password"
                          value={twAuth}
                          onChange={e => setTwAuth(e.target.value)}
                          placeholder="Paste secure auth token here"
                          className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* Twilio phone */}
                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Twilio System Phone Number</label>
                        <input
                          type="text"
                          value={twPhone}
                          onChange={e => setTwPhone(e.target.value)}
                          placeholder="e.g. +12564889501"
                          className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-crimson hover:bg-maroon text-white font-bold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer"
                        >
                          Verify & Install Keys 🔌
                        </button>
                        <button
                          type="button"
                          onClick={handleResetCredentials}
                          className="w-full py-3 px-4 bg-gray-50 hover:bg-red-100 text-slate-600 hover:text-red-700 font-bold text-xs border border-gray-200 rounded-xl transition-all duration-300"
                        >
                          Clear Credentials 🧹
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB DYNAMIC SERVICES MANAGEMENT */}
            {activeTab === 'services' && (
              <div className="space-y-8 animate-fade-in font-body">
                <div>
                  <h1 className="text-2xl font-heading font-extrabold text-dark">Clinique Services Catalog</h1>
                  <p className="text-gray-500 text-xs">Directly append or delete specialized dental procedures in active database channels</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column - Add New Service Card */}
                  <div className="lg:col-span-5 bg-white border border-maroon/10 rounded-3xl p-6 shadow-sm h-fit">
                    <h3 className="text-lg font-heading font-extrabold text-dark mb-4 flex items-center gap-1.5 border-b border-gray-150 pb-3">
                      <Plus className="text-crimson" size={18} /> Register Clinical Treatment
                    </h3>
                    
                    <form onSubmit={handleAddService} className="space-y-4 text-xs font-body">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-1">
                          <label className="font-bold text-dark block uppercase tracking-wide">Icon / Emoji</label>
                          <input
                            type="text"
                            required
                            value={newSrv.icon}
                            onChange={e => setNewSrv(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="🦷"
                            className="w-full text-center border rounded-xl px-3 py-2.5 bg-light/30 focus:border-crimson focus:outline-none focus:bg-white text-base"
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="font-bold text-dark block uppercase tracking-wide">Expected Cost (Tariff)</label>
                          <input
                            type="text"
                            required
                            value={newSrv.priceClass}
                            onChange={e => setNewSrv(prev => ({ ...prev, priceClass: e.target.value }))}
                            placeholder="e.g. ₹600–₹1,200"
                            className="w-full border rounded-xl px-3 py-2.5 bg-light/30 focus:border-crimson focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Treatment Name</label>
                        <input
                          type="text"
                          required
                          value={newSrv.name}
                          onChange={e => setNewSrv(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Laser Bleaching"
                          className="w-full border rounded-xl px-3 py-2.5 bg-light/30 focus:border-crimson focus:outline-none focus:bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-dark block uppercase tracking-wide">Procedure Summary / Description</label>
                        <textarea
                          required
                          rows={3}
                          value={newSrv.description}
                          onChange={e => setNewSrv(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Write short clinical walkthrough for patients..."
                          className="w-full border rounded-xl px-3 py-2.5 bg-light/30 focus:border-crimson focus:outline-none focus:bg-white leading-relaxed"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-crimson hover:bg-maroon text-white font-bold rounded-xl transition-all duration-300 shadow-md inline-flex items-center justify-center gap-2 text-xs"
                      >
                        <Plus size={14} /> Inject New Active Service
                      </button>
                    </form>
                  </div>

                  {/* Right Column - Catalog List */}
                  <div className="lg:col-span-7 bg-white border border-maroon/5 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                      <div>
                        <h3 className="text-lg font-heading font-extrabold text-dark">Active Procedures Directory ({services.length})</h3>
                        <p className="text-[11px] text-gray-500 font-body">Changes made here update the Services tab immediately</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {services.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No services exist in database catalog right now.</p>
                      ) : (
                        services.map((s) => (
                          <div 
                            key={s.id} 
                            className="p-4 bg-light/30 rounded-2xl border border-maroon/5 flex items-center justify-between gap-4 hover:border-crimson/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 bg-white rounded-xl border border-gray-100 shadow-sm block">{s.icon || '🦷'}</span>
                              <div>
                                <h4 className="font-heading font-bold text-dark text-sm">{s.name}</h4>
                                <p className="text-gray-500 text-[11px] leading-tight mt-0.5 line-clamp-2">{s.description}</p>
                                <span className="inline-block mt-1 font-body font-bold text-[10px] text-crimson bg-crimson/5 px-2 py-0.5 rounded-full border border-crimson/10">
                                  {s.priceClass}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => s.id && handleDeleteService(s.id, s.name)}
                              className="p-2.5 bg-white group-hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-gray-100 hover:border-red-100 transition-all shrink-0"
                              title="Delete Clinical Service"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* SUPABASE SQL SCHEMATICS INTEGRATION */}
                <div className="bg-white border border-maroon/15 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 mt-8 font-body">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 pb-5">
                    <div>
                      <span className="text-crimson font-bold uppercase tracking-widest text-[9px] block">⚡ SUPABASE CLOUD SQL INTEGRATION</span>
                      <h2 className="text-xl font-heading font-extrabold text-dark mt-1">Copy SQL Database Layout Schema</h2>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                        Execute this configuration in your Supabase SQL Editor dashboard to create the tables required for true production persistence.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const sql = `-- ==========================================
-- COMPLETE RESET
-- REMOVE OLD TABLES + DEMO DATA
-- ==========================================

DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- ==========================================
-- ENABLE UUID SUPPORT
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CREATE SERVICES TABLE
-- ==========================================

CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price_class TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE USERS TABLE
-- ==========================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  blood_group TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('admin', 'patient')),
  patient_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE APPOINTMENTS TABLE
-- ==========================================

CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  doctor_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INSERT DENTAL SERVICES
-- ==========================================

INSERT INTO public.services (name, description, price_class, icon) VALUES
('General Checkup', 'Full oral examination and dental consultation.', '₹300', '🦷'),
('Teeth Cleaning', 'Professional dental scaling and polishing.', '₹800', '✨'),
('Tooth Filling', 'Composite and cavity restoration treatment.', '₹600 - ₹1200', '💎'),
('Root Canal Treatment', 'Advanced pain-free root canal procedure.', '₹3500 - ₹6000', '⚡');

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS POLICIES
-- ==========================================

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- APPOINTMENTS POLICIES
-- ==========================================

CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- AUTO CREATE PROFILE AFTER SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, patient_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Patient'),
    'patient',
    'PAT-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- CREATE AUTH TRIGGER
-- ==========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();`;

                        navigator.clipboard.writeText(sql);
                        onShowToast('📋 Clean Production SQL Schema copied successfully!', true);
                      }}
                      className="px-5 py-2.5 bg-dark hover:bg-maroon text-white font-bold rounded-xl transition-all duration-300 inline-flex items-center gap-2 shadow-md cursor-pointer self-stretch md:self-auto justify-center text-xs"
                    >
                      <Copy size={13} /> Copy Production SQL Schema
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-5 md:p-6 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed rounded-2xl overflow-x-auto max-h-96 select-all scrollbar-thin scrollbar-thumb-white/10">
{`-- 1. Create Dental Services Directory Table
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price_class TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Patient User Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  blood_group TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('admin', 'patient')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Patient Appointments Ledger Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  doctor_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dynamic Seeding for Initial Procedures
INSERT INTO public.services (id, name, description, price_class, icon) VALUES 
('srv-1', 'General Checkup', 'Full oral examination, cavity detection, gum health screen, and custom treatment roadmapping.', '₹300', '🦷'),
('srv-2', 'Teeth Cleaning', 'Professional scaling & whitening polishing to eradicate hard plaque, tartar, and coffee stains.', '₹800', '✨'),
('srv-3', 'Tooth Filling', 'Seamless restorative filling using high-grade composite or glass ionomer for long-lasting stability.', '₹600–₹1,200', '💎'),
('srv-4', 'Root Canal Treatment', 'Extremely precise, pain-free pulp extraction and sealing under advanced digital tech.', '₹3,500–₹6,000', '⚡')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Authenticated Patient User Accounts (Password for all is: password123)
-- (Inserts fully encrypted email login credentials into Supabase Secure Auth engine)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'fa917fb6-5be3-4876-8f35-e1022883a991', 'authenticated', 'authenticated',
  'priya.singh@example.com', '$2a$10$S9Gj943mDq3xNf6XoPhxHev9zL2tN3S5845HOn7ZtA1G59374000.', now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Singh"}', false,
  now() - interval '40 days', now(), '+919876543210', now(), '', '', '', ''
), (
  '00000000-0000-0000-0000-000000000000', 'ca917fb6-5be3-4876-8f35-e1022883a992', 'authenticated', 'authenticated',
  'rahul.sharma@example.com', '$2a$10$S9Gj943mDq3xNf6XoPhxHev9zL2tN3S5845HOn7ZtA1G59374000.', now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Rahul Sharma"}', false,
  now() - interval '20 days', now(), '+919988776655', now(), '', '', '', ''
), (
  '00000000-0000-0000-0000-000000000000', 'ba917fb6-5be3-4876-8f35-e1022883a993', 'authenticated', 'authenticated',
  'amit.patel@example.com', '$2a$10$S9Gj943mDq3xNf6XoPhxHev9zL2tN3S5845HOn7ZtA1G59374000.', now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Amit Patel"}', false,
  now() - interval '5 days', now(), '+917766554433', now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 6. Seed Corresponding Public Patient Profiles
INSERT INTO public.users (id, email, full_name, phone, birth_date, gender, address, blood_group, role, created_at) VALUES 
('fa917fb6-5be3-4876-8f35-e1022883a991', 'priya.singh@example.com', 'Priya Singh', '+91 9876543210', '1995-08-15', 'Female', 'Saket Nagar, Bhopal, MP', 'B+', 'patient', now() - interval '40 days'),
('ca917fb6-5be3-4876-8f35-e1022883a992', 'rahul.sharma@example.com', 'Rahul Sharma', '+91 9988776655', '1988-12-05', 'Male', 'MP Nagar, Bhopal, MP', 'O+', 'patient', now() - interval '20 days'),
('ba917fb6-5be3-4876-8f35-e1022883a993', 'amit.patel@example.com', 'Amit Patel', '+91 7766554433', '1991-03-24', 'Male', 'Kolar Road, Bhopal, MP', 'A-', 'patient', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Dummy Appointments (Fully Integrated)
INSERT INTO public.appointments (id, user_id, patient_name, phone, email, service, preferred_date, preferred_time, message, status, doctor_note, created_at) VALUES 
('apt-dummy-1', 'fa917fb6-5be3-4876-8f35-e1022883a991', 'Priya Singh', '+91 9876543210', 'priya.singh@example.com', 'Teeth Cleaning', CURRENT_DATE + 2, '10:00 AM', 'Routine dental examination and hygienic scaler prophylaxis consultation.', 'pending', NULL, now() - interval '1 days'),
('apt-dummy-2', 'ca917fb6-5be3-4876-8f35-e1022883a992', 'Rahul Sharma', '+91 9988776655', 'rahul.sharma@example.com', 'General Checkup', CURRENT_DATE - 3, '11:30 AM', 'Persisting sensitivity in molar cavity.', 'approved', 'Fully diagnosed; deep decay on rear tooth. Restorations suggested, composite glass fillings planned.', now() - interval '5 days'),
('apt-dummy-3', 'ba917fb6-5be3-4876-8f35-e1022883a993', 'Amit Patel', '+91 7766554433', 'amit.patel@example.com', 'Tooth Filling', CURRENT_DATE - 7, '04:00 PM', 'Urgent replacement of composite resin filling.', 'approved', 'Replaced decaying restorative composite successfully. Teeth are stable.', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Approve Note Modal Box as requested */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-maroon/5 shadow-2xl space-y-6 relative animate-zoom-in font-body">
            <div>
              <h3 className="text-lg font-heading font-extrabold text-dark">✍️ Add Consultation Notes</h3>
              <p className="text-xs text-gray-500 font-body mt-1">
                Attach a friendly medical suggestion or confirmation advice to the patient's dashboard profile file.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark tracking-wide block">
                Doctor Suggestions (Optional)
              </label>
              <textarea
                value={doctorNote}
                onChange={e => setDoctorNote(e.target.value)}
                placeholder="e.g. Tooth cavity review done. Please abstain from hot caffeinated drinks for 48 hours."
                rows={4}
                className="w-full border rounded-xl px-4 py-3 text-xs bg-light/30 focus:border-crimson focus:outline-none focus:bg-white"
              ></textarea>
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-600 font-bold font-body text-xs rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-body text-xs rounded-xl transition-all duration-300 shadow-sm"
              >
                Confirm & Approve Slot ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
