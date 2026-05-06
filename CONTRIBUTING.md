# Contribuir a MejoraApp

## Flujo de Trabajo

### 1. Crear Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feat/nombre-del-feature
```

**Naming de branches:**
- `feat/` — Nuevas funcionalidades
- `fix/` — Corrección de bugs
- `refactor/` — Refactorización
- `docs/` — Documentación
- `test/` — Tests
- `chore/` — Mantenimiento

### 2. Hacer Cambios

```bash
# Desarrollar
npm run dev

# Verificar types
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm run test
```

### 3. Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar búsqueda de contenido
fix: corregir scroll en muro después de publicar
refactor: extraer lógica de badges a hook separado
docs: actualizar guía de setup
test: agregar tests para wall service
chore: actualizar dependencias
```

**Reglas:**
- Un commit por cambio lógico
- Mensaje en imperativo ("agregar", no "agregué")
- Scope opcional pero recomendado: `feat(muro):`, `fix(auth):`

### 4. Pull Request

1. Push el branch: `git push origin feat/nombre-del-feature`
2. Abrir PR a `main`
3. Completar el checklist del PR template
4. Esperar review de @pabloeckert

### 5. Review

- Al menos 1 approval requerido
- Todos los checks de CI deben pasar
- Sin conflictos con `main`
- Documentación actualizada si aplica

---

## Convenciones de Código

### TypeScript

```typescript
// ✅ Bien: tipos explícitos en funciones públicas
export function fetchPosts(page: number): Promise<Post[]> {
  // ...
}

// ✅ Bien: inferencia en variables locales
const posts = await fetchPosts(0);

// ❌ Mal: any explícito
function doSomething(data: any): any {
  // ...
}
```

### Componentes React

```tsx
// ✅ Bien: functional components con tipos
interface PostCardProps {
  post: WallPost;
  onLike: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  return <div>...</div>;
}

// ❌ Mal: default export sin tipos
export default function PostCard(props) {
  return <div>...</div>;
}
```

### Hooks

```typescript
// ✅ Bien: hook con dependencias claras
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

### CSS

```tsx
// ✅ Bien: Tailwind con cn() para conditional classes
<button className={cn(
  "px-4 py-2 rounded-lg transition-colors",
  isActive ? "bg-primary text-white" : "bg-gray-100"
)}>

// ❌ Mal: template literals sin cn()
<button className={`px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
```

---

## Estructura de un Feature

```
src/components/feature/
├── FeatureComponent.tsx    # Componente principal
├── FeatureSubComponent.tsx # Sub-componentes
├── types.ts                # Tipos del feature
├── index.ts                # Re-exports
└── __tests__/              # Tests del feature
    └── FeatureComponent.test.tsx
```

---

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { PostCard } from "../PostCard";

describe("PostCard", () => {
  it("renders post content", () => {
    render(<PostCard post={mockPost} onLike={vi.fn()} />);
    expect(screen.getByText("Test post")).toBeInTheDocument();
  });

  it("calls onLike when like button clicked", () => {
    const onLike = vi.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);
    fireEvent.click(screen.getByRole("button", { name: /like/i }));
    expect(onLike).toHaveBeenCalledWith("post-id");
  });
});
```

### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test("user can login and see muro", async ({ page }) => {
  await page.goto("/auth");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Muro")).toBeVisible();
});
```

---

## Base de Datos

### Migrations

Las migraciones van en `supabase/migrations/` con formato:

```
YYYYMMDDHHMMSS_descripcion.sql
```

Ejemplo: `20260505000000_missing_tables.sql`

### Naming de Tablas

- Snake_case plural: `wall_posts`, `crm_clients`
- Prefijo por dominio: `wall_`, `crm_`, `content_`
- Join tables: `entity1_entity2` (ej: `challenge_participants`)

### Naming de Columnas

- Snake_case: `created_at`, `user_id`, `likes_count`
- Booleanos: `is_active`, `has_completed_diagnostic`
- Timestamps: `created_at`, `updated_at`

---

## Dependencias

### Agregar una nueva dependencia

1. Verificar que no sea reemplazable con código existente
2. Verificar bundle size en [bundlephobia.com](https://bundlephobia.com)
3. Verificar que esté mantenida (último commit < 6 meses)
4. Instalar: `npm install paquete`
5. Documentar en CHANGELOG.md

### Quitar una dependencia

1. Verificar que no se use en ningún archivo
2. Desinstalar: `npm uninstall paquete`
3. Documentar en CHANGELOG.md

---

## Preguntas

- **¿Dónde pregunto?** — GitHub Issues o WhatsApp del proyecto
- **¿Necesito acceso a Supabase?** — Pedir a @pabloeckert
- **¿Puedo hacer merge?** — Solo @pabloeckert tiene permisos de merge a main
