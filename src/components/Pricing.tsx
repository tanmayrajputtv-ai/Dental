import { PRICING_PLANS } from '../data';
import { CircleCheck } from 'lucide-react';

interface PricingProps {
  onNavigate: (page: string) => void;
}

export default function Pricing({ onNavigate }: PricingProps) {
  return (
    <div className="fade-in py-20 bg-light/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 mt-12">
          <span className="text-crimson text-sm font-semibold tracking-widest uppercase">💎 PREMIUM CARE MEMBERSHIP</span>
          <h1 className="text-4xl font-heading font-bold text-dark mt-2">Annual Dental Wellness Plans</h1>
          <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
          <p className="text-gray-500 mt-4 text-sm font-body">
            Invest in long-term preventive smiles. Secure unlimited diagnostic checkups, cleaning sessions, and heavy treatment discounts with our family memberships.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((p, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border relative flex flex-col justify-between transition-all duration-300 ${
                p.popular
                  ? 'border-crimson shadow-xl scale-[1.02] md:scale-[1.04] z-10 bg-gradient-to-b from-white via-white to-light/10'
                  : 'border-maroon/5 shadow-sm hover:shadow-lg'
              }`}
            >
              {/* Badge highlight */}
              {p.badge && (
                <span
                  className={`absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest ${
                    p.popular ? 'bg-crimson text-white shadow-md' : 'bg-maroon text-white'
                  }`}
                >
                  {p.badge}
                </span>
              )}

              {/* Offer Header */}
              <div className="p-8 md:p-10 border-b border-maroon/5">
                <span className="text-xs text-gray-400 font-mono tracking-wider block uppercase mb-2">
                  {p.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold text-dark">{p.priceValue}</span>
                  <span className="text-xs text-gray-400 font-body">/{p.period}</span>
                </div>
                <p className="text-xs text-gray-500 font-body mt-2">
                  Complete annual clinical protection plan for singular individuals.
                </p>
              </div>

              {/* Offer Features List */}
              <div className="p-8 md:p-10 flex-grow space-y-4">
                {p.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <CircleCheck className="text-crimson mt-0.5 shrink-0" size={16} />
                    <span className="text-xs md:text-sm text-gray-600 font-body leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Submit CTA */}
              <div className="p-8 md:p-10 border-t border-maroon/5 bg-light/10">
                <button
                  onClick={() => onNavigate('appointment')}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 ${
                    p.popular
                      ? 'bg-crimson hover:bg-orange text-white shadow-lg hover:shadow-orange-700/20'
                      : 'bg-maroon hover:bg-crimson text-white'
                  }`}
                >
                  Subscribe to Plan 🚀
                </button>
                <p className="text-[10px] text-gray-400 text-center font-body mt-3">
                  Instantly active post-verification at the Bhopal clinic desk.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Benefits Spec */}
        <div className="mt-16 bg-white p-8 rounded-2xl border border-maroon/5">
          <h3 className="text-lg font-heading font-bold text-dark text-center mb-6">Frequently Asked Wellness Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-body">
            <div>
              <h4 className="font-semibold text-dark mb-1">How can I redeem my membership treatment discount?</h4>
              <p className="text-gray-500">
                During billing, just showcase your membership registered phone number or card profile to the receptionist desk. Discounts are instantly calculated.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-dark mb-1">Can I transfer the membership services to family members?</h4>
              <p className="text-gray-500">
                Plans are mapped to single legal individuals. However, we offer custom Family Bundles allowing shared dental checkups and teeth scaled polish discounts.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
