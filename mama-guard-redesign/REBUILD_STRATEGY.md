# Mama Guard v2.0 — Complete Rebuild Strategy

## A. Executive Diagnosis

### Current State
Mama Guard is a functional but emotionally flat maternal health prototype. It has the skeleton of a good product but lacks the depth, warmth, intelligence, and trust signals that pregnant women need in a health companion.

### Critical Failures
1. **No Home Dashboard** — The root route IS the onboarding screen. Users never get an anchor.
2. **Dead Navigation** — The Home button in the bottom nav is broken or routes to onboarding.
3. **Static Symptom Check** — Seven checkboxes with no branching logic, no severity, no follow-up.
4. **Generic Risk Results** — Three static strings ("HIGH RISK" / "MEDIUM RISK" / "LOW RISK") with no context, no actions, no follow-through.
5. **No AI** — The app is marketed as "AI-powered" but has zero AI functionality visible to users.
6. **Placeholder Learn Page** — Articles don't open. Categories don't filter. It's a facade.
7. **Cold Profile** — User is called "Mother" not their name. The reset button is the most prominent element.
8. **Read-Only Worker Portal** — Health workers see data but cannot take any actions.

### Why It Feels Cheap
- Gray slab backgrounds with white cards — no warmth, no personality
- Raw HTML date picker on onboarding
- Hardcoded "Week 0" everywhere
- No motion, no transitions, no micro-interactions
- Generic copy with no emotional intelligence
- "Danger Zone" label on a health app profile

---

## B. Premium Redesign Direction

### Brand Direction
**Mama Guard** is not a medical tool — it is a *companion*. The brand should feel:
- **Warm** like a trusted midwife's office, not a hospital ER
- **Premium** like a top-tier wellness app (Calm, Flo, Clue)
- **Safe** through clear trust signals and medical disclaimers
- **Intelligent** through thoughtful AI that augments (not replaces) medical care
- **Personal** by using her name, her week, her journey

### Visual Direction
- **Color system**: Warm rose/coral primary (not basic pink), sage green for health/success, amber for gentle warnings
- **Backgrounds**: Warm cream gradients, not flat gray or pure white
- **Surfaces**: Layered cards with soft shadows, not flat boxes
- **Glass morphism**: Navigation and headers use backdrop blur for depth
- **Typography**: Inter font family, strong hierarchy, generous line height
- **Shapes**: Large rounded corners (16-24px), organic and soft
- **Motion**: Framer Motion page transitions, staggered entrances, spring-based modals
- **Iconography**: Lucide icons with consistent sizing, warm color treatment

### Emotional Direction
- **Greet her by name**: "Good morning, Sarah" not "Welcome Mother"
- **Celebrate progress**: Baby size comparisons, week milestones, trimester transitions
- **Compassionate urgency**: High-risk results feel serious but supportive, not panic-inducing
- **Daily ritual**: The check-in should feel like a caring conversation, not a form
- **Trust through transparency**: Clear privacy messaging, medical disclaimers, data control

---

## C. Product Rebuild Plan

### 1. Onboarding → Warm Progressive Journey
**What was wrong**: Single screen with raw date picker, no storytelling, dumps all questions at once.
**What it becomes**: 6-step progressive flow:
1. Welcome slide with emotional hook
2. Features slide explaining value
3. Safety/privacy slide building trust
4. Name input (uses it throughout the app)
5. Journey selection (pregnant vs postpartum) with descriptions
6. Due date input (calculates everything from this)

**New features**: Progress indicators, smooth slide transitions, validation, gradient backgrounds per step.

### 2. Home/Dashboard → The Anchor
**What was wrong**: Didn't exist. Root was onboarding.
**What it becomes**: Rich daily dashboard with:
- Personalized greeting with time-of-day awareness
- Baby progress card with fruit size comparison and animated progress bar
- Gestational week calculation from due date
- Trimester identification
- Next milestone countdown
- Large, prominent daily check-in CTA
- Quick action cards (Ask AI, Learn)
- Trimester-specific daily tip
- Recent health status with risk badge
- Wellness streak counter
- Privacy trust banner

