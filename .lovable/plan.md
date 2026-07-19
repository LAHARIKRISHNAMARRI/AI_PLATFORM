# TeachLearn AI — Full MVP Plan

A single app with 3 role-based portals (Admin, Teacher, Student), matching the visual style of the uploaded screenshots (deep indigo sidebar, light content area, colored stat pills).

This is a multi-turn build. I'll ship it in 4 phases so you can preview after each.

## Phase 1 — Foundation (this turn)
- Enable Lovable Cloud (Postgres + auth + storage).
- Design system in `src/styles.css`: indigo primary (#5B4FE9-ish oklch), soft neutrals, Plus Jakarta Sans + Inter, pill/card variants, stat-card gradients.
- Database schema + RLS + GRANTs:
  - `app_role` enum: `admin | teacher | student`
  - `user_roles` (separate table, `has_role` SECURITY DEFINER fn)
  - `profiles` (name, avatar, department/class, bio)
  - `teachers` (subject, joined_at) linked to profile
  - `leaves` (teacher_id, from, to, reason, status)
  - `sessions` (teacher_id, title, subject, date, start/end, class, lesson_plan, outcomes, method, status)
  - `materials` (session_id, type, file_url, uploaded_by)
  - `exams` + `exam_questions` + `exam_attempts` + `attempt_answers`
  - `doubts` (student_id, subject, question, ai_answer, teacher_id?, teacher_answer?, status)
- Auth pages: `/auth` (login + signup with role selector: student/teacher; admin created by seed or promotion).
- Route architecture:
  - `_authenticated/route.tsx` (integration-managed gate)
  - `_authenticated/_admin/*`, `_authenticated/_teacher/*`, `_authenticated/_student/*` with role-gated `beforeLoad`
  - `/` redirects to role-appropriate dashboard.
- Shared portal shell (sidebar + topbar + notification bell + user card) themed per role.

## Phase 2 — Teacher Portal (matches screenshot 1)
- **Dashboard**: upcoming sessions, quick stats.
- **My Sessions**: list + filters.
- **Schedule Session**: exact form from screenshot (title, subject, date, start/end, class, lesson, plan, outcomes, method) + Upload Materials card (drag-drop → Supabase Storage) + Material Type checkboxes.
- **Uploads**: library of teacher's files.
- **Question Generation**: AI generates exam questions from an uploaded material (Lovable AI, `google/gemini-3-flash-preview`, structured output). Teacher reviews & saves as exam.
- **Students & Class**: roster view.
- **Analytics & Heatmap**, **Reports**, **Exams**, **Learning Paths**: functional shells with real data where trivial (analytics stubbed with real query aggregates).
- **Leaves**: teacher requests leave; admin approves.

## Phase 3 — Student Portal (matches screenshot 2)
- **Dashboard**: stat cards (Completed Lectures, Assessments Taken, Average Score, Concepts Mastered, Current Streak), Recent Lectures, Concept Mastery Heatmap, Overall Progress donut.
- **My Lectures**: sessions available to student's class + attached materials.
- **Assessments**: take AI-generated exams, auto-scored, results stored.
- **AI Learning Hub**: personalized weak-concept recommendations.
- **Performance / My Progress**: charts from attempts.
- **Study Materials**: download library.
- **Ask Doubt**: chat with AI tutor first (streaming via `/api/chat`); "Escalate to teacher" button creates a `doubts` row for the subject teacher to answer.

## Phase 4 — Admin Portal + polish
- **Dashboard**: user counts, active sessions, pending leaves.
- **Manage Teachers**: create (Supabase Auth Admin via server fn), edit, deactivate.
- **Leaves**: approve/reject all teacher leaves.
- **Manage Students / Classes**.
- **Settings**: own profile.
- SEO metadata per route, sitemap.xml + robots.txt, error/notFound boundaries.

## Redis note
You said "Cloud + external Redis". This MVP doesn't need Redis (Postgres handles everything at this scale). I'll wire Redis (Upstash REST) only when we hit a real caching need — I'll ask for the Upstash URL + token then. Say the word if you want it wired now anyway.

## Tech details (for reference)
- Stack: TanStack Start + React 19 + Tailwind v4 + shadcn + Lovable Cloud (Supabase) + Lovable AI Gateway.
- AI model: `google/gemini-3-flash-preview` for chat/questions/tutor.
- All server logic via `createServerFn`; chat via `/api/chat` server route with AI SDK streaming.
- Roles enforced by `has_role()` in RLS + `_role` layout `beforeLoad`.
- Storage bucket `materials` (private, RLS-scoped).

---

Approve and I'll start Phase 1 (Cloud + schema + auth + shell) this turn.
