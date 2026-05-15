import { useMembership } from '@/hooks/useMembership';
import { MEMBERSHIP_CONFIG } from '@/lib/brand';

const BADGE_STYLES = {
  n0:    { bg: 'rgba(107,114,128,0.08)', border: '#374151', text: '#6B7280' },
  n1:    { bg: 'rgba(28,77,140,0.10)',   border: '#1C4D8C', text: '#1C4D8C' },
  n2:    { bg: 'rgba(242,187,22,0.10)',  border: '#F2BB16', text: '#F2BB16' },
  admin: { bg: 'rgba(217,7,45,0.10)',    border: '#D9072D', text: '#D9072D' },
} as const;

interface MembershipBadgeProps {
  onClick?: () => void;
}

export function MembershipBadge({ onClick }: MembershipBadgeProps) {
  const { level } = useMembership();
  const style = BADGE_STYLES[level];
  const label = level === 'admin' ? 'Admin' : MEMBERSHIP_CONFIG[level as keyof typeof MEMBERSHIP_CONFIG]?.label ?? 'Free';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'perfil' }));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center px-3 rounded-full text-xs font-semibold transition-opacity hover:opacity-80 active:scale-95"
      style={{
        minHeight: 44,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
      aria-label={`Nivel de membresía: ${label}`}
    >
      {label}
    </button>
  );
}
