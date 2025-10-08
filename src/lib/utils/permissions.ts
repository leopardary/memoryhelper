'use server'
import { connectDB } from '@/lib/db/utils';
import UserRole from '@/lib/db/model/UserRole';
import Role from '@/lib/db/model/Role';
import User from '@/lib/db/model/User';
import { Permission } from '@/lib/db/model/types/Role.types';

/**
 * Check if a user has a specific permission
 * @param userId - User ID to check
 * @param permission - Permission to verify
 * @param subjectId - Optional subject ID for subject-scoped permissions
 * @returns Promise<boolean>
 */
export async function hasPermission(
  userId: string,
  permission: Permission,
  subjectId?: string
): Promise<boolean> {
  await connectDB();

  try {
    // 1. Check for global administrator role (highest priority - has all permissions)
    const adminRole = await Role.findOne({ name: 'administrator' });
    if (adminRole) {
      const globalAdmin = await UserRole.findOne({
        userId,
        roleId: adminRole._id,
        subjectId: null
      });
      if (globalAdmin) return true;
    }

    // 2. If checking subject-specific permission
    if (subjectId) {
      const subjectRoles = await UserRole.find({ userId, subjectId }).populate('roleId');
      for (const userRole of subjectRoles) {
        const role: any = userRole.roleId;
        if (role?.permissions?.includes(permission)) {
          return true;
        }
      }
    }

    // 3. Check global roles (visitor, or global teacher/student assignments)
    const globalRoles = await UserRole.find({ userId, subjectId: null }).populate('roleId');
    for (const userRole of globalRoles) {
      const role: any = userRole.roleId;
      if (role?.permissions?.includes(permission)) {
        return true;
      }
    }

    // 4. Fall back to user's default role
    const user = await User.findById(userId);
    if (user?.defaultRole) {
      const defaultRole = await Role.findOne({ name: user.defaultRole });
      if (defaultRole?.permissions?.includes(permission)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[],
  subjectId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission, subjectId)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has ALL of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[],
  subjectId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission, subjectId))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user (optionally scoped to a subject)
 */
export async function getUserPermissions(
  userId: string,
  subjectId?: string
): Promise<Permission[]> {
  await connectDB();

  try {
    const permissions = new Set<Permission>();

    // Get administrator role
    const adminRole = await Role.findOne({ name: 'administrator' });
    if (adminRole) {
      const globalAdmin = await UserRole.findOne({
        userId,
        roleId: adminRole._id,
        subjectId: null
      });
      if (globalAdmin) {
        return adminRole.permissions;
      }
    }

    // Get subject-specific roles
    if (subjectId) {
      const subjectRoles = await UserRole.find({ userId, subjectId }).populate('roleId');
      for (const userRole of subjectRoles) {
        const role: any = userRole.roleId;
        role?.permissions?.forEach((p: Permission) => permissions.add(p));
      }
    }

    // Get global roles
    const globalRoles = await UserRole.find({ userId, subjectId: null }).populate('roleId');
    for (const userRole of globalRoles) {
      const role: any = userRole.roleId;
      role?.permissions?.forEach((p: Permission) => permissions.add(p));
    }

    // Get default role permissions
    const user = await User.findById(userId);
    if (user?.defaultRole) {
      const defaultRole = await Role.findOne({ name: user.defaultRole });
      defaultRole?.permissions?.forEach((p: Permission) => permissions.add(p));
    }

    return Array.from(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

/**
 * Check if user is administrator (global)
 */
export async function isAdministrator(userId: string): Promise<boolean> {
  await connectDB();

  try {
    const adminRole = await Role.findOne({ name: 'administrator' });
    if (!adminRole) return false;

    const globalAdmin = await UserRole.findOne({
      userId,
      roleId: adminRole._id,
      subjectId: null
    });

    return !!globalAdmin;
  } catch (error) {
    console.error('Administrator check error:', error);
    return false;
  }
}

/**
 * Get all subjects where user has a specific role
 */
export async function getSubjectsWithRole(userId: string, roleName: string) {
  await connectDB();

  try {
    const role = await Role.findOne({ name: roleName });
    if (!role) return [];

    const userRoles = await UserRole.find({
      userId,
      roleId: role._id,
      subjectId: { $ne: null }
    }).populate('subjectId');

    return userRoles.map(ur => ur.subjectId).filter(Boolean);
  } catch (error) {
    console.error('Get subjects with role error:', error);
    return [];
  }
}
