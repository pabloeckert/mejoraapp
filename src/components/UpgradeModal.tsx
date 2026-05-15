import { X, Check } from 'lucide-react';
import { MEMBERSHIP_CONFIG } from '@/lib/brand';

interface UpgradeModalProps {
  targetLevel: 'n1' | 'n2';
  isOpen: boolean;
  onClose: () => void;
}

const CHECKOUT_URLS: Record<'n1' | 'n2', string> = {
  n1: import.meta.env.VITE_TIENDUP_N1_URL ?? '',
  n2: import.meta.env.VITE_TIENDUP_N2_URL ?? '',
};

const SOCIAL_PROOF: Record<'n1' | 'n2', string> = {
  n1: 'Más de 200 líderes ya hacen crecer sus empresas desde acá.',
  n2: 'Una reunión del Círculo puede valer más que doce meses de membresía.',
};

export function UpgradeModal({ targetLevel, isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  const config = MEMBERSHIP_CONFIG[targetLevel];
  const borderColor = config.border;
  const checkoutUrl = CHECKOUT_URLS[targetLevel];

  const handlePay = () => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#111118', border: `1px solid ${borderColor}` }}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white">{config.label}</h2>
          <p className="text-sm mt-1" style={{ color: borderColor }}>{config.tagline}</p>
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-2">
          {config.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-gray-300">
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: borderColor }} />
              {benefit}
            </li>
          ))}
        </ul>

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          {config.priceARS && (
            <>
              <span className="text-2xl font-bold text-white">
                ARS {config.priceARS.toLocaleString('es-AR')}
              </span>
              {config.priceUSD && (
                <span className="text-sm text-gray-400">· USD {config.priceUSD}</span>
              )}
              <span className="text-xs text-gray-500">/mes</span>
            </>
          )}
        </div>

        {/* Social proof */}
        <p className="text-xs text-gray-400 italic">{SOCIAL_PROOF[targetLevel]}</p>

        {/* CTA principal */}
        <button
          onClick={handlePay}
          className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-95"
          style={{
            background: borderColor,
            color: targetLevel === 'n2' ? '#0D0D0D' : '#FFFFFF',
          }}
        >
          Ir a pagar →
        </button>

        {/* Nota post-pago */}
        <p className="text-xs text-center text-gray-500">
          Después de pagar, volvé y tocá{' '}
          <strong className="text-gray-400">"Verificar membresía"</strong> en tu perfil.
        </p>

        {/* Botón secundario */}
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
