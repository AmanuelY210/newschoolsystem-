# Task: TEACHER-ASSIGNMENT-UI

## Agent
Main (Z.ai Code)

## Task
Update `src/components/portal/modules/TeachersModule.tsx` to add:
1. Assignment management (view / add / remove grade/section/subject/academicYear assignments)
2. Admin-only password reset
3. Status badge + activate/deactivate/lock controls
4. `academicYear` and `campus` fields on the edit form

## Context Reviewed
- `worklog.md` — confirmed DB schema, API surface, role/permission matrix
- `prisma/schema.prisma` — Teacher has `academicYear`, `campus`, `status` fields; `TeacherAssignment` model links teacher↔grade↔section↔subject with optional section + academicYear, unique constraint on `[teacherId, gradeId, sectionId, subjectId]`
- `src/app/api/teachers/route.ts` — GET returns teachers with `teacherAssignments` (includes grade/section/subject); POST creates teacher
- `src/app/api/teachers/[id]/route.ts` — PUT supports `resetPassword`, `assignments` (replaces all), `status`, `academicYear`, `campus`; only admin/super_admin can change status/salary/assignments/reset password; teacher-owner can edit own profile fields only
- `src/app/api/grades/route.ts` — returns grades with full `sections` array (subjects returned as count only)
- `src/app/api/subjects/route.ts` — supports `?gradeId=` filter, returns full subject objects
- `src/lib/use-api.ts` — `useApi<T>(url | null)`, `apiPost`, `apiPut`, `apiDelete`
- `src/lib/store.ts` — `UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'finance' | 'library'`
- `src/components/ui/tabs.tsx` — Tabs/TabsList/TabsTrigger/TabsContent available

## Implementation Summary

### New state
- `activeTab` — controls Profile / Assignments / Security tabs in the edit dialog
- `assignments` — working copy of the teacher's assignment list while editing (initialized from `teacher.teacherAssignments` when opening edit, sent to PUT on save)
- `newAssignment` — `{ gradeId, sectionId, subjectId, academicYear }` for the "add new assignment" form (sectionId uses `'all'` sentinel for "All Sections"; converted to `null` on save)
- `resetPasswordTeacher`, `newPassword`, `resettingPassword` — for the password reset dialog
- `form.academicYear`, `form.campus`, `form.status` — added to `emptyTeacher` and `openEdit`

### Data fetching
- `useApi('/api/grades')` for the grades list (each grade has a full `sections` array)
- `useApi('/api/subjects?gradeId=...')` with `null` URL when no grade is selected — subjects filtered by the currently-selected grade in the "add assignment" form

### Permission model
- `canCreate` / `canEdit` — via existing `hasPermission` + super_admin fallback (unchanged)
- `canDelete` — super_admin only (unchanged)
- `canManage` — NEW: `role === 'admin' || role === 'super_admin'`; gates assignment management, password reset, status change, salary editing
- Teachers viewing their own profile see assignments read-only and do not see admin action buttons (handled by `canManage` checks)

### Edit dialog (Tabs)
Tabs are only shown when `editTeacher && canManage`; otherwise the existing single-column Profile form is shown (preserves prior UX for create and for non-admin edits).
- **Profile tab**: all original fields + new `Academic Year` and `Campus` inputs. Salary field only visible to `canManage`.
- **Assignments tab**: 
  - Current assignments list (Grade / Section / Subject / Academic Year) with per-row remove (X) button
  - "Add New Assignment" form: grade select (drives section + subject dropdowns), section select (filtered by selected grade, includes "All Sections"), subject select (filtered by selected grade via `/api/subjects?gradeId=`), academic year input
  - "Add to List" button appends to the working `assignments` array (with duplicate guard)
  - Helper note clarifies the list replaces all assignments on save
- **Security tab**:
  - Status selector: three large buttons (Active / Inactive / Locked) updating `form.status`; saved with the rest of the form via PUT
  - "Reset Password" button that closes the edit dialog and opens the dedicated password reset dialog

### View dialog (enhanced)
- Header now includes status badge in the top-right corner
- Info grid adds Academic Year (Calendar icon) and Campus (Building2 icon)
- New "Assigned Classes & Subjects" card showing all `teacherAssignments` as Grade / Section / Subject / Academic Year badges (scrollable list, max-h-48)
- Admin-only action section (`canManage`):
  - **Quick status change** buttons: Activate (green) / Deactivate (gray) / Lock (red) — immediate PUT, badge refreshes in-place, current status button is disabled
  - **Edit Profile** button → opens edit dialog on Profile tab
  - **Manage Assignments** button → opens edit dialog on Assignments tab
  - **Reset Password** button → opens password reset dialog

### Reset password dialog
- Dedicated small dialog with new-password input (min 6 chars enforced)
- "Use default (password123)" and "Generate random" helper buttons
- On submit: `PUT /api/teachers/[id]` with `{ resetPassword }` body
- Success toast displays the new password so admin can share it with the teacher

### Save flow (handleSubmit)
- Edit mode + `canManage`: sends `{ ...form, assignments: [...] }` (assignments with `sectionId: null` when "All Sections"); `email`/`password` stripped
- Edit mode + non-admin: `status` and `salary` stripped from payload (API enforces this server-side too)
- Create mode: unchanged (API ignores `status`/`assignments` in POST)

### Status badge helper
Replaced inline badge logic with a `statusBadge(status)` helper using `STATUS_OPTIONS` constant:
- `active` → green
- `inactive` → gray
- `locked` → red
- legacy values (e.g. `on_leave`) → amber fallback
Used both in the table column and the view dialog header for consistency.

### Styling
- Teal/emerald scheme preserved throughout (bg-teal-700 hover:bg-teal-800 primary buttons, teal/emerald badges for grades/subjects, teal-50 assignment cards)
- Mobile responsive: grids collapse to single column, action buttons wrap, scrollable assignment lists with custom max-height
- framer-motion stats cards preserved

## Files Modified
- `src/components/portal/modules/TeachersModule.tsx` — full rewrite (498 lines)

## Verification
- `bun run lint` — passes with no errors or warnings
- `npx tsc --noEmit` — no TeachersModule-related errors
- Dev server: `✓ Compiled in 499ms` (no compile errors)

## Notes for Future Agents
- The grades API returns subjects as a count only; to get the actual subject list for a grade, fetch `/api/subjects?gradeId=<id>`. This pattern is used in the assignment form.
- The `sectionId` sentinel `'all'` is converted to `null` on save (API stores null for "All Sections").
- The API's PUT endpoint deduplicates assignments silently via a `catch(() => {})` on unique constraint violations, but the UI also guards against duplicates client-side for better UX.
- Status change is intentionally an immediate PUT (not part of the form save) so admins can quickly lock/unlock a teacher without touching other fields.
- Password reset is also a separate PUT call with just `{ resetPassword }` — the API returns early after updating the user's password hash, so other form fields are not affected.
