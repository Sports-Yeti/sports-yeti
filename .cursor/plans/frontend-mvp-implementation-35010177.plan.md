<!-- 35010177-bdd9-496f-ad91-1eb701dfdef1 d0a9d003-04e2-4a7d-8829-3204b077c01d -->
# Sports Yeti Frontend MVP - Execution Plan

## Current State

You have a React Native Expo app with:

- Auth screens (Login, Register, Forgot Password)
- Home dashboard with stats and activity feed
- Facilities screens (List, Details, Booking, QR Scanner)
- Teams, Leagues, Profile, and Chat screens (basic structure)
- Mock data infrastructure
- Navigation setup (tab + stack navigators)
- Basic reusable components

## Strategy

Build iteratively on existing code, complete current screens first, then add missing MVP features. All development uses mock data with clean separation for future API integration.

---

## Phase 1: Complete Existing Screens (Weeks 1-3)

### 1.1 Authentication Flow Polish

**Files**: `src/screens/auth/*`, `src/contexts/AuthContext.tsx`

- Enhance login form validation and error handling
- Complete registration flow with all user fields
- Implement forgot password flow
- Add loading states and error messages
- Connect auth context to AsyncStorage for persistence
- Add biometric authentication option (Face ID/Touch ID)

**Acceptance**: User can register, login, logout, and password recovery works with proper validation

### 1.2 Home Screen Enhancement

**Files**: `src/screens/home/HomeScreen.tsx`

- Make "Quick Actions" functional (navigate to correct screens)
- Implement "See All" navigation for games and bookings
- Add pull-to-refresh functionality
- Enhance social feed with like/comment interactions
- Add navigation to game details and booking details
- Improve loading states and empty states

**Acceptance**: All buttons navigate correctly, interactions work, data refreshes

### 1.3 Profile Screen Complete

**Files**: `src/screens/profile/ProfileScreen.tsx`

- Build complete profile view with avatar, stats, bio
- Add profile editing functionality
- Implement availability status toggle
- Add game history section
- Add team memberships display
- Add privacy settings toggle
- Include point balance and transaction history

**Acceptance**: User can view and edit complete profile, see history and stats

### 1.4 Facilities Screens Flow

**Files**: `src/screens/facilities/*`

- Complete FacilityDetailsScreen with full facility info, spaces, equipment
- Enhance BookFacilityScreen with time slot selection
- Add equipment selection to booking flow
- Implement booking confirmation with QR code display
- Complete BookingDetailsScreen with booking info and QR code
- Connect QRScannerScreen to check-in functionality
- Add booking history and management

**Acceptance**: Complete facility booking flow from browse to QR code check-in works

### 1.5 Teams Screen Complete

**Files**: `src/screens/teams/TeamsScreen.tsx`

- Build team listing with search and filters
- Create team details screen with roster
- Add create team flow
- Implement join team functionality
- Add team member management (for captains)
- Display team statistics and upcoming games

**Acceptance**: Users can browse, create, join teams, and manage rosters

### 1.6 Leagues Screen Complete

**Files**: `src/screens/leagues/LeaguesScreen.tsx`

- Build league listing with filters by sport/location
- Create league details screen with standings
- Add league registration flow
- Display league schedule and games
- Show league news and announcements

**Acceptance**: Users can browse leagues, view details, and register

---

## Phase 2: Add Missing Core Screens (Weeks 4-6)

### 2.1 Camp Management Screens

**New files**: `src/screens/camps/*`

- CampsScreen: Browse available camps with filters
- CampDetailsScreen: Camp info, sessions, schedule, registration
- CampRegistrationScreen: Registration flow with payment
- MyCampsScreen: User's registered camps and attendance
- Add camp navigation to bottom tabs or home quick actions

**Acceptance**: Users can discover, register for, and manage camp attendance

### 2.2 Game Creation & Management

**New files**: `src/screens/games/*`

- CreateGameScreen: Multi-step game creation
- Step 1: Select facility and time
- Step 2: Select equipment (optional)
- Step 3: Game details (sport, skill level, team size)
- Step 4: Invite players/teams
- GameDetailsScreen: Game info, participants, chat link, location
- MyGamesScreen: Upcoming and past games

**Acceptance**: Users can create games, invite players, and view game details

### 2.3 Chat Enhancement

**Files**: `src/screens/chat/ChatScreen.tsx`

- Enhance chat UI with message bubbles
- Add real-time message simulation (mock SSE)
- Implement attendance polls in chat
- Add media sharing UI
- Create chat list screen for all conversations
- Link game chats from game details

**Acceptance**: Rich chat experience with polls and media for game coordination

---

## Phase 3: Advanced Features (Weeks 7-9)

### 3.1 Notifications System

