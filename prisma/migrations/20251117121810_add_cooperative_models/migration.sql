/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "VoiceProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ml',
    "voiceType" TEXT NOT NULL DEFAULT 'adult',
    "gender" TEXT,
    "fundamentalFrequency" DOUBLE PRECISION,
    "formantFeatures" JSONB,
    "spectralFeatures" JSONB,
    "prosodyFeatures" JSONB,
    "malayalamPhonemes" JSONB,
    "dialectMarkers" JSONB,
    "codeSwitch" BOOLEAN NOT NULL DEFAULT false,
    "voiceprintHash" TEXT NOT NULL,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "enrollmentQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0',
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "successfulVerifications" INTEGER NOT NULL DEFAULT 0,
    "failedVerifications" INTEGER NOT NULL DEFAULT 0,
    "lastVerified" TIMESTAMP(3),
    "encryptionKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceVerification" (
    "id" TEXT NOT NULL,
    "voiceProfileId" TEXT NOT NULL,
    "sessionId" TEXT,
    "isSuccessful" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "audioQuality" DOUBLE PRECISION,
    "signalToNoise" DOUBLE PRECISION,
    "durationMs" INTEGER,
    "dialectMatch" DOUBLE PRECISION,
    "languageMix" JSONB,
    "culturalContext" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "location" JSONB,
    "processingTimeMs" INTEGER,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakerDiarization" (
    "id" TEXT NOT NULL,
    "callRecordId" TEXT NOT NULL,
    "speakerCount" INTEGER NOT NULL DEFAULT 1,
    "speakers" JSONB NOT NULL,
    "segments" JSONB NOT NULL,
    "malayalamSpeakers" INTEGER NOT NULL DEFAULT 0,
    "languageSegments" JSONB,
    "codeSwithcing" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "accuracy" DOUBLE PRECISION,
    "processingTime" INTEGER,
    "culturalMarkers" JSONB,
    "formalityLevel" DOUBLE PRECISION,
    "respectMarkers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakerDiarization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "languages" JSONB NOT NULL,
    "specialization" JSONB NOT NULL,
    "skillLevel" TEXT NOT NULL DEFAULT 'junior',
    "malayalamFluency" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "culturalKnowledge" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dialectSupport" JSONB,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "currentStatus" TEXT NOT NULL DEFAULT 'offline',
    "maxConcurrentCalls" INTEGER NOT NULL DEFAULT 3,
    "currentCallCount" INTEGER NOT NULL DEFAULT 0,
    "averageHandleTime" INTEGER NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "escalationRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "resolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "workingHours" JSONB,
    "lastLogin" TIMESTAMP(3),
    "totalCallsHandled" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallHandoff" (
    "id" TEXT NOT NULL,
    "callRecordId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fromOperatorId" TEXT,
    "toOperatorId" TEXT NOT NULL,
    "handoffType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reason" TEXT NOT NULL,
    "customerIssue" TEXT,
    "aiContext" JSONB,
    "culturalContext" JSONB,
    "languageRequirement" TEXT,
    "culturalSensitivity" BOOLEAN NOT NULL DEFAULT false,
    "dialectSpecific" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "responseTime" INTEGER,
    "handoffQuality" DOUBLE PRECISION,
    "customerSatisfaction" DOUBLE PRECISION,
    "resolutionStatus" TEXT,
    "handoffNotes" TEXT,
    "operatorNotes" TEXT,
    "customerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallHandoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeSociety" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeSociety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeMember" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shareValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeStrategy" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "targetDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeInitiative" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyMilestone" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceProfile_userId_key" ON "VoiceProfile"("userId");

-- CreateIndex
CREATE INDEX "VoiceProfile_userId_idx" ON "VoiceProfile"("userId");

-- CreateIndex
CREATE INDEX "VoiceProfile_language_idx" ON "VoiceProfile"("language");

-- CreateIndex
CREATE INDEX "VoiceProfile_isActive_idx" ON "VoiceProfile"("isActive");

-- CreateIndex
CREATE INDEX "VoiceProfile_createdAt_idx" ON "VoiceProfile"("createdAt");

-- CreateIndex
CREATE INDEX "VoiceVerification_voiceProfileId_idx" ON "VoiceVerification"("voiceProfileId");

-- CreateIndex
CREATE INDEX "VoiceVerification_sessionId_idx" ON "VoiceVerification"("sessionId");

-- CreateIndex
CREATE INDEX "VoiceVerification_isSuccessful_idx" ON "VoiceVerification"("isSuccessful");

-- CreateIndex
CREATE INDEX "VoiceVerification_createdAt_idx" ON "VoiceVerification"("createdAt");

-- CreateIndex
CREATE INDEX "VoiceVerification_confidence_idx" ON "VoiceVerification"("confidence");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakerDiarization_callRecordId_key" ON "SpeakerDiarization"("callRecordId");

-- CreateIndex
CREATE INDEX "SpeakerDiarization_callRecordId_idx" ON "SpeakerDiarization"("callRecordId");

-- CreateIndex
CREATE INDEX "SpeakerDiarization_speakerCount_idx" ON "SpeakerDiarization"("speakerCount");

-- CreateIndex
CREATE INDEX "SpeakerDiarization_malayalamSpeakers_idx" ON "SpeakerDiarization"("malayalamSpeakers");

-- CreateIndex
CREATE INDEX "SpeakerDiarization_createdAt_idx" ON "SpeakerDiarization"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorProfile_userId_key" ON "OperatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorProfile_operatorId_key" ON "OperatorProfile"("operatorId");

-- CreateIndex
CREATE INDEX "OperatorProfile_userId_idx" ON "OperatorProfile"("userId");

-- CreateIndex
CREATE INDEX "OperatorProfile_operatorId_idx" ON "OperatorProfile"("operatorId");

-- CreateIndex
CREATE INDEX "OperatorProfile_isOnline_idx" ON "OperatorProfile"("isOnline");

-- CreateIndex
CREATE INDEX "OperatorProfile_currentStatus_idx" ON "OperatorProfile"("currentStatus");

-- CreateIndex
CREATE INDEX "OperatorProfile_skillLevel_idx" ON "OperatorProfile"("skillLevel");

-- CreateIndex
CREATE INDEX "CallHandoff_callRecordId_idx" ON "CallHandoff"("callRecordId");

-- CreateIndex
CREATE INDEX "CallHandoff_sessionId_idx" ON "CallHandoff"("sessionId");

-- CreateIndex
CREATE INDEX "CallHandoff_fromOperatorId_idx" ON "CallHandoff"("fromOperatorId");

-- CreateIndex
CREATE INDEX "CallHandoff_toOperatorId_idx" ON "CallHandoff"("toOperatorId");

-- CreateIndex
CREATE INDEX "CallHandoff_status_idx" ON "CallHandoff"("status");

-- CreateIndex
CREATE INDEX "CallHandoff_priority_idx" ON "CallHandoff"("priority");

-- CreateIndex
CREATE INDEX "CallHandoff_handoffType_idx" ON "CallHandoff"("handoffType");

-- CreateIndex
CREATE INDEX "CallHandoff_requestedAt_idx" ON "CallHandoff"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeSociety_name_key" ON "CooperativeSociety"("name");

-- CreateIndex
CREATE INDEX "CooperativeSociety_type_idx" ON "CooperativeSociety"("type");

-- CreateIndex
CREATE INDEX "CooperativeSociety_region_idx" ON "CooperativeSociety"("region");

-- CreateIndex
CREATE INDEX "CooperativeSociety_status_idx" ON "CooperativeSociety"("status");

-- CreateIndex
CREATE INDEX "CooperativeMember_role_idx" ON "CooperativeMember"("role");

-- CreateIndex
CREATE INDEX "CooperativeMember_status_idx" ON "CooperativeMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeMember_societyId_userId_key" ON "CooperativeMember"("societyId", "userId");

-- CreateIndex
CREATE INDEX "CooperativeStrategy_societyId_idx" ON "CooperativeStrategy"("societyId");

-- CreateIndex
CREATE INDEX "CooperativeStrategy_category_idx" ON "CooperativeStrategy"("category");

-- CreateIndex
CREATE INDEX "CooperativeStrategy_priority_idx" ON "CooperativeStrategy"("priority");

-- CreateIndex
CREATE INDEX "CooperativeStrategy_status_idx" ON "CooperativeStrategy"("status");

-- CreateIndex
CREATE INDEX "CooperativeInitiative_strategyId_idx" ON "CooperativeInitiative"("strategyId");

-- CreateIndex
CREATE INDEX "CooperativeInitiative_societyId_idx" ON "CooperativeInitiative"("societyId");

-- CreateIndex
CREATE INDEX "CooperativeInitiative_type_idx" ON "CooperativeInitiative"("type");

-- CreateIndex
CREATE INDEX "CooperativeInitiative_status_idx" ON "CooperativeInitiative"("status");

-- CreateIndex
CREATE INDEX "StrategyMilestone_strategyId_idx" ON "StrategyMilestone"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyMilestone_status_idx" ON "StrategyMilestone"("status");

-- CreateIndex
CREATE INDEX "StrategyMilestone_targetDate_idx" ON "StrategyMilestone"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_name_key" ON "Workflow"("name");

-- AddForeignKey
ALTER TABLE "VoiceProfile" ADD CONSTRAINT "VoiceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceVerification" ADD CONSTRAINT "VoiceVerification_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "VoiceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakerDiarization" ADD CONSTRAINT "SpeakerDiarization_callRecordId_fkey" FOREIGN KEY ("callRecordId") REFERENCES "CallRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorProfile" ADD CONSTRAINT "OperatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallHandoff" ADD CONSTRAINT "CallHandoff_callRecordId_fkey" FOREIGN KEY ("callRecordId") REFERENCES "CallRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallHandoff" ADD CONSTRAINT "CallHandoff_fromOperatorId_fkey" FOREIGN KEY ("fromOperatorId") REFERENCES "OperatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallHandoff" ADD CONSTRAINT "CallHandoff_toOperatorId_fkey" FOREIGN KEY ("toOperatorId") REFERENCES "OperatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeMember" ADD CONSTRAINT "CooperativeMember_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "CooperativeSociety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeMember" ADD CONSTRAINT "CooperativeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeStrategy" ADD CONSTRAINT "CooperativeStrategy_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "CooperativeSociety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeStrategy" ADD CONSTRAINT "CooperativeStrategy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeStrategy" ADD CONSTRAINT "CooperativeStrategy_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeInitiative" ADD CONSTRAINT "CooperativeInitiative_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "CooperativeStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeInitiative" ADD CONSTRAINT "CooperativeInitiative_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "CooperativeSociety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeInitiative" ADD CONSTRAINT "CooperativeInitiative_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeInitiative" ADD CONSTRAINT "CooperativeInitiative_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyMilestone" ADD CONSTRAINT "StrategyMilestone_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "CooperativeStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
