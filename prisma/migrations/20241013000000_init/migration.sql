-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalRides" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "driverId" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "dropLat" DOUBLE PRECISION NOT NULL,
    "dropLng" DOUBLE PRECISION NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "fare" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CUSTOM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeConnection" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "sourceHandle" TEXT NOT NULL DEFAULT 'source',
    "targetHandle" TEXT NOT NULL DEFAULT 'target',
    "condition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowVersion" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "changeDescription" TEXT,
    "workflowData" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineExecution" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "inputData" TEXT NOT NULL,
    "outputData" TEXT,
    "status" TEXT NOT NULL,
    "executionTime" INTEGER NOT NULL,
    "culturalContext" TEXT NOT NULL,
    "culturalAlign" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "malayalamProc" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTime" INTEGER NOT NULL DEFAULT 0,
    "memoryUsage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "batchId" TEXT,

    CONSTRAINT "EngineExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineExecutionBatch" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "executionMode" TEXT NOT NULL,
    "totalEngines" INTEGER NOT NULL DEFAULT 0,
    "completedEngines" INTEGER NOT NULL DEFAULT 0,
    "failedEngines" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalDuration" INTEGER,
    "culturalAlign" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "malayalamProc" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EngineExecutionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineConfiguration" (
    "id" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "culturalSettings" TEXT NOT NULL,
    "performanceThresholds" TEXT NOT NULL,
    "experimentGroup" TEXT,
    "trafficPercent" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "EngineConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CulturalMetrics" (
    "id" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "festival" TEXT,
    "timeOfDay" TEXT NOT NULL,
    "alignmentScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "responseQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "userSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "executionCount" INTEGER NOT NULL DEFAULT 1,
    "averageTime" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CulturalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnginePerformanceMetric" (
    "id" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aggregationLevel" TEXT NOT NULL DEFAULT 'hourly',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "version" TEXT NOT NULL DEFAULT '1.0.0',

    CONSTRAINT "EnginePerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallRecord" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "sessionId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "callType" TEXT NOT NULL,
    "participantCount" INTEGER NOT NULL DEFAULT 1,
    "recordingUrl" TEXT,
    "recordingSize" BIGINT,
    "recordingFormat" TEXT NOT NULL DEFAULT 'wav',
    "encryptionKey" TEXT,
    "transcriptionId" TEXT,
    "audioQuality" DOUBLE PRECISION DEFAULT 0.0,
    "noiseLevel" DOUBLE PRECISION DEFAULT 0.0,
    "signalStrength" DOUBLE PRECISION DEFAULT 0.0,
    "retentionPolicy" TEXT NOT NULL DEFAULT 'standard',
    "retentionExpiry" TIMESTAMP(3),
    "gdprCompliant" BOOLEAN NOT NULL DEFAULT true,
    "hipaaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "primaryLanguage" TEXT NOT NULL DEFAULT 'en',
    "culturalContext" JSONB,
    "malayalamContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallTranscription" (
    "id" TEXT NOT NULL,
    "callRecordId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "fullTranscript" TEXT,
    "segments" JSONB,
    "summary" TEXT,
    "keyPhrases" JSONB,
    "sentiment" TEXT,
    "culturalTone" TEXT,
    "malayalamAccuracy" DOUBLE PRECISION DEFAULT 0.0,
    "codeSwiting" JSONB,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "speakerCount" INTEGER NOT NULL DEFAULT 1,
    "silenceDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallTranscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "maxParticipants" INTEGER NOT NULL DEFAULT 50,
    "conferenceType" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT 'hd',
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transcriptionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "purpose" TEXT,
    "department" TEXT,
    "ticketId" TEXT,
    "primaryLanguage" TEXT NOT NULL DEFAULT 'en',
    "culturalMode" TEXT NOT NULL DEFAULT 'standard',
    "malayalamSupport" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpeakingTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "joinTime" TIMESTAMP(3),
    "leaveTime" TIMESTAMP(3),
    "speakingTime" INTEGER NOT NULL DEFAULT 0,
    "participationScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "averageSignal" DOUBLE PRECISION DEFAULT 0.0,
    "networkQuality" DOUBLE PRECISION DEFAULT 0.0,
    "audioIssues" JSONB,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "culturalContext" JSONB,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceRecording" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "recordingSize" BIGINT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'webm',
    "duration" INTEGER NOT NULL,
    "audioQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "processingStatus" TEXT NOT NULL DEFAULT 'processing',
    "encryptionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "segments" JSONB,
    "chapters" JSONB,
    "highlights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceTranscription" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "fullTranscript" TEXT,
    "speakerSegments" JSONB,
    "summary" TEXT,
    "actionItems" JSONB,
    "decisions" JSONB,
    "languageMix" JSONB,
    "culturalTone" JSONB,
    "respectLevels" JSONB,
    "sentiment" JSONB,
    "topics" JSONB,
    "keywords" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceTranscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AMDAnalysis" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "isAnsweringMachine" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "detectionTime" INTEGER NOT NULL DEFAULT 0,
    "audioPatterns" JSONB,
    "silenceDuration" INTEGER NOT NULL DEFAULT 0,
    "beepDetected" BOOLEAN NOT NULL DEFAULT false,
    "voiceCharacteristics" JSONB,
    "greetingLanguage" TEXT,
    "culturalPattern" TEXT,
    "greetingText" TEXT,
    "messageStrategy" TEXT,
    "messageDelivered" BOOLEAN NOT NULL DEFAULT false,
    "callbackScheduled" BOOLEAN NOT NULL DEFAULT false,
    "callbackTime" TIMESTAMP(3),
    "campaignId" TEXT,
    "customerProfile" JSONB,
    "previousAttempts" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION DEFAULT 0.0,
    "falsePositiveRate" DOUBLE PRECISION DEFAULT 0.0,
    "processingLatency" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AMDAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "engine" TEXT NOT NULL DEFAULT 'custom',
    "model" TEXT,
    "realTimeMode" BOOLEAN NOT NULL DEFAULT true,
    "latency" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "culturalPreservation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fluentness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "idiomsTranslated" INTEGER NOT NULL DEFAULT 0,
    "culturalReferences" JSONB,
    "emotionalTone" JSONB,
    "researchMode" BOOLEAN NOT NULL DEFAULT false,
    "anonymized" BOOLEAN NOT NULL DEFAULT true,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "segmentCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationSegment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "latency" INTEGER NOT NULL DEFAULT 0,
    "sourceTokens" JSONB,
    "targetTokens" JSONB,
    "alignment" JSONB,
    "culturalElements" JSONB,
    "adaptations" JSONB,
    "preservationScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "humanValidated" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "linguistNotes" TEXT,
    "culturalNotes" TEXT,
    "errorAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "endpoint" TEXT,
    "apiKey" TEXT,
    "secretKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,
    "lastSync" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestData" JSONB,
    "responseData" JSONB,
    "statusCode" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemHealth" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "uptime" INTEGER,
    "lastHealthCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SystemHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "component" TEXT,
    "severity" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVersion_workflowId_version_key" ON "WorkflowVersion"("workflowId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "EngineExecution_executionId_key" ON "EngineExecution"("executionId");

-- CreateIndex
CREATE INDEX "EngineExecution_engineType_idx" ON "EngineExecution"("engineType");

-- CreateIndex
CREATE INDEX "EngineExecution_status_idx" ON "EngineExecution"("status");

-- CreateIndex
CREATE INDEX "EngineExecution_createdAt_idx" ON "EngineExecution"("createdAt");

-- CreateIndex
CREATE INDEX "EngineExecution_batchId_idx" ON "EngineExecution"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "EngineExecutionBatch_batchId_key" ON "EngineExecutionBatch"("batchId");

-- CreateIndex
CREATE INDEX "EngineExecutionBatch_status_idx" ON "EngineExecutionBatch"("status");

-- CreateIndex
CREATE INDEX "EngineExecutionBatch_startTime_idx" ON "EngineExecutionBatch"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "EngineConfiguration_engineType_key" ON "EngineConfiguration"("engineType");

-- CreateIndex
CREATE INDEX "EngineConfiguration_engineType_idx" ON "EngineConfiguration"("engineType");

-- CreateIndex
CREATE INDEX "EngineConfiguration_status_idx" ON "EngineConfiguration"("status");

-- CreateIndex
CREATE INDEX "EngineConfiguration_isDefault_idx" ON "EngineConfiguration"("isDefault");

-- CreateIndex
CREATE INDEX "CulturalMetrics_engineType_language_region_idx" ON "CulturalMetrics"("engineType", "language", "region");

-- CreateIndex
CREATE INDEX "CulturalMetrics_recordDate_idx" ON "CulturalMetrics"("recordDate");

-- CreateIndex
CREATE UNIQUE INDEX "CulturalMetrics_engineType_language_region_community_festiv_key" ON "CulturalMetrics"("engineType", "language", "region", "community", "festival", "timeOfDay", "recordDate");

-- CreateIndex
CREATE INDEX "EnginePerformanceMetric_engineType_metricType_timestamp_idx" ON "EnginePerformanceMetric"("engineType", "metricType", "timestamp");

-- CreateIndex
CREATE INDEX "EnginePerformanceMetric_aggregationLevel_periodStart_idx" ON "EnginePerformanceMetric"("aggregationLevel", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "CallRecord_callId_key" ON "CallRecord"("callId");

-- CreateIndex
CREATE INDEX "CallRecord_callId_idx" ON "CallRecord"("callId");

-- CreateIndex
CREATE INDEX "CallRecord_startTime_idx" ON "CallRecord"("startTime");

-- CreateIndex
CREATE INDEX "CallRecord_callType_primaryLanguage_idx" ON "CallRecord"("callType", "primaryLanguage");

-- CreateIndex
CREATE INDEX "CallRecord_retentionExpiry_idx" ON "CallRecord"("retentionExpiry");

-- CreateIndex
CREATE UNIQUE INDEX "CallTranscription_callRecordId_key" ON "CallTranscription"("callRecordId");

-- CreateIndex
CREATE INDEX "CallTranscription_language_confidence_idx" ON "CallTranscription"("language", "confidence");

-- CreateIndex
CREATE INDEX "CallTranscription_provider_processingTime_idx" ON "CallTranscription"("provider", "processingTime");

-- CreateIndex
CREATE UNIQUE INDEX "ConferenceSession_sessionId_key" ON "ConferenceSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConferenceSession_sessionId_idx" ON "ConferenceSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConferenceSession_status_startTime_idx" ON "ConferenceSession"("status", "startTime");

-- CreateIndex
CREATE INDEX "ConferenceSession_purpose_department_idx" ON "ConferenceSession"("purpose", "department");

-- CreateIndex
CREATE INDEX "ConferenceParticipant_sessionId_role_idx" ON "ConferenceParticipant"("sessionId", "role");

-- CreateIndex
CREATE INDEX "ConferenceParticipant_userId_idx" ON "ConferenceParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConferenceParticipant_joinTime_leaveTime_idx" ON "ConferenceParticipant"("joinTime", "leaveTime");

-- CreateIndex
CREATE INDEX "ConferenceRecording_sessionId_idx" ON "ConferenceRecording"("sessionId");

-- CreateIndex
CREATE INDEX "ConferenceRecording_processingStatus_idx" ON "ConferenceRecording"("processingStatus");

-- CreateIndex
CREATE INDEX "ConferenceTranscription_sessionId_language_idx" ON "ConferenceTranscription"("sessionId", "language");

-- CreateIndex
CREATE INDEX "ConferenceTranscription_provider_overallConfidence_idx" ON "ConferenceTranscription"("provider", "overallConfidence");

-- CreateIndex
CREATE UNIQUE INDEX "AMDAnalysis_callId_key" ON "AMDAnalysis"("callId");

-- CreateIndex
CREATE INDEX "AMDAnalysis_callId_idx" ON "AMDAnalysis"("callId");

-- CreateIndex
CREATE INDEX "AMDAnalysis_isAnsweringMachine_confidence_idx" ON "AMDAnalysis"("isAnsweringMachine", "confidence");

-- CreateIndex
CREATE INDEX "AMDAnalysis_campaignId_createdAt_idx" ON "AMDAnalysis"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "AMDAnalysis_culturalPattern_greetingLanguage_idx" ON "AMDAnalysis"("culturalPattern", "greetingLanguage");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationSession_sessionId_key" ON "TranslationSession"("sessionId");

-- CreateIndex
CREATE INDEX "TranslationSession_sessionId_idx" ON "TranslationSession"("sessionId");

-- CreateIndex
CREATE INDEX "TranslationSession_sourceLanguage_targetLanguage_idx" ON "TranslationSession"("sourceLanguage", "targetLanguage");

-- CreateIndex
CREATE INDEX "TranslationSession_researchMode_consentGiven_idx" ON "TranslationSession"("researchMode", "consentGiven");

-- CreateIndex
CREATE INDEX "TranslationSegment_sessionId_sequenceNumber_idx" ON "TranslationSegment"("sessionId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "TranslationSegment_confidence_qualityScore_idx" ON "TranslationSegment"("confidence", "qualityScore");

-- CreateIndex
CREATE INDEX "TranslationSegment_needsReview_humanValidated_idx" ON "TranslationSegment"("needsReview", "humanValidated");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX "IntegrationLog_integrationId_idx" ON "IntegrationLog"("integrationId");

-- CreateIndex
CREATE INDEX "IntegrationLog_createdAt_idx" ON "IntegrationLog"("createdAt");

-- CreateIndex
CREATE INDEX "IntegrationLog_success_idx" ON "IntegrationLog"("success");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_category_idx" ON "SystemLog"("category");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE INDEX "SystemHealth_status_idx" ON "SystemHealth"("status");

-- CreateIndex
CREATE INDEX "SystemHealth_lastHealthCheck_idx" ON "SystemHealth"("lastHealthCheck");

-- CreateIndex
CREATE UNIQUE INDEX "SystemHealth_component_key" ON "SystemHealth"("component");

-- CreateIndex
CREATE INDEX "SystemAlert_type_idx" ON "SystemAlert"("type");

-- CreateIndex
CREATE INDEX "SystemAlert_severity_idx" ON "SystemAlert"("severity");

-- CreateIndex
CREATE INDEX "SystemAlert_isResolved_idx" ON "SystemAlert"("isResolved");

-- CreateIndex
CREATE INDEX "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineExecution" ADD CONSTRAINT "EngineExecution_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EngineExecutionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallTranscription" ADD CONSTRAINT "CallTranscription_callRecordId_fkey" FOREIGN KEY ("callRecordId") REFERENCES "CallRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceParticipant" ADD CONSTRAINT "ConferenceParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConferenceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceRecording" ADD CONSTRAINT "ConferenceRecording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConferenceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceTranscription" ADD CONSTRAINT "ConferenceTranscription_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConferenceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationSegment" ADD CONSTRAINT "TranslationSegment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TranslationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

