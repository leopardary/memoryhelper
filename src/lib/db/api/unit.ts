import { prisma } from './prisma'
import type { Unit } from '.prisma/client'

export async function createUnit(data: {
  title: string
  type: string
  description?: string
  parentUnit?: string
  subject: string
  order: number
}) {
  return prisma.unit.create({
    data
  })
}

export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      memoryPieces: true,
      subjectRef: true
    }
  })
}

export async function getUnitsBySubject(subjectId: string) {
  return prisma.unit.findMany({
    where: { subject: subjectId },
    orderBy: { order: 'asc' }
  })
}

export async function updateUnit(id: string, data: Partial<Unit>) {
  return prisma.unit.update({
    where: { id },
    data
  })
}

export async function deleteUnit(id: string) {
  return prisma.unit.delete({
    where: { id }
  })
}