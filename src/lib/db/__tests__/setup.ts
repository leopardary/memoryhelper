import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '@/lib/db/prisma'
import { jest, beforeAll } from '@jest/globals'

jest.mock('@/lib/db/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeAll(() => {
  mockReset(prismaMock)
})