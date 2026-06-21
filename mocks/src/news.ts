import type { NewsArticle, SocialPostDraft } from './types';
import { DEMO_ORG_ID } from './organizations';
import { DEMO_USER_ID } from './users';

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-spring-reg-open',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-soccer',
    title: 'Spring/Summer 2026 registration is OPEN',
    body:
      'Twelve weeks of co-ed 7v7 outdoor soccer at the Yeti Center. Two divisions: Competitive D1 and Recreational D2. Sign up your team by April 5.',
    audience: 'public',
    status: 'published',
    authorUserId: DEMO_USER_ID,
    publishedAtIso: '2026-02-15T14:00:00Z',
    heroImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600',
    tags: ['registration', 'spring', 'soccer'],
    socialDraftIds: ['social-spring-reg-open'],
  },
  {
    id: 'news-hoops-rookie-night',
    organizationId: DEMO_ORG_ID,
    leagueId: 'league-yeti-hoops',
    title: 'Yeti Hoops Rookie Night — bring a friend, free drop-in',
    body:
      'New to hoops? Join our Rookie Night on the last Tuesday of every month. No experience needed. Refs, balls, and pizza on us.',
    audience: 'org',
    status: 'scheduled',
    authorUserId: DEMO_USER_ID,
    scheduledForIso: '2026-04-25T17:00:00Z',
    heroImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600',
    tags: ['rookie', 'free', 'basketball'],
    socialDraftIds: ['social-hoops-rookie-night'],
  },
  {
    id: 'news-facility-summer-hours',
    organizationId: DEMO_ORG_ID,
    title: 'Summer hours start May 1',
    body:
      'Outdoor fields open until 10 PM Mon–Fri starting May 1. Indoor courts unchanged.',
    audience: 'public',
    status: 'draft',
    authorUserId: DEMO_USER_ID,
    tags: ['facility', 'summer'],
    socialDraftIds: [],
  },
];

export const SOCIAL_POST_DRAFTS: SocialPostDraft[] = [
  {
    id: 'social-spring-reg-open',
    newsId: 'news-spring-reg-open',
    channels: ['x', 'facebook', 'instagram'],
    status: 'posted',
    postedAtIso: '2026-02-15T14:05:00Z',
    copyByChannel: {
      x: 'Spring/Summer 2026 reg is OPEN. 12 weeks of co-ed 7v7 at Yeti Center. Comp D1 + Rec D2 — sign up by April 5. yeti.collective/spring',
      facebook:
        'Our Spring/Summer 2026 outdoor soccer season is now accepting team applications. 12-week regular season, 3-week playoff. Two divisions to fit your level. Registration closes April 5.',
      instagram:
        'Spring/Summer 2026 ⚽\nReg is open. Comp D1 + Rec D2.\nLink in bio.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
  },
  {
    id: 'social-hoops-rookie-night',
    newsId: 'news-hoops-rookie-night',
    channels: ['instagram', 'facebook'],
    status: 'scheduled',
    scheduledIso: '2026-04-25T17:00:00Z',
    copyByChannel: {
      instagram:
        'New to hoops? 🏀\nRookie Night — last Tue of every month.\nFree. Refs included. Pizza on us.',
      facebook:
        'Rookie Night returns! Free drop-in for new players, last Tuesday of every month at Summit Rec. Refs and pizza included. Bring a friend.',
    },
  },
];

export function articleById(id: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((a) => a.id === id);
}

export function articlesForOrg(orgId: string): NewsArticle[] {
  return NEWS_ARTICLES.filter((a) => a.organizationId === orgId);
}

export function publishedArticlesForOrg(orgId: string): NewsArticle[] {
  return articlesForOrg(orgId).filter((a) => a.status === 'published');
}

export function draftById(id: string): SocialPostDraft | undefined {
  return SOCIAL_POST_DRAFTS.find((d) => d.id === id);
}

export function draftsForArticle(newsId: string): SocialPostDraft[] {
  return SOCIAL_POST_DRAFTS.filter((d) => d.newsId === newsId);
}
