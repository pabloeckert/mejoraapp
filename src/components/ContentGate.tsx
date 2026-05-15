import { useState, type ReactNode } from 'react';
import { useMembership } from '@/hooks/useMembership';
import { UpgradeModal } from '@/components/UpgradeModal';
import { MEMBERSHIP_CONFIG, type MembershipLevel } from '@/lib/brand';

interface ContentGateProps {
  requiredLevel: MembershipLevel;
  preview?: ReactNode;
  children: ReactNode;
  context?: string;
}

const GATE_COPY: Record<'n1' | 'n2', { headline: string }> = {
  n1: { headline: 'Tu comunidad te espera.' },
  n2: { headline: 'La red de C-Level que mueve empresas.' },
};

export function ContentGate({ requiredLevel, preview, children, context: _context }: ContentGateProps) {
  const { canAccess } = useMembership();
  const [modalOpen, setModalOpen] = useState(false);

  if (canAccess(requiredLevel)) return <>{children}</>;

  const gateLevel = (requiredLevel === 'n0' ? 'n1' : requiredLevel) as 'n1' | 'n2';
  const config = MEMBERSHIP_CONFIG[gateLevel];
  const copy = GATE_COPY[gateLevel];
  const borderColor = config.border;

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        {/* Preview borroso */}
        {preview && (
          <div className="blur-md pointer-events-none select-none" aria-hidden>
            {preview}
          </div>
        )}

        {/* Card de upgrade sobre el preview */}
        <div
          className={preview ? 'absolute inset-0 flex items-center justify-center p-4' : ''}
        >
          <div
            className="w-full rounded-xl p-5 flex flex-col gap-3"
            style={{
              background: '#111118',
              border: `1px solid ${borderColor}`,
            }}
          >
            <p className="text-white font-semibold text-sm">{copy.headline}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="h-11 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95 flex items-center justify-center"
              style={{ background: borderColor, color: gateLevel === 'n2' ? '#0D0D0D' : '#FFFFFF' }}
            >
              {config.cta}
            </button>
          </div>
        </div>
      </div>

      <UpgradeModal
        targetLevel={gateLevel}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
