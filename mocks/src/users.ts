/**
 * User fixtures.
 *
 * Compact, demo-ready users referenced by every other fixture file.
 * The Phase 0 demo user is `DEMO_USER_ID` — see `role-stacks.ts` for the
 * 6-role stack assigned to them.
 */

import type { User } from './types';

export const DEMO_USER_ID = 'user-alex-yeti';

export const USERS: User[] = [
  {
    id: DEMO_USER_ID,
    email: 'alex@yeti.test',
    name: 'Alex Park',
    avatarUrl: 'https://i.pravatar.cc/256?u=alex',
    primaryOrgId: 'org-yeti-collective',
  },
  {
    id: 'user-jordan-rivera',
    email: 'jordan@yeti.test',
    name: 'Jordan Rivera',
    avatarUrl: 'https://i.pravatar.cc/256?u=jordan',
    primaryOrgId: 'org-yeti-collective',
  },
  {
    id: 'user-sam-okafor',
    email: 'sam@yeti.test',
    name: 'Sam Okafor',
    avatarUrl: 'https://i.pravatar.cc/256?u=sam',
  },
  {
    id: 'user-priya-mehta',
    email: 'priya@yeti.test',
    name: 'Priya Mehta',
    avatarUrl: 'https://i.pravatar.cc/256?u=priya',
  },
  {
    id: 'user-mateo-luna',
    email: 'mateo@yeti.test',
    name: 'Mateo Luna',
    avatarUrl: 'https://i.pravatar.cc/256?u=mateo',
  },
  {
    id: 'user-zara-kim',
    email: 'zara@yeti.test',
    name: 'Zara Kim',
    avatarUrl: 'https://i.pravatar.cc/256?u=zara',
  },
];

export function userById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function demoUser(): User {
  return USERS[0];
}
