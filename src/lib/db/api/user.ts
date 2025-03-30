import { prisma } from './prisma'
import type { User } from '@prisma/client'

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      memoryChecks: true
    }
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function updateUser(id: string, data: Partial<User>) {
  return prisma.user.update({
    where: { id },
    data
  })
}