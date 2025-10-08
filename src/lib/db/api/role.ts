'use server'
import Role from '@/lib/db/model/Role';
import { connectDB } from '@/lib/db/utils';
import { CreateRoleInput, UpdateRoleInput, RoleName } from '@/lib/db/model/types/Role.types';

export async function createRole(data: CreateRoleInput) {
  await connectDB();
  return Role.create(data);
}

export async function getRole(id: string) {
  await connectDB();
  return Role.findById(id);
}

export async function getRoleByName(name: RoleName) {
  await connectDB();
  return Role.findOne({ name });
}

export async function getAllRoles() {
  await connectDB();
  return Role.find().sort({ name: 1 });
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  await connectDB();
  return Role.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteRole(id: string) {
  await connectDB();
  return Role.findByIdAndDelete(id);
}
