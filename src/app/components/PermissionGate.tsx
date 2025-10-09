'use client'
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/db/model/types/Role.types';
import { ReactNode } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;  // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: ReactNode;
  showForAdmin?: boolean; // If true, show content for administrators even without specific permission
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * // Show only if user has 'manage_content' permission
 * <PermissionGate permission="manage_content">
 *   <EditButton />
 * </PermissionGate>
 *
 * @example
 * // Show if user has ANY of the permissions
 * <PermissionGate permissions={['manage_content', 'manage_subject']}>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // Show if user has ALL of the permissions
 * <PermissionGate permissions={['manage_content', 'manage_subject']} requireAll>
 *   <SuperAdminFeature />
 * </PermissionGate>
 *
 * @example
 * // Show fallback if user doesn't have permission
 * <PermissionGate permission="practice" fallback={<UpgradePrompt />}>
 *   <PracticeButton />
 * </PermissionGate>
 */
export default function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showForAdmin = true
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isAuthenticated
  } = usePermissions();

  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // If showForAdmin is true and user is admin, show content
  if (showForAdmin && isAdmin()) {
    return <>{children}</>;
  }

  // Check single permission
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>;
  }

  // If no permission specified, show fallback
  return <>{fallback}</>;
}
