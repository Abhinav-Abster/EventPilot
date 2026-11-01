# EventPilot

> **Plan smarter. Spend better. Celebrate without chaos.**

EventPilot is a production-grade, GenAI-powered event planning assistant that pairs large language model creativity with a deterministic planning engine. Built for the Prompt Wars GenAI challenge, EventPilot converts natural-language event concepts into structured, editable, dependency-aware event plans with strict financial guarantees, constraint validation, and real-time adaptive replanning.

---

## 1. Challenge Vertical & Primary Persona

### Vertical

GenAI Planning & Operational Automation for Celebrations & Gatherings (Weddings, Milestone Birthdays, Community Melas).

### Target Persona

**Budget-Conscious Indian Birthday Organizer**

- **Example User Story:**

  > _"I'm planning my sister's 18th birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food."_

- **Cultural & Practical Grounding:**
  - Strict adherence to 100% vegetarian culinary standards.
  - Realistic tier-2 Indian metro (Pune) pricing benchmarks across lawns, pure-veg catering, artisanal cake bakeries, and freelance event photography.
  - Extensible domain model that scales to weddings, corporate offsites, and community gatherings without code duplication.
  - No cultural assumptions: infer and enforce only what the user explicitly mandates.

---

## 2. Problem Statement

Organizing celebratory events is notoriously prone to chaotic failure modes:

1. **Financial Float & Creep:** LLM chatbots often invent fictional vendor quotes or suffer from floating-point arithmetic errors that produce broken budgets.
2. **Fragile Scheduling:** Traditional checklists fail to account for topological prerequisites (e.g., booking a venue before ordering venue-specific backdrop prints).
3. **Inflexible Replanning:** When real-world disruptions strike (budget cuts, sudden rain, guest list expansion, vendor cancellation), organizers must rebuild plans from scratch without understanding the trade-offs.

EventPilot bridges generative creativity and software engineering rigor: **GenAI interprets intent and drafts creative ideas, while pure deterministic TypeScript code validates constraints, calculates finances, and manages task graphs.**

---

## 3. Key Features

- **Conversational Event Intake:** Natural language parsing with instant extraction into validated Zod schemas.
- **Deterministic Budget Intelligence:** Monetary calculations computed strictly in integer minor units (Paise: 1 INR = 100 Paise) to eliminate floating-point inaccuracies. Instant overspending detection, deficit calculation, and category breakdown.
- **Dependency-Aware Timeline & Checklist:** Tasks sorted topologically with cycle detection, relative lead times (-21d, -14d, -7d, 0d), overdue detection, and prerequisite unblocking.
- **Vendor Directory & Quote Tracker:** Track contact persons, estimated vs. actual quotes, booking statuses, and payment states with transparent disclosures.
- **Personalized Creative Studio:** Tailored anime-fusion themes, 100% vegetarian menus, interactive party games, and return gifts with explicit trade-offs and cost ranges.
- **Adaptive Replanning Engine (Core Differentiator):** Modify any constraint in natural language (e.g., _"My budget is now ₹30,000"_, _"Move party indoors"_, _"The caterer cancelled"_). Generates ranked proposals with side-by-side diff previews, preserved non-negotiables, and consequential Accept/Reject controls.
- **Live Gemini Integration:** Intake, plan generation, and replanning analysis run through server-side Gemini API routes. Missing configuration and provider failures are shown in the interface.

---

## 4. System Architecture & Module Responsibilities

EventPilot follows a clean boundary between generative language models and deterministic business logic:

```
EventPilot/
├── app/
│   ├── globals.css              # Custom Tailwind styling & accessible focus rings
│   ├── layout.tsx               # Root layout with PlanProvider & ReplanningModal
│   └── page.tsx                 # View orchestrator (Dashboard, Intake, Budget, etc.)
├── components/
│   ├── assistant/               # AIAssistantView (Replanning conversation & diff cards)
│   ├── budget/                  # BudgetStudioView (Category breakdown, expense tables, optimizer)
│   ├── dashboard/               # DashboardView (KPIs, countdown, progress, quick replanning)
│   ├── ideas/                   # CreativeIdeasView (Themes, decor, menus, weather contingency)
│   ├── intake/                  # EventIntakeView (Chat intake & live profile builder)
│   ├── layout/                  # Navbar and tab switching
│   ├── replanning/              # ReplanningModal (Side-by-side Before/After change preview)
│   ├── timeline/                # TimelineView (Topological task list & date recalculations)
│   └── vendors/                 # VendorManagementView (Directory, quotes & booking status)
├── lib/
│   ├── ai/                      # Gemini SDK integration and browser API client
│   ├── budget/                  # Integer money utilities & budget optimization engine
│   ├── ideas/                   # Personalized creative idea generation
│   ├── persistence/             # LocalStorage state provider and empty-plan initializer
│   ├── replanning/              # Constraint intent parser & proposal generator
│   ├── schemas/                 # Zod validation schemas for all domain entities
│   ├── timeline/                # Cycle detection, topological sorting & schedule recalculation
│   ├── types/                   # Strict TypeScript domain interfaces
│   └── vendor/                  # Vendor records and status configurations
└── tests/                       # Vitest unit and integration test suites
```

