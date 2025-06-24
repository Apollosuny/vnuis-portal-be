-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('GENERAL', 'USER_EXPERIENCE', 'FUNCTIONALITY', 'PERFORMANCE', 'DESIGN', 'CONTENT', 'TECHNICAL_ISSUE', 'SUGGESTION', 'COMPLAINT', 'COMPLIMENT');

-- CreateEnum
CREATE TYPE "SentimentType" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "rating" INTEGER,
    "sentiment" "SentimentType",
    "confidence" DOUBLE PRECISION,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiAnalysis" JSONB,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "metadata" JSONB,
    "studentId" UUID NOT NULL,
    "reviewedByOperatorId" UUID,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "feedbackId" UUID NOT NULL,
    "operatorId" UUID NOT NULL,

    CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackAnalytics" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" DATE NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "sentiment" "SentimentType" NOT NULL,
    "count" INTEGER NOT NULL,
    "avgRating" DOUBLE PRECISION,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeedbackAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_studentId_idx" ON "Feedback"("studentId");

-- CreateIndex
CREATE INDEX "Feedback_category_idx" ON "Feedback"("category");

-- CreateIndex
CREATE INDEX "Feedback_sentiment_idx" ON "Feedback"("sentiment");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackResponse_feedbackId_idx" ON "FeedbackResponse"("feedbackId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_operatorId_idx" ON "FeedbackResponse"("operatorId");

-- CreateIndex
CREATE INDEX "FeedbackAnalytics_date_idx" ON "FeedbackAnalytics"("date");

-- CreateIndex
CREATE INDEX "FeedbackAnalytics_category_idx" ON "FeedbackAnalytics"("category");

-- CreateIndex
CREATE INDEX "FeedbackAnalytics_sentiment_idx" ON "FeedbackAnalytics"("sentiment");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackAnalytics_date_category_sentiment_key" ON "FeedbackAnalytics"("date", "category", "sentiment");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reviewedByOperatorId_fkey" FOREIGN KEY ("reviewedByOperatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
