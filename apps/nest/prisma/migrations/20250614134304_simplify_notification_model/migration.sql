/*
  Warnings:

  - You are about to drop the column `entityId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `notifyType` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "notifyType",
ADD COLUMN     "type" "NotificationType" NOT NULL;
