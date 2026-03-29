-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TENANT', 'OWNER');

-- CreateEnum
CREATE TYPE "GenderRestriction" AS ENUM ('BOYS', 'GIRLS', 'COED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY');

-- CreateEnum
CREATE TYPE "WindowDirection" AS ENUM ('NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'VACANT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "alternatePhone" TEXT,
    "genderRestriction" "GenderRestriction" NOT NULL DEFAULT 'COED',
    "gateClosingTime" TEXT,
    "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "drinkingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "startingPrice" DECIMAL(65,30) NOT NULL,
    "securityDeposit" DECIMAL(65,30) NOT NULL,
    "brokerageCharges" DECIMAL(65,30) DEFAULT 0,
    "electricityIncluded" BOOLEAN NOT NULL DEFAULT true,
    "waterIncluded" BOOLEAN NOT NULL DEFAULT true,
    "wifiIncluded" BOOLEAN NOT NULL DEFAULT true,
    "totalRooms" INTEGER NOT NULL,
    "availableRooms" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "sanityDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roomType" "RoomType" NOT NULL,
    "maxOccupancy" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "floor" INTEGER NOT NULL,
    "roomSize" DOUBLE PRECISION,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "hasAttachedBath" BOOLEAN NOT NULL DEFAULT false,
    "hasAC" BOOLEAN NOT NULL DEFAULT false,
    "hasFan" BOOLEAN NOT NULL DEFAULT true,
    "windowDirection" "WindowDirection",
    "monthlyRent" DECIMAL(65,30) NOT NULL,
    "securityDeposit" DECIMAL(65,30) NOT NULL,
    "maintenanceCharges" DECIMAL(65,30) DEFAULT 0,
    "electricityIncluded" BOOLEAN NOT NULL DEFAULT true,
    "availabilityStatus" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "availableFrom" TIMESTAMP(3),
    "pgId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sanityDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "occupation" TEXT,
    "emergencyContact" JSONB,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "moveOutDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rentAmount" INTEGER NOT NULL,
    "rentStatus" "RentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "monthlyRent" DECIMAL(65,30) NOT NULL,
    "securityDeposit" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pgId" TEXT,
    "roomId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "month" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "pgId" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pgs_slug_key" ON "pgs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_slug_key" ON "rooms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_pgId_roomNumber_key" ON "rooms"("pgId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_userId_key" ON "tenants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tenantId_month_key" ON "payments"("tenantId", "month");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "pgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "pgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
