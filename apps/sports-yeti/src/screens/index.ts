// Auth screens (out of scope for this pass)
export { WelcomeScreen } from './auth/WelcomeScreen';
export { OnboardingScreen } from './auth/OnboardingScreen';
export { LoginScreen } from './auth/LoginScreen';
export { RegisterScreen } from './auth/RegisterScreen';
export { ForgotPasswordScreen } from './auth/ForgotPasswordScreen';

// Dev / design system reference
export { ComponentShowcaseScreen } from './dev/ComponentShowcaseScreen';
export { FormControlsScreen } from './dev/FormControlsScreen';
export { UIGalleryScreen } from './dev/UIGalleryScreen';

// Tab screens (5 main navigation pages)
export { DiscoverScreen } from './discover/DiscoverScreen';
export { NewsScreen } from './news/NewsScreen';
export { NewsArticleScreen } from './news/NewsArticleScreen';
export { ScheduleScreen } from './schedule/ScheduleScreen';
export { ScheduledEventDetailScreen } from './schedule/ScheduledEventDetailScreen';
export { SquadsScreen } from './teams/SquadsScreen';
export { HighlightsFeedScreen } from './highlights/HighlightsFeedScreen';
export { ProfileTabScreen } from './profile/ProfileTabScreen';

// Discover stack
export { GameDetailScreen } from './games/GameDetailScreen';
export { CreateGameScreen } from './games/CreateGameScreen';
export { CampDetailScreen } from './camps/CampDetailScreen';

// Teams stack
export { TeamDetailScreen } from './teams/TeamDetailScreen';
export { TeamPaymentScreen } from './teams/TeamPaymentScreen';
export { PlayerDirectoryScreen } from './teams/PlayerDirectoryScreen';
export { LeagueBrowseScreen } from './teams/LeagueBrowseScreen';
export { LeagueDetailScreen } from './teams/LeagueDetailScreen';

// Highlights stack
export { MyHighlightsScreen } from './highlights/MyHighlightsScreen';
export { HighlightUploadScreen } from './highlights/HighlightUploadScreen';
export { HighlightDetailScreen } from './highlights/HighlightDetailScreen';

// Profile stack
export { ProfileEditScreen } from './profile/ProfileEditScreen';
export { PlayerProfileScreen } from './profile/PlayerProfileScreen';
export { FollowingListScreen } from './profile/FollowingListScreen';
export { BookmarkedHighlightsScreen } from './profile/BookmarkedHighlightsScreen';
export { SettingsScreen } from './profile/SettingsScreen';
export { NotificationsScreen } from './profile/NotificationsScreen';
export { WaiversScreen } from './profile/WaiversScreen';
export { RolesScreen } from './profile/RolesScreen';

// Per-role placeholder home screens (Phase 3)
export { RoleHomeScreen } from './role-shells/RoleHomeScreen';

// Captain journeys (Phase 4)
export { CaptainHomeScreen } from './captain/CaptainHomeScreen';
export { TeamCreateScreen } from './captain/TeamCreateScreen';
export { TeamRosterScreen } from './captain/TeamRosterScreen';
export { DivisionApplyScreen } from './captain/DivisionApplyScreen';
export { SubRequestCreateScreen } from './captain/SubRequestCreateScreen';
export { SubRequestInboxScreen } from './captain/SubRequestInboxScreen';

// Player journeys + waiver gate (Phase 5)
export { WaiverGateScreen } from './waivers/WaiverGateScreen';
export { WaiverSignScreen } from './waivers/WaiverSignScreen';
export { JoinGamePaymentSheet } from './games/JoinGamePaymentSheet';

// Referee module (Phase 6)
export { RefereeHomeScreen } from './referee/RefereeHomeScreen';
export { MarketplaceGameDetailScreen } from './referee/MarketplaceGameDetailScreen';
export { GameReportScreen } from './referee/GameReportScreen';

// News feed (Phase 9)
export { NewsFeedScreen } from './news/NewsFeedScreen';
export { NewsDetailScreen } from './news/NewsDetailScreen';

// Critical auxiliary flows reachable from Profile -> More
export { BookingsScreen } from './bookings/BookingsScreen';
export { BookingDetailScreen } from './bookings/BookingDetailScreen';
export { FacilitiesScreen } from './facilities/FacilitiesScreen';
export { FacilityDetailScreen } from './facilities/FacilityDetailScreen';
export { MessagesScreen } from './messages/MessagesScreen';
export { ChatScreen } from './chat/ChatScreen';
