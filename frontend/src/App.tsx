import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, roleHomePath } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
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
import PatientDashboard from './pages/PatientDashboard';
import WalkinRegistration from './pages/WalkinRegistration';
import ConflictResolution from './pages/ConflictResolution';
import PatientProfileView from './pages/PatientProfileView';
import DoctorProfileView from './pages/DoctorProfileView';
import AppointmentDetails from './pages/AppointmentDetails';
import ResetPassword from './pages/ResetPassword';

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

      <Route
        path="/reset-password"
        element={<ResetPassword />}
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
              <Route path="reception/walkin" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <WalkinRegistration />
                </ProtectedRoute>
              } />
              <Route path="reception/conflicts" element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ConflictResolution />
                </ProtectedRoute>
              } />
               <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="book" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientBooking />
                </ProtectedRoute>
              } />
              <Route path="appointment/:id" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <AppointmentDetails />
                </ProtectedRoute>
              } />
              <Route path="patient/profile" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientProfileView />
                </ProtectedRoute>
              } />
              <Route path="doctors" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="doctor/profile" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorProfileView />
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
                <ProtectedRoute allowedRoles={['admin']}>
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
