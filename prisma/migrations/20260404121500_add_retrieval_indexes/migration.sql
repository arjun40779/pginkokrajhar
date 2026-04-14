-- CreateEnum
CREATE TYPE "PGStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- Schema evolution: align pgs table with current schema
-- Add status column
ALTER TABLE "pgs" ADD COLUMN IF NOT EXISTS "status" "PGStatus" NOT NULL DEFAULT 'ACTIVE';
-- Add razorpay columns
ALTER TABLE "pgs" ADD COLUMN IF NOT EXISTS "razorpayKeyId" TEXT;
ALTER TABLE "pgs" ADD COLUMN IF NOT EXISTS "razorpayAccountId" TEXT;
-- Drop columns removed from schema
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "genderRestriction";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "gateClosingTime";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "smokingAllowed";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "drinkingAllowed";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "securityDeposit";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "brokerageCharges";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "electricityIncluded";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "waterIncluded";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "wifiIncluded";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "featured";
ALTER TABLE "pgs" DROP COLUMN IF EXISTS "verificationStatus";
-- Drop stale enums (ignore errors if referenced)
DROP TYPE IF EXISTS "GenderRestriction";
DROP TYPE IF EXISTS "VerificationStatus";

-- Align users table: roles array instead of single role
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" "Role"[] DEFAULT ARRAY['TENANT']::"Role"[];
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";

-- User lookup indexes
CREATE INDEX IF NOT EXISTS "users_mobile_idx" ON "users"("mobile");

-- PG lookup and sync indexes
CREATE INDEX IF NOT EXISTS "pgs_status_createdAt_idx" ON "pgs"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "pgs_sanityDocumentId_idx" ON "pgs"("sanityDocumentId");

-- Room listing and sync indexes
CREATE INDEX IF NOT EXISTS "rooms_pgId_isActive_roomNumber_idx" ON "rooms"("pgId", "isActive", "roomNumber");
CREATE INDEX IF NOT EXISTS "rooms_pgId_availabilityStatus_monthlyRent_idx" ON "rooms"("pgId", "availabilityStatus", "monthlyRent");
CREATE INDEX IF NOT EXISTS "rooms_availabilityStatus_idx" ON "rooms"("availabilityStatus");
CREATE INDEX IF NOT EXISTS "rooms_sanityDocumentId_idx" ON "rooms"("sanityDocumentId");

-- Tenant occupancy and listing indexes
CREATE INDEX IF NOT EXISTS "tenants_roomId_isActive_idx" ON "tenants"("roomId", "isActive");
CREATE INDEX IF NOT EXISTS "tenants_phone_isActive_idx" ON "tenants"("phone", "isActive");
CREATE INDEX IF NOT EXISTS "tenants_isActive_createdAt_idx" ON "tenants"("isActive", "createdAt");

-- Booking list and validation indexes
CREATE INDEX IF NOT EXISTS "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_pgId_status_createdAt_idx" ON "bookings"("pgId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_roomId_status_createdAt_idx" ON "bookings"("roomId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_customerEmail_createdAt_idx" ON "bookings"("customerEmail", "createdAt");

-- Payment timeline and reporting indexes
CREATE INDEX IF NOT EXISTS "payments_tenantId_dueDate_idx" ON "payments"("tenantId", "dueDate");
CREATE INDEX IF NOT EXISTS "payments_status_paymentDate_idx" ON "payments"("status", "paymentDate");

-- Inquiry list indexes
CREATE INDEX IF NOT EXISTS "inquiries_status_createdAt_idx" ON "inquiries"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "inquiries_pgId_status_createdAt_idx" ON "inquiries"("pgId", "status", "createdAt");