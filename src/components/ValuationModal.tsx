import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyCategory } from '../types/realEstate';

interface ValuationModalProps {
  open: boolean;
  onClose: () => void;
}

export const ValuationModal: React.FC<ValuationModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('123 Maple Drive, Beverly Hills');
  const [category, setCategory] = useState<PropertyCategory>('House');
  const [area, setArea] = useState('2450');
  const [bedrooms, setBedrooms] = useState('4');
  const [estimate, setEstimate] = useState<number | null>(875000);

  if (!open) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const sqFt = Math.max(200, Number(area) || 1500);
    const beds = category === 'Plot' ? 0 : Math.max(0, Number(bedrooms) || 0);
    const baseRate = category === 'House' ? 340 : category === 'Apartment' ? 390 : 85;
    const computed = Math.round((sqFt * baseRate + beds * 22000) / 5000) * 5000;
    setEstimate(computed);
  };

  const formattedEstimate = estimate
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(estimate)
    : '$875,000';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          aria-label="Close valuation modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#1E40AF]">Instant Property Valuation</div>
          <h2 className="font-display text-2xl font-bold text-[#0A192F]">
            Estimate Your Property Value
          </h2>
          <p className="text-sm text-slate-500">
            Calculate an instant market valuation based on property category and square footage.
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Property Location</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Area (Sq Ft)</label>
              <input
                type="number"
                min={100}
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Bedrooms</label>
              <input
                type="number"
                min={0}
                disabled={category === 'Plot'}
                value={category === 'Plot' ? '0' : bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg tabular-nums disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0A192F] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Recalculate Estimate
          </button>
        </form>

        <div className="p-5 rounded-xl bg-[#0A192F] text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-300">Estimated Market Valuation</div>
            <div className="text-2xl font-bold tabular-nums">{formattedEstimate}</div>
            <div className="text-xs text-emerald-400 tabular-nums">
              +12.5% YoY Regional Appreciation
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/dashboard?tab=add');
            }}
            className="px-4 py-2.5 bg-[#1E40AF] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>List Property Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
