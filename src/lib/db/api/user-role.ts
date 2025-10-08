'use server'
import UserRole from '@/lib/db/model/UserRole';
import { connectDB } from '@/lib/db/utils';
import { CreateUserRoleInput } from '@/lib/db/model/types/UserRole.types';

export async function assignUserRole(data: CreateUserRoleInput) {
  await connectDB();
  // Check if assignment already exists
  const existing = await UserRole.findOne({
    userId: data.userId,
    roleId: data.roleId,
    subjectId: data.subjectId
  });

  if (existing) {
    return existing;
  }

  return UserRole.create(data);
}

export async function getUserRole(id: string) {
  await connectDB();
  return UserRole.findById(id).populate('roleId').populate('subjectId');
}

export async function getUserRoles(userId: string) {
  await connectDB();
  return UserRole.find({ userId })
    .populate('roleId')
    .populate('subjectId');
}

export async function getUserRolesBySubject(userId: string, subjectId: string) {
  await connectDB();
  return UserRole.find({ userId, subjectId })
    .populate('roleId');
}

export async function getGlobalUserRoles(userId: string) {
  await connectDB();
  return UserRole.find({ userId, subjectId: null })
    .populate('roleId');
}

export async function removeUserRole(id: string) {
  await connectDB();
  return UserRole.findByIdAndDelete(id);
}

export async function removeUserRoleByDetails(userId: string, roleId: string, subjectId?: string | null) {
  await connectDB();
  return UserRole.findOneAndDelete({
    userId,
    roleId,
    subjectId: subjectId || null
  });
}

export async function getAllUsersWithRole(roleId: string, subjectId?: string | null) {
  await connectDB();
  const query: any = { roleId };
  if (subjectId !== undefined) {
    query.subjectId = subjectId || null;
  }
  return UserRole.find(query).populate('userId');
}
