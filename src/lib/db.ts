import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, UserProfile, DentalService } from '../types';
import { SERVICES_DATA } from '../data';

// Let's establish dynamic Supabase connection settings
const LOCAL_STORAGE_DB_PREFIX = 'rajput_clinic_';

// Initial patient data to make workspace immediately interactive
const DEFAULT_PATIENTS: UserProfile[] = [];

// No pre-seeded fake appointments to fulfill 'appointment only real show do not show fake' requirement
const DEFAULT_APPOINTMENTS: Appointment[] = [];

// Unified helper class that manages either real Supabase connections or transparent localStorage fallbacks
export class ClinicDatabase {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  // Check if credentials are set, then boot up Supabase client
  private init() {
    const customUrl = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_url`);
    const customKey = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_key`);

    const url = customUrl || (import.meta as any).env.VITE_SUPABASE_URL;
    const key = customKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

    if (url && key && url !== 'YOUR_SUPABASE_URL' && key !== 'YOUR_SUPABASE_ANON_KEY') {
      try {
        this.client = createClient(url, key);
        this.isConfigured = true;
        console.log('🔌 Supabase loaded successfully!');
      } catch (e) {
        console.error('Failed to initialize Supabase, reverting to LocalDB fallback:', e);
        this.isConfigured = false;
      }
    } else {
      // Warm up fallback LocalStorage tables if empty
      if (!localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}users`)) {
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(DEFAULT_PATIENTS));
      }
      
      // Enforce real-only appointments (clearing ancient mockup data if present on the active browser)
      const currentApts = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`);
      if (!currentApts) {
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify([]));
      } else {
        try {
          const parsed = JSON.parse(currentApts) as Appointment[];
          // Clear standard mock templates if they equal pre-seeded defaults
          const realOnly = parsed.filter(a => a.id !== 'apt-1' && a.id !== 'apt-2' && a.id !== 'apt-3');
          localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(realOnly));
        } catch (e) {
          localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify([]));
        }
      }

      // Seed dynamic services if empty
      if (!localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}services`)) {
        // Map default services with generated ids
        const seededServices = SERVICES_DATA.map((s, index) => ({
          ...s,
          id: s.id || `srv-${index + 1}`
        }));
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}services`, JSON.stringify(seededServices));
      }
    }
  }

  public getIsSupabaseConnected(): boolean {
    return this.isConfigured;
  }

  public saveSupabaseCredentials(url: string, key: string) {
    if (url && key) {
      localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_url`, url);
      localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_key`, key);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_url`);
      localStorage.removeItem(`${LOCAL_STORAGE_DB_PREFIX}supabase_key`);
    }
    this.init();
  }

  // --- USERS / PATIENTS METHODS ---

  public async getUsers(): Promise<UserProfile[]> {
    const localRaw = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}users`);
    let localUsers: UserProfile[] = localRaw ? JSON.parse(localRaw) : [];

    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        // Merge Supabase users into our local cached storage so everything remains fully updated
        const supabaseUsers = data as UserProfile[];
        const merged = [...localUsers];
        for (const sUser of supabaseUsers) {
          const idx = merged.findIndex(u => u.email.toLowerCase() === sUser.email.toLowerCase());
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...sUser };
          } else {
            merged.push(sUser);
          }
        }
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(merged));
        return merged;
      }
      console.warn('Supabase fetch failed, reverting to local:', error);
    }
    return localUsers;
  }

  public async signupUser(profile: Omit<UserProfile, 'id' | 'created_at'>, password?: string): Promise<UserProfile> {
    const randomDigit = Math.floor(1000 + Math.random() * 9000);
    const mockId = `PT-${randomDigit}`;
    const mockPatientId = `PAT-${randomDigit}99`;
    
    const newUser: UserProfile = {
      ...profile,
      id: mockId,
      patient_id: mockPatientId,
      created_at: new Date().toISOString(),
      role: 'patient'
    };

    // Always perform a dual-write to local storage first, ensuring patients appear instantly in our lists
    const users = await this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    if (this.isConfigured && this.client && password) {
      // Standard auth register
      const { data: authData, error: authErr } = await this.client.auth.signUp({
        email: profile.email,
        password: password,
        options: {
          data: {
            full_name: profile.full_name
          }
        }
      });

      if (!authErr && authData.user) {
        // Compute patient_id just like the handle_new_user trigger in the PostgreSQL schema
        const generatedPatientId = `PAT-${authData.user.id.substring(0, 8)}`;
        
        const { error: dbErr } = await this.client.from('users').upsert({
          id: authData.user.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          birth_date: profile.birth_date,
          gender: profile.gender,
          address: profile.address,
          blood_group: profile.blood_group,
          avatar_url: profile.avatar_url,
          role: 'patient',
          patient_id: generatedPatientId
        });

        if (!dbErr) {
          const syncedUser = { ...newUser, id: authData.user.id, patient_id: generatedPatientId };
          users.push(syncedUser);
          localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(users));
          return syncedUser;
        }
        console.warn('Sign Up user profile upsert failed:', dbErr);
      } else {
        console.warn('Sign Up auth flow failed:', authErr);
      }
    }

    // Direct Local Storage fallback insert
    users.push(newUser);
    localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(users));
    return newUser;
  }

  public async loginUser(email: string, password?: string): Promise<{ profile: UserProfile; token?: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password ? password.trim() : '';

    // Admin Override - Admin doctor authentication logic
    if (
      (normalizedEmail === 'tanmayrajputtv@gmail.com' || 
       normalizedEmail === 'tanmayrajput@rajputdental.com' || 
       normalizedEmail === 'admin') && 
      (normalizedPassword === 'tanmay@11' || password === 'tanmay@11')
    ) {
      const adminProfile: UserProfile = {
        id: 'admin-id',
        email: 'tanmayrajputtv@gmail.com',
        full_name: 'Dr. Tanmay Rajput',
        phone: '+91 7000818065',
        role: 'admin'
      };
      return { profile: adminProfile };
    }

    if (this.isConfigured && this.client && password) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: profile, error: pErr } = await this.client
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!pErr && profile) {
          const userProfile = profile as UserProfile;
          // Dual write: make sure this Supabase credentials profile exists in our local sandbox database
          const users = await this.getUsers();
          if (!users.some(u => u.email.toLowerCase() === userProfile.email.toLowerCase())) {
            users.push(userProfile);
            localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(users));
          }
          return { profile: userProfile, token: data.session?.access_token };
        }
      }
      console.warn('Supabase auth login failed, checking local credentials:', error);
    }

    // Local DB lookup (no actual password checking except simple strings since it's sandbox)
    const users = await this.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      throw new Error('No user found with the given email address.');
    }
    
    return { profile: foundUser };
  }

  public async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        // Update browser cache synchronously
        const users = await this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = data as UserProfile;
          localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(users));
        }
        return data as UserProfile;
      }
      console.warn('Supabase update failed, tracking local:', error);
    }

    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}users`, JSON.stringify(users));
      return users[index];
    }
    throw new Error('User profile to update not found.');
  }


  // --- APPOINTMENTS METHODS ---

  public async getAppointments(): Promise<Appointment[]> {
    const localRaw = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`);
    let localApts: Appointment[] = localRaw ? JSON.parse(localRaw) : [];

    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.from('appointments').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        // Merge Supabase appointments into local storage to maintain immediate rendering
        const supabaseApts = data as Appointment[];
        const merged = [...localApts];
        for (const sApt of supabaseApts) {
          const idx = merged.findIndex(a => a.id === sApt.id);
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...sApt };
          } else {
            merged.push(sApt);
          }
        }
        // Keep sorted by creation date descending
        merged.sort((a, b) => new Date(b.created_at || b.preferred_date).getTime() - new Date(a.created_at || a.preferred_date).getTime());
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(merged));
        return merged;
      }
      console.warn('Supabase appointments fetch failed, fetching local:', error);
    }
    return localApts;
  }

  public async getAppointmentsForUser(userId: string): Promise<Appointment[]> {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('preferred_date', { ascending: false });
      if (!error && data) return data as Appointment[];
      console.warn('Supabase user appointments fetch failed, using local fallback:', error);
    }
    const appointments = await this.getAppointments();
    return appointments.filter(a => a.user_id === userId);
  }

  public async createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<Appointment> {
    const newApt: Appointment = {
      ...appointment,
      id: `apt-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (this.isConfigured && this.client) {
      const { data, error } = await this.client
        .from('appointments')
        .insert({
          id: newApt.id,
          user_id: appointment.user_id || null,
          patient_name: appointment.patient_name,
          phone: appointment.phone,
          email: appointment.email,
          service: appointment.service,
          preferred_date: appointment.preferred_date,
          preferred_time: appointment.preferred_time,
          message: appointment.message,
          status: 'pending'
        })
        .select()
        .single();

      if (!error && data) {
        const appointments = await this.getAppointments();
        appointments.unshift(data as Appointment);
        localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(appointments));
        return data as Appointment;
      }
      console.warn('Supabase appointment insert failed, tracking local cache:', error);
    }

    const appointments = await this.getAppointments();
    appointments.unshift(newApt);
    localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(appointments));
    return newApt;
  }

  public async updateAppointmentStatus(id: string, status: 'pending' | 'approved' | 'rejected', doctorNote?: string): Promise<Appointment> {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client
        .from('appointments')
        .update({ status, doctor_note: doctorNote })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const appointments = await this.getAppointments();
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          appointments[index] = data as Appointment;
          localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(appointments));
        }
        return data as Appointment;
      }
      console.warn('Supabase appointment status update failed, shifting to local cache:', error);
    }

    const appointments = await this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], status, doctor_note: doctorNote };
      localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}appointments`, JSON.stringify(appointments));
      return appointments[index];
    }
    throw new Error('Appointment not found.');
  }

  // --- DYNAMIC SERVICES METHODS ---

  public async getServices(): Promise<DentalService[]> {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.from('services').select('*').order('name', { ascending: true });
      if (!error && data) {
        return (data as any[]).map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          priceClass: s.price_class || s.priceClass || '₹500',
          icon: s.icon || '🦷'
        })) as DentalService[];
      }
      console.warn('Supabase services fetch failed, checking local:', error);
    }
    const local = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}services`);
    if (!local) {
      // Lazy initialize if not already done
      const seededServices = SERVICES_DATA.map((s, index) => ({
        ...s,
        id: s.id || `srv-${index + 1}`
      }));
      localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}services`, JSON.stringify(seededServices));
      return seededServices;
    }
    return JSON.parse(local);
  }

  public async createService(service: Omit<DentalService, 'id'>): Promise<DentalService> {
    const newService: DentalService = {
      ...service,
      id: `srv-${Math.random().toString(36).substr(2, 9)}`
    };

    if (this.isConfigured && this.client) {
      const { data, error } = await this.client
        .from('services')
        .insert({
          id: newService.id,
          name: service.name,
          description: service.description,
          price_class: service.priceClass,
          icon: service.icon
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          priceClass: data.price_class || data.priceClass,
          icon: data.icon
        };
      }
      console.warn('Supabase service insert failed, tracking local:', error);
    }

    const services = await this.getServices();
    // Prevent duplicate name conflicts
    if (services.some(s => s.name.toLowerCase() === service.name.toLowerCase())) {
      throw new Error('A dental service with this name already exists.');
    }
    services.push(newService);
    localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}services`, JSON.stringify(services));
    return newService;
  }

  public async deleteService(id: string): Promise<void> {
    if (this.isConfigured && this.client) {
      const { error } = await this.client.from('services').delete().eq('id', id);
      if (!error) return;
      console.warn('Supabase service delete failed, tracking local:', error);
    }

    const services = await this.getServices();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(`${LOCAL_STORAGE_DB_PREFIX}services`, JSON.stringify(filtered));
  }
}

export const dbService = new ClinicDatabase();

// --- TWILIO NOTIFICATION EMULATION ---
export async function sendSMSToDoctor(appointmentData: {
  patient_name: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  phone: string;
}) {
  const TWILIO_ACCOUNT_SID = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}twilio_sid`) || "SK_MOCK_SID_7005";
  const TWILIO_AUTH_TOKEN = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}twilio_token`) || "AUTH_MOCK_TOKEN_9901";
  const TWILIO_PHONE = localStorage.getItem(`${LOCAL_STORAGE_DB_PREFIX}twilio_phone`) || "+12564889501";

  const message = `🦷 New Appointment!\nPatient: ${appointmentData.patient_name}\nService: ${appointmentData.service}\nDate: ${appointmentData.preferred_date} at ${appointmentData.preferred_time}\nPhone: ${appointmentData.phone}\nBook via: Rajput Dental Clinic App`;

  console.log('Sending SMS notify payload to Dr. Tanmay Rajput on +917000818065:', message);

  // If mock, just output success to developer logs and resolve
  if (TWILIO_ACCOUNT_SID.startsWith("SK_MOCK") || !TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN.startsWith("AUTH_MOCK")) {
    return { success: true, mode: 'emulated', message };
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: "+917000818065",
        From: TWILIO_PHONE,
        Body: message
      })
    });
    return { success: res.ok, status: res.status, mode: 'live' };
  } catch (err) {
    console.error('Twilio live SMS network request failed, fallback to local dispatch log:', err);
    return { success: false, error: String(err) };
  }
}