### 3. Check-in Flow → Conversational Triage
**What was wrong**: 7 static checkboxes, no severity, no follow-up, generic results.
**What it becomes**: 3-step intelligent flow:
1. **Symptom Selection**: 8 symptoms with icons, severity labels, descriptions. Tap to toggle with visual feedback.
2. **AI Follow-up**: For each selected symptom, asks contextual questions (severity, duration, combinations).
3. **Smart Results**: Risk level with gestational-age-specific advice, action buttons (Call Provider, Find ER, Schedule), share option, AI insights toggle with personalized context.

### 4. Learn → Intelligent Content Hub
**What was wrong**: Placeholder articles that don't open, broken category filter.
**What it becomes**: Fully functional content library:
- Search with real-time filtering
- Horizontal category scroll with active states
- Week-relevance sorting (content for your current stage first)
- Article cards with type badges (article/video), read time, bookmark toggle
- Full article detail modal with spring animation
- Bookmark persistence
- Medical disclaimer on every article

### 5. Profile → Personal Identity
**What was wrong**: Called "Mother", broken menu items, "Danger Zone" dominates.
**What it becomes**: Warm personal hub:
- Real name and initial avatar
- Pregnancy details with calculated week/trimester
- Stats overview (check-ins, articles read, streak)
- Functional menu sections (Account, Preferences, Support)
- Working toggle switches for notifications/data sharing
- Worker portal access point
- Elegant reset flow with confirmation modal
- App version footer

