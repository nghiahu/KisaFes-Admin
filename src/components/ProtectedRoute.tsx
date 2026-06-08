import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/storeHooks';
import type { Permission } from '../utils/rbac';
import { hasPermission } from '../utils/rbac';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
}

export default function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Backend returns roles as ['ROLE_ADMIN', 'ROLE_USER']; map to frontend Role type
  const rawRole = user?.roles?.[0] ?? '';
  // Strip 'ROLE_' prefix if present for legacy roles, or map known patterns
  const normalizedRole = rawRole.replace(/^ROLE_/, '') as import('../utils/rbac').Role;

  if (requiredPermission && !hasPermission(normalizedRole, requiredPermission)) {
    // Optionally redirect to a 403 page or dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
