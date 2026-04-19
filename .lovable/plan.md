
## Plan: Sync, Test E2E, Document & Publish

### Goal
Pull latest from GitHub, fix any issues, run end-to-end tests with real data, document everything, and publish.

### Steps

**1. Sync with GitHub**
- Run `git fetch origin && git status` to check if local is behind
- If discrepancies exist, GitHub wins (already the case per project setup — Lovable auto-syncs both ways)
- Verify with `git log origin/main..HEAD` and `git log HEAD..origin/main`

**2. Build verification**
- Run `npx vite build` to catch TypeScript/build errors
- Fix any errors found (likely schema mismatches between code and DB types)

**3. Seed test data**
Insert realistic data via `psql` / insert tool into:
- `content_categories` (Ventas, Liderazgo, Procesos)
- `content_posts` (3 articles, 1 video, 1 PDF) to test ContenidoDeValor + AdminContenido
- `novedades` (2 published items) to test Novedades tab
- `wall_posts` + `wall_comments` (2 posts with comments) to test Muro + counter trigger
- `admin_config` (master_password key) to test AdminGate

**4. Create real test user**
- Use Supabase admin API via SQL to create user `test@mejoraapp.com` with password
- Trigger `handle_new_user` should auto-create profile
- Update profile with `nombre`, `apellido`, `cargo`, `email`
- Assign `user` role (and a separate admin user for admin testing)

**5. End-to-end testing (round 1)**
Use browser tool to test full flow:
- `/auth` → secret dot visible
- Login with test user → lands on `/`
- Navigate all 4 tabs: Contenido, Diagnóstico, Muro, Novedades
- Create wall post → verify appears
- Take diagnostic test → verify result saved
- Open profile complete modal flow
- Click secret dot → admin gate → enter password → admin panel
- Test each admin tab: Contenido, IA, Novedades, Muro, Usuarios, Seguridad
- Logout → back to `/auth`

**6. Fix any errors found, re-test**

**7. Documentation**
Create `Documents/CAMBIOS-Sincronizacion-2026-04-19.md` with:
- Summary of GitHub→Lovable sync
- Schema migrations applied (profiles fields, content_posts media fields, wall_comments table, admin_config)
- New admin access UX (secret dot in /auth + Shield return icon)
- E2E test results per section
- Test data seeded
- Optimization notes

**8. Publish**
- Display publish action so the user can click Update

### Technical notes
- Database is already in sync with GitHub code (per previous migration `20260418164609`)
- Test users created via direct SQL into `auth.users` won't work cleanly — better to use signup flow via browser, or use service role via edge function. **Approach**: use browser tool to register a user through the actual `/auth` form (most realistic).
- Admin user: assign `admin` role via insert tool to existing user after creation
- Master password for AdminGate must exist in `admin_config` — seed it

### Out of scope
- Won't refactor existing code unless tests reveal bugs
- Won't change branding or copy
