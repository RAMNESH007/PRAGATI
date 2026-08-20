import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RailwayProvider } from './context/RailwayContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OperatorDashboard } from './pages/operator/OperatorDashboard';
import { TrainsPage } from './pages/TrainsPage';
import { AIRecommendationsPage } from './pages/AIRecommendationsPage';
import { NetworkMapPage } from './pages/NetworkMapPage';
import { SchedulePlannerPage } from './pages/SchedulePlannerPage';
import { ManualControlPage } from './pages/ManualControlPage';
import { SimulationPage } from './pages/SimulationPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { ZonesPage } from './pages/ZonesPage';

export function App() {
  return (
    <AuthProvider>
      <RailwayProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/admin/login" element={<LandingPage />} />
            <Route path="/operator/login" element={<LandingPage />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OPERATOR']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Admin Scoped Portal */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/zones" element={<ZonesPage />} />
              <Route path="/admin/trains" element={<TrainsPage />} />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              } />

              {/* Operator Scoped Portal */}
              <Route path="/operator/dashboard" element={<OperatorDashboard />} />
              <Route path="/operator/zone" element={<ZonesPage />} />
              <Route path="/operator/trains" element={<TrainsPage />} />
              <Route path="/operator/manual-control" element={<ManualControlPage />} />

              {/* Shared Core Modules */}
              <Route path="/ai-recommendations" element={<AIRecommendationsPage />} />
              <Route path="/network-map" element={<NetworkMapPage />} />
              <Route path="/schedule" element={<SchedulePlannerPage />} />
              <Route path="/manual-control" element={<ManualControlPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RailwayProvider>
    </AuthProvider>
  );
}

export default App;
