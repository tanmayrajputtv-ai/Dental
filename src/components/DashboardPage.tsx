import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import { Appointment, UserProfile } from '../types';
import { CLINIC_INFO } from '../data';
import { Calendar, CheckCircle2, CircleAlert, LogOut, ShieldAlert, User, UserCheck } from 'lucide-react';

interface DashboardProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string, isSuccess: boolean) => void;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

export default function DashboardPage({
  currentUser,
  onLogout,
  onNavigate,
  onShowToast,
  onProfileUpdated
}: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    birth_date: '',
    gender: 'Male',
    blood_group: 'B+',
    address: ''
  });

  const loadAppointments = async () => {
    try {
      const list = await dbService.getAppointmentsForUser(currentUser.id);
      setAppointments(list);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // Warm up edit form
    setEditForm({
      full_name: currentUser.full_name || '',
      phone: currentUser.phone || '',
      birth_date: currentUser.birth_date || '',
      gender: currentUser.gender || 'Male',
      blood_group: currentUser.blood_group || 'B+',
      address: currentUser.address || ''
    });
  }, [currentUser]);

  const calculateAge = (dobString?: string): string => {
    if (!dobString) return 'None';
    try {
      const dob = new Date(dobString);
      if (isNaN(dob.getTime())) return 'None';
      const ageDiffMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      const calculated = Math.abs(ageDate.getUTCFullYear() - 1970);
      return `${calculated} Years`;
    } catch (e) {
      return 'None';
    }
  };

  const nameInitials = (name?: string): string => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.full_name || !editForm.phone) {
      onShowToast('Name and phone numbers are required files.', false);
      return;
    }

    try {
      const updated = await dbService.updateProfile(currentUser.id, {
        full_name: editForm.full_name,
        phone: editForm.phone,
        birth_date: editForm.birth_date || undefined,
        gender: editForm.gender,
        blood_group: editForm.blood_group,
        address: editForm.address
      });
      onProfileUpdated(updated);
      onShowToast('🎉 Profile files successfully refreshed!', true);
      setIsEditing(false);
    } catch (err: any) {
      onShowToast(err.message || 'Error editing profile info.', false);
    }
  };

  return (
    <div className="fade-in py-20 bg-light/30">
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-maroon/5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-maroon to-crimson"></div>

            <div className="relative z-10 w-24 h-24 rounded-full bg-golden border-4 border-white text-maroon font-heading font-extrabold text-2xl flex items-center justify-center shadow-md mt-8">
              {nameInitials(currentUser.full_name)}
            </div>

            <h3 className="text-xl font-heading font-bold text-dark mt-4">{currentUser.full_name}</h3>
            <span className="text-[10px] uppercase font-bold text-crimson bg-light px-2.5 py-0.5 rounded-full border border-maroon/10 mt-1">
              Registered Patient 🩺
            </span>

            {/* Profile Statistics */}
            <div className="w-full mt-6 grid grid-cols-3 gap-2 border-y border-maroon/5 py-4 text-center font-body text-xs text-gray-400">
              <div>
                <span className="font-bold text-dark block text-sm">{calculateAge(currentUser.birth_date)}</span>
                <span className="text-[10px] uppercase">Age</span>
              </div>
              <div>
                <span className="font-bold text-dark block text-sm">{currentUser.blood_group || 'O+'}</span>
                <span className="text-[10px] uppercase">Blood</span>
              </div>
              <div>
                <span className="font-bold text-dark block text-sm">{currentUser.gender || 'Male'}</span>
                <span className="text-[10px] uppercase">Gender</span>
              </div>
            </div>

            {/* Detail addresses list */}
            <div className="w-full text-left mt-6 space-y-3 font-body text-xs">
              <div>
                <span className="text-gray-400 block uppercase font-mono text-[9px]">Email Address</span>
                <span className="text-dark font-medium">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-mono text-[9px]">Mobile Phone</span>
                <span className="text-dark font-mono font-medium">{currentUser.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-mono text-[9px]">Home Address</span>
                <span className="text-dark font-medium">{currentUser.address || 'Awadhpuri, Bhopal'}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="py-2 px-3 bg-light hover:bg-maroon hover:text-white border border-maroon/10 text-maroon font-bold text-xs rounded-xl transition-all duration-300"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile ⛭'}
              </button>
              <button
                onClick={onLogout}
                className="py-2 px-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all duration-300"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Main Panel */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Real-time editable profile layout */}
          {isEditing && (
            <div className="bg-white rounded-3xl p-8 border border-maroon/5 shadow-md">
              <h3 className="text-lg font-heading font-extrabold text-dark mb-6">Modify Profile Data</h3>
              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-dark uppercase">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-dark uppercase">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 font-body text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-dark uppercase">Birth Date</label>
                    <input
                      type="date"
                      value={editForm.birth_date}
                      onChange={e => setEditForm(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-dark uppercase">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-dark uppercase">Blood Group</label>
                    <select
                      value={editForm.blood_group}
                      onChange={e => setEditForm(prev => ({ ...prev, blood_group: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 font-body text-xs">
                  <label className="font-bold text-dark uppercase">Full Living Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-crimson hover:bg-maroon text-white font-bold text-xs rounded-lg transition-all duration-300"
                >
                  Save Profile Modifications
                </button>
              </form>
            </div>
          )}

          {/* Appointments overview header */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/5 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-dark">My Appointments Pipeline</h3>
                <p className="text-gray-400 font-body text-xs">Verify current statuses and doctor suggestions</p>
              </div>
              <button
                onClick={() => onNavigate('appointment')}
                className="px-5 py-2.5 bg-maroon hover:bg-crimson text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-300 font-body shrink-0 align-left inline-flex justify-center items-center"
              >
                Book New Appointment 📅
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-crimson border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-400 font-body mt-3">Connecting to health files...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-light/10">
                <p className="text-sm font-body text-gray-500">You do not have any appointments queued on record.</p>
                <p className="text-xs text-gray-400 mt-1">Book your first painless checkup with Dr. Tanmay Rajput today!</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Cards representation */}
                {appointments.map((apt, idx) => (
                  <div key={idx} className="border border-maroon/10 rounded-2xl overflow-hidden bg-light shadow-sm">
                    
                    {/* Collapsible header view */}
                    <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-b border-maroon/5">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">Procedure</span>
                        <h4 className="font-heading font-extrabold text-sm text-dark">{apt.service}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-body text-gray-500">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-gray-400 block">Datetime</span>
                          <span className="font-medium text-dark">{apt.preferred_date}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded ml-1.5">{apt.preferred_time}</span>
                        </div>
                      </div>

                      <div>
                        {apt.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full font-body">
                            <CircleAlert size={14} /> Pending Approval
                          </span>
                        )}
                        {apt.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full font-body animate-bounce-once">
                            <CheckCircle2 size={14} /> Approved ✅
                          </span>
                        )}
                        {apt.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full font-body">
                            <ShieldAlert size={14} /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Confirmed Specific Overlay Cards as per request */}
                    {apt.status === 'approved' && (
                      <div className="p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-b border-emerald-100">
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                          <div className="space-y-2">
                            <h5 className="font-heading font-bold text-emerald-800 text-sm">✅ Appointment Confirmed!</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6 text-xs text-emerald-900 leading-relaxed font-body font-light">
                              <p>🧑‍⚕️ <strong className="font-semibold">Doctor:</strong> {CLINIC_INFO.doctor}</p>
                              <p>🏨 <strong className="font-semibold">Clinic:</strong> {CLINIC_INFO.name}, Awadhpuri, Bhopal</p>
                              <p>🗓️ <strong className="font-semibold">Bespoke Date:</strong> {apt.preferred_date} at {apt.preferred_time}</p>
                              <p>📞 <strong className="font-semibold">Inquiries:</strong> {CLINIC_INFO.phone}</p>
                            </div>

                            {/* Doctor custom note box */}
                            {apt.doctor_note && (
                              <div className="mt-3 bg-white/80 p-3.5 rounded-xl border border-emerald-100 text-xs text-slate-700 relative pl-6">
                                <span className="absolute left-2.5 top-3.5 text-emerald-600 block">💬</span>
                                <strong className="font-bold text-emerald-900 block font-heading mb-0.5">Doctor's Clinical Suggestions:</strong>
                                "{apt.doctor_note}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* General details pane if message/notes provided in status else */}
                    {apt.message && (
                      <div className="p-4 bg-gray-50/50 text-xs text-gray-500 font-body italic">
                        "Patient Inquiry: {apt.message}"
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
