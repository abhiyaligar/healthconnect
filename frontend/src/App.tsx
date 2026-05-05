import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, roleHomePath } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ReceptionDashboard from './pages/ReceptionDashboard';
import PatientBooking from './pages/PatientBooking';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QueuePanel from './pages/QueuePanel';
import ConflictsPanel from './pages/ConflictsPanel';
import AdminPanel from './pages/AdminPanel';
import ScheduleManager from './pages/ScheduleManager';

function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  return (
    <Routes>
      {/* Public: Landing Page — redirect to role home if already logged in */}
      <Route
        path="/"
        element={
          isLoggedIn && role
            ? <Navigate to={roleHomePath(role)} replace />
            : <LandingPage />
        }
      />

      {/* Protected routes — wrapped in Layout */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="reception" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ReceptionDashboard />
                </ProtectedRoute>
              } />
              <Route path="book" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientBooking />
                </ProtectedRoute>
              } />
              <Route path="doctors" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="queue" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <QueuePanel />
                </ProtectedRoute>
              } />
              <Route path="conflicts" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ConflictsPanel />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="scheduling" element={
                <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
                  <ScheduleManager />
                </ProtectedRoute>
              } />
              <Route path="*" element={<div className="p-8 text-navy-500">Page not found.</div>} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
