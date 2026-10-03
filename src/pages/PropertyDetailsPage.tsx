import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { useRealEstate, PropertyInput } from '../context/RealEstateContext';
import { PropertyImage } from '../components/PropertyImage';
import { PropertyForm } from '../components/PropertyForm';

const TIME_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
];

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPropertyById,
    currentUser,
    openAuthModal,
    createBooking,
    updateProperty,
    deleteProperty,
  } = useRealEstate();

  const property = id ? getPropertyById(id) : undefined;

  const [viewingDate, setViewingDate] = useState<string>(getTomorrowDateString());
  const [viewingTime, setViewingTime] = useState<string>(TIME_SLOTS[1]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    date: string;
    time: string;
  } | null>(null);

  // Owner Edit / Delete state
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [ownerActionMessage, setOwnerActionMessage] = useState<string | null>(null);

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0A192F]">Property Not Found</h1>
        <p className="text-sm text-slate-600">
          This property listing may have been removed or sold.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === property.ownerId;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const formattedArea = new Intl.NumberFormat('en-US').format(property.area);
  const pricePerSqFt =
    property.area > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(Math.round(property.price / property.area))
      : '$0';

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      openAuthModal('signin');
      setBookingError('Please sign in or create an account to complete your viewing booking.');
      return;
    }

    setBookingSubmitting(true);
    try {
      await createBooking(property.id, viewingDate, viewingTime);
      setBookingSuccess({ date: viewingDate, time: viewingTime });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to schedule viewing.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleOwnerUpdate = async (input: PropertyInput) => {
    await updateProperty(property.id, input);
    setIsEditing(false);
    setOwnerActionMessage('Property details updated successfully.');
  };

  const handleOwnerDelete = async () => {
    await deleteProperty(property.id);
    navigate('/properties');
  };

  const featuresList =
    property.category === 'Plot'
      ? [
          'Surveyed Boundary Markers',
          'Underground Utilities Ready',
          'Geotechnical Soil Report Available',
          'Clear Title & Residential Zoning',
          'Paved Road Access',
          'Custom Architectural Build Permitted',
        ]
      : [
          'Architectural Double-Glazed Windows',
          'Smart Climate & Security Automation',
          'Custom Chef Kitchen & Stone Countertops',
          'Private Outdoor Entertaining Area',
          'Dedicated Garage / Resident Parking',
          'High-Efficiency HVAC & Insulation',
        ];

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Navigation & Owner Quick Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0A192F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>

          {isOwner && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0A192F] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Close Editor' : 'Edit Property'}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Property</span>
              </button>
            </div>
          )}
        </div>

        {ownerActionMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>{ownerActionMessage}</span>
            <button
              type="button"
              onClick={() => setOwnerActionMessage(null)}
              className="text-emerald-700 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {confirmingDelete && (
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-900">
                Confirm Permanent Deletion
              </h3>
              <p className="text-xs text-red-700">
                Are you sure you want to delete &ldquo;{property.name}&rdquo;? This action will
                immediately remove the property from all listings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOwnerDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Yes, Delete Property
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline Owner Edit Form */}
        {isEditing && isOwner && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A192F]">
              Edit Property Listing
            </h2>
            <PropertyForm
              initialProperty={property}
              onSubmit={handleOwnerUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Property Changes"
            />
          </div>
        )}

        {/* Main Property Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Gallery, Specs, Description, Features */}
          <div className="lg:col-span-8 space-y-8">
            {/* Large Property Photograph */}
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <PropertyImage
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title, Price, and Core Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#1E40AF]">{property.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{property.location}</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A192F]">
                    {property.name}
                  </h1>
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0A192F] tabular-nums">
                    {formattedPrice}
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    {pricePerSqFt} / Sq Ft
                  </div>
                </div>
              </div>

              {/* Structured Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 space-y-1">
                  <div className="text-xs text-slate-500">Category</div>
                  <div className="text-sm font-bold text-[#0A192F]">{property.category}</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 space-y-1">
                  <div className="text-xs text-slate-500">Bedrooms</div>
                  <div className="text-sm font-bold text-[#0A192F] tabular-nums">
                    {property.category === 'Plot' ? 'N/A (Land)' : `${property.bedrooms} Bedrooms`}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 space-y-1">
                  <div className="text-xs text-slate-500">Bathrooms</div>
                  <div className="text-sm font-bold text-[#0A192F] tabular-nums">
                    {property.category === 'Plot' ? 'N/A (Land)' : `${property.bathrooms} Bathrooms`}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 space-y-1">
                  <div className="text-xs text-slate-500">Total Area</div>
                  <div className="text-sm font-bold text-[#0A192F] tabular-nums">
                    {formattedArea} Sq Ft
                  </div>
                </div>
              </div>

              {/* Property Description */}
              <div className="space-y-3 pt-2">
                <h2 className="text-base font-bold text-[#0A192F]">Property Overview</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Property Features / Basic Details */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h2 className="text-base font-bold text-[#0A192F]">
                  Property Features & Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuresList.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner / Listing Agent Information */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Listed by:{' '}
                  <strong className="text-slate-900 font-semibold">{property.ownerName}</strong>
                </div>
                <div className="tabular-nums">
                  Updated {new Date(property.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Book a Viewing Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 space-y-6 sticky top-24">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[#1E40AF]">Private Appointment</div>
                <h2 className="font-display text-xl font-bold text-[#0A192F]">
                  Book a Viewing
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select your preferred date and time to tour {property.name} in person.
                </p>
              </div>

              {bookingError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 space-y-2"
                >
                  <p>{bookingError}</p>
                  {!currentUser && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="text-xs font-bold text-[#1E40AF] underline cursor-pointer"
                    >
                      Sign In or Create Account
                    </button>
                  )}
                </div>
              )}

              {bookingSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-emerald-950">
                        Viewing Successfully Booked
                      </h3>
                      <p className="text-xs text-emerald-800 leading-relaxed tabular-nums">
                        Your appointment for <strong>{property.name}</strong> is scheduled for{' '}
                        <strong>{bookingSuccess.date}</strong> at{' '}
                        <strong>{bookingSuccess.time}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/dashboard?tab=bookings"
                      className="w-full py-2.5 px-4 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg text-center transition-colors"
                    >
                      View in My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBookingSuccess(null)}
                      className="w-full py-2 px-4 text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
                    >
                      Schedule Another Time
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Viewing Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="viewing-date"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Viewing Date *
                    </label>
                    <input
                      id="viewing-date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={viewingDate}
                      onChange={(e) => setViewingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF]"
                    />
                  </div>

                  {/* Viewing Time */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="viewing-time"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Viewing Time *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const selected = viewingTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setViewingTime(slot)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg border tabular-nums transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[#0A192F] text-white border-[#0A192F]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Booking */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full py-3 px-4 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {bookingSubmitting
                          ? 'Confirming Appointment...'
                          : currentUser
                          ? 'Book a Viewing'
                          : 'Sign In to Book a Viewing'}
                      </span>
                    </button>

                    {!currentUser && (
                      <p className="text-[11px] text-center text-slate-500">
                        You will be asked to sign in or create a free account to confirm your
                        appointment.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
