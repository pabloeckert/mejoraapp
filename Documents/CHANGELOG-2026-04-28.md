# Changelog — Sesión 2026-04-28

## Commit 1: `b48425d` — fix: default light theme, a11y contrast, e2e test fixes

### Fixes
| Archivo | Problema | Fix |
|---------|----------|-----|
| `src/contexts/ThemeContext.tsx` | Default dark mode si el OS tenía dark mode | Default = `"light"` siempre |
| `src/pages/Auth.tsx` | Botón "Admin" con contraste 2.07:1 (WCAG AA mín: 4.5:1) | `text-muted-foreground` sin `/50` opacity |
| `index.html` | `X-Frame-Options` y `frame-ancestors` en `<meta>` (browser los ignora) | Eliminados del meta CSP |
| `e2e/auth.spec.ts` | Locator de contraseña matcheaba 2 elementos | `.first()` + placeholder específico |
| `e2e/accessibility.spec.ts` | Regla `keyboard` no existe en axe-core | Reemplazada por `tabindex` + `focus-order-semantics` |

### Tests
- Unit: 103/103 ✅
- E2E: 25/25 ✅ (antes 21/25)

---

## Commit 2: `53e8b4f` — feat: UX improvements across the app

### A. NotFound.tsx — Español + personalidad
- **Antes:** "Oops! Page not found" / "Return to Home" / `console.error`
- **Ahora:** "Esta página se perdió en el camino" con icono Compass, CTAs "Ir al inicio" + "Volver atrás", Sentry.captureMessage

### B. Novedades — Empty state con CTA
- **Antes:** "Próximamente" seco, sin acción
- **Ahora:** Botón "Consultanos por WhatsApp" que lleva al chat con mensaje pre-cargado

### C. BottomNav — Jerarquía visual
- **Antes:** 4 tabs con igual peso visual
- **Ahora:** Tab "Mirror" (diagnóstico) con color `text-primary`, `font-semibold`, y dot indicator cuando no está activo

### D. CookieConsent — Link roto fix
- **Antes:** Link a `/Documents/PRIVACIDAD.html` (no existe)
- **Ahora:** Link a `/politica-privacidad.html` (página real)

### E. Landing — Scroll storytelling
- **Antes:** Secciones estáticas, todo visible de una
- **Ahora:** Componente `ScrollReveal` con IntersectionObserver — fade-in + translateY al scroll, escalonado por sección

### F. Servicios — Fix tab navigation
- **Antes:** "Ver próximos eventos" → `#novedades` (ancla rota)
- **Ahora:** Dispatch evento `navigate-tab` para cambiar al tab Novedades

### G. Loading fallback — Branding
- **Antes:** Spinner azul genérico sobre fondo blanco
- **Ahora:** Logo de la comunidad con animación pulse + spinner debajo

### H. Microcopy — Forms más humanos
- **LoginForm:** "Cargando..." → spinner + "Ingresando…"
- **SignupForm:** "Cargando..." → spinner + "Creando tu cuenta…"

### I. Novedades — "Leer más" mejorado
- **Antes:** `<button>` de texto con underline
- **Ahora:** `<Button variant="ghost">` con mejor hit area (h-7 px-2)

### Tests post-cambios
- Unit: 103/103 ✅
- E2E: 25/25 ✅
- Build: ✅ (9.48s)

---

## Archivos modificados (9)
```
src/App.tsx                        — Loading fallback con logo
src/components/BottomNav.tsx       — Jerarquía visual Mirror
src/components/CookieConsent.tsx   — Fix link privacidad
src/components/Servicios.tsx       — Fix tab navigation eventos
src/components/auth/LoginForm.tsx  — Microcopy + spinner
src/components/auth/SignupForm.tsx — Microcopy + spinner
src/components/tabs/Novedades.tsx  — Empty state CTA + botón mejorado
src/pages/Landing.tsx              — Scroll storytelling
src/pages/NotFound.tsx             — Español + Sentry
```
