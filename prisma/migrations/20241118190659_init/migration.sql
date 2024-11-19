-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "OAuthProviderName" AS ENUM ('github', 'google', 'yandex');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(200) NOT NULL,
    "lastName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL,
    "hasImage" BOOLEAN NOT NULL,
    "avatarFilename" VARCHAR(50) NOT NULL,
    "avatarBackgroundFilename" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthProvider" (
    "id" UUID NOT NULL,
    "providerName" "OAuthProviderName" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarFilename_key" ON "User"("avatarFilename");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarBackgroundFilename_key" ON "User"("avatarBackgroundFilename");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthProvider_providerName_providerUserId_key" ON "OAuthProvider"("providerName", "providerUserId");

-- AddForeignKey
ALTER TABLE "OAuthProvider" ADD CONSTRAINT "OAuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
