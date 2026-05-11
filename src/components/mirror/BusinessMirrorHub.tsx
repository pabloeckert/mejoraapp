/**
 * BusinessMirrorHub — Catálogo de tests del Business Mirror Gamer
 *
 * Muestra los tests disponibles con su estado (completado/pendiente).
 * N1/N2 pueden acceder a todos. N0 ve blur.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/useAccessLevel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessGate } from "@/components/AccessGate";
import {
  Gamepad2,
  Clock,
  CheckCircle2,
  Lock,
  ScanEye,
  Siren,
  Route,
  Brain,
  CircuitBoard,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TESTS, type TestDefinition } from "@/data/businessMirrorTests";
import { fetchMirrorResults, type MirrorResult } from "@/services/business-mirror.service";

const ICON_MAP: Record<string, typeof Gamepad2> = {
  Mirror: ScanEye,
  ScanEye,
  Siren,
  Route,
  Brain,
  CircuitBoard,
  Gamepad2,
};

interface BusinessMirrorHubProps {
  onSelectTest: (slug: string) => void;
}

export function BusinessMirrorHub({ onSelectTest }: BusinessMirrorHubProps) {
  const { user } = useAuth();
  const { level, isLoading: accessLoading } = useAccessLevel(user?.id);
  const [results, setResults] = useState<MirrorResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchMirrorResults(user.id, 20)
      .then((data) => { if (!cancelled) setResults(data); })
      .catch(() => {})
      .then(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const completedSlugs = new Set(
    results.map((r) => {
      const test = ALL_TESTS.find((t) => t.questions.some(() => true));
      // Find by test_id matching - simpler: just track completed test slugs from results
      return r.profile ? "completed" : "";
    })
  );

  // Build a map of last result per test slug
  const lastResultBySlug = new Map<string, MirrorResult>();
  for (const result of results) {
    // We need to match by test slug - since we have test_id, we'll match differently
    // For now, track all completed profiles
    for (const test of ALL_TESTS) {
      // If this result's profile matches one of the test's profiles, it's likely from that test
      if (test.profiles[result.profile ?? ""]) {
        if (!lastResultBySlug.has(test.slug)) {
          lastResultBySlug.set(test.slug, result);
        }
      }
    }
  }

  const completedCount = lastResultBySlug.size;
  const totalCount = ALL_TESTS.length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center mx-auto">
          <Gamepad2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-title font-extrabold">Business Mirror Gamer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Juegos que te hacen pensar y crecer
          </p>
        </div>
      </div>

      {/* Progress summary */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {completedCount} de {totalCount} tests completados
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
              <div
                className="bg-gradient-to-r from-pink-500 to-violet-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test list */}
      <div className="space-y-3">
        {ALL_TESTS.map((test) => {
          const lastResult = lastResultBySlug.get(test.slug);
          const isCompleted = !!lastResult;
          const Icon = ICON_MAP[test.icon] ?? Gamepad2;
          const profileData = isCompleted && lastResult.profile
            ? test.profiles[lastResult.profile]
            : null;

          return (
            <AccessGate key={test.slug} required="N1" blur>
              <button
                onClick={() => onSelectTest(test.slug)}
                className="w-full text-left group"
              >
                <Card className="hover:shadow-card-hover transition-all group-hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${test.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: test.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{test.title}</h3>
                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Hecho
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {test.subtitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {test.timeEstimateMin} min
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {test.category}
                          </Badge>
                          {isCompleted && profileData && (
                            <span
                              className="text-xs font-medium"
                              style={{ color: profileData.color }}
                            >
                              {profileData.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            </AccessGate>
          );
        })}
      </div>

      {/* Info footer */}
      <p className="text-xs text-muted-foreground text-center">
        Cada semana sumamos un nuevo test. Recibirás una notificación.
      </p>
    </div>
  );
}
