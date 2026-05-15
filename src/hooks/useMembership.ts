import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { MembershipLevel } from '@/lib/brand';

const rank: Record<MembershipLevel, number> = { n0: 0, n1: 1, n2: 2, admin: 3 };

/** Mapea access_level (mayúsculas DB) → MembershipLevel (minúsculas) */
function mapLevel(raw: string | null | undefined): MembershipLevel {
  switch ((raw ?? '').toUpperCase()) {
    case 'N1':    return 'n1';
    case 'N2':    return 'n2';
    case 'ADMIN': return 'admin';
    default:      return 'n0';
  }
}

export function useMembership() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const expires = profile?.membership_expires_at
    ? new Date(profile.membership_expires_at)
    : null;
  const isExpired = expires ? expires < new Date() : false;

  const rawLevel = mapLevel(profile?.access_level);
  const level: MembershipLevel = isExpired && rawLevel !== 'admin' ? 'n0' : rawLevel;

  return {
    level,
    isN0:    level === 'n0',
    isN1:    rank[level] >= 1,
    isN2:    rank[level] >= 2,
    isAdmin: level === 'admin',
    canAccess: (req: MembershipLevel) => rank[level] >= rank[req],
    expiresAt: expires,
    isExpired,
    daysLeft: expires
      ? Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86_400_000))
      : null,
  };
}
