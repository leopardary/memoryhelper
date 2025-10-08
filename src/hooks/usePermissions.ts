'use client'
import { useSession } from 'next-auth/react';
import { Permission } from '@/lib/db/model/types/Role.types';

/**
 * Client-side hook for checking permissions from session
 * Note: This uses permissions loaded into the session at login time
 * For real-time permission checks, use server-side hasPermission()
 */
export function usePermissions() {
  const { data: session, status } = useSession();

  const hasPermission = (permission: Permission): boolean => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    // Admins have all permissions
    if (session.user.isAdmin) {
      return true;
    }

    return session.user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = (): boolean => {
    return session?.user?.isAdmin || false;
  };

  const getPermissions = (): Permission[] => {
    return session?.user?.permissions || [];
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    getPermissions,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
}
