import { motion } from 'motion/react';
import { CLINIC_INFO, CLINIC_PHOTOS, PATIENT_TESTIMONIALS } from '../data';
import { Award, ShieldAlert, Star, TrendingUp, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden mt-16">
        <div className="absolute inset-0 z-0">
          <img
            src={CLINIC_PHOTOS.hero}
            alt="Rajput Dental Clinic Background"
            className="w-full h-full object-cover object-center opacity-40 select-none pointer-events-none scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-golden font-medium tracking-widest text-xs uppercase mb-3 px-3 py-1 rounded-full bg-maroon/50 border border-maroon/80">
              👑 {CLINIC_INFO.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Your Smile Is Our Passion
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed font-body font-light">
              Experience world-class, painless dental care with <strong className="font-medium text-golden">{CLINIC_INFO.doctor}</strong> in Awadhpuri, Bhopal. We blend advanced digital diagnostics with warm, gentle, and affordable treatments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="hero-book-btn"
                onClick={() => onNavigate('appointment')}
                className="px-8 py-4 bg-crimson hover:bg-orange text-white font-medium rounded-lg text-base shadow-lg hover:shadow-orange-700/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Book Appointment
              </button>
              <button
                id="hero-services-btn"
                onClick={() => onNavigate('services')}
                className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg text-base border-2 border-white/40 hover:border-white transition-all duration-300"
              >
                Our Services
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-maroon py-8 shadow-inner text-white border-y border-crimson/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-heading font-bold text-golden">5000+</p>
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-wider mt-1 font-body">Happy Patients</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-heading font-bold text-golden">15+</p>
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-wider mt-1 font-body">Years Experience</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-heading font-bold text-golden">98%</p>
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-wider mt-1 font-body">Satisfaction Rate</p>
            </div>
            <div className="px-4">
              <p className="text-3xl md:text-4xl font-heading font-bold text-golden">20+</p>
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-wider mt-1 font-body">Advanced Services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-crimson text-sm font-semibold tracking-widest uppercase">✨ Pure Excellence</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark mt-2">Why Choose Rajput Dental?</h2>
            <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
            <p className="text-gray-500 mt-4 font-body font-light">
              We understand dental visits can cause anxiety, which is why we’ve completely redesigned our clinical process with painless techniques and modern patient luxuries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-light border border-maroon/5 hover:border-crimson/20 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark mb-3">Advanced Equipment</h3>
              <p className="text-gray-600 font-body text-sm leading-relaxed">
                Utilizing state-of-the-art digital radiography, painless intraoral cameras, and modern autoclave sterilizers to deliver top-tier clinical diagnostics.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-light border border-maroon/5 hover:border-crimson/20 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark mb-3">Gentle Care</h3>
              <p className="text-gray-600 font-body text-sm leading-relaxed">
                Dr. Tanmay Rajput’s ultra-sensitive approach completely removes treatment anxieties. We guarantee patient pacing and complete, relaxing sedation alternatives.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-light border border-maroon/5 hover:border-crimson/20 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center mb-6">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark mb-3">Affordable Pricing</h3>
              <p className="text-gray-600 font-body text-sm leading-relaxed">
                Premium medical treatments shouldn’t carry heavy burdens. Enjoy easy, flexible pricing plans and highly transparent billing with no sudden hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split Highlight Section */}
      <section className="py-16 bg-light border-y border-maroon/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-crimson text-sm font-semibold uppercase tracking-wider">🌟 Meet Your Surgeon</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark mt-2 mb-6">
              Empathetic, Experienced, and Specialized Care
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
              At Rajput Dental Clinic, we treat patients like family members. Over the last 15 years, Dr. Tanmay Rajput has helped thousands of patients overcome severe chronic physical mouth pain, reconstruct broken bite lines, and achieve glowing, beautiful smiles.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-golden text-maroon flex items-center justify-center text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-dark text-sm">BDS, MDS Oral & Maxillofacial Surgeon</h4>
                  <p className="text-xs text-gray-500">Super-specialized training in implant surgeries and pain-free complex wisdom tooth extractions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-golden text-maroon flex items-center justify-center text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-dark text-sm">Fellowship in Implantology</h4>
                  <p className="text-xs text-gray-500">Expertise in placing stable dental implants that work and look like raw natural teeth.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3 bg-maroon hover:bg-crimson text-white font-medium rounded-lg text-sm transition-all duration-300"
              >
                Read Fully Verified Biography
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-maroon to-crimson rounded-2xl blur-lg opacity-20"></div>
            <img
              src={CLINIC_PHOTOS.dentistWork}
              alt="Dr. Tanmay Rajput treating patient gracefully"
              className="relative z-10 rounded-2xl shadow-xl w-full h-[380px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-maroon/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-crimson text-sm font-semibold tracking-widest uppercase">💬 Patient Voices</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark mt-2">What Our Patients Say</h2>
            <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PATIENT_TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-light border border-maroon/10 relative flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex gap-1 text-golden mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic font-body text-sm leading-relaxed mb-6">
                    "{t.comment}"
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-maroon/5 pt-4">
                  <div>
                    <h5 className="font-heading font-bold text-dark">{t.name}</h5>
                    <span className="text-xs text-crimson font-light">{t.treatment}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Quick Booking Call-Out */}
      <section className="bg-gradient-to-br from-maroon to-dark py-16 text-white text-center px-6 border-t-2 border-golden relative">
        <div className="max-w-3xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to Reclaim Your Smile?</h2>
          <p className="text-gray-300 font-light mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Join thousands of Bhopal families who trust Rajput Dental Clinic for flawless, painless, and premium dental transformations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onNavigate('appointment')}
              className="px-8 py-3 bg-golden hover:bg-yellow-400 text-maroon font-bold rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
            >
              Book your slot now 📅
            </button>
            <a
              href={`https://wa.me/917000818065?text=Hello%20Dr.%20Tanmay%20Rajput,%20I%20would%20like%20to%20book%20a%20dental%20appointment.`}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
