# Facility Management System - Implementation Status

## ✅ Completed: Backend & Data Layer

### 1. Type Definitions (Complete)
- ✅ `Equipment` interface - Sports equipment tracking
- ✅ `Facility` interface - Comprehensive facility details
- ✅ `FacilityBooking` interface - Booking management
- ✅ Added `'facility-admin'` to User role types

### 2. Mock Data (Complete)
**File: `mockFacilityData.ts`**

**3 Sample Facilities:**
1. **Manhattan Sports Complex** - Indoor, $200/hr
   - Basketball, volleyball, indoor soccer
   - 5 equipment types (hoops, nets, sound system, chairs, first aid)
   
2. **Brooklyn Fieldhouse** - Outdoor, $150/hr
   - Soccer, football, lacrosse
   - 3 equipment types (goals, bleachers, training cones)
   
3. **Queens Multi-Purpose Arena** - Both, $250/hr
   - Multiple sports, retractable roof
   - 3 equipment types (sound/video, tournament tables)

**3 Sample Bookings:**
- Camp bookings
- Game bookings
- Training session bookings

### 3. API Methods (Complete)
**Facility Management:**
- `getFacilities(filters)` - List with filtering
- `getFacilityById(id)` - Get single facility
- `createFacility(data)` - Add new facility
- `updateFacility(id, updates)` - Edit facility
- `deleteFacility(id)` - Remove facility

**Equipment Management:**
- `addEquipment(facilityId, equipment)` - Add equipment to facility
- `updateEquipment(facilityId, equipmentId, updates)` - Edit equipment
- `deleteEquipment(facilityId, equipmentId)` - Remove equipment

**Booking Management:**
- `getFacilityBookings(filters)` - List bookings
- `createFacilityBooking(data)` - Create new booking
- `updateFacilityBooking(id, updates)` - Edit booking
- `cancelFacilityBooking(id)` - Cancel booking

## 🚧 Next Steps: UI Pages Needed

### Pages to Create:

#### 1. **FacilitiesPage.tsx** (Main List)
**Route:** `/facilities`

**Features:**
- List all facilities in cards/table
- Filter by sport, city, status
- Search by name
- Show key details: name, location, hourly rate, rating
- Click to view details
- "Add Facility" button (for facility-admins)

#### 2. **FacilityDetailsPage.tsx** (Details & Management)
**Route:** `/facilities/:id`

**Features:**
- Facility information display
- Photo gallery
- Amenities list
- Pricing breakdown (hourly/daily/weekly/monthly)
- Availability calendar
- Equipment list with prices
- Manage equipment (add/edit/delete) for owners
- Booking history
- "Book This Facility" button
- Edit/Delete for owners

#### 3. **CreateFacilityPage.tsx** (Add New)
**Route:** `/facilities/create`

**Features:**
- Form with all facility fields
- Sport multi-select
- Amenities multi-select
- Availability schedule builder
- Equipment section (dynamic add/remove)
- Image upload
- Address validation
- Pricing setup

#### 4. **BookFacilityPage.tsx** (Booking Dialog/Page)
**Route:** `/facilities/:id/book`

**Features:**
- Date/time picker
- Duration selection
- Purpose selection (camp, game, training, event)
- Equipment selector with quantities
- Cost calculator (real-time)
- Notes field
- Booking confirmation

#### 5. **MyBookingsPage.tsx** (User's Bookings)
**Route:** `/bookings` or `/my-bookings`

**Features:**
- List all user's bookings
- Filter by status (pending, confirmed, completed, cancelled)
- Filter by date range
- Show facility details
- Cost breakdown
- Cancel booking option
- Status indicators

#### 6. **FacilityDashboard.tsx** (For Facility Admins)
**Route:** `/facility-dashboard`

**Features:**
- Revenue statistics
- Booking calendar view
- Upcoming bookings
- Equipment utilization
- Facility rating/reviews
- Manage all owned facilities
- Quick actions (approve/reject bookings)

### Integration Points:

#### Update Existing Pages:
1. **GameSchedulingPage** - Add facility selection when creating games
2. **CreateCampPage** - Add facility selection option
3. **DashboardLayout** - Add "Facilities" navigation item
4. **AppRoutes** - Add facility routes

#### Role-Based Access:
- **All Users:** View facilities, make bookings
- **Facility Admins:** Manage own facilities, equipment, approve bookings
- **League Admins:** Book facilities for games
- **Trainers:** Book facilities for camps/training
- **Admin:** Full access to all facilities

