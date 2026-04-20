import { Tag } from '../display/tag';

export type SkillLevel = 'recreational' | 'intermediate' | 'competitive' | 'elite';

const LABEL: Record<SkillLevel, string> = {
  recreational: 'Recreational',
  intermediate: 'Intermediate',
  competitive: 'Competitive',
  elite: 'Elite',
};

const TONE: Record<
  SkillLevel,
  'neutral' | 'brand' | 'success' | 'warning' | 'info'
> = {
  recreational: 'success',
  intermediate: 'info',
  competitive: 'warning',
  elite: 'brand',
};

export interface SkillLevelPillProps {
  level: SkillLevel;
}

export function SkillLevelPill({ level }: SkillLevelPillProps) {
  return <Tag label={LABEL[level]} tone={TONE[level]} size="sm" />;
}
