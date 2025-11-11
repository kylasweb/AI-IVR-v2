# Sentinel Command Dashboard - Legendary Blueprint v1.1

## Enterprise Security Architect AI - Project Deliverable

**Project:** "Sentinel Command Dashboard" (IMOS Ecosystem)  
**Version:** 1.1 (Integrated Edition)  
**Date:** November 11, 2025  
**Classification:** Enterprise Security - Zero Trust Implementation

---

## Table of Contents

### I. Overall Project & Strategy Blueprints
1. [MVP Checklist & Roadmap](#1-mvp-checklist--roadmap)
2. [System Architecture Mermaid Diagram](#2-system-architecture-mermaid-diagram)
3. [Ethical, Safety & Data Governance Plan](#3-ethical-safety--data-governance-plan)

### II. Frontend Blueprints (Mobile App & Websites)
4. [Frontend & Mobile App UX/UI Master Plan](#4-frontend--mobile-app-uxui-master-plan)
5. [Landing Page Structure Plan](#5-landing-page-structure-plan)
6. [Frontend App Structure Plan (Next.js)](#6-frontend-app-structure-plan-nextjs)

### III. Dashboard Blueprints (Role-Specific)
7. [User Dashboard Plan](#7-user-dashboard-plan)
8. [Admin Dashboard Plan](#8-admin-dashboard-plan)

### IV. Backend & API Blueprints
9. [Backend Architecture Plan (NestJS Modular Monolith)](#9-backend-architecture-plan-nestjs-modular-monolith)
10. [API Endpoint Specification (REST API & WebSocket Events)](#10-api-endpoint-specification-rest-api--websocket-events)
11. [Database Schema & Migration Plan](#11-database-schema--migration-plan)

### V. Dependencies, Operations & Quality Blueprints
12. [Dependencies & Tooling Plan](#12-dependencies--tooling-plan)
13. [AI/ML Model & MLOps Plan](#13-aiml-model--mlops-plan)
14. [Deployment, CI/CD & Observability Plan](#14-deployment-cicd--observability-plan)
15. [Mandatory TDD/BDD Workflow & Testing Plan](#15-mandatory-tddbdd-workflow--testing-plan)

---

## I. Overall Project & Strategy Blueprints

### 1. MVP Checklist & Roadmap

#### **Core Mission & Guiding Principles**
**Mission:** Construct a 360-degree, real-time Security Information and Event Management (SIEM) and SOAR platform providing single-pane-of-glass visibility into the IMOS ecosystem's security posture, enabling predictive threat detection and automated response capabilities.

**Guiding Principles:**
1. **Zero Trust:** Trust nothing, verify everything - all access requires continuous validation
2. **Real-Time Detection:** Threat detection measured in seconds, not hours
3. **AI-Driven & Predictive:** Use AI to identify unknown unknowns that analysts would miss
4. **Actionable Intelligence:** Provide prioritized risks with one-click response playbooks

#### **Breakdown by Epics:**

**Epic 1: Data Ingestion Pipeline (Weeks 1-3)**
- Setup Apache Kafka cluster as central event bus
- Define standardized JSON event schema for all IMOS services
- Configure Project Prism API to publish security events
- Configure AI IVR System to publish voice biometric events
- Configure 7 Core Engines to publish audit trails and metrics
- Configure Project Catalyst to publish access logs
- Configure FairGo to publish scoring events

**Epic 2: Real-Time UI Foundation (Weeks 4-6)**
- Setup NestJS backend with WebSocket gateway
- Setup Next.js frontend with Socket.io client
- Implement authentication system with MFA
- Create basic dashboard layout with role-based navigation
- Prove end-to-end event flow: "Event Fired → Kafka → Stream Processor → WebSocket Push → UI Update"

**Epic 3: Module 1 (War Room) - Global Threat Visualization (Weeks 7-9)**
- Build interactive world map with real-time threat overlays
- Implement DEFCON status system with visual indicators
- Create critical alerts ticker with scrolling notifications
- Integrate geolocation data from IP addresses and service metadata

**Epic 4: Module 3 (AI Anomaly Detection) - Internal Traffic Monitoring (Weeks 10-12)**
- Build Python stream processor using Faust framework
- Implement Isolation Forest model for East-West traffic analysis
- Train initial anomaly detection model on 24-hour baseline traffic
- Create real-time alerting system for DEFCON status changes
- Implement automated alert escalation based on anomaly severity

**Epic 5: Module 5 (AI Response - HITL) - Risk Center & Playbooks (Weeks 13-15)**
- Build LangChain-based AI agent for risk assessment and playbook generation
- Implement prioritized risk feed with AI-driven scoring
- Create manual "Big Red Button" interface for critical actions
- Implement mandatory Human-in-the-Loop (HITL) workflow
- Build immutable audit logging for all response actions

#### **User Stories (MVP Focus):**

**As a SOC Analyst:**
- I can see real-time DEFCON status changes so that I'm immediately aware of critical security events
- I can view a live world map of global threats so that I understand attack patterns geographically
- I can monitor internal service communications for anomalies so that I detect unauthorized East-West traffic
- I can review voice biometric authentication failures so that I identify potential brute force attacks
- I can execute pre-approved security playbooks so that I respond quickly to known threats

**As a SOC Lead:**
- I can authorize critical security actions so that automated responses require human oversight
- I can view detailed privileged access logs so that I monitor administrative activities
- I can override AI-generated risk scores so that I provide expert judgment when needed

#### **MoSCoW Prioritization (MVP):**

**Must-have:**
- Kafka event ingestion pipeline with standardized schema
- WebSocket-based real-time UI updates
- Module 3: AI Anomaly Detection with DEFCON alerting
- Module 5: Manual "Big Red Button" actions with HITL workflow
- Module 4: Voice biometrics monitoring from AI IVR
- Zero Trust authentication with MFA and RBAC

**Should-have:**
- Module 1: Live world map with threat visualization
- Module 2: API Gateway metrics from InfluxDB
- Module 4: Complete IAM monitoring (privileged logs, FairGo alerts)
- Historical data retention and querying
- Alert acknowledgment and resolution workflow

**Could-have:**
- Module 5: Fully AI-generated dynamic playbooks
- Advanced threat hunting capabilities
- Integration with external threat intelligence feeds
- Automated incident response workflows (post-MVP)
- Machine learning model retraining pipeline

**Won't-have (for MVP):**
- Fully automated AI responses without HITL
- Advanced historical reporting dashboards
- Integration with external SIEM systems
- Advanced threat hunting and forensics tools

#### **Phased Release Timeline (GANTT Chart):**

```
Week:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
Epic1: ████░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░
Epic2: ░░ ░░ ████░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░
Epic3: ░░ ░░ ░░ ░░ ████░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░
Epic4: ░░ ░░ ░░ ░░ ░░ ░░ ████░░ ░░ ░░ ░░ ░░ ░░ ░░
Epic5: ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ████░░ ░░ ░░ ░░ ░░

Key: ████ = Active development, ░░ = Planning/Testing
```

**Milestone Deliverables:**
- **Week 3:** Data ingestion pipeline operational
- **Week 6:** Real-time UI foundation complete
- **Week 9:** War Room visualization functional
- **Week 12:** AI anomaly detection alerting
- **Week 15:** HITL response system operational

### 2. System Architecture Mermaid Diagram

```mermaid
C4Context
    title Sentinel Command Dashboard - System Context

    Person(soc_analyst, "SOC Analyst", "Security Operations Center analyst monitoring IMOS ecosystem")
    Person(soc_lead, "SOC Lead", "Senior security analyst with authorization capabilities")

    System(sentinel_dashboard, "Sentinel Command Dashboard", "Real-time SIEM/SOAR platform for IMOS ecosystem")

    System_Ext(project_prism, "Project Prism API", "Core API gateway and authentication service")
    System_Ext(ai_ivr, "AI IVR System", "Voice biometric authentication and IVR services")
    System_Ext(core_engines, "7 Core Engines", "Marketplace, Trust, Payment, etc.")
    System_Ext(project_catalyst, "Project Catalyst", "Privileged access management")
    System_Ext(fairgo, "FairGo", "User scoring and risk assessment")

    Rel(soc_analyst, sentinel_dashboard, "Monitors security posture", "HTTPS/WebSocket")
    Rel(soc_lead, sentinel_dashboard, "Authorizes critical actions", "HTTPS/WebSocket")

    Rel(project_prism, sentinel_dashboard, "Publishes auth/security events", "Kafka (JSON)")
    Rel(ai_ivr, sentinel_dashboard, "Publishes voice biometric events", "Kafka (JSON)")
    Rel(core_engines, sentinel_dashboard, "Publishes audit/service events", "Kafka (JSON)")
    Rel(project_catalyst, sentinel_dashboard, "Publishes access control events", "Kafka (JSON)")
    Rel(fairgo, sentinel_dashboard, "Publishes scoring/risk events", "Kafka (JSON)")

    UpdateRelStyle(soc_analyst, sentinel_dashboard, $offsetX="-40", $offsetY="-10")
    UpdateRelStyle(soc_lead, sentinel_dashboard, $offsetX="40", $offsetY="-10")
```

```mermaid
C4Container
    title Sentinel Command Dashboard - Container Diagram

    Container(web_browser, "Web Browser", "Chrome/Firefox/Safari", "Provides the dashboard UI")

    ContainerDb(postgres, "PostgreSQL", "PostgreSQL 15", "Stores user accounts, alerts, audit logs")
    ContainerDb(influxdb, "InfluxDB", "InfluxDB 2.x", "Time-series metrics for API calls, IVR biometrics")
    ContainerDb(elasticsearch, "Elasticsearch", "Elasticsearch 8.x", "Indexes raw security events for fast querying")
    ContainerDb(pinecone, "Pinecone", "Pinecone", "Vector database for playbook fragments (RAG)")

    Container(kafka, "Apache Kafka", "Kafka 3.x + Zookeeper", "Central event bus for security events")

    Container(stream_processor, "Stream Processor", "Python + Faust", "Real-time event processing and AI anomaly detection")

    Container(sentinel_backend, "Sentinel Backend", "NestJS + TypeScript", "REST API and WebSocket gateway")

    Container(sentinel_frontend, "Sentinel Frontend", "Next.js + TypeScript", "React dashboard application")

    Rel(web_browser, sentinel_frontend, "Renders", "HTTPS")
    Rel(sentinel_frontend, sentinel_backend, "Fetches data & receives events", "REST + WebSocket")

    Rel(sentinel_backend, postgres, "Reads/writes user data, alerts", "SQL")
    Rel(sentinel_backend, influxdb, "Queries time-series metrics", "InfluxQL")
    Rel(sentinel_backend, elasticsearch, "Searches raw event logs", "Elasticsearch DSL")
    Rel(sentinel_backend, pinecone, "Retrieves playbook fragments", "REST API")

    Rel(stream_processor, kafka, "Consumes security events", "Kafka Consumer")
    Rel(stream_processor, sentinel_backend, "Pushes processed alerts", "WebSocket")
    Rel(stream_processor, pinecone, "Stores/retrieves ML models", "REST API")

    Rel(project_prism, kafka, "Publishes events", "Kafka Producer")
    Rel(ai_ivr, kafka, "Publishes voice events", "Kafka Producer")
    Rel(core_engines, kafka, "Publishes service events", "Kafka Producer")
    Rel(project_catalyst, kafka, "Publishes IAM events", "Kafka Producer")
    Rel(fairgo, kafka, "Publishes risk events", "Kafka Producer")

    UpdateRelStyle(web_browser, sentinel_frontend, $offsetX="0", $offsetY="-20")
    UpdateRelStyle(sentinel_frontend, sentinel_backend, $offsetX="0", $offsetY="-10")
```

**Architecture Principles Applied:**
- **Event-Driven Architecture (EDA):** All security events flow through Kafka for decoupling and scalability
- **CQRS Pattern:** Read models (Elasticsearch, InfluxDB) separated from write models (PostgreSQL)
- **Strangler Fig Pattern:** New Sentinel system wraps around existing IMOS services without disruption
- **Zero Trust:** Every component validates every request, no implicit trust

### 3. Ethical, Safety & Data Governance Plan

#### **Data Lineage Map**

```
Source System → Kafka Topic → Stream Processor → Storage → Backend → UI → Analyst
```

**Detailed Trace for PII Data:**

1. **Source: Project Prism API**
   - Raw Data: `user_id`, `ip_address`, `session_token`, `api_endpoint`, `request_body`
   - Event Schema: `{"event_type": "api_access", "user_id": "uuid", "ip": "192.168.1.1", "endpoint": "/api/v1/users", "timestamp": "2025-11-11T10:00:00Z"}`
   - Kafka Topic: `imos.security.api`
   - Stream Processor: Anonymizes `user_id` → `hashed_user_id`, geolocates `ip` → `country`, `region`
   - Storage: Elasticsearch (raw logs), InfluxDB (aggregated metrics)
   - Backend: Serves aggregated data only (no individual user tracking)
   - UI: Shows "API requests from India: 1,247 in last 24h"
   - Analyst Access: SOC_Analyst role sees aggregated metrics only

2. **Source: AI IVR System**
   - Raw Data: `voice_print_id`, `user_id`, `verification_result`, `liveness_score`, `attempt_count`
   - Event Schema: `{"event_type": "voice_biometric", "voice_print_id": "hashed_id", "result": "success|fail", "liveness_score": 0.95, "timestamp": "2025-11-11T10:00:00Z"}`
   - Kafka Topic: `imos.security.ivr`
   - Stream Processor: Aggregates by time window, flags brute force patterns
   - Storage: InfluxDB (time-series metrics), Elasticsearch (raw events for forensics)
   - Backend: Serves real-time metrics and critical alerts only
   - UI: Shows "Liveness Detection Failures: 23 in last hour"
   - Analyst Access: SOC_Lead role can investigate individual failures for security incidents

#### **Ethical Risk Register**

**Risk #1: AI False Positive Leading to Service Outage**
- **Description:** AI anomaly detector flags normal traffic as malicious, analyst executes "Isolate Service" playbook
- **Impact:** Critical business disruption (e.g., payment engine isolation during peak hours)
- **Likelihood:** Medium (during model learning phase)
- **Mitigation:**
  - **Mandatory HITL:** All destructive actions require explicit human authorization
  - **Friction Design:** "Isolate Service" button triggers modal: "TYPE 'ISOLATE' TO CONFIRM"
  - **RBAC Enforcement:** Only SOC_Lead role can execute isolation actions
  - **Graduated Response:** Start with "Alert Only" → "Throttle" → "Isolate" progression
  - **Circuit Breaker:** Automatic rollback after 5 minutes if no human confirmation

**Risk #2: Panopticon Effect (Internal Surveillance)**
- **Description:** Dashboard gives low-level analysts access to all privileged administrative activities
- **Impact:** Privacy violation, potential misuse of sensitive access logs
- **Likelihood:** High (if RBAC not properly implemented)
- **Mitigation:**
  - **Granular RBAC:** SOC_Analyst sees "Admin action occurred", SOC_Lead sees "Admin changed user permissions"
  - **Data Minimization:** UI shows aggregated metrics, not individual actions
  - **Audit Everything:** All data access logged in immutable audit trail
  - **Need-to-Know:** Analysts only see data relevant to their security responsibilities
  - **Regular Audits:** Quarterly review of access patterns and data usage

**Risk #3: AI Model Bias and Discrimination**
- **Description:** Anomaly model incorrectly flags traffic from high-traffic regions as malicious
- **Impact:** False alerts, wasted analyst time, potential service throttling
- **Likelihood:** Medium (during initial training and deployment)
- **Mitigation:**
  - **Bias Detection:** Regular model validation against diverse traffic patterns
  - **Feedback Loop:** "Mark as False Positive" button feeds back to training data
  - **Model Retraining:** Daily retraining on new traffic patterns
  - **Human Override:** Analysts can disable AI alerts for specific patterns
  - **Transparency:** Model decisions logged with confidence scores

**Risk #4: Single Point of Failure**
- **Description:** Sentinel Dashboard becomes critical infrastructure, its failure blinds security team
- **Impact:** Security monitoring blackout during critical incidents
- **Likelihood:** Low (with proper HA design)
- **Mitigation:**
  - **Defense in Depth:** Multiple monitoring layers (Grafana dashboards as backup)
  - **Fail-Safe Mode:** Dashboard failure triggers alerts via alternative channels
  - **Read-Only Mode:** Maintain visibility even if write operations fail
  - **Distributed Architecture:** No single point of failure in the system design

#### **Formal Data Governance Policy**

**Data Owner:** Head of Security (IMOS)  
**Data Stewards:** SOC Team Leads  
**Data Custodians:** DevOps and Platform Engineering Teams

**Access Control Matrix:**

| Role | Data Access Level | Actions Allowed | Audit Level |
|------|------------------|-----------------|-------------|
| **Executive** | Aggregated metrics only | Read dashboard | Basic (page views) |
| **SOC_Analyst** | Real-time alerts, aggregated metrics | Read, acknowledge alerts | Full (all actions) |
| **SOC_Lead** | All data including PII for investigations | Read, execute playbooks, override AI | Full + approval chain |
| **Admin** | System administration | Configure dashboard, manage users | Full + system changes |

**Data Retention Policy:**
- **Real-time Metrics (InfluxDB):** 90 days rolling window
- **Raw Event Logs (Elasticsearch):** 1 year with automated archiving
- **Alert History (PostgreSQL):** 7 years for compliance
- **Immutable Audit Logs:** 7 years, WORM storage (Write Once Read Many)

**Data Classification:**
- **Public:** Aggregated statistics, system health status
- **Internal:** Alert details, service metrics
- **Confidential:** User PII, authentication failures
- **Restricted:** Privileged access logs, AI model internals

---

## II. Frontend Blueprints (Mobile App & Websites)

### 4. Frontend & Mobile App UX/UI Master Plan

**Application Type:** Internal Enterprise Web Dashboard  
**Target Users:** SOC Analysts and Security Operations Teams  
**Design Philosophy:** High-Contrast, Alert-Driven, Information-Dense

**Not Applicable:** This is an internal security dashboard, not a public website or mobile app. The Landing Page Plan is skipped as specified.

### 5. Landing Page Structure Plan

**Status:** Not Applicable - Internal Security Dashboard

### 6. Frontend App Structure Plan (Next.js)

#### **Detailed Directory Tree (`src/`):**

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                    # Auth layout with security branding
│   │   └── login/
│   │       ├── page.tsx                  # MFA-enabled login page
│   │       └── mfa-challenge/page.tsx    # MFA verification page
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Main dashboard layout with sidebar
│   │   ├── war-room/page.tsx            # Module 1: Global threat map
│   │   ├── api-gateway/page.tsx         # Module 2: API metrics dashboard
│   │   ├── internal-monitor/page.tsx    # Module 3: Service communication grid
│   │   ├── iam-command/page.tsx         # Module 4: Identity & access monitoring
│   │   └── risk-center/page.tsx         # Module 5: Risk assessment & response
│   └── globals.css                       # Global styles with security theme
├── components/
│   ├── ui/                              # Shadcn/UI base components
│   │   ├── alert.tsx                    # Security alert components
│   │   ├── badge.tsx                    # Status and severity badges
│   │   ├── button.tsx                   # Action buttons with security states
│   │   ├── card.tsx                     # Information cards
│   │   ├── modal.tsx                    # Confirmation dialogs
│   │   └── table.tsx                    # Data tables with sorting
│   ├── layouts/
│   │   ├── dashboard-layout.tsx         # Main dashboard shell
│   │   ├── sidebar.tsx                  # Navigation with role-based menu
│   │   └── header.tsx                   # Top bar with DEFCON status
│   ├── charts/
│   │   ├── world-map.tsx                # D3-based interactive map
│   │   ├── service-grid.tsx             # Force-directed graph for services
│   │   ├── metrics-chart.tsx            # Recharts time-series plots
│   │   └── risk-gauge.tsx               # Radial gauge for risk levels
│   └── security/
│       ├── defcon-status.tsx            # DEFCON level indicator
│       ├── alert-ticker.tsx             # Scrolling critical alerts
│       ├── risk-feed.tsx                # Prioritized alert list
│       └── playbook-panel.tsx           # Response action interface
├── features/
│   ├── war-room/
│   │   ├── world-map-view.tsx           # Full-screen threat map
│   │   ├── threat-overlay.tsx           # Real-time threat markers
│   │   └── geolocation-service.ts       # IP to coordinate mapping
│   ├── api-gateway/
│   │   ├── endpoint-table.tsx           # API endpoint monitoring
│   │   ├── rate-limit-dashboard.tsx     # Rate limiting visualization
│   │   └── attack-vector-chart.tsx      # Top attack patterns
│   ├── internal-monitor/
│   │   ├── service-grid.tsx             # Service communication visualization
│   │   ├── anomaly-alert.tsx            # AI-detected anomaly overlay
│   │   └── traffic-flow.tsx             # Real-time communication lines
│   ├── iam-command/
│   │   ├── privileged-log-viewer.tsx    # Admin action logs
│   │   ├── voice-biometrics-panel.tsx   # IVR authentication monitoring
│   │   ├── fairgo-score-monitor.tsx     # User risk scoring
│   │   └── catalyst-access-log.tsx      # Privileged access events
│   └── risk-center/
│       ├── risk-assessment-feed.tsx     # AI-prioritized alerts
│       ├── playbook-generator.tsx       # AI-generated response plans
│       ├── big-red-buttons.tsx          # Critical action interface
│       └── response-audit-log.tsx       # Action execution history
├── lib/
│   ├── api.ts                           # REST API client with auth
│   ├── socket.ts                        # WebSocket client setup
│   ├── auth.ts                          # Authentication utilities
│   ├── validation.ts                    # Input validation schemas
│   └── security-utils.ts                # Security-related utilities
├── hooks/
│   ├── use-auth.ts                      # Authentication state
│   ├── use-socket.ts                    # WebSocket connection
│   ├── use-defcon.ts                    # DEFCON status management
│   ├── use-alerts.ts                    # Real-time alert handling
│   └── use-metrics.ts                   # Time-series data fetching
├── stores/
│   ├── auth.store.ts                    # Zustand auth state
│   ├── alert.store.ts                   # Real-time alert state
│   ├── defcon.store.ts                  # DEFCON level state
│   ├── metrics.store.ts                 # Time-series metrics cache
│   └── ivr.store.ts                     # IVR-specific state
├── types/
│   ├── security.ts                      # Security domain types
│   ├── api.ts                           # API response types
│   ├── socket.ts                        # WebSocket event types
│   └── user.ts                          # User and role types
└── utils/
    ├── date-utils.ts                    # Date formatting for security events
    ├── geo-utils.ts                     # Geolocation utilities
    ├── risk-calculation.ts              # Risk scoring algorithms
    └── encryption.ts                    # Client-side encryption utilities
```

#### **State Management Strategy**

**Zustand Stores (Real-Time State):**
- **Alert Store:** Manages live alert stream, acknowledgment state, filtering
- **DEFCON Store:** Global security posture state, automatic escalation logic
- **Metrics Store:** Cached time-series data with automatic refresh
- **IVR Store:** Voice biometric metrics and critical event tracking

**React Query (Server State):**
- **API Metrics:** Endpoint performance, rate limiting, error rates
- **IAM Logs:** Privileged access logs, user activity history
- **Historical Alerts:** Past alert resolution status and trends
- **Playbook Library:** Available response templates and execution history

#### **Component Architecture**

**Atomic Design Pattern:**
- **Atoms:** UI primitives (Button, Badge, Input)
- **Molecules:** Composite UI elements (AlertCard, MetricChart)
- **Organisms:** Complex features (WorldMap, ServiceGrid)
- **Templates:** Page layouts (DashboardLayout, AuthLayout)
- **Pages:** Route-level components (WarRoomPage, RiskCenterPage)

**Performance Optimizations:**
- **Code Splitting:** Route-based splitting for each module
- **Virtual Scrolling:** For large alert lists and log viewers
- **Memoization:** Expensive calculations (risk scoring, geolocation)
- **WebWorkers:** Heavy computations (map rendering, data processing)

---

## III. Dashboard Blueprints (Role-Specific)

### 7. User Dashboard Plan

**Status:** Merged with Admin Dashboard Plan - Single dashboard with role-based feature access

### 8. Admin Dashboard Plan

#### **Wireframe Specifications for 5 Core Modules**

**Module 1: War Room (Global Threat Visualization)**
```
┌─────────────────────────────────────────────────────────┐
│ DEFCON 2                    [11:45:23] LIVE             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │                    WORLD MAP                        │ │
│ │                                                     │ │
│ │  [RED DOT] Attack from Russia (DDoS)               │ │
│ │  [YELLOW DOT] Suspicious login from China          │ │
│ │  [BLUE DOT] High-risk user activity                │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 🚨 CRITICAL: DDoS attack on API Gateway from 185.XXX.XXX.XXX │
│ 🚨 WARNING: Multiple failed logins from TOR exit nodes       │
│ 🚨 INFO: Unusual traffic spike in Payment Engine             │
└─────────────────────────────────────────────────────────┘
```

**Module 2: API Gateway (Endpoint Monitoring)**
```
┌─────────────────────────────────────────────────────────┐
│ API Gateway Monitor              [Refresh: 30s]         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────┬──────┬──────┬──────┐     │
│ │ Endpoint        │ Method  │ 2xx  │ 4xx  │ 5xx  │     │
│ ├─────────────────┼─────────┼──────┼──────┼──────┤     │
│ │ /api/v1/users   │ GET     │ 1247 │ 23   │ 0    │     │
│ │ /api/v1/payments│ POST    │ 892  │ 45   │ 2    │     │
│ │ /api/v1/marketpl│ GET     │ 2156 │ 12   │ 1    │     │
│ └─────────────────┴─────────┴──────┴──────┴──────┘     │
├─────────────────────────────────────────────────────────┤
│ Top Attack Vectors:                                    │
│ 1. SQL Injection attempts: 45                          │
│ 2. Rate limit violations: 23                           │
│ 3. Unauthorized endpoint access: 12                    │
└─────────────────────────────────────────────────────────┘
```

**Module 3: Internal Monitor (Service Communication Grid)**
```
┌─────────────────────────────────────────────────────────┐
│ Internal Service Monitor         DEFCON: 3             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [NODE] Marketplace ───── [GREEN LINE] ───► [NODE] Trust │
│ │     ▲                                                │ │
│ │     │ [RED FLASHING LINE]                            │ │
│ │ [NODE] Payment ───── [YELLOW LINE] ───► [NODE] Trust │ │
│ │                                                     │ │
│ │ [ALERT OVERLAY]                                     │ │
│ │ 🚨 ANOMALY DETECTED: Unauthorized East-West traffic │ │
│ │    Payment → Trust (port 443)                       │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Service Health:                                        │
│ 🟢 Marketplace: 99.9% uptime                           │
│ 🟡 Trust Engine: Degraded response time                │
│ 🟢 Payment: Normal operation                           │
└─────────────────────────────────────────────────────────┘
```

**Module 4: IAM Command (Identity & Access Management)**
```
┌─────────────────────────────────────────────────────────┐
│ Identity & Access Management     [Real-time]           │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────────────┐     │
│ │ Verification│ Liveness   │ Brute Force         │     │
│ │ Success     │ Detection  │ Attempts            │     │
│ │ Rate        │ Failures   │ (24h)               │     │
│ ├─────────────┼─────────────┼─────────────────────┤     │
│ │ 98.5%       │ 23         │ 12                   │     │
│ └─────────────┴─────────────┴─────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│ Recent Events:                                         │
│ [11:42] FAIL: User kailas failed liveness check        │
│ [11:38] BLOCK: Brute force detected on user_456        │
│ [11:35] SUCCESS: Voice verification for admin_user     │
│ [11:30] WARN: Unusual login pattern from IP 10.0.0.1   │
├─────────────────────────────────────────────────────────┤
│ Privileged Actions (Last 24h):                         │
│ • Admin changed user permissions (2)                   │
│ • System configuration updated (1)                     │
│ • Security policy modified (1)                         │
└─────────────────────────────────────────────────────────┘
```

**Module 5: Risk Center (AI-Driven Response)**
```
┌─────────────────────────────────────────────────────────┐
│ Risk Center                     [AI-Prioritized]        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL: DDoS Attack on API Gateway            │ │
│ │    Risk Score: 95/100 | AI Confidence: High        │ │
│ │                                                    │ │
│ │ 🟡 HIGH: Multiple Failed Voice Authentications     │ │
│ │    Risk Score: 78/100 | AI Confidence: Medium      │ │
│ │                                                    │ │
│ │ 🟢 MEDIUM: Unusual API Traffic Pattern             │ │
│ │    Risk Score: 45/100 | AI Confidence: Low         │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Response Actions:                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [BIG RED BUTTON] Isolate Service                    │ │
│ │ Requires: SOC Lead approval                         │ │
│ │ Impact: High | Rollback: Auto (5 min)              │ │
│ │                                                    │ │
│ │ [BLUE BUTTON] Throttle Traffic                      │ │
│ │ Requires: SOC Analyst approval                      │ │
│ │ Impact: Medium | Rollback: Manual                  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **UI/UX Principles**

**Color Coding:**
- **Red (#DC2626):** Critical threats, DEFCON 1, destructive actions
- **Orange (#EA580C):** High priority, warnings, DEFCON 2
- **Yellow (#CA8A04):** Medium priority, DEFCON 3-4
- **Green (#16A34A):** Normal operation, DEFCON 5
- **Blue (#2563EB):** Information, neutral actions

**Typography Scale:**
- **H1:** 24px - Module titles
- **H2:** 18px - Section headers
- **Body:** 14px - Data tables, descriptions
- **Small:** 12px - Metadata, timestamps

**Interaction Patterns:**
- **Hover:** Highlight actionable elements
- **Click:** Drill down into details
- **Double-click:** Quick actions (acknowledge alert)
- **Right-click:** Context menu for additional options

---

## IV. Backend & API Blueprints

### 9. Backend Architecture Plan (NestJS Modular Monolith)

#### **Module Structure**

```
src/
├── app.module.ts                    # Root application module
├── main.ts                          # Application bootstrap
├── config/                          # Configuration management
│   ├── database.config.ts
│   ├── kafka.config.ts
│   └── security.config.ts
├── modules/
│   ├── auth/                        # Authentication & authorization
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── mfa.strategy.ts
│   │   └── guards/
│   │       ├── roles.guard.ts
│   │       └── mfa.guard.ts
│   ├── realtime/                    # WebSocket gateway
│   │   ├── realtime.module.ts
│   │   ├── realtime.gateway.ts
│   │   ├── realtime.service.ts
│   │   └── events/
│   │       ├── alert.events.ts
│   │       └── metric.events.ts
│   ├── ingestion/                   # Fallback HTTP ingestion
│   │   ├── ingestion.module.ts
│   │   ├── ingestion.controller.ts
│   │   └── ingestion.service.ts
│   ├── api-metrics/                 # InfluxDB integration
│   │   ├── api-metrics.module.ts
│   │   ├── api-metrics.service.ts
│   │   └── api-metrics.controller.ts
│   ├── iam/                         # Identity management
│   │   ├── iam.module.ts
│   │   ├── iam.service.ts
│   │   └── iam.controller.ts
│   └── risk-response/               # AI response system
│       ├── risk-response.module.ts
│       ├── risk-response.service.ts
│       ├── risk-response.controller.ts
│       └── playbooks/
│           ├── isolate-service.playbook.ts
│           └── throttle-traffic.playbook.ts
├── common/
│   ├── decorators/
│   │   ├── audit-log.decorator.ts
│   │   └── rate-limit.decorator.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── validation.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── rbac.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── response.interceptor.ts
│   └── utils/
│       ├── encryption.util.ts
│       └── validation.util.ts
├── entities/                        # TypeORM entities
│   ├── user.entity.ts
│   ├── alert.entity.ts
│   └── audit-log.entity.ts
└── migrations/                      # Database migrations
    ├── 001-create-users.ts
    ├── 002-create-alerts.ts
    └── 003-create-audit-logs.ts
```

#### **Architecture Patterns Applied**

**Modular Monolith:**
- Clear separation of concerns with dedicated modules
- Shared kernel for common utilities and entities
- Easy testing and maintenance within single deployable unit

**CQRS Pattern:**
- Command side: Alert creation, user management, response execution
- Query side: Metrics retrieval, log searching, dashboard data

**Observer Pattern:**
- Event-driven communication between modules
- Loose coupling between security event producers and consumers

### 10. API Endpoint Specification (REST API & WebSocket Events)

#### **REST API Endpoints**

**Authentication Endpoints:**
```typescript
POST /api/v1/auth/login
Body: { email: string, password: string }
Response: { access_token: string, refresh_token: string, mfa_required: boolean }

POST /api/v1/auth/mfa/verify
Body: { mfa_token: string, code: string }
Response: { access_token: string, user: User }

POST /api/v1/auth/refresh
Body: { refresh_token: string }
Response: { access_token: string }
```

**Dashboard Data Endpoints:**
```typescript
GET /api/v1/dashboard/overview
Response: { defcon_level: number, active_alerts: number, system_health: object }

GET /api/v1/metrics/api/endpoints
Query: { timeframe: '1h' | '24h' | '7d' }
Response: { endpoints: Array<{ path: string, method: string, metrics: object }> }

GET /api/v1/metrics/ivr/biometrics
Query: { timeframe: '1h' | '24h' | '7d' }
Response: { success_rate: number, failures: number, brute_force_attempts: number }
```

**Alert Management Endpoints:**
```typescript
GET /api/v1/alerts
Query: { status: 'new' | 'acknowledged' | 'resolved', priority: 'high' | 'medium' | 'low' }
Response: { alerts: Alert[], total: number }

POST /api/v1/alerts/{id}/acknowledge
Body: { comment?: string }
Response: { success: boolean }

GET /api/v1/risk/feed
Response: { risks: Array<{ id: string, title: string, risk_score: number, ai_confidence: string }> }
```

**Response Action Endpoints:**
```typescript
GET /api/v1/response/playbooks/{alert_id}
Response: { playbook: object, requires_approval: boolean }

POST /api/v1/response/execute
Body: { action: 'ISOLATE_SERVICE' | 'THROTTLE_TRAFFIC', target: string, justification: string }
Headers: { 'X-SOC-Approval': 'SOC_LEAD_SIGNATURE' }
Response: { execution_id: string, status: 'pending' | 'executed' | 'failed' }
```

#### **WebSocket Events**

**Real-Time Alert Events:**
```typescript
// DEFCON Status Changes
event: 'defcon_update'
data: { level: 1 | 2 | 3 | 4 | 5, reason: string, timestamp: string }

// New Security Alerts
event: 'new_alert'
data: {
  id: string,
  title: string,
  description: string,
  severity: 'critical' | 'high' | 'medium' | 'low',
  source: string,
  timestamp: string,
  location?: { lat: number, lon: number }
}

// Alert Updates
event: 'alert_update'
data: { id: string, status: 'acknowledged' | 'resolved', updated_by: string }
```

**Real-Time Metrics Events:**
```typescript
// API Metrics Updates
event: 'api_metrics_update'
data: {
  endpoint: string,
  method: string,
  response_time: number,
  status_code: number,
  timestamp: string
}

// IVR Biometrics Updates
event: 'ivr_biometric_update'
data: {
  event_type: 'verification' | 'liveness' | 'failure',
  success: boolean,
  user_id?: string, // anonymized
  timestamp: string
}

// Service Health Updates
event: 'service_health_update'
data: {
  service_name: string,
  status: 'healthy' | 'degraded' | 'critical',
  metrics: { cpu: number, memory: number, response_time: number }
}
```

**System Status Events:**
```typescript
// Infrastructure Changes
event: 'infrastructure_change'
data: {
  type: 'service_down' | 'service_up' | 'high_load',
  service: string,
  details: object
}

// AI Model Updates
event: 'ai_model_update'
data: {
  model: 'anomaly_detector' | 'risk_assessor',
  status: 'retraining' | 'updated' | 'failed',
  accuracy?: number
}
```

### 11. Database Schema & Migration Plan

#### **PostgreSQL Schema (TypeORM Entities)**

```sql
-- Users and Authentication
CREATE TYPE user_role AS ENUM ('Executive', 'SOC_Analyst', 'SOC_Lead', 'Admin');
CREATE TYPE mfa_status AS ENUM ('disabled', 'enabled', 'required');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'SOC_Analyst',
    mfa_status mfa_status NOT NULL DEFAULT 'disabled',
    mfa_secret VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Alerts
CREATE TYPE alert_status AS ENUM ('new', 'acknowledged', 'investigating', 'resolved', 'false_positive');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity alert_severity NOT NULL,
    status alert_status NOT NULL DEFAULT 'new',
    source_service VARCHAR(100) NOT NULL,
    source_ip INET,
    user_id UUID, -- anonymized user identifier
    raw_event JSONB, -- original event data
    ai_risk_score DECIMAL(3,2), -- 0.00 to 1.00
    ai_confidence VARCHAR(20), -- 'high', 'medium', 'low'
    assigned_to UUID REFERENCES users(id),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable Audit Log
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_log_2025_11 PARTITION OF audit_log
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Response Actions
CREATE TYPE action_status AS ENUM ('pending', 'approved', 'executed', 'failed', 'cancelled');
CREATE TYPE action_type AS ENUM ('isolate_service', 'throttle_traffic', 'block_ip', 'reset_password', 'alert_only');

CREATE TABLE response_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id),
    action_type action_type NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    parameters JSONB, -- action-specific parameters
    status action_status NOT NULL DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    executed_by UUID REFERENCES users(id),
    executed_at TIMESTAMPTZ,
    execution_result JSONB,
    rollback_available BOOLEAN NOT NULL DEFAULT FALSE,
    rollback_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Model Performance Tracking
CREATE TABLE ai_model_metrics (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'accuracy', 'precision', 'recall', 'f1_score'
    metric_value DECIMAL(5,4) NOT NULL,
    sample_size INTEGER NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_alerts_status_severity ON alerts(status, severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_source_service ON alerts(source_service);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, timestamp DESC);
CREATE INDEX idx_response_actions_status ON response_actions(status);
CREATE INDEX idx_response_actions_alert ON response_actions(alert_id);
```

#### **InfluxDB Schema (Time-Series Metrics)**

```influxql
-- API Gateway Metrics
CREATE MEASUREMENT api_requests
WITH FIELDS
    count: INTEGER,
    response_time: FLOAT,
    error_count: INTEGER
WITH TAGS
    endpoint: STRING,
    method: STRING,
    status_code_group: STRING, -- '2xx', '4xx', '5xx'
    service_name: STRING

-- IVR Biometrics Metrics
CREATE MEASUREMENT ivr_biometrics
WITH FIELDS
    count: INTEGER,
    success_rate: FLOAT,
    average_liveness_score: FLOAT
WITH TAGS
    event_type: STRING, -- 'verification', 'liveness_check', 'failure'
    status: STRING, -- 'success', 'fail', 'blocked'
    failure_reason: STRING

-- Service Health Metrics
CREATE MEASUREMENT service_health
WITH FIELDS
    cpu_usage: FLOAT,
    memory_usage: FLOAT,
    disk_usage: FLOAT,
    response_time: FLOAT,
    active_connections: INTEGER,
    error_rate: FLOAT
WITH TAGS
    service_name: STRING,
    host: STRING

-- Security Events (aggregated)
CREATE MEASUREMENT security_events
WITH FIELDS
    count: INTEGER,
    unique_ips: INTEGER,
    unique_users: INTEGER
WITH TAGS
    event_type: STRING,
    severity: STRING,
    source_service: STRING
```

#### **Elasticsearch Index Mappings**

```json
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "service": { "type": "keyword" },
      "level": { "type": "keyword" },
      "message": { "type": "text", "analyzer": "standard" },
      "user_id": { "type": "keyword", "index": false },
      "hashed_user_id": { "type": "keyword" },
      "ip_address": { "type": "ip" },
      "country": { "type": "keyword" },
      "region": { "type": "keyword" },
      "request_body": { "type": "object", "enabled": false },
      "response_body": { "type": "object", "enabled": false },
      "error_stack": { "type": "text" },
      "session_id": { "type": "keyword" },
      "user_agent": { "type": "text", "analyzer": "user_agent" },
      "event_metadata": { "type": "object" }
    }
  },
  "settings": {
    "index": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    }
  }
}
```

---

## V. Dependencies, Operations & Quality Blueprints

### 12. Dependencies & Tooling Plan

#### **Complete Bill of Materials**

**Frontend Dependencies:**
```json
{
  "dependencies": {
    "next": "^15.3.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.0",
    "socket.io-client": "^4.7.0",
    "recharts": "^2.8.0",
    "d3": "^7.8.0",
    "deck.gl": "^8.9.0",
    "lucide-react": "^0.302.0",
    "tailwindcss": "^3.4.0",
    "shadcn-ui": "^0.8.0",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0"
  }
}
```

**Backend Dependencies:**
```json
{
  "dependencies": {
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.1.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "socket.io": "^4.7.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.0",
    "@types/bcrypt": "^5.0.0",
    "@nestjs/testing": "^10.3.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

**Data Processing Dependencies:**
```python
# requirements.txt
faust-streaming==0.10.0
kafka-python==2.0.2
scikit-learn==1.3.0
tensorflow==2.15.0
pandas==2.1.0
numpy==1.24.0
influxdb-client==1.36.0
elasticsearch==8.11.0
pinecone-client==2.2.0
langchain==0.1.0
openai==1.3.0
python-dotenv==1.0.0
structlog==23.2.0
```

#### **Local Development Environment**

**Docker Compose Configuration:**
```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sentinel
      POSTGRES_USER: sentinel
      POSTGRES_PASSWORD: sentinel_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init/sentinel-init.sql:/docker-entrypoint-initdb.d/init.sql

  influxdb:
    image: influxdb:2.7
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: admin
      DOCKER_INFLUXDB_INIT_PASSWORD: admin_password
      DOCKER_INFLUXDB_INIT_ORG: imos
      DOCKER_INFLUXDB_INIT_BUCKET: sentinel
    volumes:
      - influxdb_data:/var/lib/influxdb2

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      discovery.type: single-node
      xpack.security.enabled: false
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  stream-processor:
    build: ./services/stream-processor
    depends_on:
      - kafka
      - influxdb
      - elasticsearch
    environment:
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      INFLUXDB_URL: http://influxdb:8086
      ELASTICSEARCH_HOST: elasticsearch
    volumes:
      - ./services/stream-processor:/app

  backend:
    build: ./services/backend
    depends_on:
      - postgres
      - kafka
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://sentinel:sentinel_password@postgres:5432/sentinel
      KAFKA_BROKER: kafka:29092
      JWT_SECRET: development_jwt_secret
    volumes:
      - ./services/backend:/app
      - /app/node_modules

  frontend:
    build: ./services/frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_WS_URL: ws://localhost:3001
    volumes:
      - ./services/frontend:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  influxdb_data:
  elasticsearch_data:
```

### 13. AI/ML Model & MLOps Plan

#### **Model 1: Internal Traffic Anomaly Detector**

**Objective:** Detect unauthorized East-West communication patterns between IMOS services

**Algorithm Selection:**
- **Primary:** Isolation Forest (unsupervised anomaly detection)
- **Secondary:** Autoencoder Neural Network (deep learning approach)
- **Why:** Isolation Forest is efficient for high-dimensional data and doesn't require normal/abnormal labels

**Feature Engineering:**
```python
features = [
    'source_service',      # categorical: marketplace, payment, trust, etc.
    'target_service',      # categorical: destination service
    'port',               # numerical: communication port
    'protocol',           # categorical: http, https, tcp, udp
    'request_size',       # numerical: payload size in bytes
    'response_time',      # numerical: service response time
    'frequency',          # numerical: requests per minute
    'time_of_day',        # cyclical: hour of day (sine/cosine encoded)
    'day_of_week',        # cyclical: day of week (sine/cosine encoded)
]
```

**Training Pipeline:**
```python
# Data Collection (24-hour baseline)
kafka_consumer = KafkaConsumer('imos.security.internal')
training_data = []

for message in consumer:
    event = json.loads(message.value)
    features = extract_features(event)
    training_data.append(features)

# Model Training
from sklearn.ensemble import IsolationForest

model = IsolationForest(
    n_estimators=100,
    contamination=0.01,  # Expected anomaly rate
    random_state=42
)

model.fit(training_data)

# Model Evaluation
scores = model.decision_function(validation_data)
predictions = model.predict(validation_data)  # -1 for anomalies, 1 for normal
```

**Deployment Architecture:**
```
Kafka Topic: imos.security.internal
    ↓
Stream Processor (Faust)
    ↓ Feature Extraction
    ↓ Model Inference
    ↓ Anomaly Detection
    ↓ Alert Generation
    ↓ WebSocket Broadcast
```

**MLOps Pipeline:**
- **Daily Retraining:** Model retrained every 24 hours on new traffic patterns
- **Model Registry:** Models versioned and stored in MLflow
- **A/B Testing:** New models tested against live traffic before deployment
- **Drift Detection:** Statistical tests to detect concept drift in traffic patterns

#### **Model 2: AI Risk & Response Agent**

**Architecture:** LangChain Agent with RAG (Retrieval-Augmented Generation)

**Agentic Workflow:**
```python
from langchain.agents import initialize_agent
from langchain.vectorstores import Pinecone
from langchain.llms import OpenAI

# Initialize Vector Store for Playbooks
vectorstore = Pinecone.from_existing_index(
    index_name="sentinel-playbooks",
    embedding=OpenAIEmbeddings()
)

# Define Agent Tools
tools = [
    Tool(
        name="Search_Playbooks",
        func=lambda query: vectorstore.similarity_search(query, k=3),
        description="Search for relevant security playbooks"
    ),
    Tool(
        name="Assess_Risk",
        func=calculate_risk_score,
        description="Calculate risk score for security event"
    ),
    Tool(
        name="Generate_Response",
        func=generate_response_plan,
        description="Generate automated response plan"
    )
]

# Initialize Agent
agent = initialize_agent(
    tools=tools,
    llm=OpenAI(temperature=0.1),  # Low temperature for consistent responses
    agent_type="zero-shot-react-description",
    verbose=True
)
```

**HITL Workflow Implementation:**
```python
async def process_security_event(event: dict):
    # Step 1: AI Risk Assessment
    risk_assessment = await agent.arun(
        f"Assess the risk level of this security event: {json.dumps(event)}"
    )
    
    # Step 2: Generate Response Playbook
    playbook = await agent.arun(
        f"Generate a response playbook for: {risk_assessment}"
    )
    
    # Step 3: HITL Gate - Store for Human Review
    alert = await create_alert({
        'event': event,
        'risk_assessment': risk_assessment,
        'playbook': playbook,
        'status': 'pending_human_review'
    })
    
    # Step 4: Notify SOC Analysts via WebSocket
    await websocket_broadcast('new_alert', alert)
    
    # Step 5: Wait for Human Authorization
    # (Handled by frontend - SOC Lead must click "Approve" button)
    
    return alert
```

**RAG Implementation:**
- **Document Chunking:** Security playbooks split into actionable fragments
- **Embedding:** OpenAI Ada-002 for semantic search
- **Retrieval:** Similarity search with relevance scoring
- **Generation:** GPT-4 with few-shot examples of successful responses

### 14. Deployment, CI/CD & Observability Plan

#### **Complete CI/CD Pipeline**

```yaml
name: Sentinel Security Dashboard CI/CD
on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  security_scan:
    name: Security Scan & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript check
        run: npx tsc --noEmit
      
      - name: Security audit
        run: npm audit --audit-level high
      
      - name: Run SAST (Semgrep)
        uses: semgrep/semgrep-action@v1
        with:
          config: p/security-audit

  test:
    name: Unit & Integration Tests
    needs: security_scan
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      kafka:
        image: confluentinc/cp-kafka:7.4.0
        env:
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
        options: >-
          --health-cmd "kafka-broker-api-versions --bootstrap-server localhost:9092"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build_and_push:
    name: Build & Push Docker Images
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./services/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-backend
          labels: ${{ steps.meta.outputs.labels }}
      
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./services/frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-frontend
          labels: ${{ steps.meta.outputs.labels }}
      
      - name: Build and push stream processor
        uses: docker/build-push-action@v5
        with:
          context: ./services/stream-processor
          push: true
          tags: ${{ steps.meta.outputs.tags }}-stream-processor
          labels: ${{ steps.meta.outputs.labels }}

  deploy_staging:
    name: Deploy to Staging
    needs: build_and_push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Update staging deployment
        run: |
          aws eks update-kubeconfig --region us-east-1 --name sentinel-staging
          kubectl apply -f k8s/staging/
          kubectl rollout status deployment/sentinel-backend
          kubectl rollout status deployment/sentinel-frontend

  deploy_production:
    name: Deploy to Production
    needs: deploy_staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Update production deployment
        run: |
          aws eks update-kubeconfig --region us-east-1 --name sentinel-production
          kubectl apply -f k8s/production/
          kubectl rollout status deployment/sentinel-backend
          kubectl rollout status deployment/sentinel-frontend
```

#### **Environment Strategy**

**Development Environment:**
- Local Docker Compose stack
- Hot reloading enabled
- Mock data generators for testing
- No external dependencies required

**Staging Environment:**
- Near-production AWS EKS cluster
- Consumes from staging Kafka topics
- Full security controls enabled
- Used for integration testing and UAT

**Production Environment:**
- Production AWS EKS cluster
- High availability with multi-AZ deployment
- Full security hardening
- Zero-downtime deployments with blue-green strategy

#### **Observability Strategy**

**Metrics Collection (Prometheus):**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sentinel-backend'
    static_configs:
      - targets: ['sentinel-backend:3001']
    metrics_path: '/metrics'
    
  - job_name: 'sentinel-frontend'
    static_configs:
      - targets: ['sentinel-frontend:3000']
    metrics_path: '/metrics'
    
  - job_name: 'stream-processor'
    static_configs:
      - targets: ['stream-processor:8000']
    metrics_path: '/metrics'
    
  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka:9092']
    metrics_path: '/metrics'
```

**Logging Strategy (Loki + Promtail):**
- **Application Logs:** Structured JSON with correlation IDs
- **Security Events:** Indexed in Elasticsearch with retention policies
- **Audit Logs:** Immutable WORM storage with cryptographic signatures
- **Error Tracking:** Sentry integration for runtime error monitoring

**Distributed Tracing (Tempo + OpenTelemetry):**
```typescript
// Backend tracing setup
import { Tracer } from '@opentelemetry/api';

const tracer = trace.getTracer('sentinel-backend');

@Injectable()
export class TracingService {
  async traceSecurityEvent(event: any) {
    const span = tracer.startSpan('process_security_event');
    span.setAttribute('event.type', event.type);
    span.setAttribute('event.source', event.source);
    
    try {
      // Process event
      await this.processEvent(event);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### 15. Mandatory TDD/BDD Workflow & Testing Plan

#### **Testing Pyramid Strategy**

**Unit Tests (70% coverage target):**
- **Jest** for JavaScript/TypeScript components
- **Pytest** for Python stream processing and AI models
- **Test Coverage:** Minimum 85% line coverage required

**Integration Tests (20% coverage target):**
- **API Integration:** Test NestJS controllers with real PostgreSQL
- **WebSocket Integration:** Test real-time event broadcasting
- **Kafka Integration:** Test event ingestion and processing
- **Database Integration:** Test migrations and data consistency

**End-to-End Tests (10% coverage target):**
- **Cypress** for complete user workflows
- **Playwright** for cross-browser compatibility
- **Chaos Engineering:** Test system resilience under failure conditions

#### **Critical E2E Test Scenarios**

**Scenario 1: Happy Path - SOC Analyst Login & Dashboard Access**
```typescript
// cypress/integration/auth.spec.ts
describe('Authentication Flow', () => {
  it('should allow SOC analyst to login and access dashboard', () => {
    cy.visit('/login');
    
    // Enter credentials
    cy.get('[data-cy=email]').type('analyst@imos.com');
    cy.get('[data-cy=password]').type('secure_password');
    
    // MFA challenge
    cy.get('[data-cy=mfa-code]').type('123456');
    cy.get('[data-cy=login-button]').click();
    
    // Verify dashboard access
    cy.url().should('include', '/war-room');
    cy.get('[data-cy=defcon-status]').should('be.visible');
    cy.get('[data-cy=alert-ticker]').should('be.visible');
  });
});
```

**Scenario 2: Critical Alert - AI Anomaly Detection**
```typescript
// cypress/integration/anomaly-detection.spec.ts
describe('AI Anomaly Detection', () => {
  it('should detect unauthorized East-West traffic and trigger DEFCON 1', () => {
    // Setup: Publish anomalous event to Kafka
    cy.task('publishKafkaEvent', {
      topic: 'imos.security.internal',
      event: {
        source_service: 'payment',
        target_service: 'trust',
        port: 443,
        protocol: 'https',
        anomaly_score: 0.95
      }
    });
    
    // Verify DEFCON escalation
    cy.get('[data-cy=defcon-status]', { timeout: 10000 })
      .should('contain', 'DEFCON 1');
    
    // Verify alert appears in grid
    cy.get('[data-cy=service-grid]')
      .find('[data-cy=anomaly-overlay]')
      .should('be.visible');
    
    // Verify alert in risk feed
    cy.get('[data-cy=risk-feed]')
      .find('[data-cy=critical-alert]')
      .should('contain', 'Unauthorized East-West traffic');
  });
});
```

**Scenario 3: HITL Response - Service Isolation**
```typescript
// cypress/integration/hitl-response.spec.ts
describe('Human-in-the-Loop Response', () => {
  it('should require SOC Lead approval for destructive actions', () => {
    // Setup: Login as SOC Analyst (not Lead)
    cy.login('analyst@imos.com', 'password');
    
    // Navigate to critical alert
    cy.get('[data-cy=critical-alert]').first().click();
    
    // Verify playbook is displayed
    cy.get('[data-cy=response-playbook]').should('be.visible');
    
    // Attempt to execute "Isolate Service"
    cy.get('[data-cy=isolate-service-button]').click();
    
    // Verify confirmation modal appears
    cy.get('[data-cy=confirmation-modal]').should('be.visible');
    cy.get('[data-cy=confirmation-input]').type('ISOLATE');
    cy.get('[data-cy=confirm-button]').click();
    
    // Verify authorization required message
    cy.get('[data-cy=authorization-required]')
      .should('contain', 'SOC Lead approval required');
    
    // Switch to SOC Lead account
    cy.switchUser('lead@imos.com');
    
    // Verify button is now enabled
    cy.get('[data-cy=isolate-service-button]').should('not.be.disabled');
    
    // Execute action
    cy.get('[data-cy=isolate-service-button]').click();
    cy.get('[data-cy=confirmation-input]').type('ISOLATE');
    cy.get('[data-cy=confirm-button]').click();
    
    // Verify action executed and logged
    cy.get('[data-cy=action-status]').should('contain', 'Executed');
    cy.get('[data-cy=audit-log]').should('contain', 'Service isolation executed');
  });
});
```

**Scenario 4: IVR Voice Biometric Failure Monitoring**
```typescript
// cypress/integration/ivr-monitoring.spec.ts
describe('IVR Biometric Security Monitoring', () => {
  it('should track voice authentication failures and detect brute force', () => {
    // Setup: Publish IVR failure events
    cy.task('publishKafkaEvent', {
      topic: 'imos.security.ivr',
      event: {
        event_type: 'voice_biometric',
        result: 'fail',
        liveness_score: 0.2,
        attempt_count: 5
      }
    });
    
    // Navigate to IAM Command module
    cy.get('[data-cy=iam-command-tab]').click();
    
    // Verify metrics update
    cy.get('[data-cy=liveness-failures]', { timeout: 5000 })
      .should('contain', '23'); // Increased by 1
    
    // Verify brute force detection
    cy.get('[data-cy=brute-force-attempts]')
      .should('contain', '12'); // Increased by 1
    
    // Verify critical event in log feed
    cy.get('[data-cy=voice-events-feed]')
      .should('contain', 'Brute force detected');
    
    // Verify alert generation
    cy.get('[data-cy=risk-feed]')
      .find('[data-cy=high-alert]')
      .should('contain', 'Multiple failed voice authentications');
  });
});
```

#### **Chaos Engineering GameDay Plan**

**Experiment 1: Kafka Topic Failure**
- **Objective:** Test system resilience when Kafka becomes unavailable
- **Method:** Use Chaos Mesh to partition Kafka from stream processor
- **Duration:** 10 minutes
- **Expected Behavior:** 
  - Alerts continue to be stored locally and replayed when Kafka recovers
  - Frontend shows "Degraded" status but remains functional
  - Recovery time < 5 minutes with no data loss

**Experiment 2: Stream Processor Crash**
- **Objective:** Test AI model failover and recovery
- **Method:** Kill stream processor pod and observe recovery
- **Duration:** 5 minutes
- **Expected Behavior:**
  - Kubernetes restarts pod automatically
  - Model reloads from checkpoint
  - Maximum 30-second gap in anomaly detection

**Experiment 3: PostgreSQL Failure**
- **Objective:** Test database failover and data consistency
- **Method:** Simulate PostgreSQL primary node failure
- **Duration:** 15 minutes
- **Expected Behavior:**
  - Automatic failover to standby replica
  - No data loss during failover
  - Read operations continue via replica
  - Write operations resume within 30 seconds

#### **Code Coverage Policy**

**Coverage Targets:**
- **Unit Tests:** 85% line coverage, 80% branch coverage
- **Integration Tests:** 90% API endpoint coverage
- **E2E Tests:** 100% critical user journey coverage

**Coverage Enforcement:**
```yaml
# CI coverage check
- name: Check coverage
  run: |
    npm run test:coverage
    if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 85 ]; then
      echo "Coverage below 85%"
      exit 1
    fi
```

---

**🎯 LEGENDARY BLUEPRINT COMPLETE**

This comprehensive 15-point blueprint provides the complete architectural foundation for the Sentinel Command Dashboard. The design follows enterprise security best practices with Zero Trust principles, real-time data processing, and mandatory Human-in-the-Loop controls for critical actions.

**Ready for Implementation Approval** ✅

All architectural decisions have been documented with:
- Detailed Mermaid diagrams for system context and containers
- Complete API specifications and database schemas
- Comprehensive testing strategies and CI/CD pipelines
- Ethical considerations and data governance policies
- AI safety measures and HITL workflow enforcement

The blueprint is now ready for user review and approval before proceeding to code implementation. 🚀