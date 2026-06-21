import { Tag } from '../display/tag';

export type SeasonCycle = 'spring_summer' | 'fall_winter';

export interface SeasonPillProps {
  cycle: SeasonCycle;
  year: number;
  /** Optional override (e.g. "Spring/Summer 2026 · Week 4"). */
  label?: string;
}

/**
 * Compact season indicator. Spring/Summer renders warm; Fall/Winter cool.
 */
export function SeasonPill({ cycle, year, label }: SeasonPillProps) {
  const computed =
    cycle === 'spring_summer'
      ? `Spring/Summer ${year}`
      : `Fall/Winter ${year}`;
  return (
    <Tag
      label={label ?? computed}
      tone={cycle === 'spring_summer' ? 'warning' : 'info'}
      size="sm"
    />
  );
}
