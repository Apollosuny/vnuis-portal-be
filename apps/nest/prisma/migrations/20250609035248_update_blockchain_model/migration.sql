-- CreateEnum
CREATE TYPE "BlockchainType" AS ENUM ('SOLANA', 'POLYGON', 'ETHEREUM');

-- CreateEnum
CREATE TYPE "BlockchainTransactionType" AS ENUM ('FORM_SIGN', 'NFT_MINT', 'REWARD_TRANSFER');

-- CreateEnum
CREATE TYPE "BlockchainTransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "BlockchainTransaction" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "txHash" TEXT NOT NULL,
    "chain" "BlockchainType" NOT NULL,
    "txType" "BlockchainTransactionType" NOT NULL,
    "status" "BlockchainTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "senderAddress" TEXT NOT NULL,
    "receiverAddress" TEXT,
    "executedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "userId" UUID,

    CONSTRAINT "BlockchainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSignatureOnChain" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formHash" TEXT NOT NULL,
    "formSubmissionId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,

    CONSTRAINT "FormSignatureOnChain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlockchainTransaction_txHash_idx" ON "BlockchainTransaction"("txHash");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_chain_txType_status_idx" ON "BlockchainTransaction"("chain", "txType", "status");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_userId_idx" ON "BlockchainTransaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FormSignatureOnChain_formSubmissionId_key" ON "FormSignatureOnChain"("formSubmissionId");

-- CreateIndex
CREATE INDEX "FormSignatureOnChain_formHash_idx" ON "FormSignatureOnChain"("formHash");

-- AddForeignKey
ALTER TABLE "BlockchainTransaction" ADD CONSTRAINT "BlockchainTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSignatureOnChain" ADD CONSTRAINT "FormSignatureOnChain_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "AdministrativeProceduresFormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSignatureOnChain" ADD CONSTRAINT "FormSignatureOnChain_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "BlockchainTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
