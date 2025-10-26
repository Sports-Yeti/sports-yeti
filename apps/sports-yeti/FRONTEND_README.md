# Sports Yeti - Frontend Implementation

## 🎯 Overview

This is the **Sports Yeti mobile application** built with **React Native** and **Expo**. The app provides a complete social sports platform where users can discover leagues, create teams, book facilities, manage games, and earn points through gamification.

---

## 🏗️ Architecture

### Project Structure

```
apps/sports-yeti/
├── src/
│   ├── app/
│   │   └── App.tsx                    # Main app component with providers
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx             # Reusable button component
│   │       ├── Input.tsx              # Reusable input component
│   │       ├── LoadingSpinner.tsx     # Loading indicator
│   │       └── Card.tsx               # Card wrapper component
│   ├── contexts/
│   │   └── AuthContext.tsx            # Authentication state management
│   ├── mocks/
│   │   └── data/
│   │       ├── users.ts               # Mock user data
│   │       ├── teams.ts               # Mock team data
│   │       ├── leagues.ts             # Mock league data
│   │       ├── facilities.ts          # Mock facility data
│   │       ├── games.ts               # Mock game data
│   │       ├── social.ts              # Mock social feed data
│   │       ├── chat.ts                # Mock chat data
│   │       ├── bookings.ts            # Mock booking data
│   │       └── index.ts               # Export all mock data
│   ├── navigation/
│   │   ├── RootNavigator.tsx          # Root navigation (Auth/Main)
│   │   ├── AuthNavigator.tsx          # Authentication flow
│   │   ├── MainTabNavigator.tsx       # Bottom tab navigation
│   │   ├── HomeStackNavigator.tsx     # Home tab stack
│   │   ├── TeamStackNavigator.tsx     # Teams tab stack
│   │   ├── FacilityStackNavigator.tsx # Facilities tab stack
│   │   └── ProfileStackNavigator.tsx  # Profile tab stack
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx        # Login page
│   │   │   ├── RegisterScreen.tsx     # Registration page
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx         # Dashboard/home feed
│   │   ├── leagues/
│   │   │   ├── LeaguesScreen.tsx      # Browse leagues
│   │   │   └── LeagueDetailsScreen.tsx
│   │   ├── teams/
│   │   │   ├── TeamsScreen.tsx        # My teams list
│   │   │   ├── TeamDetailsScreen.tsx  # Team details
│   │   │   └── CreateTeamScreen.tsx   # Create new team
│   │   ├── facilities/
│   │   │   ├── FacilitiesScreen.tsx   # Browse facilities
│   │   │   ├── FacilityDetailsScreen.tsx
│   │   │   ├── BookFacilityScreen.tsx # Booking flow
│   │   │   ├── QRScannerScreen.tsx    # QR code scanner
│   │   │   └── BookingDetailsScreen.tsx
│   │   ├── games/
│   │   │   └── CreateGameScreen.tsx   # Multi-step game creation
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx         # Game/team chat
│   │   ├── social/
│   │   │   └── SocialFeedScreen.tsx   # Social media feed
│   │   └── profile/
│   │       ├── ProfileScreen.tsx      # User profile
│   │       ├── EditProfileScreen.tsx  # Edit profile
│   │       ├── SettingsScreen.tsx     # App settings
│   │       ├── NotificationsScreen.tsx
│   │       ├── PointsScreen.tsx       # Points & rewards
│   │       ├── AchievementsScreen.tsx # Unlocked achievements
│   │       ├── DataExportScreen.tsx   # GDPR data export
│   │       └── HelpScreen.tsx         # Help & support
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── utils/                         # Utility functions (future)
├── assets/                            # Images and fonts
├── app.json                           # Expo configuration
├── metro.config.js                    # Metro bundler config
├── package.json                       # Dependencies
└── tsconfig.json                      # TypeScript config
```

---

## 🎨 Features Implemented

### ✅ Authentication Flow

- **Login Screen**: Email/password login with validation
- **Registration Screen**: Multi-step registration with sport selection
- **Forgot Password**: Password reset flow
- **Mock Authentication**: Any credentials work for testing

### ✅ Home Dashboard

- **User Stats**: Points, games played, upcoming games
- **Quick Actions**: Create game, book facility, find team, join league
- **Upcoming Games**: List of scheduled games
- **Upcoming Bookings**: Facility reservations
- **Social Feed Preview**: Recent posts from community

