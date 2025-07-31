# 🏀 Sports Yeti - MVP Scope
## Minimal Viable Product for Basketball League Pilot

---

## 📋 Executive Summary

Sports Yeti MVP is a **focused sports community platform** designed for the basketball league pilot. The MVP prioritizes core league management, basic social features, camp management, and essential functionality while building the foundation for the full platform vision.

**MVP Focus:**
- Basketball league management and team organization
- Basic social features and player profiles
- Camp management and training sessions
- Simple facility booking system with QR check-ins
- Core payment processing with automatic charging
- Mobile app for player experience
- Basic chat system for game coordination
- Foundation for future expansion

**Key MVP Features:**
- League administration dashboard
- Team and player management
- Camp creation and registration
- Basic social feed and profiles
- Simple facility booking with QR codes
- Payment processing for league fees and camps
- Mobile app (React Native) for players
- Web app for league management
- Basic chat system with attendance polls

---

## 🎯 MVP Goals & Success Criteria

### **Primary Goals**
1. **Validate Core Concept**: Prove that leagues and players will use the platform
2. **Test User Experience**: Validate the core user flows and interface
3. **Generate Revenue**: Establish payment processing and revenue streams
4. **Build Foundation**: Create scalable architecture for future features
5. **Gather Feedback**: Collect user feedback for feature prioritization

### **Success Metrics**
- **User Adoption**: 80%+ of league players register and use the platform
- **Engagement**: Average 3+ sessions per week per active user
- **Revenue**: Process $10K+ in league registration fees and camp fees
- **Retention**: 70%+ monthly user retention
- **Feedback**: Collect detailed feedback from 50+ users
- **Mobile App Usage**: 60%+ of players use mobile app for notifications
- **QR Check-in Rate**: 85%+ successful QR code check-ins

---

## 🏢 Core MVP Features

### **League Management System**

#### **League Administration Dashboard**
- **League Overview**: Basic statistics (teams, players, games, camps)
- **Team Management**: Approve teams, manage rosters
- **Player Management**: Approve player registrations
- **Game Scheduling**: Basic season schedule creation
- **Camp Management**: Create and manage training camps
- **Payment Tracking**: Track team registration fees and camp fees
- **News & Announcements**: Post league updates

#### **Team Registration Process**
- **Team Application**: Captains can create and submit teams
- **Player Invitation**: Invite players to join teams
- **Roster Management**: Manage team player lists
- **Payment Processing**: Handle team registration fees
- **Waiver Management**: Digital waiver signing

### **Camp Management System**

#### **Camp Creation & Management**
- **Camp Setup**: Create training camps with details and schedules
- **Session Scheduling**: Schedule training sessions and activities
- **Facility Assignment**: Assign gyms and training spaces to camps
- **Registration Management**: Handle camp registrations and payments
- **Capacity Management**: Set maximum participants per camp/session
- **Camp Analytics**: Track registration, attendance, and revenue

#### **Camp Registration Process**
- **Camp Discovery**: Players browse available camps
- **Registration**: Players register for camps and sessions
- **Payment Processing**: Handle camp registration fees
- **Attendance Tracking**: Track player attendance at sessions
- **Camp Communication**: Send updates and notifications to camp participants

### **Player Experience**

#### **Player Profiles**
- **Basic Profile**: Name, avatar, bio, experience level
- **Availability Status**: "Looking for Team", "Available to Sub"
- **Privacy Toggle**: Simple public/private profile setting
- **Game History**: Track games played and performance
- **Camp History**: Track camps attended and training sessions
- **Team Membership**: Show current team affiliations

#### **Social Features**
- **Basic Feed**: View league news, team updates, and camp announcements
- **Player Discovery**: Browse other players in the league
- **Team Discovery**: Browse teams and their rosters
- **Camp Discovery**: Browse available training camps
- **Basic Messaging**: Direct messages between players
- **Notifications**: Game reminders, team updates, and camp notifications

### **Facility Booking System**

