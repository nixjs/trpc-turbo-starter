-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "WalletProviderLogin" AS ENUM ('PL_NONE', 'PL_METAMASK', 'PL_BINANCE_WALLET');

-- CreateEnum
CREATE TYPE "SocialProviderLogin" AS ENUM ('PL_NONE', 'PL_GOOGLE', 'PL_GITHUB', 'PL_TELEGRAM', 'PL_FACEBOOK', 'PL_INSTAGRAM', 'PL_SLACK', 'PL_TWITTER');

-- CreateEnum
CREATE TYPE "NetworkSymbol" AS ENUM ('NS_NONE', 'NS_ETH', 'NS_BSC', 'NS_TRX');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('BS_NONE', 'BS_COMMITTED', 'BS_BET', 'BS_COMPLETED');

-- CreateEnum
CREATE TYPE "GameSymbol" AS ENUM ('NONE', 'DICE', 'KENO', 'HASH_DICE', 'MINES', 'TRIPLE', 'LIMBO', 'TOWER', 'COIN_FLIP');

-- CreateEnum
CREATE TYPE "DiceDirection" AS ENUM ('DD_NONE', 'DD_ROLL_UNDER', 'DD_ROLL_OVER');

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "networkSymbol" "NetworkSymbol" NOT NULL,
    "walletProvider" "WalletProviderLogin" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSocial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socialProvider" "SocialProviderLogin" NOT NULL,
    "socialProviderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiceBet" (
    "turnId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameSymbol" "GameSymbol" NOT NULL,
    "commitHash" VARCHAR(1024) NOT NULL,
    "maskedResult" VARCHAR(1024) NOT NULL,
    "signature" VARCHAR(256) NOT NULL,
    "multiplier" DECIMAL(23,8) NOT NULL,
    "currencySymbol" VARCHAR(64) NOT NULL,
    "status" "BetStatus" NOT NULL DEFAULT 'BS_NONE',
    "isWin" BOOLEAN NOT NULL DEFAULT false,
    "betAmount" DECIMAL(23,8) NOT NULL,
    "payout" DECIMAL(23,8) NOT NULL,
    "profit" DECIMAL(23,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placeBetTxId" TEXT NOT NULL,
    "direction" "DiceDirection" NOT NULL DEFAULT 'DD_NONE',
    "luckyNumber" INTEGER NOT NULL,
    "betNumber" INTEGER NOT NULL,

    CONSTRAINT "DiceBet_pkey" PRIMARY KEY ("turnId","createdAt")
);

-- CreateTable
CREATE TABLE "DiceGameConfig" (
    "gameSymbol" "GameSymbol" NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiceGameConfig_pkey" PRIMARY KEY ("gameSymbol")
);

-- CreateTable
CREATE TABLE "BetResult" (
    "turnId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameSymbol" "GameSymbol" NOT NULL,
    "multiplier" DECIMAL(23,8) NOT NULL,
    "currencySymbol" VARCHAR(64) NOT NULL,
    "betAmount" DECIMAL(23,8) NOT NULL,
    "payout" DECIMAL(23,8) NOT NULL,
    "profit" DECIMAL(23,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetResult_pkey" PRIMARY KEY ("turnId","createdAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_walletAddress_networkSymbol_key" ON "UserWallet"("walletAddress", "networkSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "UserSocial_socialProvider_socialProviderId_key" ON "UserSocial"("socialProvider", "socialProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSocial" ADD CONSTRAINT "UserSocial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
