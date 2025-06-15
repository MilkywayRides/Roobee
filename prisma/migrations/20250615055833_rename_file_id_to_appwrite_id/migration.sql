/*
  Warnings:

  - You are about to drop the column `fileId` on the `ProjectFile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appwriteId]` on the table `ProjectFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appwriteId` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProjectFile_fileId_idx";

-- DropIndex
DROP INDEX "ProjectFile_fileId_key";

-- AlterTable
ALTER TABLE "ProjectFile" DROP COLUMN "fileId",
ADD COLUMN     "appwriteId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_appwriteId_key" ON "ProjectFile"("appwriteId");

-- CreateIndex
CREATE INDEX "ProjectFile_appwriteId_idx" ON "ProjectFile"("appwriteId");