**New files**: `src/screens/notifications/*`, `src/services/notifications.ts`

- NotificationsScreen: List all notifications
- Implement Expo push notification setup
- Add notification preferences screen
- Create notification badge system
- Add in-app notification toast/banner
- Connect notifications to relevant screens

**Acceptance**: Users receive and can manage notifications

### 3.2 Payment Integration UI

**New files**: `src/screens/payments/*`

- PaymentMethodScreen: Add/manage payment methods (Stripe UI)
- PaymentHistoryScreen: Transaction history
- Add payment confirmation flows to bookings/camps/leagues
- Implement payment method selection
- Add receipt display

**Acceptance**: Complete payment UI flows (ready for Stripe integration)

### 3.3 QR Code System

**Files**: `src/screens/facilities/QRScannerScreen.tsx`, enhance booking screens

- Enhance QR scanner with better camera UX
- Add QR code generation for bookings
- Implement check-in confirmation flow
- Add QR code display in booking details
- Create attendance tracking UI

**Acceptance**: QR code generation and scanning works for facility check-ins

### 3.4 Social Features Enhancement

**New files**: `src/screens/social/*`

- Create dedicated social feed screen
- Add post creation with media upload
- Implement comment threads
- Add like/unlike functionality
- Create user discovery screen
- Add follow/unfollow features

**Acceptance**: Rich social interaction with posts, comments, likes

---

## Phase 4: Polish & Testing (Weeks 10-11)

### 4.1 UI/UX Polish

- Consistent styling across all screens
- Add loading skeletons for better perceived performance
- Implement smooth transitions and animations
- Add empty states for all lists
- Improve error handling and user feedback
- Add offline indicators and retry mechanisms

### 4.2 State Management Enhancement

**Files**: Create `src/store/*` (Zustand)

- Set up Zustand for global state
- Move auth state to Zustand
- Add booking state management
- Implement optimistic updates
- Add state persistence

### 4.3 API Integration Preparation

**Files**: Create `src/services/api/*`

- Create API client with interceptors
- Define API endpoints and types
- Implement mock mode toggle
- Add error handling and retry logic
- Create API hooks for common operations

### 4.4 Testing & Documentation

- Add component tests for common components
- Test critical user flows
- Document component usage
- Create setup instructions
- Add inline code documentation

---

## Implementation Approach

### For Each Screen/Feature:

1. **Plan**: Review mock data structure, plan component hierarchy
2. **Build**: Create/enhance screen with proper TypeScript types
3. **Connect**: Wire up navigation, mock data, and state
4. **Polish**: Add loading states, error handling, animations
5. **Test**: Manual testing of all flows and edge cases

### Code Quality Standards:

- Use TypeScript strictly (no `any` types)
- Follow existing component patterns (Button, Input, LoadingSpinner)
- Maintain consistent styling with current design system
- Keep screens focused, extract reusable components
- Add comments for complex logic
- Use proper React Native performance patterns (useMemo, useCallback)

### Mock Data Strategy:

- Enhance existing mock data in `src/mocks/data/*`
- Keep mock functions realistic and stateful where needed
- Structure for easy swap to real API calls
- Use consistent IDs and relationships

---

## Key Deliverables

**End of Phase 1**: All existing screens fully functional and polished
**End of Phase 2**: All MVP screens implemented with mock data
**End of Phase 3**: Advanced features working (notifications, payments UI, QR codes)
**End of Phase 4**: Production-ready frontend, API integration ready

---

## Success Criteria

- ✅ All screens navigable and functional
- ✅ No crashes or major bugs
- ✅ Consistent UI/UX across app
- ✅ Mock data flows work end-to-end
- ✅ Ready for backend API integration
- ✅ Code is clean, typed, and documented

### To-dos

- [ ] Complete authentication flow with validation, persistence, and biometric auth
- [ ] Enhance home screen with functional quick actions, navigation, and interactions
- [ ] Build complete profile screen with editing, stats, history, and settings
- [ ] Complete facility booking flow from browse to QR check-in
- [ ] Finish teams screen with creation, joining, and roster management
- [ ] Complete leagues screen with details, registration, and schedule
- [ ] Create camp management screens (browse, details, registration, my camps)
- [ ] Build game creation and management screens with multi-step flow
- [ ] Enhance chat with polls, media sharing, and rich UI
- [ ] Implement notifications system with Expo push and preferences
- [ ] Create payment UI flows for Stripe integration
- [ ] Complete QR code generation and scanning for check-ins
- [ ] Enhance social features with posts, comments, likes, and user discovery
- [ ] Polish UI/UX with animations, loading states, and error handling
- [ ] Set up Zustand for global state management
- [ ] Create API client infrastructure ready for backend integration
- [ ] Add tests and documentation for components and flows