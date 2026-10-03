import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { PropertyCategory, PropertyFilterState, SortOption } from '../types/realEstate';

interface SearchFiltersProps {
  filters: PropertyFilterState;
  onChange: React.Dispatch<React.SetStateAction<PropertyFilterState>>;
  onReset: () => void;
  onSearchSubmit?: () => void;
  showSort?: boolean;
  compact?: boolean;
}

const CATEGORIES: Array<'All' | PropertyCategory> = ['All', 'House', 'Apartment', 'Plot'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onSearchSubmit,
  showSort = true,
  compact = false,
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5"
    >
      {/* Top Row: Category Segmented Control + Sort / Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, category: cat }))}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#0A192F] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'All' ? 'All Types' : cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {showSort && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                }
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1E40AF]"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          compact ? 'lg:grid-cols-6' : 'lg:grid-cols-5'
        } gap-4 items-end`}
      >
        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onChange((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="City, State, ZIP, or Street"
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Min Price */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Minimum Price ($)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={filters.minPrice}
            onChange={(e) => onChange((prev) => ({ ...prev, minPrice: e.target.value }))}
            placeholder="No Min"
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Maximum Price ($)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={filters.maxPrice}
            onChange={(e) => onChange((prev) => ({ ...prev, maxPrice: e.target.value }))}
            placeholder="No Max"
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Bedrooms</label>
          <select
            value={filters.bedrooms}
            onChange={(e) => onChange((prev) => ({ ...prev, bedrooms: e.target.value }))}
            disabled={filters.category === 'Plot'}
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF] disabled:opacity-50"
          >
            <option value="Any">Any Beds</option>
            <option value="1">1+ Bedrooms</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Bathrooms</label>
          <select
            value={filters.bathrooms}
            onChange={(e) => onChange((prev) => ({ ...prev, bathrooms: e.target.value }))}
            disabled={filters.category === 'Plot'}
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF] disabled:opacity-50"
          >
            <option value="Any">Any Baths</option>
            <option value="1">1+ Bathrooms</option>
            <option value="2">2+ Bathrooms</option>
            <option value="3">3+ Bathrooms</option>
            <option value="4">4+ Bathrooms</option>
          </select>
        </div>

        {compact && (
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Search Properties</span>
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </form>
  );
};
