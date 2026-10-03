import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  User,
  StoredUserRecord,
  Property,
  PropertyCategory,
  Booking,
  BookingStatus,
  PropertyFilterState,
  VALIDATION_LIMITS,
} from '../types/realEstate';
import { INITIAL_SEED_PROPERTIES } from '../data/seedProperties';
import { hashPassword, verifyPassword } from '../utils/crypto';

const STORAGE_KEYS = {
  USERS: 'homeluxe_users_db_v1',
  SESSION: 'homeluxe_active_session_v1',
  PROPERTIES: 'homeluxe_properties_db_v1',
  DELETED_SEED_IDS: 'homeluxe_deleted_seed_ids_v1',
  BOOKINGS: 'homeluxe_bookings_db_v1',
};

export interface PropertyInput {
  name: string;
  image: string;
  price: number;
  location: string;
  category: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
}

interface RealEstateContextValue {
  currentUser: User | null;
  isAuthReady: boolean;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;

  properties: Property[];
  myProperties: Property[];
  loadingProperties: boolean;
  filters: PropertyFilterState;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFilterState>>;
  resetFilters: () => void;
  addProperty: (input: PropertyInput) => Promise<Property>;
  updateProperty: (id: string, input: PropertyInput) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;

  myBookings: Booking[];
  createBooking: (propertyId: string, viewingDate: string, viewingTime: string) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  rescheduleBooking: (bookingId: string, viewingDate: string, viewingTime: string) => Promise<void>;
}

const DEFAULT_FILTERS: PropertyFilterState = {
  location: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'Any',
  bathrooms: 'Any',
  sortBy: 'newest',
};

const RealEstateContext = createContext<RealEstateContextValue | undefined>(undefined);

