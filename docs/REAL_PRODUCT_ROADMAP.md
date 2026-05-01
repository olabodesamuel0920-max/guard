# Mama Guard: Real Product Roadmap

## 1. Current Product State
- Mama Guard is currently a local-device prototype / early-access preview.
- Data is stored on the user’s browser/device.
- It is not yet cloud synced.
- It does not diagnose, dispatch emergencies, or replace a healthcare provider.

## 2. Current Local Data
Explain likely localStorage data:
- onboarding/profile information
- provider phone
- nearest hospital
- check-in records
- symptom follow-up answers
- article read count
- notification/user settings

## 3. What Must Move to Supabase Later
Recommended tables:
- profiles
- checkins
- symptom_responses
- care_team_contacts
- safety_plan_items
- article_reads
- user_settings

## 4. Required Auth and Security
Include:
- Supabase Auth
- Row Level Security
- users can only access their own data
- no public exposure of pregnancy records
- provider access must require patient consent
- audit/logging should be considered later

## 5. What Must NOT Be Built Yet
Include:
- diagnosis engine
- emergency dispatch
- AI doctor
- clinical approval claims
- real provider dashboard with real patient records before authentication and consent are ready

## 6. Safe Launch Path
Break into stages:
- **Stage 1: Prototype polish**
- **Stage 2: Early access with accounts**
- **Stage 3: Secure cloud sync**
- **Stage 4: Provider collaboration with consent**
- **Stage 5: Clinical review and compliance planning**

## 7. Immediate Next Product Priorities
Include:
- real auth
- database planning
- privacy policy
- safer onboarding consent
- export user data
- emergency localization
- user testing with pregnant users or maternal health workers
