import type {
  RecurringAvailabilitySlot,
  Space,
  SpaceRentalConfig,
  Weekday,
} from './types';

export const SPACES: Space[] = [
  // Yeti Center — flagship
  {
    id: 'space-yeti-court-a',
    facilityId: 'facility-yeti-center',
    name: 'Court A',
    sports: ['basketball', 'volleyball', 'pickleball'],
    surface: 'Hardwood',
    capacity: 50,
    isIndoor: true,
  },
  {
    id: 'space-yeti-court-b',
    facilityId: 'facility-yeti-center',
    name: 'Court B',
    sports: ['basketball', 'volleyball'],
    surface: 'Hardwood',
    capacity: 50,
    isIndoor: true,
  },
  {
    id: 'space-yeti-turf',
    facilityId: 'facility-yeti-center',
    name: 'Turf Field',
    sports: ['soccer', 'flag_football', 'lacrosse'],
    surface: 'Synthetic turf',
    capacity: 80,
    isIndoor: true,
  },
  {
    id: 'space-yeti-outdoor-1',
    facilityId: 'facility-yeti-center',
    name: 'Outdoor Field 1',
    sports: ['soccer', 'flag_football'],
    surface: 'Natural grass',
    capacity: 120,
    isIndoor: false,
  },
  // Summit Rec
  {
    id: 'space-summit-court-1',
    facilityId: 'facility-summit-rec',
    name: 'Court 1',
    sports: ['basketball'],
    surface: 'Hardwood',
    capacity: 40,
    isIndoor: true,
  },
  {
    id: 'space-summit-court-2',
    facilityId: 'facility-summit-rec',
    name: 'Court 2',
    sports: ['basketball', 'volleyball'],
    surface: 'Hardwood',
    capacity: 40,
    isIndoor: true,
  },
  // Front Range Pickleball Park
  {
    id: 'space-frp-court-1',
    facilityId: 'facility-frp-courts',
    name: 'Court 1',
    sports: ['pickleball'],
    surface: 'Sport court',
    capacity: 8,
    isIndoor: false,
  },
  {
    id: 'space-frp-court-2',
    facilityId: 'facility-frp-courts',
    name: 'Court 2',
    sports: ['pickleball'],
    surface: 'Sport court',
    capacity: 8,
    isIndoor: false,
  },
];

export const SPACE_RENTAL_CONFIGS: SpaceRentalConfig[] = [
  // Internal-only: dedicated to Yeti Hoops league
  {
    id: 'src-yeti-court-a',
    spaceId: 'space-yeti-court-a',
    rentalMode: 'internal',
    internalLeagueIds: ['league-yeti-hoops'],
  },
  // Both: shared between league play and rentals
  {
    id: 'src-yeti-court-b',
    spaceId: 'space-yeti-court-b',
    rentalMode: 'both',
    externalHourlyRateCents: 9500,
    internalLeagueIds: ['league-yeti-hoops'],
  },
  {
    id: 'src-yeti-turf',
    spaceId: 'space-yeti-turf',
    rentalMode: 'both',
    externalHourlyRateCents: 18500,
    internalLeagueIds: ['league-yeti-soccer'],
  },
  {
    id: 'src-yeti-outdoor-1',
    spaceId: 'space-yeti-outdoor-1',
    rentalMode: 'external',
    externalHourlyRateCents: 12000,
    blackoutDates: ['2026-05-25', '2026-07-04'],
  },
  // Summit Rec
  {
    id: 'src-summit-court-1',
    spaceId: 'space-summit-court-1',
    rentalMode: 'both',
    externalHourlyRateCents: 6500,
    internalLeagueIds: ['league-yeti-hoops'],
  },
  {
    id: 'src-summit-court-2',
    spaceId: 'space-summit-court-2',
    rentalMode: 'external',
    externalHourlyRateCents: 6500,
  },
  // Front Range Pickleball
  {
    id: 'src-frp-court-1',
    spaceId: 'space-frp-court-1',
    rentalMode: 'both',
    externalHourlyRateCents: 2500,
    internalLeagueIds: ['league-front-range-pickleball'],
  },
  {
    id: 'src-frp-court-2',
    spaceId: 'space-frp-court-2',
    rentalMode: 'external',
    externalHourlyRateCents: 2500,
  },
];

const ALL_WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function dailySlot(
  spaceId: string,
  weekday: Weekday,
  startTime: string,
  endTime: string,
  hourlyRateCents: number,
  isPeak: boolean,
): RecurringAvailabilitySlot {
  return {
    id: `slot-${spaceId}-${weekday}-${startTime.replace(':', '')}`,
    spaceId,
    weekday,
    startTime,
    endTime,
    hourlyRateCents,
    isPeak,
  };
}

/**
 * Recurring availability slots — one per (space × weekday × off/peak block).
 * Off-peak: 06:00-17:00 (weekdays) at the base rate.
 * Peak:     17:00-22:00 (weekdays) + all-day weekends at +30%.
 */
function makeSpaceAvailability(
  spaceId: string,
  baseRateCents: number,
): RecurringAvailabilitySlot[] {
  const peakRate = Math.round(baseRateCents * 1.3);
  return ALL_WEEKDAYS.flatMap((weekday): RecurringAvailabilitySlot[] => {
    const isWeekend = weekday === 'sat' || weekday === 'sun';
    if (isWeekend) {
      return [dailySlot(spaceId, weekday, '08:00', '22:00', peakRate, true)];
    }
    return [
      dailySlot(spaceId, weekday, '06:00', '17:00', baseRateCents, false),
      dailySlot(spaceId, weekday, '17:00', '22:00', peakRate, true),
    ];
  });
}

export const RECURRING_AVAILABILITY: RecurringAvailabilitySlot[] = [
  ...makeSpaceAvailability('space-yeti-court-a', 8500),
  ...makeSpaceAvailability('space-yeti-court-b', 9500),
  ...makeSpaceAvailability('space-yeti-turf', 18500),
  ...makeSpaceAvailability('space-yeti-outdoor-1', 12000),
  ...makeSpaceAvailability('space-summit-court-1', 6500),
  ...makeSpaceAvailability('space-summit-court-2', 6500),
  ...makeSpaceAvailability('space-frp-court-1', 2500),
  ...makeSpaceAvailability('space-frp-court-2', 2500),
];

export function spaceById(id: string): Space | undefined {
  return SPACES.find((s) => s.id === id);
}

export function spacesByFacility(facilityId: string): Space[] {
  return SPACES.filter((s) => s.facilityId === facilityId);
}

export function rentalConfigForSpace(spaceId: string): SpaceRentalConfig | undefined {
  return SPACE_RENTAL_CONFIGS.find((c) => c.spaceId === spaceId);
}

export function availabilityForSpace(spaceId: string): RecurringAvailabilitySlot[] {
  return RECURRING_AVAILABILITY.filter((s) => s.spaceId === spaceId);
}