### Module Responsibilities

| Responsibility                      | Responsible Module                   | Design Pattern / Mechanism                                      |
| :---------------------------------- | :----------------------------------- | :-------------------------------------------------------------- |
| **Natural Language Interpretation** | `lib/ai/aiService.ts`                | Gemini (`@google/genai`) through server-side route handlers     |
| **Schema Validation**               | `lib/schemas/eventSchemas.ts`        | Zod runtime schema validation on all inputs & outputs           |
| **Monetary Calculations**           | `lib/budget/moneyUtils.ts`           | Integer Paise (Minor units); 0 floating-point arithmetic        |
| **Budget Optimization**             | `lib/budget/budgetEngine.ts`         | Deterministic priority-inversion reduction algorithm            |
| **Task Dependency Resolution**      | `lib/timeline/timelineEngine.ts`     | Depth-First Search cycle detection & topological sorting        |
| **Constraint Shift Analysis**       | `lib/replanning/replanningEngine.ts` | Deep state cloning, diff extraction, and invariant verification |
| **State Persistence**               | `lib/persistence/PlanContext.tsx`    | React Context + validated browser LocalStorage with fallback    |

---

## 5. How GenAI is Used vs. Deterministic Decision-Making

### Generative AI Responsibilities

- Parsing unstructured natural language requests into structured profile attributes.
- Brainstorming culturally authentic creative themes (e.g., Studio Ghibli enchanted garden decor, Japanese-Indian fusion live chaat counters).
- Formulating human-readable trade-off explanations when constraints change.
- Providing conversational guidance during the intake flow.

### Deterministic Application Responsibilities

- **All financial arithmetic:** Subtotals, category sums, contingency percentages, remaining buffers, and deficits.
- **Constraint validation:** Ensuring mandatory fields exist, guest counts are positive, and dates are valid.
- **Dependency management:** Ensuring tasks are executed in topological order and detecting circular dependency loops.
- **Invariance protection:** Refusing to silently violate non-negotiable must-haves (e.g. cutting vegetarian food or milestone themes).
- **State transitions:** Requiring explicit user approval before applying replanning proposals to the event state.

---

## 6. Budget Optimization & Replanning Algorithms

### Budget Optimization Algorithm (`optimizeBudget`)

When a budget reduction is requested:

1. **Deficit Calculation:** Computes `deficit = totalEstimated - targetBudget`. If `deficit <= 0`, returns immediately.
2. **Constraint Protection:** Inspects `profile.mustHaves`. Items matching protected keywords are marked with `isProtected: true`.
3. **Priority Inversion Sorting:** Categories are ranked for reduction based on the inverse of user priorities (e.g. entertainment → photography → decor → invitations → venue → food).
4. **Tiered Reductions:**
   - **Invitations:** Switched to digital animated invites (up to 85% reduction).
   - **Photography:** Adjusted to 2.5-hour key moment coverage (up to 50% reduction).
   - **Entertainment:** Switched from external DJ to curated PA speaker & playlist (up to 60% reduction).
   - **Decorations:** Shifted to DIY standees and balloon arches (capped at 35% reduction to preserve theme).
   - **Food & Catering:** Optimized portioning while **strictly enforcing a baseline quality floor of ₹200/guest** and preserving 100% vegetarian requirements.
   - **Contingency:** Streamlined up to 75% to absorb remaining deficit.
5. **Feasibility Assertion:** If the target cannot be met without violating protected constraints or dropping below ₹200/guest for food, the engine flags explicit conflicts rather than fabricating impossible prices.

### Adaptive Replanning Pipeline (`generateReplanningProposals`)

1. **Intent Parsing:** Extracts change intent (`budget_change`, `guest_count_change`, `venue_change`, `vendor_cancellation`, `date_change`).
2. **State Cloning:** Clones the entire event state into an immutable working copy.
3. **Cascade Propagation:**
   - Guest count changes scale catering and invitation line items proportionally.
   - Venue shifts update facility rental items and substitute lawn-specific weather checks with hall AC checks.
   - Vendor cancellations freeze quote liabilities and inject emergency replacement tasks.
   - Date shifts recalculate relative deadlines across all tasks.
4. **Diff Generation:** Computes exact before-and-after values for every affected field.
5. **Proposal Staging:** Stages the proposal for user review. No state is overwritten until the user clicks **Accept & Apply Changes**.

---

## 7. Security & Responsible AI Considerations

