/*
  Warnings:

  - You are about to drop the column `electricityIncluded` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "electricityIncluded",
DROP COLUMN "floor";
