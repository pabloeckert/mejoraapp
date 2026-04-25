import { BookOpen, MessageSquare, Sparkles, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, boolean>;
}

const tabs = [
  { id: "contenido", label: "Contenido", icon: BookOpen },
  { id: "diagnostico", label: "Mirror", icon: ClipboardCheck },
  { id: "muro", label: "Muro", icon: MessageSquare },
  { id: "novedades", label: "Novedades", icon: Sparkles },
];

const BottomNav = ({ activeTab, onTabChange, badges }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasNew = badges?.[tab.id] ?? false;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[72px]",
                isActive
                  ? "text-mc-dark-blue bg-mc-dark-blue/8 dark:bg-primary/12"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                {hasNew && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mc-red rounded-full border-2 border-card animate-pulse" />
                )}
              </div>
              <span className={cn("text-caption", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
