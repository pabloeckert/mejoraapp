import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { Providers } from "@/components/Providers";
import { CookieConsent } from "@/components/CookieConsent";

// Lazy-loaded pages — each route only downloads its code when needed
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <ErrorBoundary>
    <Providers>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            <Route
              path="/"
              element={
                <RouteErrorBoundary routeName="index">
                  <Index />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/auth"
              element={
                <RouteErrorBoundary routeName="auth">
                  <Auth />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/reset-password"
              element={
                <RouteErrorBoundary routeName="reset-password">
                  <ResetPassword />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin"
              element={
                <RouteErrorBoundary routeName="admin">
                  <Admin />
                </RouteErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <CookieConsent />
    </Providers>
  </ErrorBoundary>
);

export default App;
