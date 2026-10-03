import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Users,
  Star,
  Gift,
  Phone,
  ChevronDown,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useRealEstate } from '../context/RealEstateContext';

export const BrandLogo: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div className="flex items-center gap-2.5 select-none">
    {/* Hexagonal House Emblem matching reference */}
    <svg
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M20 3L35 11.5V28.5L20 37L5 28.5V11.5L20 3Z"
        stroke={dark ? '#FFFFFF' : '#0B2447'}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M11 21L20 13L29 21V31H11V21Z"
        stroke={dark ? '#60A5FA' : '#0F3C78'}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 31V23H23V31"
        stroke={dark ? '#FFFFFF' : '#0B2447'}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="18.5"
        y="17"
        width="3"
        height="3"
        fill={dark ? '#60A5FA' : '#0F3C78'}
      />
    </svg>
    <div className="flex flex-col leading-none">
      <span
        className={`font-brand text-lg font-extrabold tracking-wide ${
          dark ? 'text-white' : 'text-[#0B2447]'
        }`}
      >
        HOMELUXE
      </span>
      <span
        className={`text-[9px] font-semibold tracking-[0.26em] mt-0.5 ${
          dark ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        REAL ESTATE
      </span>
    </div>
  </div>
);

export const Header: React.FC = () => {
  const { currentUser, openAuthModal, signOut, resetFilters, setFilters } = useRealEstate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSellClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    if (!currentUser) {
      openAuthModal('signin');
      navigate('/dashboard?tab=add');
    } else {
      navigate('/dashboard?tab=add');
    }
  };

  const handleBrowseCategory = (cat: 'All' | 'House' | 'Apartment' | 'Plot') => {
    setMobileMenuOpen(false);
    resetFilters();
    setFilters((prev) => ({ ...prev, category: cat }));
    navigate('/properties');
  };

  const handleSectionNavigation = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    if (location.pathname.startsWith('/dashboard')) {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_2px_15px_rgba(10,25,47,0.06)]">
      {/* Top Dark Navy Utility Bar (Matches Reference Image) */}
      <div className="bg-[#06152D] text-slate-200 text-[11px] sm:text-xs py-2 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left Trust Badges */}
          <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Trusted by 10,000+ Clients</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-200">
              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>5 Star Rated Agency</span>
            </span>
            <button
              type="button"
              onClick={() => handleSectionNavigation('selling-valuation-banner')}
              className="hidden md:inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Free Property Valuation</span>
            </button>
          </div>

          {/* Right Phone & Social Icons */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <a
              href="tel:9956323801"
              className="inline-flex items-center gap-1.5 font-medium text-white hover:text-blue-300 transition-colors tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>9956323801</span>
            </a>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-700">
              {/* Facebook */}
              <a
                href="#contact-footer"
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionNavigation('contact-footer');
                }}
                aria-label="Facebook"
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#contact-footer"
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionNavigation('contact-footer');
                }}
                aria-label="Instagram"
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg
                  className="w-3 h-3 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#contact-footer"
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionNavigation('contact-footer');
                }}
                aria-label="LinkedIn"
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="shrink-0">
          <BrandLogo />
        </Link>

        {/* Center: Navigation Links matching Reference Image */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-700">
          <Link
            to="/"
            className={`py-2 relative transition-colors whitespace-nowrap ${
              isActive('/')
                ? 'text-[#0F3C78] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F3C78] after:rounded-full'
                : 'hover:text-[#0F3C78]'
            }`}
          >
            Home
          </Link>

          {/* Buy Dropdown / Link */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => handleBrowseCategory('All')}
              className={`py-2 inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                isActive('/properties') ? 'text-[#0F3C78]' : 'hover:text-[#0F3C78]'
              }`}
            >
              <span>Properties</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F3C78]" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-1 w-44 z-50">
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => handleBrowseCategory('All')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-[#0F3C78] cursor-pointer"
                >
                  All Properties
                </button>
                <button
                  type="button"
                  onClick={() => handleBrowseCategory('House')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-[#0F3C78] cursor-pointer"
                >
                  Houses for Sale
                </button>
                <button
                  type="button"
                  onClick={() => handleBrowseCategory('Apartment')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-[#0F3C78] cursor-pointer"
                >
                  Apartments
                </button>
                <button
                  type="button"
                  onClick={() => handleBrowseCategory('Plot')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-[#0F3C78] cursor-pointer"
                >
                  Residential Plots
                </button>
              </div>
            </div>
          </div>

          <a
            href="#sell"
            onClick={handleSellClick}
            className={`py-2 relative transition-colors whitespace-nowrap ${
              location.pathname === '/dashboard' && location.search.includes('add')
                ? 'text-[#0F3C78] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F3C78] after:rounded-full'
                : 'hover:text-[#0F3C78]'
            }`}
          >
            Sell
          </a>

          <button
            type="button"
            onClick={() => handleBrowseCategory('Apartment')}
            className="py-2 hover:text-[#0F3C78] transition-colors whitespace-nowrap cursor-pointer"
          >
            Rent
          </button>

          <Link
            to="/properties"
            className="py-2 inline-flex items-center gap-1 hover:text-[#0F3C78] transition-colors whitespace-nowrap"
          >
            <span>Listings</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={() => handleSectionNavigation('why-choose-us')}
            className="py-2 hover:text-[#0F3C78] transition-colors whitespace-nowrap cursor-pointer"
          >
            About Us
          </button>

          <button
            type="button"
            onClick={() => handleSectionNavigation('contact-footer')}
            className="py-2 hover:text-[#0F3C78] transition-colors whitespace-nowrap cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right: Auth Controls + "List Your Property" Navy CTA Button */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2447] bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#0F3C78]" />
                <span>Dashboard ({currentUser.name.split(' ')[0]})</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F3C78] transition-colors whitespace-nowrap cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-2 text-xs font-semibold text-[#0F3C78] border border-[#0F3C78]/30 hover:bg-blue-50/50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleSellClick()}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0B2447] hover:bg-[#133667] rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            List Your Property
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden p-2 text-slate-700 hover:text-[#0B2447] rounded-lg focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Properties
            </Link>
            <a
              href="#sell"
              onClick={handleSellClick}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Sell Property
            </a>
            <button
              type="button"
              onClick={() => handleSectionNavigation('why-choose-us')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => handleSectionNavigation('contact-footer')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Contact
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-[#0B2447] rounded-lg"
                >
                  Dashboard ({currentUser.name})
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="py-2.5 px-4 text-xs font-semibold text-[#0B2447] border border-slate-200 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2.5 px-4 text-xs font-semibold text-white bg-[#0F3C78] rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleSellClick()}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-[#0B2447] rounded-lg"
            >
              List Your Property
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
