import { BookOpen, MessageSquare, Sparkles, ClipboardCheck, Users, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, boolean>;
}

const tabs = [
  { id: "contenido", label: "Contenido", icon: BookOpen },
  { id: "diagnostico", label: "Mirror", icon: ClipboardCheck, accent: true },
  { id: "muro", label: "Muro", icon: MessageSquare },
  { id: "comunidad", label: "Comunidad", icon: Users },
  { id: "mentor", label: "Mentor", icon: Bot },
  { id: "novedades", label: "Novedades", icon: Sparkles },
];

const BottomNav = ({ activeTab, onTabChange, badges }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" role="navigation" aria-label="Navegación principal">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasNew = badges?.[tab.id] ?? false;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${tab.label}${hasNew ? " (nuevo contenido)" : ""}`}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[72px]",
                isActive
                  ? "text-mc-dark-blue bg-mc-dark-blue/8 dark:bg-primary/12"
                  : tab.accent
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                {hasNew && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mc-red rounded-full border-2 border-card animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-caption",
                isActive ? "font-bold" : tab.accent ? "font-semibold" : "font-medium"
              )}>
                {tab.label}
              </span>
              {tab.accent && !isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