### ✅ Leagues

- **Browse Leagues**: View active leagues by sport
- **League Details**: Full league information
- **Divisions**: View league divisions
- **Join League**: League registration flow
- **League Rules & Amenities**: Complete league information

### ✅ Teams

- **My Teams**: View teams you're part of
- **Create Team**: Multi-step team creation
- **Team Details**: View team roster and info
- **Team Management**: Captain tools (edit, manage members)
- **Join/Leave Teams**: Team membership management

### ✅ Facilities

- **Browse Facilities**: Search available venues
- **Facility Details**: View spaces, equipment, info
- **Book Facility**: Reserve courts/fields with equipment
- **QR Scanner**: Check-in with QR codes
- **Booking Management**: View and manage reservations

### ✅ Games

- **Create Game**: 4-step game creation wizard
  - Step 1: Game details (sport, skill level, wager)
  - Step 2: Facility selection
  - Step 3: Schedule (date, time, duration)
  - Step 4: Review & confirm
- **Game Chat**: Team communication with polls
- **Point Wagering**: Bet points on game outcomes

### ✅ Social Features

- **Social Feed**: Instagram-like feed
- **Create Posts**: Share updates and media
- **Like/Comment**: Engage with posts
- **User Profiles**: View player profiles

### ✅ Chat System

- **Real-time Messaging**: WhatsApp-style chat
- **Attendance Polls**: Vote on game attendance
- **Media Sharing**: Share photos/videos
- **Game Coordination**: Organize logistics

### ✅ Points & Gamification

- **Points Balance**: Track your points
- **Transactions History**: View earned/spent points
- **Ways to Earn**: Multiple earning opportunities
- **Purchase Points**: Buy more points (stub)

### ✅ Profile & Settings

- **User Profile**: View stats and achievements
- **Edit Profile**: Update personal information
- **Settings**: Notifications, privacy, preferences
- **Achievements**: Badges and milestones
- **Notifications**: Game reminders, updates
- **Data Export**: GDPR-compliant data export
- **Help & Support**: FAQ and contact info

---

## 🎭 Mock Data System

All screens use **static dummy data** instead of real API calls:

### Mock Data Location

All mock data is located in `src/mocks/data/`:

- `users.ts` - 3 sample players with complete profiles
- `teams.ts` - 3 sample teams with members
- `leagues.ts` - 3 sample leagues with divisions
- `facilities.ts` - 2 sample facilities with spaces and equipment
- `games.ts` - 3 sample games (scheduled, completed)
- `social.ts` - Sample posts, notifications, point transactions
- `chat.ts` - Sample chat messages and polls
- `bookings.ts` - Sample facility bookings

### Helper Functions

Each mock data file exports helper functions:

- `getById(id)` - Get single item by ID
- `getByUser(userId)` - Get items for specific user
- `getBySport(sport)` - Filter by sport type
- `getMy*()` - Get current user's items

Example:

```typescript
import { getMyTeams, getMyUpcomingGames, getCurrentPlayer } from '../mocks/data';

const myTeams = getMyTeams();
const upcomingGames = getMyUpcomingGames();
const currentUser = getCurrentPlayer();
```

---

## 🔄 Switching to Real Data

To connect the app to a real backend:

### 1. Create API Service Layer

Create `src/services/api.ts`:

```typescript
const API_BASE_URL = 'https://your-api.com/api/v1';

export async function login(credentials: LoginForm) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
}

// Add more API functions...
```

### 2. Update Context Providers

Replace mock data calls in `src/contexts/AuthContext.tsx`:

```typescript
// Before (mock):
const loggedInUser = getCurrentPlayer();

// After (real):
const response = await login(credentials);
const loggedInUser = response.data.user;
```

### 3. Replace Mock Data Imports

In each screen, replace:

```typescript
// Before:
import { getMyTeams } from '../../mocks/data';

// After:
import { fetchMyTeams } from '../../services/api';
```

### 4. Update State Management

Consider using **React Query** or **SWR** for data fetching:

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: teams } = useQuery({
  queryKey: ['myTeams'],
  queryFn: fetchMyTeams,
});
```

---

## 🚀 Running the App

### Prerequisites

- Node.js 16+
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Start Development Server

```bash
# From project root
cd apps/sports-yeti
npx expo start

