import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useRealEstate } from '../context/RealEstateContext';
import { SearchFilters } from '../components/SearchFilters';
import { PropertyCard } from '../components/PropertyCard';

export const PropertiesPage: React.FC = () => {
  const {
    properties,
    loadingProperties,
    filters,
    setFilters,
    resetFilters,
  } = useRealEstate();

  // Dynamic filtering & sorting over actual property records
  const filteredProperties = useMemo(() => {
    return properties
      .filter((property) => {
        // Category filter (House, Apartment, Plot)
        if (filters.category !== 'All' && property.category !== filters.category) {
          return false;
        }

        // Location / Name query filter
        if (filters.location.trim() !== '') {
          const query = filters.location.trim().toLowerCase();
          const matchLocation = property.location.toLowerCase().includes(query);
          const matchName = property.name.toLowerCase().includes(query);
          if (!matchLocation && !matchName) {
            return false;
          }
        }

        // Minimum Price filter
        if (filters.minPrice !== '') {
          const min = Number(filters.minPrice);
          if (!Number.isNaN(min) && property.price < min) {
            return false;
          }
        }

        // Maximum Price filter
        if (filters.maxPrice !== '') {
          const max = Number(filters.maxPrice);
          if (!Number.isNaN(max) && property.price > max) {
            return false;
          }
        }

        // Bedrooms filter
        if (filters.bedrooms !== 'Any' && property.category !== 'Plot') {
          const minBeds = Number(filters.bedrooms);
          if (!Number.isNaN(minBeds) && property.bedrooms < minBeds) {
            return false;
          }
        }

        // Bathrooms filter
        if (filters.bathrooms !== 'Any' && property.category !== 'Plot') {
          const minBaths = Number(filters.bathrooms);
          if (!Number.isNaN(minBaths) && property.bathrooms < minBaths) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (filters.sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [properties, filters]);

  return (
    <div className="bg-slate-50/60 min-h-screen py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#1E40AF]">Verified Directory</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0A192F]">
              Available Properties
            </h1>
            <p className="text-sm text-slate-600">
              Filter by House, Apartment, or Plot, and refine by location, price range, and size.
            </p>
          </div>

          <Link
            to="/dashboard?tab=add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property for Sale</span>
          </Link>
        </div>

        {/* Dynamic Search & Filter Controls */}
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          showSort={true}
        />

        {/* Results Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-[#0A192F] tabular-nums">{filteredProperties.length}</span>{' '}
            of <span className="font-semibold tabular-nums">{properties.length}</span> properties
            {filters.category !== 'All' && (
              <span>
                {' '}
                · Category: <strong className="text-[#1E40AF]">{filters.category}</strong>
              </span>
            )}
            {filters.location.trim() && (
              <span>
                {' '}
                · Location: <strong className="text-[#0A192F]">&ldquo;{filters.location}&rdquo;</strong>
              </span>
            )}
          </div>
        </div>

        {/* Property Grid / Loading / Empty State */}
        {loadingProperties && properties.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl bg-white border border-slate-200 animate-pulse p-5"
              />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A192F]">
              No Matching Properties Found
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              No properties matched your current filter combination. Try broadening your price
              range, changing the property category, or clearing the location filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