### 6. Worker Portal → Actionable Dashboard
**What was wrong**: Read-only list with no actions.
**What it becomes**: Full community health worker tool:
- Stats cards (caseload count, high-risk count, today's check-ins)
- Urgent alert banner for high-risk patients
- Searchable patient list with risk filtering
- Patient cards with: avatar, demographics, gestational age, symptoms, location
- Quick action buttons: Call, Message, Notes
- Patient detail modal with full info: contact, pregnancy details, symptoms, worker notes
- Action buttons: Mark Resolved, Schedule Follow-up

### 7. AI Assistant → Central Intelligence Layer
**What was wrong**: Didn't exist at all.
**What it becomes**: Full chat interface:
- Welcome message with quick prompt buttons
- Contextual responses based on keyword matching (cramping, bleeding, headaches, etc.)
- Safety-first messaging with medical disclaimers
- Action suggestions in responses (Call Provider, Find ER, Read Article, Log Symptom)
- Loading states with "Thinking..." indicator
- Disclaimer footer on every session
- Floating action button on home screen for quick access

### 8. Notifications/Reminders
**New feature**: Daily check-in reminders, milestone alerts, appointment reminders.

### 9. Trend/History Views
**New feature**: Weekly symptom charts, check-in frequency graphs, risk trend visualization.

---

## D. AI Layer Design

### Philosophy
Mama Guard AI is a **supportive guide**, not a diagnostic tool. Every interaction reinforces that AI guidance does not replace professional medical care.

### Entry Points
1. **Dedicated AI tab** — Full chat interface at `/ai`
2. **Floating action button** — Sparkles button on home screen
3. **Header AI button** — Quick access in the sticky header
4. **Check-in follow-up** — AI asks follow-up questions after symptom selection
5. **Result insights** — Toggle AI context on risk results

### AI Capabilities (Implemented)
- **Symptom interpretation**: Keyword-based contextual responses
- **Follow-up questions**: Dynamic questioning based on selected symptoms
- **Safety escalation**: Automatic urgent care recommendations for high-risk patterns
- **Educational support**: Article and learning resource recommendations
- **Gestational context**: Week-specific advice and warnings

### AI Capabilities (Future Roadmap)
- Integration with LLM API (OpenAI/Claude) for natural conversation
- Vector search over medical content for RAG-based answers
- Voice input for symptom reporting
- Predictive risk modeling from symptom history
- Personalized weekly guidance based on user's stage and history
- Worker-facing AI summaries of patient trends

### Safety Architecture
- Every response includes "This is not a medical diagnosis" disclaimer
- High-risk symptoms always trigger action buttons (Call Provider, Find ER)
- AI refuses to provide definitive diagnoses
- Clear escalation paths to human care

---

## E. Phase-by-Phase Implementation Roadmap

### Phase 1: Foundation (Week 1) ✅ DONE
- Design system (CSS variables, colors, shadows, gradients)
- Global styles and typography
- Bottom navigation with glass morphism
- Sticky header with user data and AI button
- App shell layout

### Phase 2: Home + Onboarding (Week 2) ✅ DONE
- Multi-step onboarding with animated slides
- Real home dashboard with gestational calculations
- Baby size comparisons
- Progress visualization
- Daily tip system

### Phase 3: Check-in + Results (Week 3) ✅ DONE
- Symptom selection with premium cards
- AI follow-up question flow
- Smart results with gestational context
- Action buttons (Call, ER, Schedule)
- AI insights toggle

### Phase 4: AI + Learn (Week 4) ✅ DONE
- Full AI chat interface
- Quick prompts and contextual responses
- Floating AI button
- Learn page with search/filter
- Article detail modals
- Bookmark system

### Phase 5: Profile + Worker (Week 5) ✅ DONE
- Profile with real user data
- Preferences and toggles
- Worker portal with stats
- Patient management
- Actionable workflows

### Phase 6: Polish + Integration (Week 6+)
- Framer Motion animations throughout
- Micro-interactions (button presses, card hovers)
- Loading states
- Error handling
- Offline support considerations
- PWA manifest
- Testing on real devices

---

## F. File-by-File Build Plan

### Config Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies (Next.js 15, React 19, Tailwind, Framer Motion, Lucide) |
| `tsconfig.json` | TypeScript config with path aliases |
| `next.config.js` | Static export config |
| `tailwind.config.ts` | Custom colors (rose, sage, warm), font family, border radius |
| `postcss.config.js` | Tailwind + Autoprefixer |

### Core Files
| File | Purpose |
|------|---------|
| `app/globals.css` | Complete design system with CSS variables |
| `app/layout.tsx` | Root layout with Inter font, viewport config |
| `app/page.tsx` | Smart redirect (onboarding vs home) |
| `lib/utils.ts` | Gestational calculations, risk logic, formatting |

### Components
| File | Purpose |
|------|---------|
| `components/Header.tsx` | Sticky header with user info, week display, AI button, trust badge |
| `components/BottomNav.tsx` | Glass morphism navigation with 4 tabs |
| `components/AIFloatingButton.tsx` | FAB for quick AI access |

### Pages
| File | Purpose |
|------|---------|
| `app/onboarding/page.tsx` | 6-step progressive onboarding with animations |
| `app/home/page.tsx` | Rich dashboard with baby progress, check-in CTA, tips |
| `app/checkin/page.tsx` | 3-step symptom flow with AI follow-up and smart results |
| `app/ai/page.tsx` | Full chat interface with contextual responses |
| `app/learn/page.tsx` | Searchable content library with article modals |
| `app/profile/page.tsx` | User profile with preferences and stats |
| `app/worker/page.tsx` | Health worker dashboard with patient management |

---

## G. Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: React hooks + localStorage
- **Export**: Static HTML (deployable to any CDN)

---

## H. Key Design Decisions

### Mobile-First
- Max-width container (512px) centered on larger screens
- Bottom navigation with safe area padding
- Touch-friendly tap targets (min 44px)
- Horizontal scroll for category filters
- Bottom sheet modals for detail views

### Performance
- Static export for instant loading
- Minimal dependencies
- CSS variables for theme (no runtime JS)
- Lazy animation mounting
- Optimized images (unoptimized flag for static export)

### Accessibility
- Proper heading hierarchy
- ARIA labels on interactive elements
- Color contrast compliance (warm grays on cream backgrounds)
- Focus states on all interactive elements
- Screen reader friendly icons with aria-labels

### Trust & Safety
- Medical disclaimer on every AI interaction
- "Safe" trust badge in header
- Privacy messaging in footer
- Clear escalation paths for high-risk symptoms
- AI responses framed as "guidance" not "diagnosis"

---

## I. Future Enhancements

### Near Term
- Real LLM integration (OpenAI/Claude API)
- Push notifications for daily check-ins
- Appointment scheduling integration
- Medication tracking
- Fetal kick counter
- Weight/BP tracking

### Long Term
- Provider portal integration
- Telehealth appointment booking
- Community features (groups, forums)
- Multi-language support
- Integration with EHR systems
- Predictive analytics for risk assessment
