-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('VEG', 'NON_VEG');

-- DropForeignKey
ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_pgId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "addressState" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherPhone" TEXT,
ADD COLUMN     "foodRestrictions" TEXT,
ADD COLUMN     "foodType" "FoodType",
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherPhone" TEXT,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "postOffice" TEXT,
ADD COLUMN     "schoolCollege" TEXT,
ADD COLUMN     "village" TEXT;

-- AlterTable
ALTER TABLE "inquiries" ALTER COLUMN "pgId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "pgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
