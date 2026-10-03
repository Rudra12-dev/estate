import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Property, PropertyCategory } from '../types/realEstate';
import { PropertyInput } from '../context/RealEstateContext';
import { BRAND_IMAGES } from '../data/seedProperties';
import { processUploadedImageFile } from '../utils/imageUpload';
import { PropertyImage } from './PropertyImage';

interface PropertyFormProps {
  initialProperty?: Property | null;
  onSubmit: (data: PropertyInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialProperty,
  onSubmit,
  onCancel,
  submitLabel = 'Publish Property Listing',
}) => {
  const [name, setName] = useState(initialProperty?.name || '');
  const [price, setPrice] = useState(initialProperty ? String(initialProperty.price) : '');
  const [location, setLocation] = useState(initialProperty?.location || '');
  const [category, setCategory] = useState<PropertyCategory>(initialProperty?.category || 'House');
  const [bedrooms, setBedrooms] = useState(
    initialProperty ? String(initialProperty.bedrooms) : '3'
  );
  const [bathrooms, setBathrooms] = useState(
    initialProperty ? String(initialProperty.bathrooms) : '2'
  );
  const [area, setArea] = useState(initialProperty ? String(initialProperty.area) : '');
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [image, setImage] = useState(
    initialProperty?.image || BRAND_IMAGES.presets[0].url
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProperty) {
      setName(initialProperty.name);
      setPrice(String(initialProperty.price));
      setLocation(initialProperty.location);
      setCategory(initialProperty.category);
      setBedrooms(String(initialProperty.bedrooms));
      setBathrooms(String(initialProperty.bathrooms));
      setArea(String(initialProperty.area));
      setDescription(initialProperty.description);
      setImage(initialProperty.image);
    }
  }, [initialProperty]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingImage(true);
    try {
      const optimizedDataUrl = await processUploadedImageFile(file);
      setImage(optimizedDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        image,
        price: Number(price),
        location,
        category,
        bedrooms: category === 'Plot' ? 0 : Number(bedrooms),
        bathrooms: category === 'Plot' ? 0 : Number(bathrooms),
        area: Number(area),
        description,
      });
      if (!initialProperty) {
        setName('');
        setPrice('');
        setLocation('');
        setCategory('House');
        setBedrooms('3');
        setBathrooms('2');
        setArea('');
        setDescription('');
        setImage(BRAND_IMAGES.presets[0].url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save property.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Property Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Property Name / Street Address *
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={160}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 742 Evergreen Terrace"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Location (City, State, ZIP) *
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={160}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Beverly Hills, CA 90210"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Property Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PropertyCategory)}
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          >
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Plot">Plot</option>
          </select>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Listing Price (USD) *
          </label>
          <input
            type="number"
            required
            min={1}
            max={1000000000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 750000"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Bedrooms {category === 'Plot' && '(Not applicable for Plots)'}
          </label>
          <input
            type="number"
            required={category !== 'Plot'}
            min={0}
            max={50}
            disabled={category === 'Plot'}
            value={category === 'Plot' ? '0' : bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF] disabled:opacity-50"
          />
        </div>

        {/* Bathrooms */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Bathrooms {category === 'Plot' && '(Not applicable for Plots)'}
          </label>
          <input
            type="number"
            required={category !== 'Plot'}
            min={0}
            max={50}
            disabled={category === 'Plot'}
            value={category === 'Plot' ? '0' : bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF] disabled:opacity-50"
          />
        </div>

        {/* Area */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700">
            Total Area (Sq Ft) *
          </label>
          <input
            type="number"
            required
            min={1}
            max={10000000}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. 2450"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums focus:outline-none focus:bg-white focus:border-[#1E40AF]"
          />
        </div>
      </div>

      {/* Property Image Upload & Gallery Selection */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700">
          Property Photograph *
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Live Preview */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <PropertyImage
              src={image}
              alt={name || 'Property preview'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Upload & Presets Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Processing Image...' : 'Upload Photo from Device'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste an image URL / data URI"
                className="flex-1 px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs text-slate-500">
                Or select from architectural photography presets:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BRAND_IMAGES.presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      image === preset.url
                        ? 'border-[#1E40AF] ring-2 ring-[#1E40AF]/20'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Architectural Description & Key Features *
        </label>
        <textarea
          required
          minLength={10}
          maxLength={4000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the architectural style, interior finishes, neighborhood amenities, and lot features..."
          className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E40AF]"
        />
      </div>

      {/* Submit & Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Saving Listing...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
