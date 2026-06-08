import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import UserList from './features/users/UserList';
import { useTheme } from './hooks/useTheme';

import CategoryList from './features/categories/CategoryList';
import BlogList from './features/blogs/BlogList';
import SystemSettingsPage from './features/settings/SystemSettings';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import AuditLogs from './features/logs/AuditLogs';
import NotificationCenter from './features/notifications/NotificationCenter';
import ConfirmModal from './shared/components/ConfirmModal';

export default function App() {
  useTheme(); // Initialize theme
  const { t } = useTranslation();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => setSessionExpired(true);
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const handleLoginRedirect = () => {
    setSessionExpired(false);
    window.location.href = '/login';
  };

  return (
    <>
      <ConfirmModal 
        isOpen={sessionExpired} 
        title={t('app.sessionExpired')}
        message={<span dangerouslySetInnerHTML={{ __html: t('app.sessionExpiredDesc') }} />}
        confirmText={t('app.loginAgain')}
        cancelText={t('app.close')}
        onConfirm={handleLoginRedirect}
        onCancel={handleLoginRedirect}
      />
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Protected by specific permissions */}
            <Route element={<ProtectedRoute requiredPermission="USER_VIEW" />}>
              <Route path="/users" element={<UserList />} />
            </Route>
            
            <Route element={<ProtectedRoute requiredPermission="CATEGORY_VIEW" />}>
              <Route path="/categories" element={<CategoryList />} />
            </Route>
            
            <Route element={<ProtectedRoute requiredPermission="BLOG_VIEW" />}>
              <Route path="/blogs" element={<BlogList />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="ANALYTICS_VIEW" />}>
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="AUDIT_LOG_VIEW" />}>
              <Route path="/logs" element={<AuditLogs />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="SETTINGS_VIEW" />}>
              <Route path="/notifications" element={<NotificationCenter />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="SETTINGS_VIEW" />}>
              <Route path="/settings" element={<SystemSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </>
  );
}
