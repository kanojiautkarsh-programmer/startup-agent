# Site-Wide Detailed Audit Plan

The user has requested a detailed audit of the entire `startup-agent.vercel.app` site, spanning every page. After analyzing the routing tree, there are over 30 unique pages/routes in the application across three main categories: Public pages, Auth flow, and Internal App (Dashboard, Settings, etc.).

A comprehensive audit of this scale must be structured systematically to ensure nothing is missed and to avoid overwhelming the context.

## Audit Scope
Based on our project's available skills and standards, the audit will cover:
1. **UI/UX Consistency constraints (`baseline-ui`)**: Checking for hardcoded colors, dark mode fidelity, typography adherence, responsive boundaries, and layout structure.
2. **Accessibility (`fixing-accessibility`)**: Verifying ARIA labels, keyboard navigation, focus management, and sufficient color contrast across components.
3. **SEO & Metadata (`fixing-metadata`)**: Ensuring each page correctly uses Next.js metadata objects (`export const metadata`), Open Graph tags, canonical URLs, and appropriate heading hierarchies.
4. **Motion & Performance (`fixing-motion-performance`)**: Identifying expensive animations, layout thrashing, or scroll-jank. 

## User Review Required

> [!WARNING]
> Due to the sheer volume of pages (30+ `page.tsx` files), auditing everything simultaneously is inefficient and may result in partial fixes. I recommend splitting this task into iterative phases. Do you approve of executing the audit **one phase at a time**, generating a report and rolling out fixes after each phase?

## Proposed Approach (Phased Execution)

### Phase 1: Public Routes (Marketing & Legal)
> These pages represent the top of the funnel and require pristine UI, high SEO, and strict accessibility.
- `src/app/(public)/page.tsx` (Home)
- `src/app/(public)/features/page.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/app/(public)/about/page.tsx`, `blog`, `careers`, `company`, `contact`
- Legal pages: `privacy`, `terms`, `cookies`, `dpa`, `security`

**Execution:** Read file contents, identify missing `metadata` exports, check for unpolished layouts left over from the Gradient Labs UI transition, and produce an `audit_report_phase1.md` before applying automated fixes.

### Phase 2: Authentication & Onboarding
> These pages are critical for conversion. Focus lies on mobile responsiveness, error handling presentation, and focus management.
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/onboarding/page.tsx`

**Execution:** Verify that form inputs have proper focus rings, validation messages are accessible, and contrast is preserved across light/dark modes.

### Phase 3: Core App Dashboard & Features
> Data-heavy pages where Layout and UI density matter most. 
- `src/app/dashboard/page.tsx`
- `src/app/chat/page.tsx`, `memory`, `goals`, `clients`
- `src/app/demo/page.tsx`, `team/invite`
- `src/app/settings/*` (api-keys, billing, documents, integrations, security, startup, team)

**Execution:** Verify Sidebar integration, ensure data grids/cards use the design system variables (`bg-card`, `text-foreground`), and check the handling of loading/empty states.

## Open Questions

> [!CAUTION]
> 1. **Focus Areas:** Are there any specific issues you've already noticed that you want me to prioritize during this audit (e.g., exclusively dark-mode testing, mobile views, or specific components)?
> 2. **Execution Method:** Would you like me to merely generate an audit *report* containing all flaws without touching the code, or do you want me to *fix* the flaws as I find them within each phase?

## Verification Plan

### Automated Checks
- I will run static `grep_search` tools to find missing `<title>`, `metadata`, hardcoded `#[0-9a-fA-F]` colors instead of CSS variables across all `.tsx` files.
- I will verify whether `metadata` correctly uses `Metadata` from `next`.

### Manual / Browser Verification
- Using the `browser_subagent` on key complex pages (like `/dashboard` and `/onboarding`) to visually detect rendering quirks. 

***
Please approve this phased strategy, and let me know if I should act on fixes immediately or just report them first!
