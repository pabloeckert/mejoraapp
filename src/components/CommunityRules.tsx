/**
 * CommunityRules — Reglas de la comunidad visibles en el muro
 *
 * Se muestra como un expandible al inicio del muro.
 * Define las reglas claras para participación anónima.
 */

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const rules = [
  {
    icon: Check,
    text: "Compartí experiencias reales de negocio — buenas o malas.",
    ok: true,
  },
  {
    icon: Check,
    text: "Hacé preguntas genuinas. Pedí consejo. Ofrecé perspectiva.",
    ok: true,
  },
  {
    icon: Check,
    text: "Respetá el anonimato de todos. Nadie se expone acá.",
    ok: true,
  },
  {
    icon: AlertTriangle,
    text: "Sin ventas, promos ni publicidad. Este no es un canal comercial.",
    ok: false,
  },
  {
    icon: AlertTriangle,
    text: "Sin datos personales: no publiques teléfonos, direcciones ni emails.",
    ok: false,
  },
  {
    icon: AlertTriangle,
    text: "Sin insultos a personas o empresas con nombre. La frustración está bien, el ataque no.",
    ok: false,
  },
];

export const CommunityRules = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-dashed border-muted-foreground/20">
      <CardContent className="p-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Reglas de la comunidad
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            <p className="text-caption text-muted-foreground leading-relaxed">
              El muro es un espacio seguro para compartir. Las publicaciones son anónimas
              y moderadas por IA. Estas son las reglas:
            </p>
            <div className="space-y-1.5">
              {rules.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      rule.ok ? "bg-green-500/5" : "bg-amber-500/5"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        rule.ok ? "text-green-600" : "text-amber-600"
                      }`}
                    />
                    <span className="text-xs text-foreground leading-snug">
                      {rule.text}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-caption text-muted-foreground">
              Los posts que no cumplan estas reglas serán rechazados por la moderación automática.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityRules;
