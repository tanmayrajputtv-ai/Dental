import { DentalService, PricingPlan, Testimonial } from './types';

export const CLINIC_INFO = {
  doctor: 'Dr. Tanmay Rajput',
  name: 'Rajput Dental Clinic',
  location: 'Awadhpuri, Bhopal, Madhya Pradesh',
  phone: '+91 7000818065',
  whatsapp: '+91 7000818065',
  email: 'tanmayrajput@rajputdental.com',
  workingHours: {
    weekdays: 'Mon–Sat: 9 AM – 7 PM',
    sunday: 'Sunday: 10 AM – 2 PM'
  }
};

export const CLINIC_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400',
  dentistWork: 'https://images.unsplash.com/photo-1588776814546-1ffbb6e3b2f0?w=800',
  interior: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800',
  doctorPortrait: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600',
  teethCleaning: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600',
  braces: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600',
  smileResult: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=600',
  happyPatient: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600',
  dentalXray: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600',
  reception: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
};

export const SERVICES_DATA: DentalService[] = [
  {
    name: 'General Checkup',
    description: 'Full oral examination, cavity detection, gum health screen, and custom treatment roadmapping.',
    priceClass: '₹300',
    icon: '🦷'
  },
  {
    name: 'Teeth Cleaning',
    description: 'Professional scaling & whitening polishing to eradicate hard plaque, tartar, and coffee stains.',
    priceClass: '₹800',
    icon: '✨'
  },
  {
    name: 'Tooth Filling',
    description: 'Seamless restorative filling using high-grade composite or glass ionomer for long-lasting stability.',
    priceClass: '₹600–₹1,200',
    icon: '💎'
  },
  {
    name: 'Root Canal Treatment',
    description: 'Extremely precise, pain-free therapeutic pulp extraction and sealing under advanced digital tech.',
    priceClass: '₹3,500–₹6,000',
    icon: '⚡'
  },
  {
    name: 'Tooth Extraction',
    description: 'Surgical or standard simple tooth extraction with strict modern hygiene and low-pain local numbness.',
    priceClass: '₹500–₹2,000',
    icon: '🏷️'
  },
  {
    name: 'Dental Implant',
    description: 'Medical-grade pure titanium tooth replacement root fused into bone structure topped with zirconia crown.',
    priceClass: '₹25,000–₹40,000',
    icon: '🔩'
  },
  {
    name: 'Teeth Whitening',
    description: 'Advanced custom laser dental bleaching to boost color up to eight premium shades in a single sitting.',
    priceClass: '₹4,000–₹8,000',
    icon: '🌟'
  },
  {
    name: 'Braces / Aligners',
    description: 'Classic durable metal braces, discrete ceramic aligners, or next-gen transparent invisible crowns.',
    priceClass: '₹18,000–₹55,000',
    icon: '🎯'
  },
  {
    name: 'Dentures',
    description: 'Comprehensive removable full or partial custom resin dentures for complete chewing restoration.',
    priceClass: '₹8,000–₹20,000',
    icon: '🌉'
  },
  {
    name: 'Pediatric Dentistry',
    description: 'Ultra-gentle kid dental counseling, early caries detection, and pleasant playful dental checkups.',
    priceClass: '₹300–₹1,500',
    icon: '🧸'
  },
  {
    name: 'Crown & Bridge',
    description: 'Premium restorative ceramic or highly aesthetic zirconia crowns for shielding damaged tooth cores.',
    priceClass: '₹5,000–₹12,000',
    icon: '👑'
  },
  {
    name: 'Gum Treatment',
    description: 'In-depth gingivitis and periodontitis therapeutic deep root scaling and professional laser pocket repair.',
    priceClass: '₹1,500–₹4,000',
    icon: '🔬'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'BASIC PLAN',
    priceValue: '₹999',
    period: 'year',
    features: [
      'Annual checkup (2 clinical visits)',
      'Professional teeth cleaning (1 session)',
      'High-resolution diagnostic X-Ray (1 time)',
      'Flat 10% discount on all active treatments'
    ]
  },
  {
    name: 'STANDARD PLAN',
    priceValue: '₹2,499',
    period: 'year',
    features: [
      'Comprehensive annual checkup (4 clinical visits)',
      'Professional teeth cleaning (2 sessions)',
      'High-resolution diagnostic X-Rays (2 times)',
      'Protective Fluoride treatment for anti-caries',
      'Flat 20% discount on all active treatments',
      'Priority fast-track appointment booking list'
    ],
    badge: 'STAR VALUE',
    popular: true
  },
  {
    name: 'PREMIUM PLAN',
    priceValue: '₹5,999',
    period: 'year',
    features: [
      'Unlimited checkups and consultations',
      'Quarterly diagnostic cleaning sessions (4 times)',
      'Comprehensive Full Mouth Digital X-Ray scan',
      '1 Free aesthetic tooth filling procedure',
      'Flat 30% discount on all active treatments',
      'Emergency immediate same-day appointment room',
      'Direct personal Dr. Rajput WhatsApp support channel'
    ],
    badge: 'ELITE CLUB'
  }
];

export const PATIENT_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Anjali Sharma',
    rating: 5,
    comment: 'Dr. Tanmay is absolutely brilliant! I got my Root Canal Treatment done here. I was extremely scared of the pain, but the whole procedure was incredibly gentle and completely comfortable.',
    date: '2026-04-12',
    treatment: 'Root Canal Treatment'
  },
  {
    name: 'Vikram Singh',
    rating: 5,
    comment: 'The absolute best dental clinic in Bhopal. Very clean, elegant interiors, and Dr. Tanmay Rajput explains everything meticulously before initiating any treatment. Highly recommended!',
    date: '2026-05-01',
    treatment: 'Dental Implant'
  },
  {
    name: 'Kabir Verma',
    rating: 5,
    comment: 'Took my 6-year-old daughter for a checkup. Dr. Tanmay treated her with so much patience and kindness. She had zero tears, and she is actually looking forward to her next cleaning!',
    date: '2026-05-18',
    treatment: 'Pediatric Care'
  }
];
