# Sports Yeti Admin Web Application

A React web application built with Vite, TypeScript, and Material-UI for managing Sports Yeti's administrative interfaces.

## Features

### League Administration
- View all leagues with search and filters
- Create new leagues with details, schedule, and rules
- Edit league information
- Manage league registrations and teams
- View team standings and statistics

### Trainer Management
- View all trainers with their credentials
- Manage trainer profiles and certifications
- View trainer-specific camps
- Create and schedule training camps
- Track camp registrations and attendance

### Referee Administration
- View all referees with credentials
- Manage game assignments
- Track assignment status (pending/confirmed/completed)
- Submit detailed game reports with incidents
- View compensation and performance ratings

## Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Date Utilities**: date-fns
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── DataCard.tsx
│   ├── DataTable.tsx
│   ├── StatCard.tsx
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   └── LoadingSpinner.tsx
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── layouts/         # Layout components
│   └── DashboardLayout.tsx
├── pages/          # Page components (routes)
│   ├── LoginPage.tsx
│   ├── DashboardHome.tsx
│   ├── leagues/
│   ├── trainers/
│   ├── camps/
│   └── referees/
├── services/       # API services
│   └── mockApi.ts
├── types/          # TypeScript type definitions
│   └── index.ts
├── App.tsx         # Root component
├── AppRoutes.tsx   # Route definitions
└── main.tsx        # Entry point
```

## Authentication

The application uses a simple mock authentication system. To log in:

1. Enter any email address
2. Enter any password
3. Select your role:
   - **League Administrator**: Manage leagues, teams, and view all data
   - **Trainer**: Manage training camps and participants
   - **Referee**: View assignments and submit game reports

**Note**: This is a mock system using localStorage. In production, integrate with a real authentication backend.

## Mock Data

The application uses mock data defined in `src/services/mockApi.ts`. All API calls are simulated with delays to mimic real network requests. The mock data includes:

- 3 Leagues (basketball, soccer, tennis)
- 3 Trainers with certifications
- 3 Training camps
- 3 Referees with credentials
- Game assignments and reports
- Dashboard statistics

## Features by Role

### League Administrator
- Full access to all sections
- Manage leagues (create, edit, view)
- View all trainers and camps
- View all referees and assignments
- Access dashboard with comprehensive statistics

### Trainer
- Manage personal training camps
- Create new camps
- View registrations and participants
- Access trainer-specific dashboard

### Referee
- View game assignments
- Confirm pending assignments
- Submit game reports with incident tracking
- View compensation and statistics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Code Style

This project follows:
- TypeScript strict mode
- Functional components with hooks
- Material-UI component patterns
- React Hook Form for form handling
- Zod for runtime validation

## API Integration

To integrate with a real backend:

1. Replace mock API calls in `src/services/mockApi.ts` with actual API endpoints
2. Update the `AuthContext` to use real authentication
3. Add proper error handling and retry logic
4. Implement proper loading states
5. Add API interceptors for authentication tokens

## Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (up to 768px)

The sidebar navigation automatically collapses to a drawer on mobile devices.

## Future Enhancements

- Add real-time notifications
- Implement data export (CSV/PDF)
- Add advanced analytics and charts
- Implement file upload for avatars and documents
- Add calendar view for schedules
- Implement search across all entities
- Add email notifications
- Implement payment integration
- Add multi-language support

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
