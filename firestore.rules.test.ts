/**
 * Security Rules Verification Spec for HomeLuxe Real Estate
 * Verifies all 12 Dirty Dozen payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  { id: 1, name: 'Shadow field injection on Property create', collection: 'properties', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 2, name: 'Identity spoofing on Property create', collection: 'properties', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 3, name: 'Unverified email write attempt', collection: 'properties', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 4, name: 'Immortal field mutation (ownerId/createdAt)', collection: 'properties', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 5, name: 'Cross-user property update or delete', collection: 'properties', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 6, name: 'Orphaned booking creation with non-existent propertyId', collection: 'bookings', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 7, name: 'State shortcutting on booking creation', collection: 'bookings', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 8, name: 'Terminal state bypass on Cancelled booking', collection: 'bookings', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 9, name: 'Unauthorized PII read on /users/{id}/private/info', collection: 'users/private', operation: 'get', expectedResult: 'PERMISSION_DENIED' },
  { id: 10, name: 'Blanket booking list scraping across users', collection: 'bookings', operation: 'list', expectedResult: 'PERMISSION_DENIED' },
  { id: 11, name: 'Denial-of-wallet oversized string poisoning', collection: 'properties', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 12, name: 'Client-spoofed timestamp on create/update', collection: 'properties', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
];
