-- CreateTable
CREATE TABLE "interfaceEvents" (
    "id" SERIAL NOT NULL,
    "interfaceId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "interfaceEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contextExtensions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contextExtensions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interfaceEvents_interfaceId_eventId_key" ON "interfaceEvents"("interfaceId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "contextExtensions_name_key" ON "contextExtensions"("name");

-- AddForeignKey
ALTER TABLE "interfaceEvents" ADD CONSTRAINT "interfaceEvents_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "interfaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interfaceEvents" ADD CONSTRAINT "interfaceEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
