import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit3, Trash2, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRealEstate, PropertyInput } from '../context/RealEstateContext';
import { Property } from '../types/realEstate';
import { PropertyImage } from '../components/PropertyImage';
import { PropertyForm } from '../components/PropertyForm';

type DashboardTab = 'my-properties' | 'add' | 'bookings';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    openAuthModal,
    myProperties,
    myBookings,
    addProperty,
    updateProperty,
    deleteProperty,
    cancelBooking,
    confirmBooking,
  } = useRealEstate();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (initialTabParam === 'add') return 'add';
    if (initialTabParam === 'bookings') return 'bookings';
    return 'my-properties';
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'add' || tab === 'bookings' || tab === 'my-properties') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabSwitch = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setEditingProperty(null);
    setPropertyToDelete(null);
  };

  // Edit / Delete / Feedback states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Protected Route Gate if user is not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/60 px-4 py-16">
        <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-8 text-center space-y-5">
          <div className="text-xs font-semibold text-[#1E40AF]">Authentication Required</div>
          <h1 className="font-display text-2xl font-bold text-[#0A192F]">
            Access Your Real Estate Dashboard
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sign in or create an account to list properties for sale, edit your listings, and
            manage your scheduled property viewings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="flex-1 py-2.5 px-4 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0A192F] border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPortfolioValue = myProperties.reduce((acc, p) => acc + p.price, 0);
  const formattedPortfolioValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalPortfolioValue);

  const handleAddProperty = async (input: PropertyInput) => {
    const created = await addProperty(input);
    setStatusBanner(`"${created.name}" has been published to property listings.`);
    handleTabSwitch('my-properties');
  };

  const handleUpdateProperty = async (input: PropertyInput) => {
    if (!editingProperty) return;
    const updated = await updateProperty(editingProperty.id, input);
    setEditingProperty(null);
    setStatusBanner(`"${updated.name}" has been updated across all listings.`);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    const deletedName = propertyToDelete.name;
    await deleteProperty(propertyToDelete.id);
    setPropertyToDelete(null);
    setStatusBanner(`"${deletedName}" has been permanently removed from listings.`);
  };

  return (
    <div className="bg-slate-50/60 min-h-screen py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Account Header & Summary Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#1E40AF]">Client & Seller Dashboard</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A192F]">
                Welcome, {currentUser.name}
              </h1>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>

            <button
              type="button"
              onClick={() => handleTabSwitch('add')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 space-y-1">
              <div className="text-xs text-slate-500">My Properties</div>
              <div className="text-xl font-bold text-[#0A192F] tabular-nums">
                {myProperties.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 space-y-1">
              <div className="text-xs text-slate-500">Listed Portfolio Value</div>
              <div className="text-xl font-bold text-[#0A192F] tabular-nums">
                {formattedPortfolioValue}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 space-y-1">
              <div className="text-xs text-slate-500">My Viewing Bookings</div>
              <div className="text-xl font-bold text-[#0A192F] tabular-nums">
                {myBookings.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 space-y-1">
              <div className="text-xs text-slate-500">Active Appointments</div>
              <div className="text-xl font-bold text-[#0A192F] tabular-nums">
                {myBookings.filter((b) => b.status !== 'Cancelled').length}
              </div>
            </div>
          </div>

          {/* Dashboard Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => handleTabSwitch('my-properties')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'my-properties'
                  ? 'bg-[#0A192F] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Properties ({myProperties.length})
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('add')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#0A192F] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Add Property
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('bookings')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#0A192F] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Bookings ({myBookings.length})
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusBanner && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {propertyToDelete && (
          <div
            role="alertdialog"
            aria-labelledby="delete-confirm-title"
            className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4"
          >
            <div className="space-y-1">
              <h3 id="delete-confirm-title" className="text-sm font-bold text-red-950">
                Confirm Property Deletion
              </h3>
              <p className="text-xs text-red-800">
                Are you sure you want to delete <strong>{propertyToDelete.name}</strong>? This
                property will be permanently removed from the database and all public listings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* TAB A: MY PROPERTIES (and Edit Property) */}
        {activeTab === 'my-properties' && (
          <div className="space-y-6">
            {editingProperty ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-[#1E40AF]">Edit Listing</div>
                    <h2 className="font-display text-xl font-bold text-[#0A192F]">
                      Update {editingProperty.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Back to My Properties
                  </button>
                </div>

                <PropertyForm
                  initialProperty={editingProperty}
                  onSubmit={handleUpdateProperty}
                  onCancel={() => setEditingProperty(null)}
                  submitLabel="Save Updated Property"
                />
              </div>
            ) : myProperties.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
                <h2 className="font-display text-xl font-bold text-[#0A192F]">
                  You Haven&apos;t Listed Any Properties Yet
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Ready to sell a house, apartment, or residential plot? Create your first listing
                  and showcase it to buyers immediately.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('add')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Property</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((property) => {
                  const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(property.price);

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <Link
                          to={`/properties/${property.id}`}
                          className="block aspect-[4/3] bg-slate-100 overflow-hidden"
                        >
                          <PropertyImage
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </Link>

                        <div className="p-5 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-[#1E40AF]">
                              {property.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{property.location}</span>
                          </div>

                          <div className="text-lg font-bold text-[#0A192F] tabular-nums">
                            {formattedPrice}
                          </div>

                          <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                            <Link
                              to={`/properties/${property.id}`}
                              className="hover:text-[#1E40AF]"
                            >
                              {property.name}
                            </Link>
                          </h3>

                          <div className="text-xs text-slate-500 tabular-nums">
                            {property.category !== 'Plot'
                              ? `${property.bedrooms} Beds · ${property.bathrooms} Baths · ${property.area.toLocaleString()} Sq Ft`
                              : `Residential Plot · ${property.area.toLocaleString()} Sq Ft`}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/properties/${property.id}`}
                          className="text-xs font-semibold text-slate-700 hover:text-[#0A192F]"
                        >
                          View Listing
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProperty(property)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPropertyToDelete(property)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB B: ADD PROPERTY */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <div className="text-xs font-semibold text-[#1E40AF]">New Listing</div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0A192F]">
                Add a Property for Sale
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Complete the property details below. Your listing will immediately appear on the
                Properties page and search results.
              </p>
            </div>

            <PropertyForm
              onSubmit={handleAddProperty}
              onCancel={() => handleTabSwitch('my-properties')}
              submitLabel="Publish Property Listing"
            />
          </div>
        )}

        {/* TAB C: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
                <h2 className="font-display text-xl font-bold text-[#0A192F]">
                  No Viewing Bookings Scheduled
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Explore our available properties and click &ldquo;Book a Viewing&rdquo; on any
                  listing to schedule an in-person tour.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <span>Browse Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => {
                  const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(booking.propertyPrice);

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/properties/${booking.propertyId}`}
                          className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                        >
                          <PropertyImage
                            src={booking.propertyImage}
                            alt={booking.propertyName}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className={`font-semibold ${
                                booking.status === 'Confirmed'
                                  ? 'text-emerald-700'
                                  : booking.status === 'Cancelled'
                                  ? 'text-red-600'
                                  : 'text-amber-700'
                              }`}
                            >
                              Status: {booking.status}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="text-slate-500">{booking.propertyLocation}</span>
                          </div>

                          <h3 className="text-base font-bold text-[#0A192F]">
                            <Link
                              to={`/properties/${booking.propertyId}`}
                              className="hover:text-[#1E40AF]"
                            >
                              {booking.propertyName}
                            </Link>
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
                            <span>Date: {booking.viewingDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>Time: {booking.viewingTime}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#0A192F]">{formattedPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Actions */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <Link
                          to={`/properties/${booking.propertyId}`}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0A192F] border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          View Property
                        </Link>

                        {booking.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => confirmBooking(booking.id)}
                            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Confirm Attendance
                          </button>
                        )}

                        {booking.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking.id)}
                            className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Cancel Viewing
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
