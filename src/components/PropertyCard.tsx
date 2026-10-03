import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bed, Bath, Maximize2 } from 'lucide-react';
import { Property } from '../types/realEstate';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [favorited, setFavorited] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const formattedArea = new Intl.NumberFormat('en-US').format(property.area);

  const isApartmentRentalStyle = property.id === 'prop_pine_street_103';

  return (
    <article className="group bg-white rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)] border border-slate-200/80 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Property Image Container with FOR SALE badge & Heart Icon matching reference */}
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
        <Link to={`/properties/${property.id}`} className="block w-full h-full">
          <PropertyImage
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
        </Link>

        {/* Top-Left Status Badge matching Reference Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
              isApartmentRentalStyle ? 'bg-[#388E3C]' : 'bg-[#0F3C78]'
            }`}
          >
            {isApartmentRentalStyle ? 'FOR SALE · APT' : `FOR SALE · ${property.category.toUpperCase()}`}
          </span>
        </div>

        {/* Top-Right Favorite Heart Button matching Reference Image */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFavorited((prev) => !prev);
          }}
          aria-label="Save property to favorites"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-xs flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Card Body matching Reference Image */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Large Bold Price */}
          <div className="text-xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {formattedPrice}
          </div>

          {/* Street Name */}
          <h3 className="mt-1 text-sm font-bold text-slate-800 group-hover:text-[#0F3C78] transition-colors line-clamp-1">
            <Link to={`/properties/${property.id}`}>{property.name}</Link>
          </h3>

          {/* Location */}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{property.location}</p>
        </div>

        {/* Bottom Specs Row with Icons matching Reference Image */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-600 tabular-nums">
            {property.category !== 'Plot' ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{property.bedrooms} Beds</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{property.bathrooms} Baths</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formattedArea} Sq Ft</span>
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-[#0F3C78] font-semibold">
                  <span>Residential Plot</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formattedArea} Sq Ft</span>
                </span>
              </>
            )}
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="block w-full py-2 px-3 text-center text-xs font-semibold text-[#0B2447] bg-slate-50 hover:bg-[#0B2447] hover:text-white rounded-lg border border-slate-200/80 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};
