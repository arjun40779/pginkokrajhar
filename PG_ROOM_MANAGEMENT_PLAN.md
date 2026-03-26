# PG and Room Management System - Implementation Plan

## Overview

Building a comprehensive PG and Room Management System with dual-database architecture:

- **Backend Database**: Operational data (pricing, availability, bookings, tenant info)
- **Sanity CMS**: Marketing content (images, descriptions, promotional materials)
- **Admin Panel**: Unified interface for managing both operational and marketing data
- **Webhook Integration**: Sync between backend and Sanity

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │────│  Backend API     │────│   Database      │
│   (Next.js)     │    │  (Next.js API)   │    │   (Prisma)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │ Webhook
         │                       ▼
         │              ┌──────────────────┐
         └──────────────│   Sanity CMS     │
                        │ (Marketing Data) │
                        └──────────────────┘
```

## Phase 1: Basic Backend Setup (Current Phase)

### 1.1 Database Schema (Prisma)

#### PG Model

```prisma
model PG {
  id                String   @id @default(cuid())

  // Basic Info
  name              String
  slug              String   @unique
  description       String?
  isActive          Boolean  @default(true)

  // Location
  address           String
  area              String
  city              String
  state             String
  pincode           String
  latitude          Float?
  longitude         Float?

  // Contact
  ownerName         String
  ownerPhone        String
  ownerEmail        String?
  alternatePhone    String?

  // Rules & Policies
  genderRestriction String   // 'boys', 'girls', 'coed'
  gateClosingTime   String?  // "22:00"
  smokingAllowed    Boolean  @default(false)
  drinkingAllowed   Boolean  @default(false)

  // Pricing
  startingPrice     Decimal
  securityDeposit   Decimal
  brokerageCharges  Decimal? @default(0)

  // Meta
  totalRooms        Int
  availableRooms    Int
  featured          Boolean  @default(false)
  verificationStatus String @default("pending") // pending, verified, rejected
  sanityDocumentId  String?  // Link to Sanity document

  // Relationships
  rooms             Room[]
  bookings          Booking[]

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("pgs")
}
```

#### Room Model

```prisma
model Room {
  id                String   @id @default(cuid())

  // Basic Info
  roomNumber        String
  slug              String   @unique
  description       String?
  isActive          Boolean  @default(true)

  // Room Details
  roomType          String   // 'single', 'double', 'triple', 'dormitory'
  maxOccupancy      Int
  currentOccupancy  Int      @default(0)
  floor             Int
  roomSize          Float?   // sq ft

  // Features
  hasBalcony        Boolean  @default(false)
  hasAttachedBath   Boolean  @default(false)
  hasAC             Boolean  @default(false)
  hasFan            Boolean  @default(true)
  windowDirection   String?  // 'north', 'south', etc.

  // Pricing
  monthlyRent       Decimal
  securityDeposit   Decimal
  maintenanceCharges Decimal? @default(0)
  electricityIncluded Boolean @default(true)

  // Availability
  availabilityStatus String  @default("available") // available, occupied, maintenance, reserved
  availableFrom     DateTime?

  // Relationships
  pgId              String
  pg                PG       @relation(fields: [pgId], references: [id], onDelete: Cascade)
  bookings          Booking[]
  tenants           Tenant[]

  // Meta
  featured          Boolean  @default(false)
  sanityDocumentId  String?  // Link to Sanity document

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("rooms")
  @@unique([pgId, roomNumber])
}
```

#### Supporting Models

```prisma
model Tenant {
  id              String   @id @default(cuid())
  name            String
  phone           String
  email           String?
  occupation      String?
  emergencyContact Json?    // {name, relation, phone}
  moveInDate      DateTime
  moveOutDate     DateTime?
  isActive        Boolean  @default(true)

  // Relationships
  roomId          String
  room            Room     @relation(fields: [roomId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("tenants")
}

model Booking {
  id              String   @id @default(cuid())

  // Customer Info
  customerName    String
  customerPhone   String
  customerEmail   String?

  // Booking Details
  checkInDate     DateTime
  checkOutDate    DateTime?
  status          String   @default("pending") // pending, confirmed, cancelled, completed

  // Pricing
  monthlyRent     Decimal
  securityDeposit Decimal
  totalAmount     Decimal
  paidAmount      Decimal  @default(0)

  // Relationships
  pgId            String?
  pg              PG?      @relation(fields: [pgId], references: [id])
  roomId          String?
  room            Room?    @relation(fields: [roomId], references: [id])

  // Meta
  notes           String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("bookings")
}
```

### 1.2 API Endpoints Structure

#### PG Management APIs

```
POST   /api/admin/pgs          - Create new PG
GET    /api/admin/pgs          - List all PGs (with filters)
GET    /api/admin/pgs/:id      - Get PG details
PUT    /api/admin/pgs/:id      - Update PG
DELETE /api/admin/pgs/:id      - Delete PG (soft delete)
POST   /api/admin/pgs/:id/sync - Sync to Sanity
```

#### Room Management APIs

```
POST   /api/admin/rooms        - Create new room
GET    /api/admin/rooms        - List all rooms (with filters)
GET    /api/admin/rooms/:id    - Get room details
PUT    /api/admin/rooms/:id    - Update room
DELETE /api/admin/rooms/:id    - Delete room
POST   /api/admin/rooms/:id/sync - Sync to Sanity
```

#### Public APIs (for website)

```
GET    /api/pgs                - Public PG listings
GET    /api/pgs/:slug          - Public PG details
GET    /api/rooms              - Public room listings
GET    /api/rooms/:slug        - Public room details
POST   /api/bookings           - Create booking inquiry
```

### 1.3 Admin Panel Structure

#### Pages to Create

```
/admin/
├── dashboard/                  - Overview stats
├── pgs/
│   ├── page.tsx               - PG list view
│   ├── create/page.tsx        - Create new PG
│   └── [id]/
│       ├── page.tsx           - PG details/edit
│       └── rooms/
│           ├── page.tsx       - Rooms in this PG
│           └── create/page.tsx - Add room to PG
├── rooms/
│   ├── page.tsx               - All rooms list
│   └── [id]/page.tsx          - Room details/edit
├── bookings/
│   ├── page.tsx               - Booking inquiries
│   └── [id]/page.tsx          - Booking details
└── tenants/
    ├── page.tsx               - Current tenants
    └── [id]/page.tsx          - Tenant details
```

## Phase 2: Webhook Integration with Sanity

### 2.1 Webhook System

- Create webhook endpoint: `/api/webhooks/sanity-sync`
- Trigger when PG/Room is created/updated/deleted
- Auto-create/update Sanity documents
- Handle image placeholder creation in Sanity

### 2.2 Sanity Document Auto-Generation

- Create minimal Sanity documents with backend data
- Leave image fields empty for manual upload
- Sync basic text content from backend

## Phase 3: Advanced Features (Future)

### 3.1 Tenant Management

- Check-in/Check-out processes
- Rent payment tracking
- Maintenance requests
- Tenant communication

### 3.2 Booking System

- Online booking form
- Payment integration
- Booking confirmation
- Calendar integration

### 3.3 Analytics & Reporting

- Occupancy rates
- Revenue tracking
- Popular PG/Room analytics
- Financial reports

## Implementation Checklist - Phase 1

### Backend Setup

- [x] Update Prisma schema with PG, Room, Tenant, Booking models
- [ ] Run migration to create database tables
- [x] Create API route handlers for PG CRUD operations
- [x] Create API route handlers for Room CRUD operations
- [x] Add proper validation using Zod
- [x] Add error handling and logging

### Admin Panel UI

- [x] Create admin layout with navigation
- [x] Build PG list and create/edit forms (list done, forms in progress)
- [ ] Build Room list and create/edit forms
- [ ] Add proper form validation
- [ ] Add success/error notifications
- [x] Implement search and filtering (PG list done)

### Data Management

- [x] Add proper TypeScript types (in API routes)
- [ ] Create utility functions for data formatting
- [x] Add data validation schemas (Zod schemas)
- [x] Implement soft delete functionality

### Authentication & Authorization

- [ ] Add admin authentication
- [ ] Implement role-based access control
- [ ] Protect admin routes
- [ ] Add session management

## Progress Update (Latest)

### ✅ Completed Items:

1. **Enhanced Prisma Schema**: Complete database model with PG, Room, Tenant, Booking, Payment, and Inquiry models
2. **API Routes**: Full CRUD operations for both PGs and Rooms with proper validation
3. **Admin Layout**: Professional admin panel layout with navigation
4. **Admin Dashboard**: Overview dashboard with stats cards and quick actions
5. **PG List Page**: Comprehensive PG management with search, filters, and actions
6. **Validation**: Zod schemas for data validation in all API routes
7. **Error Handling**: Proper error responses and validation in API

### 🚧 In Progress:

1. **PG Create/Edit Forms**: Need to create the form components
2. **Room Management Pages**: List and form pages for rooms

### 📋 Next Steps:

1. **Run Database Migration**: Execute `npx prisma db push` to create tables
2. **Create PG Forms**: Build create and edit forms for PGs
3. **Build Room Management**: Create room list and forms
4. **Add Authentication**: Implement admin login system
5. **Add Webhooks**: Sanity sync integration

## File Structure for Implementation

```
app/
├── admin/                     # Admin panel pages
│   ├── layout.tsx            # Admin layout with nav
│   ├── dashboard/page.tsx    # Admin dashboard
│   ├── pgs/                  # PG management
│   └── rooms/                # Room management
├── api/
│   ├── admin/                # Admin APIs
│   │   ├── pgs/              # PG CRUD APIs
│   │   └── rooms/            # Room CRUD APIs
│   ├── pgs/                  # Public PG APIs
│   ├── rooms/                # Public Room APIs
│   └── webhooks/             # Sanity sync webhooks
├── components/
│   ├── admin/                # Admin-specific components
│   │   ├── PGForm.tsx        # PG create/edit form
│   │   ├── RoomForm.tsx      # Room create/edit form
│   │   └── AdminLayout.tsx   # Admin layout
│   └── forms/                # Shared form components
lib/
├── db/                       # Database utilities
├── validations/              # Zod schemas
└── types/                    # TypeScript types
prisma/
├── schema.prisma             # Updated with new models
└── migrations/               # Database migrations
```

## Next Steps

1. **Start with Prisma Schema**: Update the database schema with PG and Room models
2. **Create Basic APIs**: Implement CRUD operations for PGs and Rooms
3. **Build Admin Forms**: Create simple forms to add/edit PGs and Rooms
4. **Add Validation**: Implement proper data validation
5. **Test CRUD Operations**: Ensure all basic operations work correctly

This plan provides a solid foundation that can be extended with more features as needed. The architecture separates concerns properly and allows for future scalability.

