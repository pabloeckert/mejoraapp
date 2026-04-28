/**
 * Component Tests
 *
 * Tests for React component rendering and behavior.
 * Uses @testing-library/react for component testing.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    getChannels: vi.fn().mockReturnValue([]),
    removeChannel: vi.fn(),
  },
}));

// Mock PostHog
vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

// ── Error Boundary Tests ────────────────────────────────────────
describe("ErrorBoundary", () => {
  it("renders children when no error", async () => {
    const { default: ErrorBoundary } = await import("@/components/ErrorBoundary");
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Test content")).toBeDefined();
  });

  it("renders fallback UI when error occurs", async () => {
    const { default: ErrorBoundary } = await import("@/components/ErrorBoundary");

    const ThrowError = () => {
      throw new Error("Test error");
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo salió mal")).toBeDefined();
    expect(screen.getByText("Reintentar")).toBeDefined();
    expect(screen.getByText("Ir al inicio")).toBeDefined();

    consoleSpy.mockRestore();
  });
});

// ── Loading Fallback Tests ──────────────────────────────────────
describe("Loading Fallback", () => {
  it("App component exports correctly", async () => {
    const App = await import("@/App");
    expect(App.default).toBeDefined();
  });
});

// ── Auth Form Tests ─────────────────────────────────────────────
describe("Auth Forms", () => {
  it("LoginForm exports correctly", async () => {
    const LoginForm = await import("@/components/auth/LoginForm");
    expect(LoginForm.default).toBeDefined();
  });

  it("SignupForm exports correctly", async () => {
    const SignupForm = await import("@/components/auth/SignupForm");
    expect(SignupForm.default).toBeDefined();
  });

  it("GoogleButton exports correctly", async () => {
    const GoogleButton = await import("@/components/auth/GoogleButton");
    expect(GoogleButton.default).toBeDefined();
  });
});

// ── Tab Components ──────────────────────────────────────────────
describe("Tab Components", () => {
  it("Muro component exports correctly", async () => {
    const Muro = await import("@/components/tabs/Muro");
    expect(Muro.default).toBeDefined();
  });

  it("Novedades component exports correctly", async () => {
    const Novedades = await import("@/components/tabs/Novedades");
    expect(Novedades.default).toBeDefined();
  });

  it("ContenidoDeValor component exports correctly", async () => {
    const ContenidoDeValor = await import("@/components/tabs/ContenidoDeValor");
    expect(ContenidoDeValor.default).toBeDefined();
  });
});

// ── Feature Components ──────────────────────────────────────────
describe("Feature Components", () => {
  it("DiagnosticTest exports correctly", async () => {
    const DiagnosticTest = await import("@/components/DiagnosticTest");
    expect(DiagnosticTest.default).toBeDefined();
  });

  it("Onboarding exports correctly", async () => {
    const Onboarding = await import("@/components/Onboarding");
    expect(Onboarding.default).toBeDefined();
  });

  it("OnboardingV2 exports correctly", async () => {
    const OnboardingV2 = await import("@/components/OnboardingV2");
    expect(OnboardingV2.default).toBeDefined();
  });

  it("BadgeDisplay exports correctly", async () => {
    const BadgeDisplay = await import("@/components/BadgeDisplay");
    expect(BadgeDisplay.BadgeDisplay).toBeDefined();
  });

  it("CommunityRanking exports correctly", async () => {
    const CommunityRanking = await import("@/components/CommunityRanking");
    expect(CommunityRanking.CommunityRanking).toBeDefined();
  });

  it("UserProfile exports correctly", async () => {
    const UserProfile = await import("@/components/UserProfile");
    expect(UserProfile.UserProfile).toBeDefined();
  });
});

// ── Admin Components ────────────────────────────────────────────
describe("Admin Components", () => {
  it("AdminCRM exports correctly", async () => {
    const AdminCRM = await import("@/components/admin/AdminCRM");
    expect(AdminCRM.default).toBeDefined();
  });

  it("AdminUsuarios exports correctly", async () => {
    const AdminUsuarios = await import("@/components/admin/AdminUsuarios");
    expect(AdminUsuarios.default).toBeDefined();
  });

  it("AdminContenido exports correctly", async () => {
    const AdminContenido = await import("@/components/admin/AdminContenido");
    expect(AdminContenido.default).toBeDefined();
  });

  it("AdminMuro exports correctly", async () => {
    const AdminMuro = await import("@/components/admin/AdminMuro");
    expect(AdminMuro.default).toBeDefined();
  });

  it("AdminNovedades exports correctly", async () => {
    const AdminNovedades = await import("@/components/admin/AdminNovedades");
    expect(AdminNovedades.default).toBeDefined();
  });

  it("AdminSeguridad exports correctly", async () => {
    const AdminSeguridad = await import("@/components/admin/AdminSeguridad");
    expect(AdminSeguridad.default).toBeDefined();
  });

  it("AdminIA exports correctly", async () => {
    const AdminIA = await import("@/components/admin/AdminIA");
    expect(AdminIA.default).toBeDefined();
  });
});

// ── UI Components ───────────────────────────────────────────────
describe("UI Components", () => {
  it("Button renders correctly", async () => {
    const { Button } = await import("@/components/ui/button");
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("Card renders correctly", async () => {
    const { Card, CardContent } = await import("@/components/ui/card");
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("Input renders correctly", async () => {
    const { Input } = await import("@/components/ui/input");
    render(<Input placeholder="Test input" />);
    expect(screen.getByPlaceholderText("Test input")).toBeDefined();
  });

  it("Skeleton renders correctly", async () => {
    const { Skeleton } = await import("@/components/ui/skeleton");
    const { container } = render(<Skeleton className="h-4 w-full" />);
    expect(container.firstChild).toBeDefined();
  });
});

// ── Context Providers ───────────────────────────────────────────
describe("Context Providers", () => {
  it("AuthProvider exports correctly", async () => {
    const { AuthProvider } = await import("@/contexts/AuthContext");
    expect(AuthProvider).toBeDefined();
  });

  it("ThemeProvider exports correctly", async () => {
    const { ThemeProvider } = await import("@/contexts/ThemeContext");
    expect(ThemeProvider).toBeDefined();
  });

  it("I18nProvider exports correctly", async () => {
    const { I18nProvider } = await import("@/contexts/I18nContext");
    expect(I18nProvider).toBeDefined();
  });
});

// ── Hooks ───────────────────────────────────────────────────────
describe("Hooks Exports", () => {
  it("useAuth exports correctly", async () => {
    const { useAuth } = await import("@/contexts/AuthContext");
    expect(useAuth).toBeDefined();
  });

  it("useToast exports correctly", async () => {
    const { useToast } = await import("@/hooks/use-toast");
    expect(useToast).toBeDefined();
  });

  it("useBadges exports correctly", async () => {
    const { useBadges } = await import("@/hooks/useBadges");
    expect(useBadges).toBeDefined();
  });

  it("useWallInteractions exports correctly", async () => {
    const { useWallInteractions } = await import("@/hooks/useWallInteractions");
    expect(useWallInteractions).toBeDefined();
  });

  it("usePullToRefresh exports correctly", async () => {
    const { usePullToRefresh } = await import("@/hooks/usePullToRefresh");
    expect(usePullToRefresh).toBeDefined();
  });

  it("useRanking exports correctly", async () => {
    const { useRanking } = await import("@/hooks/useRanking");
    expect(useRanking).toBeDefined();
  });

  it("useCRM hooks export correctly", async () => {
    const crm = await import("@/hooks/useCRM");
    expect(crm.useCRMClients).toBeDefined();
    expect(crm.useCRMProducts).toBeDefined();
    expect(crm.useCRMInteractions).toBeDefined();
  });

  it("useContentRecommendations exports correctly", async () => {
    const { useContentRecommendations } = await import("@/hooks/useContentRecommendations");
    expect(useContentRecommendations).toBeDefined();
  });

  it("useFeatureAccess exports correctly", async () => {
    const { useFeatureAccess } = await import("@/hooks/useFeatureAccess");
    expect(useFeatureAccess).toBeDefined();
  });

  it("useAdminAction exports correctly", async () => {
    const { useAdminAction } = await import("@/hooks/useAdminAction");
    expect(useAdminAction).toBeDefined();
  });
});
