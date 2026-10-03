import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Search,
  Home,
  Users,
  ShieldCheck,
  Tag,
  MapPin,
  Award,
  CheckSquare,
  Mail,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useRealEstate } from '../context/RealEstateContext';
import { PropertyCategory } from '../types/realEstate';
import { BRAND_IMAGES } from '../data/seedProperties';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyImage } from '../components/PropertyImage';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { ValuationModal } from '../components/ValuationModal';

export const HomePage: React.FC = () => {
  const {
    properties,
    setFilters,
    resetFilters,
    currentUser,
    openAuthModal,
  } = useRealEstate();
  const navigate = useNavigate();

  // Search Bar Tabs (Buy / Rent / Sell) + Filter States
  const [searchModeTab, setSearchModeTab] = useState<'buy' | 'rent' | 'sell'>('buy');
  const [heroLocation, setHeroLocation] = useState('');
  const [heroCategory, setHeroCategory] = useState<'All' | PropertyCategory>('All');
  const [heroPriceRange, setHeroPriceRange] = useState('any');
  const [heroBeds, setHeroBeds] = useState('Any');
  const [heroBaths, setHeroBaths] = useState('Any');

  // Featured Properties Category Filter & Carousel Offset
  const [featuredTab, setFeaturedTab] = useState<'All' | PropertyCategory>('All');
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Modals
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [valuationOpen, setValuationOpen] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchModeTab === 'sell') {
      if (!currentUser) {
        openAuthModal('signin');
      }
      navigate('/dashboard?tab=add');
      return;
    }

    let minPrice = '';
    let maxPrice = '';
    if (heroPriceRange === 'under-500k') {
      maxPrice = '500000';
    } else if (heroPriceRange === '500k-800k') {
      minPrice = '500000';
      maxPrice = '800000';
    } else if (heroPriceRange === '800k-1.2m') {
      minPrice = '800000';
      maxPrice = '1200000';
    } else if (heroPriceRange === '1.2m-plus') {
      minPrice = '1200000';
    }

    setFilters({
      location: heroLocation.trim(),
      category: heroCategory,
      minPrice,
      maxPrice,
      bedrooms: heroCategory === 'Plot' ? 'Any' : heroBeds,
      bathrooms: heroCategory === 'Plot' ? 'Any' : heroBaths,
      sortBy: 'newest',
    });
    navigate('/properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredFeaturedList = useMemo(() => {
    return featuredTab === 'All'
      ? properties
      : properties.filter((p) => p.category === featuredTab);
  }, [properties, featuredTab]);

  const visibleFeaturedProperties = useMemo(() => {
    if (filteredFeaturedList.length <= 4) return filteredFeaturedList;
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push(filteredFeaturedList[(carouselOffset + i) % filteredFeaturedList.length]);
    }
    return result;
  }, [filteredFeaturedList, carouselOffset]);

  const handleNextFeatured = () => {
    setCarouselOffset((prev) => (prev + 1) % Math.max(1, filteredFeaturedList.length));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('success');
    setNewsletterEmail('');
  };

  return (
    <div className="bg-white">
      {/* =================================================================
          1. HERO SECTION (Matches Reference Image Seamless Left-Fade Layout)
         ================================================================= */}
      <section className="relative bg-white">
        {/* Background / Right-Aligned Luxury Villa with White Left Blend */}
        <div className="relative max-w-[1440px] mx-auto">
          <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center overflow-hidden">
            {/* Right-side Villa Photo */}
            <div className="absolute inset-y-0 right-0 w-full lg:w-[72%] h-full">
              <PropertyImage
                src={BRAND_IMAGES.heroVilla}
                alt="Luxury modern two-story home with twilight pool"
                className="w-full h-full object-cover object-center"
              />
              {/* Smooth gradient blending photo into white canvas on the left & top */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-white via-white/95 via-45% to-transparent" />
              <div className="lg:hidden absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent" />
            </div>

            {/* Left Foreground Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-24 lg:py-20">
              <div className="max-w-xl space-y-5">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#0A192F] leading-[1.08]">
                  Find Your
                  <br />
                  Perfect <span className="text-[#0F3C78]">Home</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-md font-medium">
                  Discover exceptional properties and
                  <br className="hidden sm:inline" /> unlock the door to your dream home.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      navigate('/properties');
                    }}
                    className="px-6 py-3.5 bg-[#0B2447] hover:bg-[#133667] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md inline-flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <span>Explore Properties</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHowItWorksOpen(true)}
                    className="px-6 py-3.5 bg-white/95 hover:bg-white text-[#0A192F] border border-slate-400/90 text-xs sm:text-sm font-bold rounded-lg shadow-xs inline-flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <span>How It Works</span>
                    <Play className="w-3.5 h-3.5 text-[#0A192F]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              FLOATING SEARCH & FILTER CARD OVERLAPPING HERO BOTTOM
             ================================================================= */}
          <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
            {/* Folder Tabs (Buy | Rent | Sell) matching Reference Image */}
            <div className="inline-flex items-center bg-white rounded-t-xl px-4 pt-2.5 pb-1 gap-6 shadow-[0_-4px_15px_rgba(10,25,47,0.04)] border border-b-0 border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSearchModeTab('buy');
                  setHeroCategory('All');
                }}
                className={`pb-2 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer ${
                  searchModeTab === 'buy'
                    ? 'text-[#0F3C78] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F3C78] after:rounded-full'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchModeTab('rent');
                  setHeroCategory('Apartment');
                }}
                className={`pb-2 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer ${
                  searchModeTab === 'rent'
                    ? 'text-[#0F3C78] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F3C78] after:rounded-full'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchModeTab('sell');
                  if (!currentUser) {
                    openAuthModal('signin');
                  }
                  navigate('/dashboard?tab=add');
                }}
                className={`pb-2 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer ${
                  searchModeTab === 'sell'
                    ? 'text-[#0F3C78] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0F3C78] after:rounded-full'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sell
              </button>
            </div>

            {/* White Horizontal Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-b-2xl rounded-tr-2xl shadow-[0_14px_40px_rgba(10,25,47,0.12)] border border-slate-200/80 p-4 sm:p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                {/* 1. Location (3 cols) */}
                <div className="lg:col-span-3 sm:pr-3 lg:border-r border-slate-200/80">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={heroLocation}
                    onChange={(e) => setHeroLocation(e.target.value)}
                    placeholder="City, Neighborhood, or ZIP"
                    className="w-full text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* 2. Property Type / Category (2 cols) */}
                <div className="lg:col-span-2 sm:px-2 lg:border-r border-slate-200/80">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Property Type
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={heroCategory}
                      onChange={(e) =>
                        setHeroCategory(e.target.value as 'All' | PropertyCategory)
                      }
                      className="w-full appearance-none text-xs sm:text-sm text-slate-600 bg-transparent pr-5 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Any Type</option>
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Plot">Plot</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
                  </div>
                </div>

                {/* 3. Price Range (2 cols) */}
                <div className="lg:col-span-2 sm:px-2 lg:border-r border-slate-200/80">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Price Range
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={heroPriceRange}
                      onChange={(e) => setHeroPriceRange(e.target.value)}
                      className="w-full appearance-none text-xs sm:text-sm text-slate-600 bg-transparent pr-5 tabular-nums focus:outline-none cursor-pointer"
                    >
                      <option value="any">$Min - $Max</option>
                      <option value="under-500k">Under $500k</option>
                      <option value="500k-800k">$500k - $800k</option>
                      <option value="800k-1.2m">$800k - $1.2M</option>
                      <option value="1.2m-plus">$1.2M+</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
                  </div>
                </div>

                {/* 4. Beds (1.5 cols -> 1 col) */}
                <div className="lg:col-span-1 sm:px-1 lg:border-r border-slate-200/80">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Beds
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={heroBeds}
                      onChange={(e) => setHeroBeds(e.target.value)}
                      disabled={heroCategory === 'Plot'}
                      className="w-full appearance-none text-xs sm:text-sm text-slate-600 bg-transparent pr-4 focus:outline-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="Any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
                  </div>
                </div>

                {/* 5. Baths (1 col) */}
                <div className="lg:col-span-1 sm:px-1">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Baths
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={heroBaths}
                      onChange={(e) => setHeroBaths(e.target.value)}
                      disabled={heroCategory === 'Plot'}
                      className="w-full appearance-none text-xs sm:text-sm text-slate-600 bg-transparent pr-4 focus:outline-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="Any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
                  </div>
                </div>

                {/* 6. Search Properties Button (3 cols) */}
                <div className="lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-[#0B2447] hover:bg-[#133667] text-white text-xs sm:text-sm font-bold rounded-lg inline-flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Search Properties</span>
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* =================================================================
            4-COLUMN FEATURE ROW WITH DARK NAVY CIRCULAR ICONS
           ================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0B2447] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Home className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Find The Perfect Home</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse thousands of verified listings that match your needs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0B2447] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Expert Agents</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Work with experienced agents who guide you at every step.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0B2447] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Trusted & Secure</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transparent process and secure property transactions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0B2447] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Tag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Best Deals</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Get the best value with exclusive property deals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. FEATURED PROPERTIES ("Homes You'll Love" - 4-Card Row + Arrow)
         ================================================================= */}
      <section className="py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold tracking-wider text-[#0F3C78] uppercase">
                FEATURED PROPERTIES
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Homes You&apos;ll Love
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Category Quick Filter Tabs (All, House, Apartment, Plot) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['All', 'House', 'Apartment', 'Plot'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setFeaturedTab(cat);
                      setCarouselOffset(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      featuredTab === cat
                        ? 'bg-[#0B2447] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Link
                to="/properties"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F3C78] hover:text-[#0B2447] transition-colors whitespace-nowrap"
              >
                <span>View All Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4-Card Row with Right Carousel Arrow Button matching Reference Image */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleFeaturedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {filteredFeaturedList.length > 4 && (
              <button
                type="button"
                onClick={handleNextFeatured}
                aria-label="Next featured properties"
                className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.16)] border border-slate-200 items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================
          3. THINKING OF SELLING / HOME VALUE ESTIMATE BANNER
         ================================================================= */}
      <section id="selling-valuation-banner" className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden bg-[#071936] grid grid-cols-1 lg:grid-cols-12 shadow-[0_10px_30px_rgba(7,25,54,0.16)]">
            {/* Left Dark Navy Content */}
            <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-4">
              <div className="text-sm sm:text-base font-medium text-slate-200">
                Thinking of Selling?
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white leading-tight">
                Get Maximum Value for Your Property
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                Our expert agents help you sell faster and for the best possible price.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setValuationOpen(true)}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-[#071936] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Get Free Home Valuation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interior Photo with Floating Home Value Estimate Card */}
            <div className="lg:col-span-6 relative min-h-[250px] sm:min-h-[290px]">
              <PropertyImage
                src={BRAND_IMAGES.valuationBanner}
                alt="Modern luxury living room overlooking city"
                className="w-full h-full object-cover"
              />
              {/* Floating Estimate Card matching Reference Image */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <button
                  type="button"
                  onClick={() => setValuationOpen(true)}
                  className="bg-white/95 backdrop-blur-xs rounded-2xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(10,25,47,0.22)] border border-white flex items-center gap-4 max-w-xs w-full text-left transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  {/* Circle Icon on Left */}
                  <div className="w-12 h-12 rounded-full bg-[#EBF2FA] text-[#0F3C78] flex items-center justify-center shrink-0">
                    <Home className="w-6 h-6" />
                  </div>
                  {/* Estimate Numbers on Right */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Home Value Estimate
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                        $875,000
                      </span>
                      <span className="text-xs font-bold text-emerald-600 tabular-nums">
                        +12.5% ↑
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Based on market trends
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. WHY CHOOSE US ("We Make Real Estate Simple") & STAY UPDATED
         ================================================================= */}
      <section id="why-choose-us" className="py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Why Choose Us Header & 4-Column Strip */}
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold tracking-wider text-[#0F3C78] uppercase">
                WHY CHOOSE US
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                We Make Real Estate Simple
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EBF2FA] text-[#0F3C78] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Local Expertise</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    In-depth knowledge of local markets and neighborhoods.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EBF2FA] text-[#0F3C78] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Personalized Service</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tailored solutions that fit your unique needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EBF2FA] text-[#0F3C78] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Proven Results</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A track record of successful sales and happy clients.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EBF2FA] text-[#0F3C78] flex items-center justify-center shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Full Support</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    From search to closing, we&apos;re with you all the way.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Updated Newsletter Banner matching Reference Image */}
          <div className="rounded-2xl bg-[#EEF3F9] border border-blue-100/80 px-6 py-5 sm:px-8 sm:py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#0B2447] text-[#0B2447] flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Stay Updated</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Subscribe to get the latest property listings and real estate tips.
                </p>
              </div>
            </div>

            {newsletterStatus === 'success' ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-4 py-3 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You are subscribed to HomeLuxe updates!</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === 'error') setNewsletterStatus('idle');
                  }}
                  placeholder="Enter your email address"
                  className="w-full sm:w-80 px-4 py-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:border-[#0F3C78]"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#0F3C78] hover:bg-[#0B2447] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      <ValuationModal open={valuationOpen} onClose={() => setValuationOpen(false)} />
    </div>
  );
};
