import { Tag, type TagSize } from '../display/tag';

/**
 * Role labels (lowercased ids) → display strings. Kept in @sports-yeti/ui
 * so the badge component is self-contained — the canonical map in
 * @sports-yeti/mocks is also exported (`ROLE_LABEL`) and the two stay in
 * sync via tests in Phase 12.
 */
const ROLE_LABEL: Record<string, string> = {
  player: 'Player',
  team_captain: 'Captain',
  referee: 'Referee',
  facility_manager: 'Facility Mgr',
  league_admin: 'League Admin',
  org_admin: 'Org Admin',
};

const ROLE_TONE: Record<
  string,
  'neutral' | 'brand' | 'live' | 'success' | 'warning' | 'error' | 'info'
> = {
  player: 'brand',
  team_captain: 'info',
  referee: 'warning',
  facility_manager: 'success',
  league_admin: 'neutral',
  org_admin: 'neutral',
};

export interface RoleBadgeProps {
  role: string;
  /** Optional explicit override of the label (e.g. with scope). */
  label?: string;
  size?: TagSize;
}

export function RoleBadge({ role, label, size = 'sm' }: RoleBadgeProps) {
  return (
    <Tag
      label={label ?? ROLE_LABEL[role] ?? role}
      tone={ROLE_TONE[role] ?? 'neutral'}
      size={size}
      leadingDot
    />
  );
}
