# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication**: All write operations and private read operations require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Split-Collection Isolation**:
   - `/users/{userId}` stores only public display fields (`id`, `name`, `createdAt`).
   - `/users/{userId}/private/{docId}` stores PII (`email`, `passwordHash`) and requires both `request.auth.uid == userId` and the Master Gate parent verification (`get(/databases/$(database)/documents/users/$(userId)).data.id == request.auth.uid`).
4. **Property Ownership & Integrity**:
   - A property can only be created if `incoming().ownerId == request.auth.uid`, `incoming().id == propertyId`, and `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - A property can only be updated or deleted by its owner (`existing().ownerId == request.auth.uid`).
   - During property updates, `id`, `ownerId`, and `createdAt` are strictly immutable, and `updatedAt` must equal `request.time`.
5. **Booking Ownership, Relational Integrity & Terminal State Locking**:
   - A booking can only be created if `incoming().userId == request.auth.uid`, `incoming().status == 'Pending'`, and the target property exists (`exists(/databases/$(database)/documents/properties/$(incoming().propertyId))`).
   - Bookings can only be read (`get` or `list`) by the user who created them (`resource.data.userId == request.auth.uid`).
   - Once a booking reaches the terminal state `'Cancelled'`, no further updates are permitted (`existing().status != 'Cancelled'`).

---

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on Property Create**:
   ```json
   {
     "id": "prop_1",
     "ownerId": "user_1",
     "ownerName": "Alice",
     "name": "123 Maple Drive",
     "image": "/img.jpg",
     "price": 850000,
     "location": "Beverly Hills, CA",
     "category": "House",
     "bedrooms": 4,
     "bathrooms": 3,
     "area": 2450,
     "description": "Luxury modern residence.",
     "isFeaturedAdmin": true
   }
   ```
2. **Identity Spoofing on Property Create (`ownerId != request.auth.uid`)**:
   ```json
   {
     "id": "prop_2",
     "ownerId": "victim_uid",
     "ownerName": "Attacker",
     "name": "456 Oak Ave",
     "image": "/img.jpg",
     "price": 620000,
     "location": "Austin, TX",
     "category": "House",
     "bedrooms": 3,
     "bathrooms": 2,
     "area": 1890,
     "description": "Spoofed owner payload."
   }
   ```
3. **Unverified Email Write Attempt (`email_verified: false`)**:
   Authenticated token with `email_verified == false` attempting to create `/properties/prop_3`.
4. **Immortal Field Mutation (`ownerId` or `createdAt` modified on Property Update)**:
   ```json
   {
     "ownerId": "new_owner_uid"
   }
   ```
5. **Cross-User Property Update/Delete**:
   User `attacker_uid` attempting to update or delete `/properties/prop_owned_by_alice`.
6. **Orphaned Booking Creation (Non-existent `propertyId`)**:
   Booking payload referencing `"propertyId": "non_existent_prop_999"`.
7. **State Shortcutting on Booking Creation (`status: "Confirmed"` on initial create)**:
   Booking payload with `"status": "Confirmed"` instead of `"Pending"`.
8. **Terminal State Bypass on Booking Update**:
   Attempting to update a booking whose `existing().status == "Cancelled"` back to `"Confirmed"`.
9. **Unauthorized PII Read on `/users/{victimId}/private/info`**:
   Authenticated user `attacker_uid` attempting `get` on `/users/victim_uid/private/info`.
10. **Blanket Booking List Scraping**:
    Authenticated user executing an unconstrained `list` query on `/bookings` without `where('userId', '==', auth.uid)`.
11. **Denial-of-Wallet Oversized String Poisoning**:
    Property creation with a 10,000-character `description` or 200-character `id`.
12. **Client-Spoofed Timestamp (`createdAt` in the past or future)**:
    Property creation where `createdAt != request.time`.
