-- CreateTable
CREATE TABLE "ChatbotIntentRoute" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "intent" TEXT NOT NULL,
    "routePath" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "responseTemplate" TEXT,
    "quickActions" JSONB,

    CONSTRAINT "ChatbotIntentRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotIntentRoute_intent_key" ON "ChatbotIntentRoute"("intent");

-- CreateIndex
CREATE INDEX "ChatbotIntentRoute_intent_idx" ON "ChatbotIntentRoute"("intent");

-- CreateIndex
CREATE INDEX "ChatbotIntentRoute_isActive_idx" ON "ChatbotIntentRoute"("isActive");

-- CreateIndex
CREATE INDEX "ChatbotIntentRoute_priority_idx" ON "ChatbotIntentRoute"("priority");
