# LANG-MODULE — Language Management Module

## Task
Build a complete Language Management module for the Super Admin portal at
`/home/z/my-project/src/components/portal/modules/LanguageManagementModule.tsx`.

## Context Verified
- **Prisma schema** (`prisma/schema.prisma`):
  - `Language`: `id`, `code` (unique), `name`, `nativeName?`, `flag?`, `enabled`, `isDefault`, timestamps. Has `translations` relation.
  - `Translation`: `id`, `languageId`, `key`, `value`. Unique `[languageId, key]`. Cascade delete on language.
- **API routes** (all verified to exist and return correct shapes):
  - `GET /api/languages` → `{ languages: [...] }` with `_count.translations`; super_admin sees all, others see only `enabled`.
  - `POST /api/languages` → `{ language }` (super_admin only; lowercases code; unsets other defaults if `isDefault`).
  - `GET /api/languages/[id]` → `{ language }` with `translations`.
  - `PUT /api/languages/[id]` → `{ language }` (super_admin only; blocks disabling default; unsets other defaults).
  - `DELETE /api/languages/[id]` → `{ success: true }` (super_admin only; blocks deleting default).
  - `GET /api/languages/[id]/translations` → `{ translations: { key: value, ... } }`.
  - `PUT /api/languages/[id]/translations` → `{ success: true, count }` (super_admin only; upserts each key).

## Implementation Summary
Created a single `'use client'` file exporting `LanguageManagementModule()`.

### Key features delivered
1. **Access control** — `AccessDenied` component shown if not super_admin. Uses
   `role === 'super_admin' && hasPermission(role, 'language.*')` as defense-in-depth.
2. **Stats cards** (4, teal/emerald/amber palette):
   - Total Languages, Enabled, Default Language (shows flag + code), Total Translations.
3. **Search** — filters by name / code / nativeName.
4. **Languages table** with columns: Flag (emoji), Name (+ nativeName subtitle),
   Code (mono badge), Status (🟢 ON / 🔴 OFF badge), Default (★ Yes badge), Actions.
5. **Actions per row**: Edit, Translations, ON/OFF toggle (disabled for enabled-default),
   Set Default (hidden when already default), Delete (disabled for default).
6. **Add/Edit dialog** — code (disabled in edit mode), name, nativeName, flag (with quick-pick
   emoji grid of 16 common flags), enabled Switch, isDefault Switch (disabled when editing the
   current default).
7. **Translations dialog** —
   - Header shows flag + name + code badge.
   - "Add New Translation Key" panel (key + value inputs, Enter to submit).
   - Search/filter by key.
   - Scrollable list (`max-h-[50vh] overflow-y-auto`) of key/value rows using `Textarea`
     (resizable) with a per-row remove (X) button.
   - Save button calls `PUT /api/languages/[id]/translations` with the full `{ translations }`
     object; loading/saving spinners via `Loader2`.
8. **Delete confirmation** — `AlertDialog` warning about cascading translation deletion; the row
   delete button is disabled for the default language.
9. **Toast notifications** for all success/error outcomes via `useToast`.

### Patterns followed (consistent with existing modules)
- Imports: `useAppStore, UserRole` from `@/lib/store`; `useApi, apiPost, apiPut, apiDelete`
  from `@/lib/use-api`; `useToast` from `@/components/ui/use-toast`; `hasPermission` from
  `@/lib/auth`.
- shadcn/ui components: Card, Button, Input, Label, Badge, Switch, Textarea, Dialog,
  AlertDialog, Table, Skeleton (plus `Loader2` from lucide-react).
- Teal/emerald color scheme (`bg-teal-700 hover:bg-teal-800`, `text-emerald-600`, etc.).
- Mobile-first responsive grid: stats cards `grid-cols-2 md:grid-cols-4`; form fields
  `grid-cols-2`; translations grid collapses to single column on small screens.
- All hooks declared before the early `AccessDenied` return to satisfy the Rules of Hooks.
- Empty states with icon + helper text.
- Skeletons for loading rows and translation entries.

## Lint / Build
- `bun run lint` → **clean** (no errors, no warnings).
- Dev log shows no compilation errors related to this module.

## File
- `/home/z/my-project/src/components/portal/modules/LanguageManagementModule.tsx` (~31 KB).