#### **Basic Facility Management**
- **Facility Registration**: League can register their facilities
- **Space Management**: List available courts/spaces
- **Basic Pricing**: Set hourly rates for facility use
- **Availability Calendar**: Show available time slots
- **Camp Facility Assignment**: Assign facilities to camp sessions

#### **Simple Booking Process**
- **Browse Facilities**: View available facilities and spaces
- **Select Time**: Choose available time slots
- **Payment**: Pay for facility booking
- **QR Code Generation**: Generate QR code for facility check-in
- **Confirmation**: Receive booking confirmation and QR code
- **QR Check-in**: Scan QR code at facility for attendance tracking

### **Payment System**

#### **Core Payment Processing**
- **League Registration**: Team registration fee processing
- **Camp Registration**: Camp registration fee processing
- **Facility Bookings**: Facility rental payments
- **Payment Methods**: Credit/debit cards via Stripe
- **Credit Card Verification**: Verify payment methods for automatic charging
- **Automatic Charging**: Charge players automatically when bookings confirmed
- **Basic Invoicing**: Generate payment confirmations
- **Refund Handling**: Basic refund processing

#### **Revenue Tracking**
- **Transaction Fees**: 3-5% on all payments
- **League Commission**: 10% on league registrations
- **Camp Commission**: 10% on camp registrations
- **Facility Commission**: 10% on facility bookings
- **Basic Reporting**: Revenue and transaction reports

#### **Payout System**
- **Immediate Payouts**: Facility owners receive immediate payment
- **Delayed Payouts**: Leagues receive monthly payouts
- **Payout Analysis**: Track payout timing and success rates

### **Chat System**

#### **Basic Chat Features**
- **Game Chat**: Dedicated chat for each game
- **Team Chat**: Team communication channels
- **Attendance Polls**: WhatsApp-style polls for attendance confirmation
- **Game Coordination**: Coordinate logistics and strategy
- **Push Notifications**: Real-time chat notifications
- **Chat History**: Persistent chat history for reference

#### **Chat Management**
- **Poll Creation**: Create attendance and decision polls
- **Message Types**: Text, media sharing, and polls
- **Chat Export**: Export chat history if needed
- **Basic Moderation**: Simple chat moderation tools

---

## 🏗️ MVP Technical Architecture

### **Backend (Laravel)**

#### **Core Modules**
```
sports-yeti-api/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── PlayerController.php
│   │   ├── TeamController.php
│   │   ├── LeagueController.php
│   │   ├── CampController.php
│   │   ├── FacilityController.php
│   │   ├── GameController.php
│   │   ├── PaymentController.php
│   │   ├── ChatController.php
│   │   └── SocialController.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Player.php
│   │   ├── Team.php
│   │   ├── League.php
│   │   ├── Camp.php
│   │   ├── CampSession.php
│   │   ├── Facility.php
│   │   ├── Space.php
│   │   ├── Game.php
│   │   ├── Booking.php
│   │   ├── Payment.php
│   │   ├── Chat.php
│   │   ├── ChatMessage.php
│   │   └── Post.php
│   ├── Services/
│   │   ├── PaymentService.php
│   │   ├── BookingService.php
│   │   ├── CampService.php
│   │   ├── NotificationService.php
│   │   ├── ChatService.php
│   │   └── LeagueManagementService.php
│   └── Jobs/
│       ├── SendNotifications.php
│       └── ProcessPayments.php
```