# Or using Nx
npx nx run sports-yeti:start
```

### Run on Devices

- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Physical Device**: Scan QR code with Expo Go app
- **Web**: Press `w` in terminal

---

## 📱 App Flow

### First Time User Journey

1. **Launch App** → Sees Login Screen
2. **Click "Create Account"** → Registration Screen
3. **Fill Form** → Select sports, experience level
4. **Create Account** → Automatically logged in
5. **Home Dashboard** → See quick actions and stats
6. **Explore Features** → Browse leagues, teams, facilities

### Existing User Journey

1. **Launch App** → Auto-login if token exists
2. **Home Dashboard** → See upcoming games, bookings
3. **Quick Actions**:
   - Create a new game
   - Book a facility
   - Join a team
   - Browse leagues

---

## 🎨 Design System

### Colors

```typescript
Primary: #007AFF (iOS Blue)
Success: #28a745 (Green)
Danger: #dc3545 (Red)
Warning: #ffc107 (Yellow)
Info: #0c5460 (Teal)

Backgrounds:
- Primary BG: #f8f9fa (Light Gray)
- Card BG: #ffffff (White)
- Accent BG: #e3f2fd (Light Blue)

Text:
- Primary Text: #212529 (Dark)
- Secondary Text: #6c757d (Gray)
- Subtle Text: #8E8E93 (Light Gray)
```

### Typography

```typescript
Title: 24-32px, bold
Heading: 18-20px, semibold
Body: 14-16px, regular
Caption: 12px, regular
```

### Spacing

```typescript
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
xxl: 32px
```

---

## 🔧 Technology Stack

### Core

- **React Native** 0.79.5
- **Expo** 53.0.0
- **TypeScript** 5.8.2

### Navigation

- **@react-navigation/native** 7.0.0
- **@react-navigation/bottom-tabs** 7.0.0
- **@react-navigation/stack** 7.0.0

### UI Components

- **react-native-paper** 5.14.5
- **@expo/vector-icons** 14.0.0
- **react-native-svg** 15.11.2

### Storage

- **@react-native-async-storage/async-storage** (for auth tokens)

---

## 🐛 Known Issues & TODOs

### Console Warnings

- ⚠️ Password field accessibility warning (React Native Web) - **cosmetic only, doesn't affect functionality**

### TODO: Backend Integration Points

All screens have TODO comments marking where API calls should be implemented:

```typescript
// TODO: Implement actual login API call
// TODO: Implement create team API call
// TODO: Implement booking API call
// TODO: Validate token with backend
```

### Missing Implementations (Future)

1. **Real Camera Integration**: QR scanner uses placeholder
2. **Image Upload**: Avatar and media uploads
3. **Push Notifications**: Expo notifications setup
4. **Real-time Chat**: WebSocket integration
5. **Payment Processing**: Stripe integration
6. **Maps Integration**: Facility location maps
7. **Calendar Integration**: Game scheduling calendar
8. **Video Highlights**: AI-powered highlight extraction

---

## 📝 Component Usage Examples

### Button Component

```typescript
import Button from '../../components/common/Button';

<Button
  title="Click Me"
  onPress={handlePress}
  variant="primary" // primary | secondary | outline | danger
  size="large" // small | medium | large
  loading={isLoading}
  disabled={isDisabled}
/>;
```

### Input Component

```typescript
import Input from '../../components/common/Input';

<Input label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} secureTextEntry={false} />;
```

### Card Component

```typescript
import Card from '../../components/common/Card';

<Card variant="elevated">
  <Text>Card content</Text>
</Card>;
```

---

## 🧪 Testing

### Mock Authentication

The app uses mock authentication, so **any credentials will work**:

- **Email**: anything@example.com
- **Password**: any 6+ characters

Registration creates a temporary user profile with:

- 100 starting points
- Selected sports preferences
- Basic player stats

---

## 🎮 Key User Flows

### 1. Create a Game (Mock Game System)

```
Home → Create Game →
Step 1: Select sport, skill level, wager →
Step 2: Choose facility & space →
Step 3: Set date, time, duration →
Step 4: Review & confirm →
Game Created!
```

### 2. Book a Facility

```
Facilities → Select Facility →
View Details → Book This Space →
Select date/time → Add equipment →
Choose payment method → Confirm →
Receive QR Code
```

### 3. Create a Team

```
Teams → Create New Team →
Enter name, sport, skill level →
Set max members, description →
Create Team → You're the captain!
```

### 4. Join a League

```
Leagues → Browse Active Leagues →
Select League → View Details →
Review divisions → Join League →
Complete registration
```

---

## 🔐 Authentication State

The app uses Context API for authentication:

```typescript
import { useAuth } from '../../contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

