# 🚀 Sports Yeti - Quick Start Guide

## Get the App Running in 3 Steps

### Step 1: Install Dependencies (if not done)

```bash
cd apps/sports-yeti
npm install
```

### Step 2: Start the Development Server

```bash
npx expo start
```

### Step 3: Open the App

Choose one of these options:

- **Press `i`** → iOS Simulator (Mac only)
- **Press `a`** → Android Emulator
- **Press `w`** → Web Browser
- **Scan QR code** → Expo Go app on your phone

---

## 🧪 Testing the App

### Login Credentials

The app uses **mock authentication** - any credentials work!

**Example Login:**

- Email: `test@example.com`
- Password: `password123`

**Or create a new account:**

1. Click "Create Account"
2. Fill in the form
3. Select sports and experience level
4. Click "Create Account"

---

## 🎮 Features to Try

### 1. Browse Your Dashboard

After login, you'll see:

- Your points balance
- Games played
- Upcoming games
- Quick action buttons

### 2. Create a Game

1. Click "Create Game" on home
2. Follow 4-step wizard:
   - Game details
   - Select facility
   - Schedule time
   - Review & confirm

### 3. Book a Facility

1. Go to Facilities tab
2. Click on a facility
3. Select a space
4. Choose date/time
5. Add equipment (optional)
6. Confirm booking
7. Get QR code

### 4. Create a Team

1. Go to Teams tab
2. Click "Create New Team"
3. Enter team name
4. Select sport and skill level
5. Create team

### 5. Browse Leagues

1. Go to Leagues tab
2. View active leagues
3. Click on a league
4. View details and join

### 6. Check Your Points

1. Go to Profile tab
2. Click "Points & Rewards"
3. See balance and transaction history
4. View ways to earn points

### 7. View Achievements

1. Go to Profile tab
2. Click "Achievements"
3. See unlocked and locked achievements
4. Track your progress

---

## 📊 Mock Data Overview

The app comes pre-loaded with sample data:

### Current User (You)

- **Name**: John Doe
- **Email**: john.doe@example.com
- **Points**: 2,850
- **Games Played**: 23
- **Sports**: Basketball, Soccer

### Available Content

- **3** Sample leagues (Basketball, Soccer, Tennis)
- **3** Sample teams
- **2** Facilities with multiple courts/fields
- **3** Games (1 scheduled, 1 upcoming, 1 completed)
- **3** Social posts
- **4** Notifications
- **3** Upcoming bookings

---

## 🎨 UI Highlights

### Clean, Modern Design

- iOS-inspired UI with Material Design elements
- Consistent color scheme (Blue primary)
- Card-based layouts
- Smooth transitions

### Responsive Layout

- Works on all screen sizes
- Optimized for mobile (iOS/Android)
- Web-compatible

### Interactive Elements

- Tap animations
- Loading states
- Error handling
- Success feedback

---

## 🔍 Navigation Flow

```
Login → Home Dashboard
         ├── Create Game → 4-step wizard → Confirmation
         ├── Chat → Messages & Polls
         │
         ├── Leagues → Browse → Details → Join
         │
         ├── Teams → My Teams → Details → Manage
         │           └── Create Team
         │
         ├── Facilities → Browse → Details → Book → QR Code
         │                          └── QR Scanner
         │
         └── Profile → Stats & Info
                       ├── Edit Profile
                       ├── Settings (Notifications, Privacy)
                       ├── Notifications (Unread badges)
                       ├── Points & Transactions
                       ├── Achievements (Progress tracking)
                       ├── Data Export (GDPR compliance)
                       └── Help & Support
```

---

## 💡 Pro Tips

### 1. Hot Reload

Save any file and the app reloads automatically - no restart needed!

### 2. Debugging

- Check the terminal for console.log output
- Use React DevTools for component inspection
- Network tab shows (mocked) API calls

### 3. Testing Different Users

Currently logged in as John Doe. To simulate different users, modify:

```typescript
// src/mocks/data/users.ts
export const getCurrentPlayer = () => mockPlayers[0]; // Change index
```

### 4. Adding Mock Data

Add more sample data in `src/mocks/data/` files:

```typescript
// Example: Add a new team
export const mockTeams: Team[] = [
  // ... existing teams
  {
    id: 'team-4',
    name: 'Your New Team',
    // ... other properties
  },
];
```

---

## 🐛 Troubleshooting

### App Won't Start?

```bash
# Clear cache
npx expo start --clear

# Or
rm -rf node_modules
npm install
```

### Console Warnings?

The password field warning is cosmetic only - **the app works perfectly**. It's a React Native Web accessibility notice.

### Navigation Issues?

Make sure you've navigated through authentication. The app shows Login screen first, then Main tabs after authentication.

---

## 📱 Platform-Specific Notes

### iOS

- Runs on iOS Simulator (Xcode required)
- Physical devices need Expo Go app

### Android

- Runs on Android Emulator (Android Studio required)
- Physical devices need Expo Go app

### Web

- Runs in any modern browser
- Full functionality available
- Responsive design

---

## 🎯 Next Steps

### For Development

1. Connect to real backend API
2. Replace mock data with real API calls
3. Implement real camera for QR scanning
4. Add image upload functionality
5. Integrate push notifications

### For Backend Integration

1. Review TODO comments in code
2. Implement API service layer
3. Add error handling
4. Set up authentication tokens
5. Configure environment variables

---

## 📞 Need Help?

### Documentation

- See `FRONTEND_README.md` for detailed docs
- Check `IMPLEMENTATION_SUMMARY.md` for overview

### Support

- Email: support@sportsyeti.com
- Review code comments (TODO markers)
- Check project scope in `/project/prompts/scope.md`

---

## ✨ You're All Set!

The Sports Yeti mobile app is ready to use with full mock data. Explore all the features, test the flows, and enjoy the app!

**Happy coding! 🏀⚽🎾**