- **Zero Client-Side Secret Leakage:** Provider API keys (`GEMINI_API_KEY`) are accessed strictly on the server or in secure API abstractions. No API keys are bundled into client JavaScript.
- **Untrusted Input Sanitation:** All model responses and user inputs are passed through Zod schemas with bounded string lengths and type coercion.
- **Prompt Injection Defense:** Business logic constraints (e.g. budget totals, task prerequisites) are evaluated in pure TypeScript code. Prompt injection cannot bypass deterministic math or violate protected constraints.
- **Truthfulness & Provenance:** EventPilot never claims to have booked live vendors or processed credit card payments. All sample vendors are explicitly labeled as benchmark data.

---

## 8. Accessibility & UX Design

- **Visual Identity:** Warm off-white backgrounds (`#FAF8F5`), deep forest green primary accent (`#143D30`), and restrained warm gold accents (`#D97706`).
- **Semantic HTML:** Landmarks (`<header>`, `<main>`, `<nav>`, `<table>`, `<dialog>`), explicit ARIA attributes (`aria-current`, `aria-label`, `aria-modal`), and visible keyboard focus rings.
- **Information Architecture:** Clear tabbed views ensuring users always know their location and can navigate between Dashboard, Intake, Budget, Timeline, Vendors, and Ideas.
- **Responsive Layouts:** Mobile navigation drawer, fluid grid systems, and touch-friendly tap targets.

---

## 9. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.6 (Strict Mode)
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Validation:** Zod 3.23
- **GenAI SDK:** `@google/genai` (Google GenAI SDK)
- **Test Runner:** Vitest 4.1

---

## 10. Prerequisites & Installation

### Prerequisites

- Node.js v20.x or higher
- npm or pnpm

### Installation

```bash
# Clone the repository (keep single main branch)
git clone https://github.com/Abhinav-Abster/EventPilot.git
cd EventPilot

# Install dependencies
npm install
```

---

## 11. Environment Variable Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable               | Description             | Required? | Default            |
| :--------------------- | :---------------------- | :-------- | :----------------- |
| `GEMINI_API_KEY`       | Google Gemini API Key   | Yes       | None               |
| `GEMINI_MODEL`         | Gemini Model identifier | Optional  | `gemini-2.0-flash` |
| `NEXT_PUBLIC_APP_NAME` | Application Name        | Optional  | `EventPilot`       |

> **Note:** Add `GEMINI_API_KEY` to `.env.local` and restart the application. If it is missing or Gemini returns an error, the interface displays the error and does not substitute generated sample data.

---

## 12. Development & Production Commands

```bash
# Start local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Run automated Vitest test suites
npm run test

# Run Vitest in watch mode
npm run test:watch

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 13. Testing & Verification

EventPilot includes automated unit and integration tests covering all critical paths:

```bash
npm run test
```

### Test Suites Overview

- **`tests/budget.test.ts`**: Verifies minor unit calculations, overspending detection, deficit calculation, protected requirement preservation during budget reduction, and infeasibility flagging.
- **`tests/timeline.test.ts`**: Verifies topological ordering, circular dependency detection, blocked status propagation, overdue identification, and date shift recalculation.
- **`tests/replanning.test.ts`**: Verifies natural language intent parsing, constraint preservation, diff generation, and proposal staging.
- **`tests/validation.test.ts`**: Verifies Zod schema validation rules, rejection of malformed inputs, and missing Gemini configuration errors.
- **`tests/userJourney.test.ts`**: Simulates the complete 11-step end-to-end competition audit workflow.

---

## 14. Starting a Plan

1. Add `GEMINI_API_KEY` to `.env.local` and run `npm run dev`.
2. Open Event Intake and describe the event you want to plan.
3. Review the extracted profile, then select **Generate Master Plan**.
4. Use the AI Assistant or dashboard quick bar to request a replan and review the generated change proposal.

---

## 15. Sample User Prompts for Live Evaluation

- _"I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food."_
- _"My budget is now ₹30,000."_
- _"We have 20 additional guests."_
- _"Move the party indoors due to rain."_
- _"The caterer cancelled at the last minute."_
- _"Keep the decorations but reduce other expenses."_
- _"The event is now next Saturday."_

---

## 16. Assumptions & Limitations

1. **Vendor Integrations:** Vendor records are high-fidelity Pune benchmarks. Direct payment gateway execution and real-time vendor calendar sync are out of scope for this hackathon submission.
2. **Weather API:** Weather contingency ideas are based on Pune climate standards (e.g. evening dew and sudden pre-monsoon showers). Live radar integration is labeled as a future roadmap capability.
3. **Currency Scope:** Initial financial engine targets Indian Rupees (`INR` / `₹`) with Paise integer units. Multi-currency conversions can be plugged into `lib/budget/moneyUtils.ts`.

---

## 17. Repository Hygiene & Compliance

- **Single Branch:** All commits exist solely on `main`. No additional branches created.
- **Repository Size:** Entire repository (excluding gitignored node_modules and build artifacts) remains under **2 MB**, well below the 10 MB competition limit.
- **No Committed Secrets:** No `.env` or credentials committed. Only `.env.example` is tracked.

---

## 18. License

MIT License. Designed and built with ❤️ for the Prompt Wars GenAI Challenge.
