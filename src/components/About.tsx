import { motion } from 'motion/react';
import { CLINIC_INFO, CLINIC_PHOTOS } from '../data';
import { Award, GraduationCap, Heart, Sparkles } from 'lucide-react';

export default function About() {
  const qualifications = [
    { title: 'BDS - Bachelor of Dental Surgery', institution: 'Apex Government Dental College', year: '2010' },
    { title: 'MDS - Masters in Oral & Maxillofacial Surgery', institution: 'State Medical University', year: '2014' },
    { title: 'Fellowship in Implantology', institution: 'International Board of Oral Implantology', year: '2016' }
  ];

  const teamMembers = [
    { name: 'Dr. Tanmay Rajput', role: 'Chief Dental Surgeon & Implantologist', image: CLINIC_PHOTOS.doctorPortrait, spec: 'Oral Surgery & Implants' },
    { name: 'Dr. Neha Saxena', role: 'Associate Pediatric Dentist', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', spec: 'Kids Dental Specialist' },
    { name: 'Ms. Pooja Sharma', role: 'Senior Clinical Assistant', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=400', spec: 'Patient Care Manager' }
  ];

  return (
    <div className="fade-in py-20 bg-light/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 mt-12">
          <span className="text-crimson text-sm font-semibold tracking-widest uppercase">🩺 Our Clinical Story</span>
          <h1 className="text-4xl font-heading font-bold text-dark mt-2">About Rajput Dental Clinic</h1>
          <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
          <p className="text-gray-500 mt-4 text-sm font-body">
            Fulfilling a lifelong dream to bring pain-free, world-class dental engineering to the citizens of Bhopal.
          </p>
        </div>

        {/* Doctor Spotlight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-maroon to-orange rounded-3xl blur-xl opacity-20"></div>
            <img
              src={CLINIC_PHOTOS.doctorPortrait}
              alt="Dr. Tanmay Rajput profile avatar"
              className="relative z-10 w-full h-[450px] object-cover rounded-3xl shadow-xl border border-maroon/10"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl z-20 shadow-lg border border-maroon/5">
              <h3 className="font-heading font-bold text-dark text-lg">{CLINIC_INFO.doctor}</h3>
              <p className="text-xs text-crimson uppercase font-medium mt-0.5">BDS, MDS, F.I.S. (Oral Surgery)</p>
            </div>
          </div>

          <div className="lg:col-span-12 lg:col-start-7 lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon/10 text-maroon text-xs font-semibold">
              <Award size={14} /> Master Specialist
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark leading-snug">
              Providing Over 15 Years of Trusted Clinical Leadership
            </h2>
            <p className="text-gray-600 font-body text-sm md:text-base leading-relaxed">
              Dr. Tanmay Rajput is a highly qualified, state-registered dental surgeon with a super-specialization (MDS) in Oral and Maxillofacial Surgery. Known for his compassionate and gentle persona, he has worked continuously to reduce patient dental phobia by practicing highly advanced non-invasive dental procedures.
            </p>
            <p className="text-gray-600 font-body text-sm md:text-base leading-relaxed">
              Based in Awadhpuri, Bhopal, Dr. Rajput has earned stellar references for treating complex wisdom tooth alignment blockades and reconstruction projects with absolutely zero pain complaints.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-maroon/5">
              <div className="flex gap-2.5 items-center">
                <div className="w-10 h-10 rounded-lg bg-golden/20 text-maroon flex items-center justify-center font-bold">15+</div>
                <div>
                  <h4 className="font-bold text-dark text-xs">Years of Service</h4>
                  <p className="text-[10px] text-gray-500">Continuous practices</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-center">
                <div className="w-10 h-10 rounded-lg bg-golden/20 text-maroon flex items-center justify-center">🤝</div>
                <div>
                  <h4 className="font-bold text-dark text-xs">Family Atmosphere</h4>
                  <p className="text-[10px] text-gray-500">Kind counseling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="p-8 md:p-10 rounded-3xl bg-white border border-maroon/5 shadow-sm space-y-6">
            <h3 className="text-xl font-heading font-bold text-dark flex items-center gap-3">
              <GraduationCap className="text-crimson" /> Qualifications & Academics
            </h3>
            <div className="space-y-6">
              {qualifications.map((q, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-golden font-body">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-crimson"></div>
                  <h4 className="font-semibold text-dark text-sm">{q.title}</h4>
                  <p className="text-xs text-gray-500">{q.institution} — Class of {q.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-3xl bg-maroon text-white shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-golden font-bold text-xs uppercase tracking-widest block">♥ CLINICAL ETHICS</span>
              <h3 className="text-2xl font-heading font-bold leading-tight">Our Unwavering Promise to Patients</h3>
              <p className="text-gray-300 font-body text-sm leading-relaxed">
                At Rajput Dental, we hold patient safety, complete visual cleanliness, and clinical performance above all. We exclusively implement certified, single-use vacuum autoclaved diagnostic instruments of German high-precision grade.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10 text-center font-body text-xs text-gray-300">
              <div>
                <p className="text-lg text-golden font-bold">100%</p>
                <p className="text-[10px] uppercase">Sterilized Instruments</p>
              </div>
              <div>
                <p className="text-lg text-golden font-bold">24hr</p>
                <p className="text-[10px] uppercase">Crisis Support</p>
              </div>
              <div>
                <p className="text-lg text-golden font-bold">99%</p>
                <p className="text-[10px] uppercase">Positive Results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Spotlights */}
        <div className="mb-24">
          <h3 className="text-2xl font-heading font-bold text-dark text-center mb-10">Our Clinic Infrastructure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <img src={CLINIC_PHOTOS.interior} alt="Clinic interior sitting area" className="w-full h-64 object-cover" />
              <div className="p-4 bg-white border border-t-0 border-maroon/5">
                <p className="font-heading font-bold text-dark text-sm">Waiting Lounge</p>
                <p className="text-[11px] text-gray-500 font-body">Quiet, sterile lounge with relaxing classical acoustic backdrop.</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <img src={CLINIC_PHOTOS.reception} alt="Reception desk" className="w-full h-64 object-cover" />
              <div className="p-4 bg-white border border-t-0 border-maroon/5">
                <p className="font-heading font-bold text-dark text-sm">Reception Helpdesk</p>
                <p className="text-[11px] text-gray-500 font-body">Helpful check-in and membership registration staff.</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <img src={CLINIC_PHOTOS.dentalXray} alt="Modern dental equipment x-ray panel" className="w-full h-64 object-cover" />
              <div className="p-4 bg-white border border-t-0 border-maroon/5">
                <p className="font-heading font-bold text-dark text-sm">Diagnostic Chamber</p>
                <p className="text-[11px] text-gray-500 font-body">Equipped with painless digital high-resolution radiographs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-2xl font-heading font-bold text-dark text-center mb-12">Meet the Expert Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-maroon/5 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={t.image} alt={t.name} className="w-full h-[280px] object-cover" />
                <div className="p-6 text-center">
                  <h4 className="font-heading font-bold text-dark text-lg">{t.name}</h4>
                  <p className="text-xs text-crimson uppercase font-body font-medium mt-1">{t.role}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-light text-maroon text-[11px] font-body mt-4 border border-maroon/10">
                    {t.spec}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
