import { prisma } from './prisma'
import type { Subject } from '@prisma/client'

export async function createSubject(data: {
  title: string
  description: string
  labels: string[]
}) {
  return prisma.subject.create({
    data
  })
}

export async function getSubject(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      units: true,
      memoryPieces: true
    }
  })
}

export async function getAllSubjects() {
  return prisma.subject.findMany({
    include: {
      units: true
    }
  })
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  return prisma.subject.update({
    where: { id },
    data
  })
}

export async function deleteSubject(id: string) {
  return prisma.subject.delete({
    where: { id }
  })
}