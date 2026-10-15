import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './components/RoleGuard';

import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/Auth/StudentLogin';
import { StaffLogin } from './pages/Auth/StaffLogin';
import { AdminLogin } from './pages/Auth/AdminLogin';

import { StudentDashboard } from './pages/Student/StudentDashboard';
import { StudentMenu } from './pages/Student/StudentMenu';
import { StudentTimetable } from './pages/Student/StudentTimetable';
import { StudentCheckout } from './pages/Student/StudentCheckout';
import { StudentOrders } from './pages/Student/StudentOrders';
import { StudentInvoices } from './pages/Student/StudentInvoices';
import { StudentProfile } from './pages/Student/StudentProfile';

import { StaffDashboard } from './pages/Staff/StaffDashboard';

import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { KitchenKanban } from './pages/Admin/KitchenKanban';
import { MenuManagement } from './pages/Admin/MenuManagement';
import { InventoryManagement } from './pages/Admin/InventoryManagement';
import { PickupSlotManagement } from './pages/Admin/PickupSlotManagement';
import { TimetableAnalytics } from './pages/Admin/TimetableAnalytics';
import { AdminReports } from './pages/Admin/AdminReports';
import { UserManagement } from './pages/Admin/UserManagement';
import { AuditLogs } from './pages/Admin/AuditLogs';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Portal Protected Routes */}
          <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/menu" element={<StudentMenu />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/checkout" element={<StudentCheckout />} />
            <Route path="/student/orders" element={<StudentOrders />} />
            <Route path="/student/invoices" element={<StudentInvoices />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Staff Portal Protected Routes */}
          <Route element={<RoleGuard allowedRoles={['STAFF']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/menu" element={<StudentMenu />} />
            <Route path="/staff/checkout" element={<StudentCheckout />} />
            <Route path="/staff/orders" element={<StudentOrders />} />
            <Route path="/staff/invoices" element={<StudentInvoices />} />
            <Route path="/staff/profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Portal Protected Routes */}
          <Route element={<RoleGuard allowedRoles={['CANTEEN_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/kitchen" element={<KitchenKanban />} />
            <Route path="/admin/menu" element={<MenuManagement />} />
            <Route path="/admin/inventory" element={<InventoryManagement />} />
            <Route path="/admin/pickup-slots" element={<PickupSlotManagement />} />
            <Route path="/admin/timetable-analytics" element={<TimetableAnalytics />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
