/*
  Warnings:

  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SectionImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SectionImage" DROP CONSTRAINT "SectionImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SectionImage" DROP CONSTRAINT "SectionImage_sectionId_fkey";

-- DropTable
DROP TABLE "public"."Section";

-- DropTable
DROP TABLE "public"."SectionImage";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Sections" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SectionImages" (
    "sectionId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "order" FLOAT NOT NULL,

    CONSTRAINT "SectionImages_pkey" PRIMARY KEY ("sectionId","imageId")
);

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionImages_sectionId_order_key" ON "public"."SectionImages"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "public"."Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_name_key" ON "public"."Users"("name");

-- AddForeignKey
ALTER TABLE "public"."SectionImages" ADD CONSTRAINT "SectionImages_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SectionImages" ADD CONSTRAINT "SectionImages_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