#### **MVP Database Schema**
```sql
-- Core User & Profile Tables
users (id, email, name, avatar, phone, created_at, updated_at)
players (id, user_id, bio, experience_level, availability_status, is_private, league_id)
teams (id, name, captain_id, league_id, created_at)
team_members (id, team_id, player_id, role, payment_status, waiver_signed)

-- League Tables
leagues (id, name, description, admin_id, sport_type, location, created_at)
league_admins (id, league_id, user_id, role, permissions, created_at)

-- Camp Tables
camps (id, league_id, name, description, start_date, end_date, registration_fee, max_participants)
camp_sessions (id, camp_id, facility_id, start_time, end_time, max_participants)
camp_registrations (id, camp_id, player_id, payment_status, attendance_status)

-- Facility Tables
facilities (id, league_id, name, address, contact_info, operating_hours)
spaces (id, facility_id, name, sport_type, capacity, hourly_rate)
bookings (id, space_id, user_id, start_time, end_time, status, amount, qr_code)

-- Game Tables
games (id, team1_id, team2_id, facility_id, space_id, scheduled_at, status)
game_participants (id, game_id, player_id, team_id, attendance_confirmed, qr_checkin_time)
game_reports (id, game_id, captain_id, report_type, details, equipment_damage, created_at)

-- Payment Tables
payments (id, user_id, amount, type, status, reference_id, fee_amount, created_at)

-- Social Tables
posts (id, user_id, content, media_urls, likes_count, comments_count, created_at)
comments (id, post_id, user_id, content, created_at)
notifications (id, user_id, type, title, message, read_at, created_at)

-- Chat Tables
chats (id, game_id, team_id, type, created_at)
chat_messages (id, chat_id, user_id, message, message_type, media_url, created_at)
chat_polls (id, chat_id, question, options, votes, created_at)
chat_poll_votes (id, poll_id, user_id, option_id, created_at)

-- League Management Tables
league_news (id, league_id, title, content, published_at, author_id)
waivers (id, league_id, title, content, required, created_at)
waiver_signatures (id, waiver_id, user_id, signed_at, ip_address)
```

### **Frontend Applications**

#### **Web App (Next.js) - League Management**
- **League Dashboard**: Overview, team management, game scheduling, camp management
- **Camp Management**: Create camps, schedule sessions, manage registrations
- **Facility Management**: Space registration, booking management, QR code generation
- **Payment Processing**: Handle all payments and invoicing
- **Analytics & Reporting**: Basic revenue and participation reports
- **Chat Management**: Basic chat moderation and management

#### **Mobile App (React Native) - Player Experience**
- **Player Dashboard**: Profile management, team discovery, camp discovery
- **Camp Registration**: Browse and register for training camps
- **Facility Booking**: Browse and book available spaces
- **QR Code Scanner**: Scan QR codes for facility check-ins
- **Social Feed**: Basic news feed and player interaction
- **Notifications**: Push notifications for games, camps, and updates
- **Chat System**: Game and team communication with attendance polls
- **Game Schedule**: View upcoming games and team schedule
- **Camp Schedule**: View camp sessions and training schedule

---

## 🔄 MVP User Journeys

### **1. League Setup Journey**
```
League admin registers → Creates league profile → 
Sets up facilities → Defines registration fees → 
Creates training camps → Opens team registration → 
Approves teams → Creates season schedule
```

### **2. Team Formation Journey**
```
Captain creates team → Invites players → Players accept → 
Pays registration fee → Signs waiver → 
Team approved by league → Season participation
```

### **3. Player Registration Journey**
```
Player registers → Completes profile → 
Browses teams and camps → Joins team and registers for camps → 
Pays registration fees → Signs waiver → 
Access to league features and camp sessions
```

### **4. Camp Registration Journey**
```
League creates camp → Players browse camps via mobile app → 
Register for camp → Payment processing → 
Receive notifications → Attend sessions → 
Track attendance and progress
```

### **5. Facility Booking Journey**
```
Player browses facilities → Selects available time → 
Pays for booking → Receives confirmation and QR code → 
Attends facility → Scans QR code for check-in
```

### **6. Game Management Journey**
```
League schedules game → Teams notified via mobile app → 
Chat room created → Attendance polls created → 
Players vote on attendance → Game played → 
Captains report absences and equipment damage → 
Results recorded → Statistics updated
```

### **7. Chat Coordination Journey**
```
Game scheduled → Chat room automatically created → 
Teams join chat → Attendance polls created → 
Players vote on attendance → Game coordination → 
Post-game chat archive
```

