import React, { useState } from 'react';
import { CLINIC_INFO } from '../data';
import { Calendar, PhoneCall, Mail, Navigation2, Send } from 'lucide-react';

interface ContactProps {
  onShowToast: (message: string, isSuccess: boolean) => void;
}

export default function Contact({ onShowToast }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      onShowToast('Please fill out all fields in the contact request form.', false);
      return;
    }

    setLoading(true);
    // Simulate API transport
    setTimeout(() => {
      onShowToast("📬 Thank you for reaching out! Dr. Tanmay Rajput's assistant will call you back shortly.", true);
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fade-in py-20 bg-light/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 mt-12">
          <span className="text-crimson text-sm font-semibold tracking-widest uppercase">📞 GET IN TOUCH</span>
          <h1 className="text-4xl font-heading font-bold text-dark mt-2">Connect with Rajput Dental</h1>
          <div className="w-16 h-1 bg-crimson mx-auto mt-4"></div>
          <p className="text-gray-500 mt-4 text-sm font-body">
            Have questions regarding pricing programs, root canals or general dental concerns? Drop us a line of code below!
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-maroon/5 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-light text-maroon flex items-center justify-center mx-auto mb-4">
              <PhoneCall size={20} />
            </div>
            <h3 className="font-heading font-bold text-dark text-base">Direct Phone Call</h3>
            <p className="text-xs text-gray-400 mt-1 mb-3">Call or WhatsApp anytime</p>
            <a href={`tel:${CLINIC_INFO.phone}`} className="text-sm font-extrabold text-crimson font-mono hover:underline">
              {CLINIC_INFO.phone}
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-maroon/5 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-light text-maroon flex items-center justify-center mx-auto mb-4">
              <Mail size={20} />
            </div>
            <h3 className="font-heading font-bold text-dark text-base">Official Email</h3>
            <p className="text-xs text-gray-400 mt-1 mb-3">Response within 24 work hours</p>
            <a href={`mailto:${CLINIC_INFO.email}`} className="text-sm font-extrabold text-crimson font-body hover:underline transition-colors break-words">
              {CLINIC_INFO.email}
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-maroon/5 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-light text-maroon flex items-center justify-center mx-auto mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="font-heading font-bold text-dark text-base">Clinic Operations</h3>
            <p className="text-xs text-gray-400 mt-1 mb-1 font-body">Mon–Sat: 9 AM – 7 PM</p>
            <p className="text-xs text-gray-400 font-body">Sunday: 10 AM – 2 PM</p>
          </div>
        </div>

        {/* Split Section: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Free Message Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-maroon/5 shadow-md">
            <h3 className="text-xl font-heading font-bold text-dark mb-6">Drop a Custom Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark uppercase block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full border rounded-xl px-4 py-3 text-xs md:text-sm focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark uppercase block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full border rounded-xl px-4 py-3 text-xs md:text-sm focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark uppercase block">Your Inquiry Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Ask any general oral check question..."
                  className="w-full border rounded-xl px-4 py-3 text-xs md:text-sm focus:border-crimson focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-crimson hover:bg-maroon disabled:bg-gray-400 text-white font-bold rounded-xl text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? 'Transmitting code...' : <><Send size={14} /> Send Inquiry</>}
              </button>
            </form>
          </div>

          {/* Google map iframe */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-3xl overflow-hidden border border-maroon/5 p-4 shadow-md flex-1 h-[300px] lg:h-full relative min-h-[350px]">
              {/* Direct Bhopal Maps link embed */}
              <iframe
                title="Rajput Dental Clinic Bhopal Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14664.4443909796!2d77.47047717524967!3d23.238914618798155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c423ba21323cd%3A0x673ccb3684a0d8da!2sAwadhpuri%2C%20Bhopal%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1716945030225!5m2!1sen!2sin"
                className="w-full h-full rounded-2xl border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
            </div>

            <div className="p-5 bg-white border border-maroon/5 rounded-2xl shadow-sm text-xs font-body space-y-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-golden/20 text-maroon flex items-center justify-center shrink-0">📍</div>
              <div>
                <h4 className="font-bold text-dark font-heading">Clinic Location:</h4>
                <p className="text-gray-500">{CLINIC_INFO.location}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
