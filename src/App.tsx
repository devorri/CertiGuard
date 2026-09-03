import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyPage } from './pages/VerifyPage';
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { RequestCertificate } from './pages/resident/RequestCertificate';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageRequests } from './pages/admin/ManageRequests';
import { CertificateRecords } from './pages/admin/CertificateRecords';
import { ManageResidents } from './pages/admin/ManageResidents';
import { SMSLogs } from './pages/admin/SMSLogs';
import { OfficialReports } from './pages/admin/OfficialReports';
import { ProtectedRoute } from './components/ui/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:hash" element={<VerifyPage />} />

          {/* Resident Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="resident" />}>
            <Route path="/resident/dashboard" element={<ResidentDashboard />} />
            <Route path="/resident/request" element={<RequestCertificate />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<ManageRequests />} />
              <Route path="/admin/records" element={<CertificateRecords />} />
              <Route path="/admin/residents" element={<ManageResidents />} />
              <Route path="/admin/sms" element={<SMSLogs />} />
              <Route path="/admin/reports" element={<OfficialReports />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};
export default App;
