# Mama Guard — Backend Readiness Plan 🛠️

This document outlines the technical transition from a local-device demo to a production-grade, secure backend infrastructure.

## 📡 Current State: "Local-Only"
- **Storage**: `localStorage` (via `safeStorage` wrapper).
- **Authentication**: None (Session-based via onboarding).
- **AI**: Deterministic client-side logic (No API costs/latency).
- **Privacy**: High (Data never leaves the device).
- **Limitation**: Data is not persistent across devices or browsers.

## 🏗️ Target Backend Architecture
To move from demo to product, we recommend a **Privacy-First, Serverless Architecture**.

### 1. Suggested Stack
- **Database**: **PostgreSQL** (Managed via Supabase for ease of HIPAA-readiness).
- **Authentication**: **Supabase Auth** or **NextAuth.js** (Supporting Magic Links for low-friction access).
- **Server Logic**: **Next.js API Routes** (Edge functions for low latency).
- **Hosting**: **Vercel** (Existing production environment).

### 2. Data Privacy & Compliance
- **Encryption**: AES-256 for data at rest; TLS 1.3 for data in transit.
- **HIPAA Pathway**: Use a BAA (Business Associate Agreement) compliant provider like Supabase or AWS.
- **Zero-Knowledge Path**: Future exploration of client-side encryption where the server never sees the raw health data.

### 3. Database Schema (High Level)
- `profiles`: User name, status, due date, medical facility IDs.
- `check_ins`: Timestamp, risk_level, symptoms_array, follow_up_answers (JSONB).
- `safety_plans`: Provider contact, hospital name, emergency contact.
- `analytics`: Anonymized usage patterns for clinical research.

## 🗺️ Phase-by-Phase Roadmap

### Phase 1: Authentication & User Profiles
- Implement Magic Link login.
- Migrate onboarding data from `localStorage` to a `profiles` table.
- Allow users to access their profile on multiple devices.

### Phase 2: Persistent History
- Sync `check_ins` to the database.
- Implement a "History" view that loads from the server.
- Add "Export as PDF" for provider summaries.

### Phase 3: AI & Insights Expansion
- Transition deterministic logic to a secure server-side LLM (e.g., OpenAI via HIPAA-compliant gateway).
- Add longitudinal insights (e.g., "Your headaches have occurred 3 times this week").

### Phase 4: Clinician Gateway (Future)
- Create a secure portal for healthcare providers to view patient-approved summaries.
- Implement real-time notifications for "High Risk" assessments to care teams.

## 🚫 What NOT to Build Yet
- **Public API**: Do not expose health endpoints to third parties.
- **Direct Messaging**: Avoid building a custom chat platform; use secure summary exports instead.
- **Payment Processing**: Focus on the safety core before monetization.

---
*This plan ensures Mama Guard remains scalable, secure, and ready for clinical validation.*
