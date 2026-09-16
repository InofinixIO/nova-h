import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Star, Mail, Phone, Globe, Award, CheckCircle2, Send, Building2 } from 'lucide-react';
import { DirectoryItem } from '../types';

interface VendorDetailModalProps {
  vendor: DirectoryItem | null;
  onClose: () => void;
  onPostRequirement: () => void;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  vendor,
  onClose,
  onPostRequirement,
}) => {
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');

  if (!vendor) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText('');
      alert(`Message successfully delivered to ${vendor.name}! They will contact you shortly.`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            vendor.role === 'advisor'
              ? 'bg-sky-100 text-sky-800 border border-sky-200'
              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
          }`}>
            {vendor.role === 'advisor' ? 'Healthcare Advisor' : 'Verified Vendor'}
          </span>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {vendor.category}
          </span>
        </div>

        {/* Business Name & Verification */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>{vendor.name}</span>
              {vendor.verified && (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" title="Verified by NOVA" />
              )}
            </h3>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Base: <strong>{vendor.location}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{vendor.rating.toFixed(1)}</span>
                <span>({vendor.reviewsCount} promoter reviews)</span>
              </div>
              <span>•</span>
              <span><strong>{vendor.yearsOfExperience}</strong> years in healthcare</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-sm text-slate-700 leading-relaxed">
          {vendor.description}
        </div>

        {/* Featured Project */}
        {vendor.featuredProject && (
          <div className="mb-5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Featured Hospital Benchmark:</p>
              <p className="text-xs font-medium text-slate-800 mt-0.5">{vendor.featuredProject}</p>
            </div>
          </div>
        )}

        {/* Services & Capabilities */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Specialized Products & Capabilities:
          </p>
          <div className="flex flex-wrap gap-2">
            {vendor.productsAndServices.map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Geographic Coverage */}
        <div className="space-y-1.5 mb-6 text-xs text-slate-600">
          <p className="font-bold text-slate-800 uppercase tracking-wider">Service Coverage Locations:</p>
          <p>{vendor.serviceLocations.join(', ')}</p>
        </div>

        {/* Contact and Direct Connect Box */}
        <div className="pt-5 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Direct Contact Details:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-mono">{vendor.contactEmail}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-mono">{vendor.phone}</span>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <form onSubmit={handleSendMessage} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Send Direct Message or Inquiry:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ask about pricing, availability, or technical specifications..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={messageSent}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
