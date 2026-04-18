import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { Mountain, Snowflake, Trees } from 'lucide-react-native';

export type TeamLevel = 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL';

export interface SquadNeed {
  label: string;
  urgent?: boolean;
}

export interface Squad {
  id: string;
  name: string;
  level: TeamLevel;
  location: string;
  sport: string;
  Icon: ComponentType<LucideProps>;
  needs: SquadNeed[];
  helper?: string;
}

export const SQUADS: Squad[] = [
  {
    id: 'avalanche-fc',
    name: 'Avalanche FC',
    level: 'INTERMEDIATE',
    location: 'Denver, CO',
    sport: "Men's Soccer",
    Icon: Mountain,
    needs: [
      { label: 'Goalie', urgent: true },
      { label: 'Center Back' },
    ],
  },
  {
    id: 'glacier-knights',
    name: 'Glacier Knights',
    level: 'ADVANCED',
    location: 'Anchorage, AK',
    sport: 'Ice Hockey - D2',
    Icon: Snowflake,
    needs: [{ label: 'Defensemen' }, { label: 'Right Wing' }],
  },
  {
    id: 'summit-hoops',
    name: 'Summit Hoops',
    level: 'RECREATIONAL',
    location: 'Boulder, CO',
    sport: 'Co-ed Basketball',
    Icon: Trees,
    needs: [{ label: 'Point Guard' }],
    helper: 'Looking for subs weekly.',
  },
];
