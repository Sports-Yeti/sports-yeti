import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import LeaguesPage from './pages/leagues/LeaguesPage';
import LeagueDetailsPage from './pages/leagues/LeagueDetailsPage';
import CreateLeaguePage from './pages/leagues/CreateLeaguePage';
import EditLeaguePage from './pages/leagues/EditLeaguePage';
import TrainersPage from './pages/trainers/TrainersPage';
import TrainerDetailsPage from './pages/trainers/TrainerDetailsPage';
import CampsPage from './pages/camps/CampsPage';
import CreateCampPage from './pages/camps/CreateCampPage';
import RefereesPage from './pages/referees/RefereesPage';
import RefereeDetailsPage from './pages/referees/RefereeDetailsPage';
import AssignmentsPage from './pages/referees/AssignmentsPage';
import GameReportPage from './pages/referees/GameReportPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        
        {/* League Routes */}
        <Route path="leagues" element={<LeaguesPage />} />
        <Route path="leagues/create" element={<CreateLeaguePage />} />
        <Route path="leagues/:id" element={<LeagueDetailsPage />} />
        <Route path="leagues/:id/edit" element={<EditLeaguePage />} />
        
        {/* Trainer Routes */}
        <Route path="trainers" element={<TrainersPage />} />
        <Route path="trainers/:id" element={<TrainerDetailsPage />} />
        
        {/* Camp Routes */}
        <Route path="camps" element={<CampsPage />} />
        <Route path="camps/create" element={<CreateCampPage />} />
        
        {/* Referee Routes */}
        <Route path="referees" element={<RefereesPage />} />
        <Route path="referees/:id" element={<RefereeDetailsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="games/:id/report" element={<GameReportPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
