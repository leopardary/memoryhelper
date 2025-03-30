import { prisma } from '@/lib/db/api/prisma'
import type { MemoryPiece } from '@prisma/client'

export async function createMemoryPiece(data: {
  subject: string
  unit: string
  content: string
  description: string
  labels: string[]
  imageUrl: string
}) {
  return prisma.memoryPiece.create({
    data
  })
}

export async function getMemoryPiece(id: string) {
  return prisma.memoryPiece.findUnique({
    where: { id },
    include: {
      subjectRef: true,
      unitRef: true,
      memoryChecks: true
    }
  })
}

export async function getMemoryPiecesByUnit(unitId: string) {
  return prisma.memoryPiece.findMany({
    where: { unit: unitId }
  })
}

export async function updateMemoryPiece(id: string, data: Partial<MemoryPiece>) {
  return prisma.memoryPiece.update({
    where: { id },
    data
  })
}

export async function deleteMemoryPiece(id: string) {
  return prisma.memoryPiece.delete({
    where: { id }
  })
}