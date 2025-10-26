// Analytics Service
// Track user behavior and app events

import { debugLog } from '../utils/config';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    debugLog('Analytics service initialized');
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user ID for tracking
  setUserId(userId: string): void {
    this.userId = userId;
    debugLog('Analytics user ID set:', userId);

    // TODO: Send to analytics service
    // this.track('user_identified', { userId });
  }

  // Clear user ID (on logout)
  clearUserId(): void {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    debugLog('Analytics user ID cleared');
  }

  // Track an event
  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        platform: 'mobile',
      },
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    debugLog('Analytics event tracked:', event);

    // TODO: Send to analytics service (e.g., Mixpanel, Amplitude, Firebase)
    // this.sendToAnalyticsService(event);
  }

  // Track screen view
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  trackAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  // Track conversion events
  trackConversion(
    conversionType: string,
    properties?: Record<string, any>
  ): void {
    this.track('conversion', {
      conversion_type: conversionType,
      ...properties,
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  // Get all tracked events (for debugging)
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clearEvents(): void {
    this.events = [];
    debugLog('Analytics events cleared');
  }

  // ============================================================================
  // PREDEFINED EVENT TRACKERS
  // ============================================================================

  // Authentication events
  trackSignUp(method: string): void {
    this.trackConversion('sign_up', { method });
  }

  trackLogin(method: string): void {
    this.track('login', { method });
  }

  trackLogout(): void {
    this.track('logout');
  }

  // Game events
  trackGameCreated(gameType: string, sport: string): void {
    this.trackConversion('game_created', { game_type: gameType, sport });
  }

  trackGameJoined(gameId: string): void {
    this.track('game_joined', { game_id: gameId });
  }

  trackGameCompleted(gameId: string, won: boolean): void {
    this.track('game_completed', { game_id: gameId, won });
  }

  // Team events
  trackTeamCreated(teamId: string, sport: string): void {
    this.trackConversion('team_created', { team_id: teamId, sport });
  }

  trackTeamJoined(teamId: string): void {
    this.track('team_joined', { team_id: teamId });
  }

  // Facility events
  trackFacilityBooked(facilityId: string, spaceId: string, cost: number): void {
    this.trackConversion('facility_booked', {
      facility_id: facilityId,
      space_id: spaceId,
      cost,
    });
  }

  trackQRCodeScanned(bookingId: string): void {
    this.track('qr_code_scanned', { booking_id: bookingId });
  }

  // Social events
  trackPostCreated(): void {
    this.track('post_created');
  }

  trackPostLiked(postId: string): void {
    this.track('post_liked', { post_id: postId });
  }

  trackCommentPosted(postId: string): void {
    this.track('comment_posted', { post_id: postId });
  }

  // Points events
  trackPointsEarned(amount: number, source: string): void {
    this.track('points_earned', { amount, source });
  }

  trackPointsSpent(amount: number, purpose: string): void {
    this.track('points_spent', { amount, purpose });
  }

  trackPointsPurchased(amount: number, price: number): void {
    this.trackConversion('points_purchased', { amount, price });
  }

  // Achievement events
  trackAchievementUnlocked(achievementId: string, points: number): void {
    this.track('achievement_unlocked', {
      achievement_id: achievementId,
      points,
    });
  }

  // League events
  trackLeagueJoined(leagueId: string): void {
    this.trackConversion('league_joined', { league_id: leagueId });
  }

  // Chat events
  trackMessageSent(chatId: string): void {
    this.track('message_sent', { chat_id: chatId });
  }

  trackPollCreated(chatId: string): void {
    this.track('poll_created', { chat_id: chatId });
  }

  trackPollVoted(pollId: string): void {
    this.track('poll_voted', { poll_id: pollId });
  }

  // User engagement
  trackAppOpened(): void {
    this.track('app_opened');
  }

  trackAppClosed(): void {
    this.track('app_closed');
  }

  trackSessionDuration(durationSeconds: number): void {
    this.track('session_duration', { duration: durationSeconds });
  }
}

// Export singleton instance
const analytics = new AnalyticsService();

export default analytics;

// Export class for testing
export { AnalyticsService };
