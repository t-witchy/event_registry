-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('V1_LOOSE', 'V2_STRONG');

-- CreateTable
CREATE TABLE "interfaceGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "owner" TEXT,

    CONSTRAINT "interfaceGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interfaces" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "figmaUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "interfaceGroupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interfaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interfaceTags" (
    "id" SERIAL NOT NULL,
    "interfaceId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "interfaceTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interfaceElements" (
    "id" SERIAL NOT NULL,
    "interfaceId" INTEGER NOT NULL,
    "elementId" INTEGER NOT NULL,
    "displayLabel" TEXT,
    "position" INTEGER,
    "notes" TEXT,

    CONSTRAINT "interfaceElements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "source" "EventSource" NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interfaceElementEvents" (
    "id" SERIAL NOT NULL,
    "interfaceElementId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "interfaceElementEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interfaceTags_interfaceId_tagId_key" ON "interfaceTags"("interfaceId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "events_canonicalName_key" ON "events"("canonicalName");

-- CreateIndex
CREATE UNIQUE INDEX "interfaceElementEvents_interfaceElementId_eventId_key" ON "interfaceElementEvents"("interfaceElementId", "eventId");

-- AddForeignKey
ALTER TABLE "interfaces" ADD CONSTRAINT "interfaces_interfaceGroupId_fkey" FOREIGN KEY ("interfaceGroupId") REFERENCES "interfaceGroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceTags" ADD CONSTRAINT "interfaceTags_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "interfaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceTags" ADD CONSTRAINT "interfaceTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceElements" ADD CONSTRAINT "interfaceElements_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "interfaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceElements" ADD CONSTRAINT "interfaceElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceElementEvents" ADD CONSTRAINT "interfaceElementEvents_interfaceElementId_fkey" FOREIGN KEY ("interfaceElementId") REFERENCES "interfaceElements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceElementEvents" ADD CONSTRAINT "interfaceElementEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
