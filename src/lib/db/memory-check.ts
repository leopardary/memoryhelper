import { prisma } from './prisma'
import type { MemoryCheck } from '@prisma/client'

export async function createMemoryCheck(data: {
  memoryPiece: string
  correct: boolean
  userId: string
}) {
  return prisma.memoryCheck.create({
    data
  })
}

export async function getMemoryCheck(id: string) {
  return prisma.memoryCheck.findUnique({
    where: { id }
  })
}

export async function getMemoryChecksByUser(userId: string) {
  return prisma.memoryCheck.findMany({
    where: { userId },
    include: {
      memory: true
    }
  })
}

export async function updateMemoryCheck(id: string, data: Partial<MemoryCheck>) {
  return prisma.memoryCheck.update({
    where: { id },
    data
  })
}

export async function deleteMemoryCheck(id: string) {
  return prisma.memoryCheck.delete({
    where: { id }
  })
}