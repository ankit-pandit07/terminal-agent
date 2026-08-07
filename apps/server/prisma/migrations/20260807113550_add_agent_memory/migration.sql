-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "executionId" TEXT,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentMemory_conversationId_idx" ON "AgentMemory"("conversationId");

-- CreateIndex
CREATE INDEX "AgentMemory_executionId_idx" ON "AgentMemory"("executionId");

-- CreateIndex
CREATE INDEX "AgentMemory_type_idx" ON "AgentMemory"("type");

-- CreateIndex
CREATE INDEX "AgentMemory_key_idx" ON "AgentMemory"("key");
