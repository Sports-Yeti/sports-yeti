# Sports Yeti Admin - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Navigate to the Web App
```bash
cd apps/web
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will open at **http://localhost:3000**

### 3. Log In
Use these credentials (or any email/password):
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: Choose from:
  - **League Administrator** - Full access to manage leagues, view all data
  - **Trainer** - Manage training camps
  - **Referee** - View assignments and submit game reports

## 📱 What You'll See

### For League Administrators
- **Dashboard**: Overview of all leagues, trainers, referees, camps
- **Leagues**: Create, view, edit leagues and manage teams
- **Trainers**: View all trainers and their camps
- **Camps**: Browse and create training camps
- **Referees**: View all referees and assignments

### For Trainers
- **Dashboard**: Camp statistics and activity
- **Trainers**: Your profile and other trainers
- **Camps**: Manage your camps and create new ones

### For Referees
- **Dashboard**: Assignment statistics
- **Referees**: View other referees
- **Assignments**: Confirm pending assignments
- **Game Reports**: Submit detailed reports after games

## 🎯 Try These Features

1. **Create a New League**
   - Go to Leagues → Click "Create League"
   - Fill in the form and submit

2. **Browse Training Camps**
   - Go to Camps
   - Filter by sport
   - View camp details

3. **View Game Assignments**
   - Go to Assignments (as Referee)
   - Confirm pending assignments
   - Submit game reports

4. **Check Dashboard Stats**
   - View real-time statistics
   - See recent activity feed

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Lint code
npm run lint
```

## 📊 Features Overview

✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Type-Safe** - 100% TypeScript coverage
✅ **Form Validation** - Real-time error feedback
✅ **Search & Filters** - Find what you need quickly
✅ **Mock Data** - Realistic data for testing
✅ **Loading States** - Clear feedback on all actions
✅ **Role-Based Access** - Different views for different roles

## 🔄 Next Steps

Once you're familiar with the interface:
1. Replace mock API with real backend calls
2. Add authentication tokens
3. Deploy to staging environment
4. Run tests
5. Deploy to production

## 📚 Need More Info?

- **Full Documentation**: See `README.md`
- **Implementation Details**: See `IMPLEMENTATION_COMPLETE.md`
- **Code Examples**: Browse `src/pages/*` for reference

## 💡 Tips

- All forms have validation - try submitting empty forms to see errors
- Tables are sortable - click column headers
- Use filters to narrow down results
- Mobile menu is in the top-left when on small screens

---

**Enjoy exploring the Sports Yeti Admin application!** 🎉
