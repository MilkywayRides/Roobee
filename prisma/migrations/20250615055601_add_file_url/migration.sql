/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `ProjectFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedById` to the `ProjectFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectFile" ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedById" TEXT NOT NULL,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_fileId_key" ON "ProjectFile"("fileId");

-- CreateIndex
CREATE INDEX "ProjectFile_fileId_idx" ON "ProjectFile"("fileId");

-- CreateIndex
CREATE INDEX "ProjectFile_uploadedById_idx" ON "ProjectFile"("uploadedById");

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
