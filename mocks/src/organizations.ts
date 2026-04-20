import type { Organization } from './types';
import { DEMO_USER_ID } from './users';

export const DEMO_ORG_ID = 'org-yeti-collective';

export const ORGANIZATIONS: Organization[] = [
  {
    id: DEMO_ORG_ID,
    name: 'Yeti Collective',
    slug: 'yeti-collective',
    logoUrl: 'https://i.pravatar.cc/256?u=yeti-collective',
    city: 'Denver',
    state: 'CO',
    country: 'US',
    brandColor: '#006495',
    brandColorAccent: '#3FB1FA',
    ownerUserId: DEMO_USER_ID,
    socialLinks: {
      x: 'https://x.com/yeti_collective',
      instagram: 'https://instagram.com/yeti.collective',
      facebook: 'https://facebook.com/yeti.collective',
      linkedin: 'https://linkedin.com/company/yeti-collective',
    },
    socialIntegrationStatus: {
      x: 'connected',
      instagram: 'connected',
      facebook: 'connected',
      linkedin: 'expired',
    },
    createdAtIso: '2024-09-12T16:00:00Z',
  },
  {
    id: 'org-front-range-sports',
    name: 'Front Range Sports Co.',
    slug: 'front-range-sports',
    logoUrl: 'https://i.pravatar.cc/256?u=front-range-sports',
    city: 'Boulder',
    state: 'CO',
    country: 'US',
    brandColor: '#A14A1B',
    brandColorAccent: '#F0985E',
    ownerUserId: 'user-priya-mehta',
    socialLinks: {
      instagram: 'https://instagram.com/front.range.sports',
    },
    socialIntegrationStatus: {
      instagram: 'connected',
    },
    createdAtIso: '2025-01-08T10:30:00Z',
  },
];

export function organizationById(id: string): Organization | undefined {
  return ORGANIZATIONS.find((o) => o.id === id);
}

export function organizationBySlug(slug: string): Organization | undefined {
  return ORGANIZATIONS.find((o) => o.slug === slug);
}
