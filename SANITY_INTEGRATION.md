# Sanity CMS Integration

This document explains how to set up and use the Sanity CMS integration with your PG Room Management system.

## Overview

The system implements a **dual-architecture** approach where:

- **Database**: Handles operational data, pricing, availability, and bookings
- **Sanity CMS**: Manages content, images, descriptions, and marketing materials
- **Webhooks**: Keep both systems synchronized in real-time

## Setup Instructions

### 1. Environment Variables

Copy the required environment variables from `.env.sanity.example` to your `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=your-write-token
SANITY_WEBHOOK_SECRET=your-webhook-secret-key
```

### 2. Get Sanity Credentials

1. **Project ID & Dataset**: Already configured in your `sanity.config.ts`
2. **API Write Token**:
   - Go to Sanity Studio → API → Tokens
   - Create new token with **Editor** permissions
   - Copy the token to `SANITY_API_WRITE_TOKEN`
3. **Webhook Secret**: Generate a random string for `SANITY_WEBHOOK_SECRET`

### 3. Configure Sanity Webhook

In your Sanity Studio dashboard:

1. Go to **API → Webhooks**
2. Click **Create webhook**
3. Configure:
   - **URL**: `https://your-domain.com/api/webhooks/sanity`
   - **Secret**: Use the same value as `SANITY_WEBHOOK_SECRET`
   - **Trigger on**: Document mutations
   - **Filter**: `_type in ["pg", "room"]`

## Architecture

### Data Flow

```
Admin Panel → Database → Sync API → Sanity CMS
     ↑                                    ↓
     └──── Webhook ← Database ← Sync API ←┘
```

### Read-Only Fields

In Sanity, these fields are **read-only** and managed by the database:

**PG Document:**

- `dbId` - Database ID
- `startingPrice` - Starting price
- `securityDeposit` - Security deposit
- `brokerageCharges` - Brokerage charges
- `totalRooms` - Total room count
- `availableRooms` - Available room count

**Room Document:**

- `dbId` - Database ID
- `monthlyRent` - Monthly rent
- `securityDeposit` - Security deposit
- `maintenanceCharges` - Maintenance charges
- `maxOccupancy` - Maximum occupancy
- `currentOccupancy` - Current occupancy
- `availabilityStatus` - Availability status

### API Endpoints

#### Sanity to Database Sync

- `POST /api/webhooks/sanity` - Receives Sanity webhook events
- Automatically syncs content changes from Sanity to database

#### Database to Sanity Sync

- `POST /api/sync/sanity` - Sync individual records
- `GET /api/sync/sanity` - Bulk sync all records

### Automatic Sync Triggers

The system automatically syncs to Sanity when:

1. **PG Operations**:
   - Creating new PG via `POST /api/admin/pgs`
   - Updating PG via `PUT /api/admin/pgs/[id]`

2. **Room Operations**:
   - Creating new Room via `POST /api/admin/rooms`
   - Updating Room via `PUT /api/admin/rooms/[id]`

## Schema Overview

### PG Schema (`pg`)

```typescript
{
  _type: 'pg',
  name: string,           // Editable in Sanity
  slug: slug,             // Editable in Sanity
  description: text,      // Editable in Sanity
  images: [],            // Editable in Sanity
  // ... other content fields

  // Read-only fields (managed by database)
  dbId: string,
  startingPrice: number,
  securityDeposit: number,
  totalRooms: number,
  availableRooms: number,
}
```

### Room Schema (`room`)

```typescript
{
  _type: 'room',
  description: text,      // Editable in Sanity
  images: [],            // Editable in Sanity
  pgReference: reference, // Reference to PG
  // ... other content fields

  // Read-only fields (managed by database)
  dbId: string,
  monthlyRent: number,
  securityDeposit: number,
  maxOccupancy: number,
  currentOccupancy: number,
  availabilityStatus: string,
}
```

## Usage Workflows

### 1. Creating a PG

1. **Admin Panel**: Create PG with all operational details
2. **Auto-Sync**: System automatically creates corresponding Sanity document
3. **Content Management**: Use Sanity Studio to add images, enhanced descriptions, SEO content

### 2. Managing Content

1. **Sanity Studio**: Edit descriptions, upload images, manage SEO content
2. **Webhook Sync**: Changes automatically sync to database for public display
3. **Price Management**: Always done in Admin Panel, read-only in Sanity

### 3. Initial Data Sync

To sync existing database records to Sanity:

```bash
curl -X GET https://your-domain.com/api/sync/sanity
```

This will create Sanity documents for all PGs and Rooms that don't have `sanityDocumentId`.

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct and accessible
2. Verify `SANITY_WEBHOOK_SECRET` matches in both places
3. Check webhook logs in Sanity Studio → API → Webhooks

### Sync Failures

1. Check `SANITY_API_WRITE_TOKEN` has Editor permissions
2. Verify documents exist in database before syncing
3. Check server logs for detailed error messages

### Missing Data

1. Run bulk sync: `GET /api/sync/sanity`
2. Check `sanityDocumentId` field in database records
3. Verify webhook is properly configured and triggering

## Best Practices

1. **Content First**: Always create records in Admin Panel first
2. **Content Enhancement**: Use Sanity for images, descriptions, SEO
3. **Pricing Control**: Never modify prices in Sanity - use Admin Panel
4. **Regular Sync**: Monitor sync status and run bulk sync if needed
5. **Testing**: Test webhooks in development before production deployment
