import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const steps = [
    {
      num: '01.',
      title: 'Curated Property Discovery',
      desc: 'Filter verified Houses, Apartments, and Residential Plots by city, price range, bedrooms, and architectural size.',
    },
    {
      num: '02.',
      title: 'Private Viewing Scheduling',
      desc: 'Select your preferred viewing date and time directly on any property page. Manage all appointments in your dashboard.',
    },
    {
      num: '03.',
      title: 'Direct Listing & Portfolio Management',
      desc: 'Property owners can list homes or land parcels with custom photography, update pricing in real time, and track inquiries.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 relative space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#1E40AF]">HomeLuxe Platform Guide</div>
          <h2 className="font-display text-2xl font-bold text-[#0A192F]">
            How HomeLuxe Real Estate Works
          </h2>
          <p className="text-sm text-slate-500">
            A transparent, end-to-end experience for buyers, investors, and property sellers.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
            >
              <h3 className="text-sm font-semibold text-[#0A192F]">
                <span className="text-[#1E40AF] mr-1.5 tabular-nums">{step.num}</span>
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/properties');
            }}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
