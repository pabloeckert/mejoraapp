/**
 * Landing — Página pública de aterrizaje
 *
 * Muestra la propuesta de valor de MejoraApp para visitantes no autenticados.
 * Accesible en /landing. El dominio mejoraok.com puede apuntar acá.
 *
 * Secciones:
 *   1. Hero con CTA
 *   2. Features (4 tabs de la app)
 *   3. Diagnóstico preview
 *   4. Social proof
 *   5. CTA final
 */

import { useState, useRef, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ── Scroll reveal wrapper ─────────────────────────────────────────────
function ScrollReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: "Muro Anónimo",
    desc: "Compartí experiencias, dudas y frustraciones sin revelar tu identidad. Moderado por IA para mantener calidad.",
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  {
    icon: BookOpen,
    title: "Contenido de Valor",
    desc: "Tips, estrategias y reflexiones semanales para hacer crecer tu negocio. Generado por IA y curado por expertos.",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    icon: ClipboardCheck,
    title: "Diagnóstico Estratégico",
    desc: "8 preguntas, 1 minuto. Descubrí qué está frenando tu crecimiento y recibí un plan de acción personalizado.",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Sparkles,
    title: "Novedades",
    desc: "Eventos, workshops, lanzamientos y herramientas de la comunidad Mejora Continua.",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
];

const stats = [
  { value: "1 min", label: "Diagnóstico" },
  { value: "100%", label: "Anónimo" },
  { value: "IA", label: "Moderación" },
  { value: "Gratis", label: "Siempre" },
];

export default function Landing() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-mc-dark-blue/5 to-transparent dark:from-mc-dark-blue/20" />

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          {/* Badge */}
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mc-dark-blue/10 dark:bg-primary/15 text-caption font-medium text-mc-dark-blue dark:text-primary mb-6">
              <Shield className="w-3.5 h-3.5" />
              Comunidad de líderes empresariales
            </div>
          </ScrollReveal>

          {/* Heading */}
          <ScrollReveal delay={100}>
            <h1 className="text-display md:text-[2.5rem] md:leading-tight font-extrabold text-foreground mb-4">
              Hacé crecer tu negocio
              <br />
              <span className="text-mc-dark-blue dark:text-primary">con los que entienden</span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={200}>
            <p className="text-subtitle text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Contenido de valor, diagnóstico estratégico y una comunidad anónima donde los empresarios argentinos comparten lo que realmente pasa.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-body font-semibold px-8">
                  Empezá gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="gap-2 text-body">
                  Conocé más <ChevronRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={400}>
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-title font-bold text-foreground">{stat.value}</div>
                  <div className="text-caption text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-heading font-bold text-foreground mb-3">
                Todo lo que necesitás, en un solo lugar
              </h2>
              <p className="text-body text-muted-foreground max-w-md mx-auto">
                Cuatro herramientas diseñadas para empresarios que quieren crecer con estrategia, no con improvisación.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 100}>
                  <Card
                    className={`transition-all duration-200 cursor-default ${
                      hoveredFeature === i ? "shadow-md scale-[1.02]" : "shadow-sm"
                    }`}
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <CardContent className="p-5 flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-subtitle font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-body text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Diagnóstico preview ──────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-caption font-medium text-emerald-600 dark:text-emerald-400 mb-4">
              <Zap className="w-3.5 h-3.5" />
              Diagnóstico estratégico
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="text-heading font-bold text-foreground mb-3">
              ¿Qué está frenando tu crecimiento?
            </h2>
            <p className="text-body text-muted-foreground max-w-md mx-auto mb-8">
              8 preguntas. 1 minuto. Un plan de acción personalizado basado en tu situación real.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[
              { icon: "🎯", title: "Preciso", desc: "Detecta tu perfil exacto" },
              { icon: "⚡", title: "Rápido", desc: "1 minuto, sin vueltas" },
              { icon: "📋", title: "Accionable", desc: "Plan concreto post-test" },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={200 + i * 100}>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-body font-semibold text-foreground">{item.title}</div>
                    <div className="text-caption text-muted-foreground">{item.desc}</div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={500}>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Hacé el diagnóstico gratis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-caption font-medium text-purple-600 dark:text-purple-400 mb-4">
              <Users className="w-3.5 h-3.5" />
              Comunidad
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="text-heading font-bold text-foreground mb-3">
              No estás solo en esto
            </h2>
            <p className="text-body text-muted-foreground max-w-md mx-auto mb-8">
              Una comunidad de empresarios argentinos que comparten lo que realmente pasa — sin filtros, sin exposición.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { emoji: "🇦🇷", text: "Para empresarios argentinos" },
              { emoji: "🔒", text: "100% anónimo en el muro" },
              { emoji: "🤖", text: "Moderado por IA" },
            ].map((item, i) => (
              <ScrollReveal key={item.text} delay={200 + i * 100}>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-body text-foreground">{item.text}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-mc-dark-blue dark:bg-primary/10">
        <ScrollReveal>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-heading font-bold text-white dark:text-foreground mb-3">
              ¿Listo para crecer?
            </h2>
            <p className="text-body text-white/80 dark:text-muted-foreground mb-8">
              Unite a la comunidad. Es gratis, es anónimo, y en 1 minuto ya tenés tu primer diagnóstico.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-body font-semibold">
                Crear cuenta gratis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-subtitle font-bold text-foreground">MejoraApp</span>
            <span className="text-caption text-muted-foreground">by Mejora Continua</span>
          </div>
          <div className="flex gap-4 text-caption text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
            <a href="/politica-privacidad.html" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="/terminos-servicio.html" className="hover:text-foreground transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