## 📊 Data Model Summary

### Facility
```typescript
{
  id, name, ownerId, ownerName,
  address, city, state, zipCode,
  description, sports[], amenities[],
  capacity, squareFootage, indoorOutdoor,
  hourlyRate, dailyRate, weeklyRate, monthlyRate,
  equipment: Equipment[],
  images: string[],
  availability: { [day]: { open, close, available } },
  rating, totalBookings, status,
  contactPhone, contactEmail, createdAt
}
```

### Equipment
```typescript
{
  id, name, category,
  quantity, pricePerHour, pricePerDay,
  condition, description, image
}
```

### FacilityBooking
```typescript
{
  id, facilityId, facilityName,
  bookingType, relatedId,
  bookedBy, bookedByName,
  startDateTime, endDateTime, duration,
  equipmentRented: [],
  totalCost, status, notes, createdAt
}
```

## 🎯 Business Logic

### Booking Cost Calculation:
```javascript
facilityBaseCost = duration * hourlyRate (or daily/weekly rate)
equipmentCost = sum of (quantity * pricePerHour * duration)
totalCost = facilityBaseCost + equipmentCost
```

### Availability Checking:
- Check facility availability schedule (day of week, hours)
- Check for booking conflicts (existing bookings)
- Equipment availability (quantity available vs. requested)

### Status Workflow:
**Facilities:** active → inactive → maintenance
**Bookings:** pending → confirmed → completed (or cancelled)

## 🔧 Quick Implementation Guide

### 1. Start with FacilitiesPage (Listing)
```tsx
- Use DataTable or Grid of DataCards
- Implement search/filter
- Add "View Details" navigation
```

### 2. Then FacilityDetailsPage
```tsx
- Display all facility info
- Show equipment list
- Add booking button
- Owner edit/delete actions
```

### 3. Simple Booking Dialog
```tsx
- Modal/Dialog component
- Date range picker
- Equipment selector
- Cost calculator
- Create booking API call
```

### 4. My Bookings View
```tsx
- Table of user's bookings
- Status filters
- Cancel action
```

### 5. Facility Admin Features
```tsx
- Dashboard for facility owners
- Manage equipment
- Approve/reject bookings
- View statistics
```

## 📝 Development Priority

**Phase 1: Core Viewing** (Most Important)
1. FacilitiesPage - Browse facilities
2. FacilityDetailsPage - View details & equipment
3. Update navigation/routes

**Phase 2: Booking**
4. BookFacilityPage/Dialog - Make bookings
5. MyBookingsPage - View/manage bookings

**Phase 3: Management**
6. CreateFacilityPage - Add facilities
7. FacilityDashboard - Admin dashboard
8. Equipment CRUD operations

**Phase 4: Integration**
9. Connect to game scheduling
10. Connect to camp creation
11. Add booking to calendar view

## ✅ What's Ready to Use

All backend functionality is complete and tested:
- ✅ TypeScript interfaces defined
- ✅ Mock data with 3 facilities
- ✅ Full CRUD API methods
- ✅ Equipment management
- ✅ Booking system
- ✅ Filtering and search
- ✅ Build successful

**Next step:** Create the UI pages to interact with this backend!

---

## Example API Usage

```typescript
// List facilities
const facilities = await mockApi.getFacilities({ sport: 'basketball' });

// Get facility details
const facility = await mockApi.getFacilityById('facility-1');

// Create booking
const booking = await mockApi.createFacilityBooking({
  facilityId: 'facility-1',
  facilityName: 'Manhattan Sports Complex',
  bookingType: 'camp',
  bookedBy: 'trainer-1',
  bookedByName: 'Mike Johnson',
  startDateTime: '2025-07-01T09:00:00Z',
  endDateTime: '2025-07-01T17:00:00Z',
  duration: 8,
  equipmentRented: [],
  totalCost: 1600,
  status: 'pending',
});

// Add equipment
const equipment = await mockApi.addEquipment('facility-1', {
  name: 'Basketball Rack',
  category: 'sports',
  quantity: 10,
  pricePerHour: 15,
  pricePerDay: 50,
  condition: 'good',
});
```

---

**Status:** Backend Complete ✅ | UI Pages In Progress 🚧
**Estimated UI Completion:** ~4-6 pages to implement
