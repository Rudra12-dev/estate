export type PropertyCategory = 'House' | 'Apartment' | 'Plot';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredUserRecord extends User {
  passwordHash: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  image: string;
  price: number;
  location: string;
  category: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyLocation: string;
  propertyPrice: number;
  viewingDate: string;
  viewingTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

export interface PropertyFilterState {
  location: string;
  category: 'All' | PropertyCategory;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  sortBy: SortOption;
}

/**
 * Verbatim validation constants synchronized with firebase-blueprint.json
 * and firestore.rules
 */
export const VALIDATION_LIMITS = {
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  ID_MAX_LENGTH: 128,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 100,
  EMAIL_MIN: 3,
  EMAIL_MAX: 254,
  PROPERTY_NAME_MIN: 3,
  PROPERTY_NAME_MAX: 160,
  LOCATION_MIN: 2,
  LOCATION_MAX: 160,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 4000,
  IMAGE_MAX_LENGTH: 800000,
  PRICE_MIN: 0,
  PRICE_MAX: 1000000000,
  BEDROOMS_MAX: 50,
  BATHROOMS_MAX: 50,
  AREA_MAX: 10000000,
} as const;