---

## 📊 MVP Success Metrics

### **User Adoption Metrics**
- **Registration Rate**: 80%+ of league players register
- **Active Users**: 70%+ weekly active users
- **Feature Usage**: 60%+ use core features (booking, messaging, camps)
- **Mobile App Usage**: 60%+ of players use mobile app for notifications
- **QR Check-in Rate**: 85%+ successful QR code check-ins

### **Revenue Metrics**
- **Payment Success**: 95%+ successful payment processing
- **Revenue Generation**: $10K+ in league registration and camp fees
- **Transaction Volume**: 100+ successful transactions
- **Camp Revenue**: 30%+ of total revenue from camp registrations
- **Automatic Charging**: 90%+ successful automatic payment processing

### **Engagement Metrics**
- **Session Frequency**: 3+ sessions per week per user
- **Time Spent**: Average 10+ minutes per session
- **Feature Engagement**: 50%+ use social features
- **Camp Participation**: 40%+ of players register for at least one camp
- **Chat Engagement**: 70%+ of games have active chat participation

### **Technical Metrics**
- **System Uptime**: 99%+ availability
- **Response Time**: <2 seconds average page load
- **Error Rate**: <1% error rate
- **Mobile App Performance**: <3 seconds app launch time
- **QR Code Generation**: <1 second QR code generation time

---

## 🛠️ MVP Development Timeline

### **Phase 1: Foundation (Weeks 1-4)**
- **Week 1-2**: Laravel API development and database setup
- **Week 3**: Basic authentication and user management
- **Week 4**: League and team management core features

### **Phase 2: Core Features (Weeks 5-8)**
- **Week 5-6**: Player profiles, social features, and camp management
- **Week 7**: Facility booking system with QR code generation
- **Week 8**: Payment processing integration with automatic charging

### **Phase 3: Mobile App Development (Weeks 9-12)**
- **Week 9-10**: React Native mobile app development
- **Week 11**: Push notifications, QR code scanner, and mobile-specific features
- **Week 12**: Mobile app testing and optimization

### **Phase 4: League Management (Weeks 13-16)**
- **Week 13-14**: League administration dashboard
- **Week 15**: Game scheduling, camp management, and waiver system
- **Week 16**: Chat system implementation with attendance polls

### **Phase 5: Testing & Launch (Weeks 17-20)**
- **Week 17-18**: User testing and feedback collection
- **Week 19**: Bug fixes and performance optimization
- **Week 20**: MVP launch with basketball league

---

## 💡 MVP Revenue Model

### **Primary Revenue Streams**
1. **Transaction Fees**: 3-5% on all payments
2. **League Registration Fees**: 10% commission on registrations
3. **Camp Registration Fees**: 10% commission on camp registrations
4. **Facility Commission**: 10% on facility bookings

### **Projected MVP Revenue**
- **Month 1**: $3K - $7K (pilot launch with camps)
- **Month 2**: $7K - $12K (full league and camp adoption)
- **Month 3**: $12K - $18K (stabilized usage with camp revenue)

---

## 🎯 MVP Competitive Advantages

### **vs. Existing Competitors**
- **Focused Solution**: Specifically designed for basketball leagues
- **Camp Integration**: Integrated training camp management
- **Mobile-First**: Dedicated mobile app for player experience
- **Simple Interface**: Easy-to-use for non-technical users
- **Integrated Payments**: Seamless payment processing with automatic charging
- **QR Code Check-ins**: Streamlined attendance tracking
- **Chat System**: Basic communication and coordination tools
- **Social Features**: Basic community building tools

### **MVP Positioning**
- **Primary**: Basketball league management platform with training camps
- **Secondary**: Player community and facility booking
- **Future**: Foundation for multi-sport expansion

---

## 🚀 MVP Launch Strategy

