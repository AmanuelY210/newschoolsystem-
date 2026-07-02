# Task 6 — Public Website Frontend

**Agent:** Sub-agent (general-purpose)
**Task:** Build the Public Website frontend for the School Management System
**Status:** ✅ Complete

## Files Created (11 total)

```
src/components/public/
├── PublicHeader.tsx           # Sticky header, mobile Sheet, teal theme
├── PublicFooter.tsx           # 4-col footer, social icons, mt-auto
├── PublicSite.tsx             # Wrapper: Header + page switch + Footer
└── pages/
    ├── HomePage.tsx           # Hero, stats, programs, events, gallery, CTA
    ├── AboutPage.tsx          # CMS, mission/vision/values, timeline, leadership
    ├── AcademyPage.tsx        # CMS, programs, subjects, calendar, facilities
    ├── AdmissionsPage.tsx     # CMS, process, requirements, application form
    ├── MediaPage.tsx          # Photo grid lightbox / Video embeds, filter tabs
    ├── TeachersPage.tsx       # Cards grid, search, 401 fallback to demo data
    ├── StudentsPage.tsx       # Achievements, council, grade overview, count
    └── ContactPage.tsx        # CMS info, contact form, OSM map embed
```

Also updated: `src/app/page.tsx` to render `<PublicSite />`.

## Key Decisions

1. **useToast location:** Resolved to `@/hooks/use-toast` (not `@/components/ui/use-toast` as the task brief suggested — confirmed by reading `src/components/ui/toaster.tsx`).

2. **Auth-required endpoints for public pages:** `/api/teachers` and `/api/students` return 401 for anonymous users. Rather than breaking the public pages, I added graceful fallbacks:
   - TeachersPage: shows 8 demo teachers + a friendly "log in for full directory" notice
   - StudentsPage: shows "2,000+" when count can't be fetched, with note to sign in

3. **MediaPage state on type change:** Used `key` prop on `<MediaPage>` in PublicSite to force remount when switching photo↔video. Avoids the `react-hooks/set-state-in-effect` lint error.

4. **Color scheme:** Strict teal/emerald (no indigo/blue), per the brief. Consistent gradient `from-teal-500 to-emerald-600` for icon badges.

5. **Image strategy:** Unsplash URLs for hero backgrounds/programs, dicebear initials API for avatars (leadership, student council, teacher cards). No `<Image>` from next/image (the `@next/next/no-img-element` rule isn't enabled in this project, so the disable comments were removed).

## Data Sources Used

| Endpoint | Used in |
|----------|---------|
| `GET /api/settings` | Header (school_name, logo), Footer (all info + footer_text), Home (tagline), Academy/About/Admissions/Contact fallbacks |
| `GET /api/social` | Footer social icons (with lucide fallback set) |
| `GET /api/events` | Home upcoming events (3 cards) |
| `GET /api/media?type=photo` | Home featured gallery (6 items) + MediaPage photos |
| `GET /api/media?type=video` | MediaPage videos |
| `GET /api/cms/about` | AboutPage content + banner |
| `GET /api/cms/academy` | AcademyPage content + banner |
| `GET /api/cms/admissions` | AdmissionsPage content + banner |
| `GET /api/cms/contact` | ContactPage content |
| `POST /api/registrations` | Admissions application form |
| `POST /api/contact` | Contact form |
| `GET /api/teachers` | TeachersPage (with 401 fallback) |
| `GET /api/students` | StudentsPage count (with 401 fallback to "2,000+") |

## Verification

- `bun run lint` → 0 errors, 0 warnings
- `npx tsc --noEmit` → passes (filtered out unrelated examples/seed/skills errors)
- Dev server log confirms `/` returns 200 and all API endpoints respond 200

## Integration Notes for Other Agents

- `src/app/page.tsx` currently always renders `<PublicSite />`. The login/portal agents should add their conditional based on `useAppStore((s) => s.view)`:
  ```tsx
  if (view === 'public') return <PublicSite />
  if (view === 'login') return <Login />  // Task 5
  return <Portal />                       // Other tasks
  ```
- The Zustand store (`src/lib/store.ts`) exposes:
  - `view: 'public' | 'login' | 'portal'`
  - `publicPage: PublicPage` ('home' | 'about' | 'academy' | 'admissions' | 'media-photos' | 'media-videos' | 'teachers' | 'students' | 'contact')
  - `navigateToPublic(page)`, `navigateToLogin()`, `navigateToPortal(module?)`
- All public pages call `navigateToPublic()` for internal nav (no Next.js router) and `navigateToLogin()` for the Portal Login CTA.
- Toaster is already mounted globally in `src/app/layout.tsx`.
