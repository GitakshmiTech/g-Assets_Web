import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

export default function ProtectedRoute({ requiredPermission }) {
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (!requiredPermission) {
    return <Outlet />;
  }

  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