function parseTimestamp(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date((val as { seconds: number }).seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function validatePropertyPayload(input: PropertyInput) {
  const name = input.name.trim();
  const location = input.location.trim();
  const description = input.description.trim();
  const image = input.image.trim();

  if (
    name.length < VALIDATION_LIMITS.PROPERTY_NAME_MIN ||
    name.length > VALIDATION_LIMITS.PROPERTY_NAME_MAX
  ) {
    throw new Error(
      `Property name must be between ${VALIDATION_LIMITS.PROPERTY_NAME_MIN} and ${VALIDATION_LIMITS.PROPERTY_NAME_MAX} characters.`
    );
  }
  if (
    location.length < VALIDATION_LIMITS.LOCATION_MIN ||
    location.length > VALIDATION_LIMITS.LOCATION_MAX
  ) {
    throw new Error(
      `Location must be between ${VALIDATION_LIMITS.LOCATION_MIN} and ${VALIDATION_LIMITS.LOCATION_MAX} characters.`
    );
  }
  if (!['House', 'Apartment', 'Plot'].includes(input.category)) {
    throw new Error('Category must be House, Apartment, or Plot.');
  }
  if (
    typeof input.price !== 'number' ||
    Number.isNaN(input.price) ||
    input.price <= 0 ||
    input.price > VALIDATION_LIMITS.PRICE_MAX
  ) {
    throw new Error('Please enter a valid positive price.');
  }
  if (
    typeof input.area !== 'number' ||
    Number.isNaN(input.area) ||
    input.area <= 0 ||
    input.area > VALIDATION_LIMITS.AREA_MAX
  ) {
    throw new Error('Please enter a valid positive area in Sq Ft.');
  }
  if (
    typeof input.bedrooms !== 'number' ||
    Number.isNaN(input.bedrooms) ||
    input.bedrooms < 0 ||
    input.bedrooms > VALIDATION_LIMITS.BEDROOMS_MAX
  ) {
    throw new Error('Bedrooms must be between 0 and 50.');
  }
  if (
    typeof input.bathrooms !== 'number' ||
    Number.isNaN(input.bathrooms) ||
    input.bathrooms < 0 ||
    input.bathrooms > VALIDATION_LIMITS.BATHROOMS_MAX
  ) {
    throw new Error('Bathrooms must be between 0 and 50.');
  }
  if (
    description.length < VALIDATION_LIMITS.DESCRIPTION_MIN ||
    description.length > VALIDATION_LIMITS.DESCRIPTION_MAX
  ) {
    throw new Error(
      `Description must be between ${VALIDATION_LIMITS.DESCRIPTION_MIN} and ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters.`
    );
  }
  if (!image || image.length > VALIDATION_LIMITS.IMAGE_MAX_LENGTH) {
    throw new Error('Please provide a valid property image.');
  }
}

export const RealEstateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const [localProperties, setLocalProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (saved) {
        return JSON.parse(saved) as Property[];
      }
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_SEED_PROPERTIES));
      return INITIAL_SEED_PROPERTIES;
    } catch {
      return INITIAL_SEED_PROPERTIES;
    }
  });

  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_SEED_IDS);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [firestoreProperties, setFirestoreProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);

  const [localBookings, setLocalBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? (JSON.parse(saved) as Booking[]) : [];
    } catch {
      return [];
    }
  });
  const [firestoreBookings, setFirestoreBookings] = useState<Booking[]>([]);

  const [filters, setFilters] = useState<PropertyFilterState>(DEFAULT_FILTERS);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Persist local properties & bookings changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(localProperties));
    } catch (e) {
      console.error('Failed to persist properties to storage:', e);
    }
  }, [localProperties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_SEED_IDS, JSON.stringify(deletedIds));
    } catch (e) {
      console.error('Failed to persist deleted IDs:', e);
    }
  }, [deletedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(localBookings));
    } catch (e) {
      console.error('Failed to persist bookings to storage:', e);
    }
  }, [localBookings]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const safeName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'HomeLuxe Member')
          .slice(0, VALIDATION_LIMITS.USER_NAME_MAX)
          .padEnd(2, 'M');
        const userObj: User = {
          id: fbUser.uid,
          name: safeName,
          email: fbUser.email || 'member@homeluxe.com',
          createdAt: fbUser.metadata.creationTime
            ? new Date(fbUser.metadata.creationTime).toISOString()
            : new Date().toISOString(),
        };
        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userObj));

        // Sync public & private profile to Firestore if verified
        if (fbUser.emailVerified) {
          const publicPath = `users/${fbUser.uid}`;
          try {
            const pubRef = doc(db, 'users', fbUser.uid);
            const pubSnap = await getDoc(pubRef);
            if (!pubSnap.exists()) {
              await setDoc(pubRef, {
                id: fbUser.uid,
                name: safeName,
                createdAt: serverTimestamp(),
              });
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, publicPath);
          }

          const privatePath = `users/${fbUser.uid}/private/info`;
          try {
            const privRef = doc(db, 'users', fbUser.uid, 'private', 'info');
            const privSnap = await getDoc(privRef);
            if (!privSnap.exists()) {
              const oauthHash = await hashPassword(`oauth_google_${fbUser.uid}`);
              await setDoc(privRef, {
                id: fbUser.uid,
                email: (fbUser.email || 'member@homeluxe.com').slice(0, VALIDATION_LIMITS.EMAIL_MAX),
                passwordHash: oauthHash,
                createdAt: serverTimestamp(),
              });
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, privatePath);
          }
        }
      } else {
        // Restore local session if present
        try {
          const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
          if (savedSession) {
            setCurrentUser(JSON.parse(savedSession) as User);
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time listener for public properties
  useEffect(() => {
    if (!isAuthReady) return;
    setLoadingProperties(true);
    const q = query(collection(db, 'properties'), where('price', '>=', 0));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Property[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            ownerId: data.ownerId,
            ownerName: data.ownerName || 'Property Owner',
            name: data.name,
            image: data.image,
            price: Number(data.price),
            location: data.location,
            category: data.category as PropertyCategory,
            bedrooms: Number(data.bedrooms ?? 0),
            bathrooms: Number(data.bathrooms ?? 0),
            area: Number(data.area ?? 0),
            description: data.description,
            createdAt: parseTimestamp(data.createdAt),
            updatedAt: parseTimestamp(data.updatedAt),
          };
        });
        setFirestoreProperties(items);
        setLoadingProperties(false);
      },
      (error) => {
        setLoadingProperties(false);
        handleFirestoreError(error, OperationType.LIST, 'properties');
      }
    );

    return () => unsubscribe();
  }, [isAuthReady]);

  // Firestore real-time listener for authenticated user's bookings
  useEffect(() => {
    if (!isAuthReady || !auth.currentUser || !auth.currentUser.emailVerified) {
      setFirestoreBookings([]);
      return;
    }

    const uid = auth.currentUser.uid;
    const q = query(collection(db, 'bookings'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Booking[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            userId: data.userId,
            propertyId: data.propertyId,
            propertyName: data.propertyName,
            propertyImage: data.propertyImage,
            propertyLocation: data.propertyLocation,
            propertyPrice: Number(data.propertyPrice ?? 0),
            viewingDate: data.viewingDate,
            viewingTime: data.viewingTime,
            status: data.status as BookingStatus,
            createdAt: parseTimestamp(data.createdAt),
            updatedAt: parseTimestamp(data.updatedAt),
          };
        });
        setFirestoreBookings(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, currentUser?.id]);

  // Merge Firestore + local properties, excluding deleted IDs
  const properties = useMemo(() => {
    const map = new Map<string, Property>();
    for (const p of INITIAL_SEED_PROPERTIES) {
      if (!deletedIds.includes(p.id)) {
        map.set(p.id, p);
      }
    }
    for (const p of localProperties) {
      if (!deletedIds.includes(p.id)) {
        map.set(p.id, p);
      }
    }
    for (const p of firestoreProperties) {
      if (!deletedIds.includes(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [localProperties, firestoreProperties, deletedIds]);

  const myProperties = useMemo(() => {
    if (!currentUser) return [];
    return properties.filter((p) => p.ownerId === currentUser.id);
  }, [properties, currentUser]);

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    const map = new Map<string, Booking>();
    for (const b of localBookings) {
      if (b.userId === currentUser.id) {
        map.set(b.id, b);
      }
    }
    for (const b of firestoreBookings) {
      if (b.userId === currentUser.id) {
        map.set(b.id, b);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [localBookings, firestoreBookings, currentUser]);

  // Authentication Actions
  const signUp = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string): Promise<User> => {
      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (
        trimmedName.length < VALIDATION_LIMITS.USER_NAME_MIN ||
        trimmedName.length > VALIDATION_LIMITS.USER_NAME_MAX
      ) {
        throw new Error(
          `Full name must be between ${VALIDATION_LIMITS.USER_NAME_MIN} and ${VALIDATION_LIMITS.USER_NAME_MAX} characters.`
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        !emailRegex.test(normalizedEmail) ||
        normalizedEmail.length > VALIDATION_LIMITS.EMAIL_MAX
      ) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match. Please confirm your password.');
      }

      const existingUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
      const existingUsers: StoredUserRecord[] = existingUsersRaw
        ? JSON.parse(existingUsersRaw)
        : [];

      const duplicate = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (duplicate) {
        throw new Error('An account with this email address already exists. Please sign in.');
      }

      const passwordHash = await hashPassword(password);
      const nowIso = new Date().toISOString();
      const newUserRecord: StoredUserRecord = {
        id: generateSafeId('user'),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        createdAt: nowIso,
      };

      const updatedUsers = [...existingUsers, newUserRecord];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

      // Omit passwordHash from session/UI state
      const publicUser: User = {
        id: newUserRecord.id,
        name: newUserRecord.name,
        email: newUserRecord.email,
        createdAt: newUserRecord.createdAt,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(publicUser));
      setCurrentUser(publicUser);
      setAuthModalOpen(false);
      return publicUser;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const existingUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
    const existingUsers: StoredUserRecord[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const matchedUser = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!matchedUser) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const isValid = await verifyPassword(password, matchedUser.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const publicUser: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      createdAt: matchedUser.createdAt,
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(publicUser));
    setCurrentUser(publicUser);
    setAuthModalOpen(false);
    return publicUser;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const safeName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'HomeLuxe Member')
      .slice(0, VALIDATION_LIMITS.USER_NAME_MAX)
      .padEnd(2, 'M');
    const publicUser: User = {
      id: fbUser.uid,
      name: safeName,
      email: fbUser.email || 'member@homeluxe.com',
      createdAt: fbUser.metadata.creationTime
        ? new Date(fbUser.metadata.creationTime).toISOString()
        : new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(publicUser));
    setCurrentUser(publicUser);
    setAuthModalOpen(false);
    return publicUser;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
  }, []);

  // Property CRUD Actions with strict ownership verification
  const addProperty = useCallback(
    async (input: PropertyInput): Promise<Property> => {
      if (!currentUser) {
        throw new Error('Authentication required. Please sign in to list a property.');
      }

      const normalizedInput: PropertyInput = {
        ...input,
        name: input.name.trim(),
        location: input.location.trim(),
        description: input.description.trim(),
        image: input.image.trim(),
        bedrooms: input.category === 'Plot' ? 0 : Number(input.bedrooms),
        bathrooms: input.category === 'Plot' ? 0 : Number(input.bathrooms),
        price: Number(input.price),
        area: Number(input.area),
      };

      validatePropertyPayload(normalizedInput);

      const id = generateSafeId('prop');
      const nowIso = new Date().toISOString();
      const newProperty: Property = {
        id,
        ownerId: currentUser.id,
        ownerName: currentUser.name.slice(0, VALIDATION_LIMITS.USER_NAME_MAX),
        ...normalizedInput,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setLocalProperties((prev) => [newProperty, ...prev]);

      if (auth.currentUser && auth.currentUser.uid === currentUser.id && auth.currentUser.emailVerified) {
        const path = `properties/${id}`;
        try {
          await setDoc(doc(db, 'properties', id), {
            id: newProperty.id,
            ownerId: newProperty.ownerId,
            ownerName: newProperty.ownerName,
            name: newProperty.name,
            image: newProperty.image,
            price: newProperty.price,
            location: newProperty.location,
            category: newProperty.category,
            bedrooms: newProperty.bedrooms,
            bathrooms: newProperty.bathrooms,
            area: newProperty.area,
            description: newProperty.description,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }

      return newProperty;
    },
    [currentUser]
  );

  const updateProperty = useCallback(
    async (id: string, input: PropertyInput): Promise<Property> => {
      if (!currentUser) {
        throw new Error('Authentication required. Please sign in to edit a property.');
      }

      const existing = properties.find((p) => p.id === id);
      if (!existing) {
        throw new Error('Property not found.');
      }
      if (existing.ownerId !== currentUser.id) {
        throw new Error('Forbidden: You are only authorized to edit properties that you own.');
      }

      const normalizedInput: PropertyInput = {
        ...input,
        name: input.name.trim(),
        location: input.location.trim(),
        description: input.description.trim(),
        image: input.image.trim(),
        bedrooms: input.category === 'Plot' ? 0 : Number(input.bedrooms),
        bathrooms: input.category === 'Plot' ? 0 : Number(input.bathrooms),
        price: Number(input.price),
        area: Number(input.area),
      };

      validatePropertyPayload(normalizedInput);

      const updatedProperty: Property = {
        ...existing,
        ...normalizedInput,
        updatedAt: new Date().toISOString(),
      };

      setLocalProperties((prev) => {
        const existsInLocal = prev.some((p) => p.id === id);
        if (existsInLocal) {
          return prev.map((p) => (p.id === id ? updatedProperty : p));
        }
        return [updatedProperty, ...prev];
      });

      if (auth.currentUser && auth.currentUser.uid === currentUser.id && auth.currentUser.emailVerified) {
        const path = `properties/${id}`;
        try {
          const propRef = doc(db, 'properties', id);
          const snap = await getDoc(propRef);
          if (snap.exists()) {
            await updateDoc(propRef, {
              name: updatedProperty.name,
              image: updatedProperty.image,
              price: updatedProperty.price,
              location: updatedProperty.location,
              category: updatedProperty.category,
              bedrooms: updatedProperty.bedrooms,
              bathrooms: updatedProperty.bathrooms,
              area: updatedProperty.area,
              description: updatedProperty.description,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      }

      return updatedProperty;
    },
    [currentUser, properties]
  );

  const deleteProperty = useCallback(
    async (id: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Authentication required. Please sign in to delete a property.');
      }

      const existing = properties.find((p) => p.id === id);
      if (!existing) {
        throw new Error('Property not found.');
      }
      if (existing.ownerId !== currentUser.id) {
        throw new Error('Forbidden: You are only authorized to delete properties that you own.');
      }

      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setLocalProperties((prev) => prev.filter((p) => p.id !== id));

      if (auth.currentUser && auth.currentUser.uid === currentUser.id && auth.currentUser.emailVerified) {
        const path = `properties/${id}`;
        try {
          const propRef = doc(db, 'properties', id);
          const snap = await getDoc(propRef);
          if (snap.exists()) {
            await deleteDoc(propRef);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
        }
      }
    },
    [currentUser, properties]
  );

  const getPropertyById = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  // Viewing Bookings Actions
  const createBooking = useCallback(
    async (propertyId: string, viewingDate: string, viewingTime: string): Promise<Booking> => {
      if (!currentUser) {
        throw new Error('Please sign in or create an account to book a property viewing.');
      }

      const targetProperty = properties.find((p) => p.id === propertyId);
      if (!targetProperty) {
        throw new Error('The selected property is no longer available.');
      }

      const cleanDate = viewingDate.trim();
      const cleanTime = viewingTime.trim();

      if (!cleanDate || cleanDate.length < 8 || cleanDate.length > 20) {
        throw new Error('Please select a valid viewing date.');
      }
      if (!cleanTime || cleanTime.length < 3 || cleanTime.length > 30) {
        throw new Error('Please select a valid viewing time slot.');
      }

      const bookingId = generateSafeId('book');
      const nowIso = new Date().toISOString();
      const newBooking: Booking = {
        id: bookingId,
        userId: currentUser.id,
        propertyId: targetProperty.id,
        propertyName: targetProperty.name.slice(0, VALIDATION_LIMITS.PROPERTY_NAME_MAX),
        propertyImage: targetProperty.image,
        propertyLocation: targetProperty.location.slice(0, VALIDATION_LIMITS.LOCATION_MAX),
        propertyPrice: targetProperty.price,
        viewingDate: cleanDate,
        viewingTime: cleanTime,
        status: 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setLocalBookings((prev) => [newBooking, ...prev]);

      if (auth.currentUser && auth.currentUser.uid === currentUser.id && auth.currentUser.emailVerified) {
        // Ensure parent property exists in Firestore so exists() relational rule succeeds
        const propPath = `properties/${targetProperty.id}`;
        try {
          const propRef = doc(db, 'properties', targetProperty.id);
          const propSnap = await getDoc(propRef);
          if (!propSnap.exists()) {
            await setDoc(propRef, {
              id: targetProperty.id,
              ownerId: currentUser.id,
              ownerName: targetProperty.ownerName.slice(0, VALIDATION_LIMITS.USER_NAME_MAX),
              name: targetProperty.name,
              image: targetProperty.image,
              price: targetProperty.price,
              location: targetProperty.location,
              category: targetProperty.category,
              bedrooms: targetProperty.bedrooms,
              bathrooms: targetProperty.bathrooms,
              area: targetProperty.area,
              description: targetProperty.description,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, propPath);
        }

        const bookingPath = `bookings/${bookingId}`;
        try {
          await setDoc(doc(db, 'bookings', bookingId), {
            id: newBooking.id,
            userId: newBooking.userId,
            propertyId: newBooking.propertyId,
            propertyName: newBooking.propertyName,
            propertyImage: newBooking.propertyImage,
            propertyLocation: newBooking.propertyLocation,
            propertyPrice: newBooking.propertyPrice,
            viewingDate: newBooking.viewingDate,
            viewingTime: newBooking.viewingTime,
            status: 'Pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, bookingPath);
        }
      }

      return newBooking;
    },
    [currentUser, properties]
  );

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Authentication required.');
      }
      const existing = myBookings.find((b) => b.id === bookingId);
      if (!existing) {
        throw new Error('Booking not found.');
      }
      if (existing.userId !== currentUser.id) {
        throw new Error('Forbidden: You cannot modify another user’s booking.');
      }
      if (existing.status === 'Cancelled') {
        throw new Error('This booking has already been cancelled.');
      }

      const updated: Booking = {
        ...existing,
        status: 'Cancelled',
        updatedAt: new Date().toISOString(),
      };

      setLocalBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));

      if (auth.currentUser && auth.currentUser.uid === currentUser.id && auth.currentUser.emailVerified) {
        const path = `bookings/${bookingId}`;
        try {
          const bookRef = doc(db, 'bookings', bookingId);
          const snap = await getDoc(bookRef);
          if (snap.exists()) {
            await updateDoc(bookRef, {
              status: 'Cancelled',
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      }
    },
    [currentUser, myBookings]
  );

  const confirmBooking = useCallback(
    async (bookingId: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Authentication required.');
      }
      const existing = myBookings.find((b) => b.id === bookingId);
      if (!existing) {
        throw new Error('Booking not found.');
      }
      if (existing.userId !== currentUser.id) {
        throw new Error('Forbidden: You cannot modify another user’s booking.');
      }
      if (existing.status === 'Cancelled') {
        throw new Error('Cancelled bookings cannot be modified.');
      }

      const updated: Booking = {
        ...existing,
        status: 'Confirmed',
        updatedAt: new Date().toISOString(),
      };

      setLocalBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    },
    [currentUser, myBookings]
  );

  const rescheduleBooking = useCallback(
    async (bookingId: string, viewingDate: string, viewingTime: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Authentication required.');
      }
      const existing = myBookings.find((b) => b.id === bookingId);
      if (!existing) {
        throw new Error('Booking not found.');
      }
      if (existing.userId !== currentUser.id) {
        throw new Error('Forbidden: You cannot modify another user’s booking.');
      }
      if (existing.status === 'Cancelled') {
        throw new Error('Cancelled bookings cannot be rescheduled.');
      }

      const updated: Booking = {
        ...existing,
        viewingDate: viewingDate.trim(),
        viewingTime: viewingTime.trim(),
        updatedAt: new Date().toISOString(),
      };

      setLocalBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));

      if (
        auth.currentUser &&
        auth.currentUser.uid === currentUser.id &&
        auth.currentUser.emailVerified &&
        existing.status === 'Pending'
      ) {
        const path = `bookings/${bookingId}`;
        try {
          const bookRef = doc(db, 'bookings', bookingId);
          const snap = await getDoc(bookRef);
          if (snap.exists()) {
            await updateDoc(bookRef, {
              viewingDate: updated.viewingDate,
              viewingTime: updated.viewingTime,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      }
    },
    [currentUser, myBookings]
  );

  const value = useMemo<RealEstateContextValue>(
    () => ({
      currentUser,
      isAuthReady,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      properties,
      myProperties,
      loadingProperties,
      filters,
      setFilters,
      resetFilters,
      addProperty,
      updateProperty,
      deleteProperty,
      getPropertyById,
      myBookings,
      createBooking,
      cancelBooking,
      confirmBooking,
      rescheduleBooking,
    }),
    [
      currentUser,
      isAuthReady,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      properties,
      myProperties,
      loadingProperties,
      filters,
      resetFilters,
      addProperty,
      updateProperty,
      deleteProperty,
      getPropertyById,
      myBookings,
      createBooking,
      cancelBooking,
      confirmBooking,
      rescheduleBooking,
    ]
  );

  return <RealEstateContext.Provider value={value}>{children}</RealEstateContext.Provider>;
};

export function useRealEstate(): RealEstateContextValue {
  const ctx = useContext(RealEstateContext);
  if (!ctx) {
    throw new Error('useRealEstate must be used within a RealEstateProvider');
  }
  return ctx;
}
