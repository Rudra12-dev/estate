import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useRealEstate } from '../context/RealEstateContext';
import { PropertyCategory } from '../types/realEstate';
import { BrandLogo } from './Header';

export const Footer: React.FC = () => {
  const { setFilters, resetFilters } = useRealEstate();
  const navigate = useNavigate();

  const handleCategoryLink = (category: 'All' | PropertyCategory) => {
    resetFilters();
    setFilters((prev) => ({ ...prev, category }));
    navigate('/properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact-footer" className="bg-[#06152D] text-slate-300 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pb-12 border-b border-slate-800">
          {/* Column 1: Brand + Tagline + Social Icons (4 cols) */}
          <div className="lg:col-span-4 space-y-4 pr-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-block"
            >
              <BrandLogo dark />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
              Helping you find the perfect place to call home. Your trusted real estate partner.
            </p>
            {/* Social Icons Row matching Reference Image */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#contact-footer"
                onClick={(e) => e.preventDefault()}
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-white text-[#06152D] hover:bg-blue-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="#contact-footer"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-white text-[#06152D] hover:bg-blue-100 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-current"
                  fill="none"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#contact-footer"
                onClick={(e) => e.preventDefault()}
                aria-label="Twitter"
                className="w-7 h-7 rounded-full bg-white text-[#06152D] hover:bg-blue-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="#contact-footer"
                onClick={(e) => e.preventDefault()}
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-white text-[#06152D] hover:bg-blue-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryLink('House')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Buy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryLink('Apartment')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Rent
                </button>
              </li>
              <li>
                <Link
                  to="/dashboard?tab=add"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Sell
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryLink('All')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Listings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  Our Agents
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryLink('Plot')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Land & Plots
                </button>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <a href="tel:9956323801" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white">Resources</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/dashboard?tab=add" className="hover:text-white transition-colors">
                  Home Valuation
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  Buyers Guide
                </Link>
              </li>
              <li>
                <Link to="/dashboard?tab=add" className="hover:text-white transition-colors">
                  Sellers Guide
                </Link>
              </li>
              <li>
                <Link to="/dashboard?tab=bookings" className="hover:text-white transition-colors">
                  Viewing Bookings
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  Property Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white">Contact Us</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2 tabular-nums">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:9956323801" className="hover:text-white transition-colors">
                  9956323801
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="mailto:rudre066175@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  rudre066175@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Rudra Real Estate
                  <br />
                  Lucknow, Uttar Pradesh.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Homeluxe Real Estate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/properties" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
