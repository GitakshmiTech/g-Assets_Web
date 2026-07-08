import { useSelector } from "react-redux";

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    
    // If user has permissions array, check it
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    
    return false;
  };

  const hasAnyPermission = (permissions = []) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    
    if (user.permissions && Array.isArray(user.permissions)) {
      return permissions.some(p => user.permissions.includes(p));
    }
    
    return false;
  };

  const hasAllPermissions = (permissions = []) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    
    if (user.permissions && Array.isArray(user.permissions)) {
      return permissions.every(p => user.permissions.includes(p));
    }
    
    return false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    isAdmin: ["SUPER_ADMIN", "COMPANY_ADMIN", "BRANCH_ADMIN", "ADMIN"].includes(user?.role),
  };
};