### **Pilot Phase (Basketball League)**
- **Focus**: Single basketball league with 10-20 teams and training camps
- **Goals**: Validate core features and user experience
- **Timeline**: 5 months (20 weeks)
- **Success Metrics**: User adoption, engagement, revenue, mobile app usage, QR check-in rates

### **Post-MVP Expansion**
- **Local Expansion**: Add 2-3 more basketball leagues
- **Feature Enhancement**: Add missing features based on feedback
- **Platform Evolution**: Gradually implement full scope features

---

## 🔮 MVP to Full Platform Evolution

### **Phase 1: MVP Launch (Months 1-5)**
- Launch with basketball league pilot and camps
- Validate core features and user experience
- Establish revenue streams and payment processing
- Validate mobile app usage and engagement
- Test QR code check-in system

### **Phase 2: Feature Enhancement (Months 6-9)**
- Add gamification and point system
- Implement referee services
- Add tournament management
- Enhance camp features with trainer management
- Add point wagering for mock games

### **Phase 3: Platform Expansion (Months 10-13)**
- Add multi-sport support
- Implement AI highlight extraction
- Add equipment rental system
- Expand mobile app features
- Enhance chat system with WhatsApp integration

### **Phase 4: Full Platform (Months 14-17)**
- Complete all features from full scope
- Add multi-language support
- Scale to regional/national level

---

## ⚠️ MVP Limitations & Future Considerations

### **MVP Limitations**
- **Single Sport**: Basketball only (vs. multi-sport in full scope)
- **Basic Social Features**: Limited social interaction (vs. comprehensive social platform)
- **Simple Booking**: Basic facility booking (vs. equipment rental, referee booking)
- **Basic Camp Management**: No trainer management or advanced camp features
- **No Gamification**: No point system or achievements
- **No AI Features**: No highlight extraction or AI optimization
- **Single Language**: English only (vs. multi-language support)
- **No Mock Games**: No casual game creation system
- **Basic Chat**: Limited chat features (vs. advanced chat with WhatsApp integration)
- **No Point Wagering**: No competitive point wagering system

### **Future Considerations**
- **Scalability**: Architecture designed to support full platform features
- **Modular Design**: Features can be added incrementally
- **API-First**: Backend designed for mobile app development
- **Payment Foundation**: Payment system ready for additional revenue streams
- **User Feedback**: MVP designed to collect feedback for feature prioritization
- **Mobile Foundation**: Mobile app ready for additional features
- **QR Code System**: Foundation for advanced check-in and tracking features
- **Chat Foundation**: Basic chat system ready for advanced features

---

## 📋 MVP Feature Checklist

### **✅ Core Features (MVP)**
- [ ] User authentication and registration
- [ ] League administration dashboard
- [ ] Team creation and management
- [ ] Player profiles and discovery
- [ ] Camp creation and management
- [ ] Camp registration and payment processing
- [ ] Basic social feed and messaging
- [ ] Facility registration and booking
- [ ] QR code generation and check-in system
- [ ] Payment processing (Stripe integration)
- [ ] Automatic charging system
- [ ] Game scheduling and management
- [ ] Waiver management
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Mobile-responsive web interface
- [ ] Basic chat system with attendance polls
- [ ] QR code scanner in mobile app

### **⏳ Future Features (Post-MVP)**
- [ ] Gamification and point system
- [ ] Point wagering for mock games
- [ ] Referee services
- [ ] Tournament management
- [ ] Equipment rental
- [ ] Trainer management for camps
- [ ] AI highlight extraction
- [ ] Multi-language support
- [ ] Advanced social features
- [ ] Mock game system
- [ ] Advanced camp analytics
- [ ] WhatsApp chat integration
- [ ] Advanced chat features

---

This MVP scope document outlines a focused, achievable version of Sports Yeti that can be launched in 20 weeks while building the foundation for the full platform vision. The MVP prioritizes core league management functionality, camp management, mobile app experience, QR code check-ins, automatic payment processing, and basic chat features while maintaining the social-first approach that differentiates the platform. 