- `user`: Current player object (null if not logged in)
- `isAuthenticated`: Boolean auth status
- `login(credentials)`: Login function
- `register(userData)`: Registration function
- `logout()`: Logout function
- `updateProfile(updates)`: Update user profile

---

## 📊 Mock Data Schema

### Current Player

The app simulates a logged-in user with:

- Name: John Doe
- Email: john.doe@example.com
- Points: 2850
- Games Played: 23
- Experience: Advanced
- Sports: Basketball, Soccer

### Sample Data Counts

- Players: 3
- Teams: 3
- Leagues: 3
- Facilities: 2
- Spaces: 3
- Equipment: 3
- Games: 3
- Posts: 3
- Bookings: 3
- Chat Messages: 4

---

## 🌐 API Integration Checklist

When connecting to real backend, implement these endpoints:

### Authentication

- [ ] POST `/api/v1/auth/register`
- [ ] POST `/api/v1/auth/login`
- [ ] POST `/api/v1/auth/logout`
- [ ] POST `/api/v1/auth/forgot-password`
- [ ] GET `/api/v1/auth/me`

### Players

- [ ] GET `/api/v1/players`
- [ ] GET `/api/v1/players/{id}`
- [ ] PUT `/api/v1/players/{id}`

### Teams

- [ ] GET `/api/v1/teams`
- [ ] POST `/api/v1/teams`
- [ ] GET `/api/v1/teams/{id}`
- [ ] PUT `/api/v1/teams/{id}`
- [ ] POST `/api/v1/teams/{id}/join`
- [ ] POST `/api/v1/teams/{id}/leave`

### Leagues

- [ ] GET `/api/v1/leagues`
- [ ] GET `/api/v1/leagues/{id}`
- [ ] POST `/api/v1/leagues/{id}/join`

### Facilities

- [ ] GET `/api/v1/facilities`
- [ ] GET `/api/v1/facilities/{id}`
- [ ] POST `/api/v1/facilities/{id}/book`
- [ ] GET `/api/v1/bookings/{id}`
- [ ] DELETE `/api/v1/bookings/{id}`

### Games

- [ ] GET `/api/v1/games`
- [ ] POST `/api/v1/games`
- [ ] GET `/api/v1/games/{id}`
- [ ] PUT `/api/v1/games/{id}/attendance`
- [ ] POST `/api/v1/games/{id}/report`

### Chat

- [ ] GET `/api/v1/chats/{id}/messages`
- [ ] POST `/api/v1/chats/{id}/messages`
- [ ] POST `/api/v1/chats/{id}/polls`
- [ ] POST `/api/v1/polls/{id}/vote`

### Social

- [ ] GET `/api/v1/posts`
- [ ] POST `/api/v1/posts`
- [ ] POST `/api/v1/posts/{id}/like`
- [ ] POST `/api/v1/posts/{id}/comments`

### Points

- [ ] GET `/api/v1/points/transactions`
- [ ] POST `/api/v1/points/purchase`

### Notifications

- [ ] GET `/api/v1/notifications`
- [ ] PUT `/api/v1/notifications/{id}/read`
- [ ] DELETE `/api/v1/notifications/{id}`

---

## 🎯 Next Steps

### Immediate Priorities

1. ✅ Fix password input warning (completed)
2. ✅ Build all core screens (completed)
3. Connect to real backend API
4. Implement real camera for QR scanning
5. Add image upload functionality

### Phase 2 Features

- Tournament system
- Camp management
- Referee booking
- Video highlights
- Advanced analytics
- Social media integration

---

## 💡 Tips for Development

### Hot Reload

The app supports hot reloading. Save any file and see changes instantly.

### Debugging

- Use React DevTools
- Console logs appear in terminal
- Network requests visible in Dev Tools

### State Management

Currently using Context API. For larger scale, consider:

- Redux Toolkit
- Zustand
- MobX

---

## 📞 Support

For questions or issues:

- Email: support@sportsyeti.com
- Phone: 1-800-555-1234
- Hours: Mon-Fri 9am-6pm EST

---

## 📄 License

MIT License - Sports Yeti Platform

---

**Built with ❤️ by the Sports Yeti team**
