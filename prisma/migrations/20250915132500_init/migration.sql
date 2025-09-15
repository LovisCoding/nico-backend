/*
  Warnings:

  - You are about to drop the column `isActive` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_sectionId_fkey";

-- AlterTable
ALTER TABLE "public"."Image" DROP COLUMN "isActive",
DROP COLUMN "sectionId",
DROP COLUMN "title",
ADD COLUMN     "alt" TEXT;

-- CreateTable
CREATE TABLE "public"."SectionImage" (
    "sectionId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SectionImage_pkey" PRIMARY KEY ("sectionId","imageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionImage_sectionId_order_key" ON "public"."SectionImage"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "public"."SectionImage" ADD CONSTRAINT "SectionImage_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SectionImage" ADD CONSTRAINT "SectionImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
