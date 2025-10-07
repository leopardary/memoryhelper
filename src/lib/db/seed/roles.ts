'use server'
import { connectDB } from '@/lib/db/utils';
import Role from '@/lib/db/model/Role';
import { CreateRoleInput } from '@/lib/db/model/types/Role.types';

const defaultRoles: CreateRoleInput[] = [
  {
    name: 'visitor',
    displayName: 'Visitor',
    description: 'Default role with view-only access',
    permissions: ['view'],
    isGlobal: true
  },
  {
    name: 'student',
    displayName: 'Student',
    description: 'Can view content and practice within assigned subjects',
    permissions: ['view', 'practice'],
    isGlobal: false
  },
  {
    name: 'teacher',
    displayName: 'Teacher',
    description: 'Can manage content and students within assigned subjects',
    permissions: ['view', 'manage_content', 'manage_student'],
    isGlobal: false
  },
  {
    name: 'administrator',
    displayName: 'Administrator',
    description: 'Full access to all features and subjects',
    permissions: [
      'view',
      'practice',
      'manage_content',
      'manage_student',
      'manage_subject',
      'manage_teacher'
    ],
    isGlobal: true
  }
];

/**
 * Seed default roles into the database
 * Safe to run multiple times - will only create roles that don't exist
 */
export async function seedRoles() {
  await connectDB();

  try {
    const results = [];

    for (const roleData of defaultRoles) {
      const existing = await Role.findOne({ name: roleData.name });

      if (!existing) {
        const role = await Role.create(roleData);
        results.push({ created: true, role: role.name });
        console.log(`Created role: ${role.name}`);
      } else {
        results.push({ created: false, role: existing.name });
        console.log(`Role already exists: ${existing.name}`);
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error seeding roles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update existing roles with latest permissions
 * Use this when you update role definitions
 */
export async function updateRoles() {
  await connectDB();

  try {
    const results = [];

    for (const roleData of defaultRoles) {
      const updated = await Role.findOneAndUpdate(
        { name: roleData.name },
        {
          $set: {
            displayName: roleData.displayName,
            description: roleData.description,
            permissions: roleData.permissions,
            isGlobal: roleData.isGlobal
          }
        },
        { new: true, upsert: true }
      );

      results.push({ updated: true, role: updated.name });
      console.log(`Updated role: ${updated.name}`);
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error updating roles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
