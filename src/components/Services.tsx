import { useEffect, useState } from 'react';
import { dbService } from '../lib/db';
import { DentalService } from '../types';

interface ServicesProps {
  onNavigate: (page: string, preselectedService?: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const [servicesList, setServicesList] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await dbService.getServices();
        setServicesList(data);
      } catch (err) {
        console.error('Error fetching clinical services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="fade-in py-20 bg-light/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 mt-12">
          <span className="text-crimson text-sm font-semibold tracking-widest uppercase">✨ CLINICAL PORTFOLIO</span>
          <h1 className="text-4xl font-heading font-bold text-dark mt-2">Our Specialized Dental Services</h1>
          <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
          <p className="text-gray-500 mt-4 text-sm font-body">
            We provide a comprehensive range of preventative, pediatric, and surgical treatments equipped with digital medical precision.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-gray-500 font-mono">Loading clinical services pipeline...</p>
          </div>
        ) : servicesList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm font-bold text-dark">No services found in active directory.</p>
            <p className="text-xs text-gray-500 mt-1">Add clinical procedures via the Admin dashboard.</p>
          </div>
        ) : (
          /* Services Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((s, idx) => (
              <div
                key={s.id || idx}
                className="bg-white rounded-2xl border border-maroon/5 p-8 flex flex-col justify-between hover:shadow-xl hover:border-crimson/10 transition-all duration-300 relative group"
              >
                {/* Card top decorative line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-maroon via-crimson to-orange rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div>
                  <div className="w-14 h-14 rounded-full bg-light flex items-center justify-center text-3xl shadow-sm border border-maroon/5 mb-6 group-hover:scale-110 group-hover:bg-maroon/10 transition-all duration-300">
                    {s.icon || '🦷'}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark mb-3 group-hover:text-maroon transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-gray-500 font-body text-xs md:text-sm leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-maroon/5 pt-5 mt-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Estimated Tariff</span>
                    <span className="text-base font-bold text-crimson font-body">{s.priceClass}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('appointment', s.name)}
                    className="px-5 py-2.5 bg-maroon text-white hover:bg-orange text-xs font-semibold rounded-lg font-body transition-all duration-300 transform hover:scale-[1.03]"
                  >
                    Book Now 📅
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Banner Info */}
        <div className="mt-16 bg-white p-6 md:p-8 rounded-2xl border border-maroon/5 text-center max-w-3xl mx-auto">
          <p className="text-sm font-body text-gray-500">
            💡 <strong className="text-dark font-medium">Have a unique or emergency issue?</strong> We provide customized surgical treatments that might not be explicitly tabulated. Contact Dr. Tanmay Rajput directly at <strong className="text-crimson font-mono">+91 7000818065</strong> or book an instant dental consultation space.
          </p>
        </div>
      </div>
    </div>
  );
}
