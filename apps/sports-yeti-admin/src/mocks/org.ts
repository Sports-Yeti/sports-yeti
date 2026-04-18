export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: string | null;
  role: 'owner' | 'admin' | 'staff';
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  city: string;
  timezone: string;
  currency: 'USD';
  plan: 'starter' | 'growth' | 'pro';
  seasonStartIso: string;
  seasonEndIso: string;
}

export const CURRENT_ORG: Organization = {
  id: 'org-yeti-co',
  name: 'Yeti Athletic Co.',
  slug: 'yeti-athletic',
  city: 'Denver, CO',
  timezone: 'America/Denver',
  currency: 'USD',
  plan: 'pro',
  seasonStartIso: '2026-01-15',
  seasonEndIso: '2026-12-15',
};

export const CURRENT_ADMIN: AdminUser = {
  id: 'admin-1',
  name: 'Alex Rivera',
  email: 'alex@yetiathletic.com',
  initials: 'AR',
  avatar: 'https://i.pravatar.cc/120?img=14',
  role: 'owner',
  orgId: CURRENT_ORG.id,
};

export const ADMIN_TEAMMATES: AdminUser[] = [
  CURRENT_ADMIN,
  {
    id: 'admin-2',
    name: 'Priya Shah',
    email: 'priya@yetiathletic.com',
    initials: 'PS',
    avatar: 'https://i.pravatar.cc/120?img=47',
    role: 'admin',
    orgId: CURRENT_ORG.id,
  },
  {
    id: 'admin-3',
    name: 'Sam Brooks',
    email: 'sam@yetiathletic.com',
    initials: 'SB',
    avatar: 'https://i.pravatar.cc/120?img=33',
    role: 'staff',
    orgId: CURRENT_ORG.id,
  },
];

export const ADMIN_ORG_SWITCHER: Organization[] = [
  CURRENT_ORG,
  {
    id: 'org-coastal',
    name: 'Coastal Volley Co.',
    slug: 'coastal-volley',
    city: 'San Diego, CA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    plan: 'growth',
    seasonStartIso: '2026-04-01',
    seasonEndIso: '2026-09-30',
  },
];
