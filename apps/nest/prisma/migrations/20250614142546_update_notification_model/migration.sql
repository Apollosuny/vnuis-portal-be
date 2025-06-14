/*
  Warnings:

  - The values [ROOM_BOOKING,FORM_STATUS,BLOCKCHAIN_TRANSACTION] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'REVOKED');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('ALL_STUDENTS', 'SPECIFIC_STUDENTS', 'BY_CLASS', 'BY_MAJOR');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('GENERAL', 'ACADEMIC', 'EVENT', 'SYSTEM', 'URGENT');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "Notification_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
DROP COLUMN "readAt",
DROP COLUMN "userId",
ADD COLUMN     "createdById" UUID NOT NULL,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL,
ADD COLUMN     "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "targetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetType" "NotificationTargetType" NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_createdById_idx" ON "Notification"("createdById");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
