export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  blood_group?: string;
  avatar_url?: string;
  created_at?: string;
  role?: 'admin' | 'patient';
  patient_id?: string;
}

export interface Appointment {
  id: string;
  user_id?: string | null;
  patient_name: string;
  phone: string;
  email?: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  doctor_note?: string;
  created_at?: string;
}

export interface DentalService {
  id?: string;
  name: string;
  description: string;
  priceClass: string;
  icon: string;
}

export interface PricingPlan {
  name: string;
  priceValue: string;
  period: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  date: string;
  treatment: string;
}
