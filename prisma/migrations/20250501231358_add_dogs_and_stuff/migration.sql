/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Type` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `age` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxAge` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxWeight` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAge` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minWeight` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "location" JSONB NOT NULL,
ADD COLUMN     "maxAge" INTEGER NOT NULL,
ADD COLUMN     "maxWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minAge" INTEGER NOT NULL,
ADD COLUMN     "minWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "Type";

-- CreateTable
CREATE TABLE "Dog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "personFriendliness" INTEGER NOT NULL,
    "dogFriendliness" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "sex" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "matchedWithId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dog_userId_key" ON "Dog"("userId");

-- CreateIndex
CREATE INDEX "Dog_userId_idx" ON "Dog"("userId");

-- CreateIndex
CREATE INDEX "Match_userId_idx" ON "Match"("userId");

-- CreateIndex
CREATE INDEX "Match_matchedWithId_idx" ON "Match"("matchedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userId_matchedWithId_key" ON "Match"("userId", "matchedWithId");

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchedWithId_fkey" FOREIGN KEY ("matchedWithId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
