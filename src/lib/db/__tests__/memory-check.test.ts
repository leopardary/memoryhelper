import { prismaMock } from './setup'
import {
  createMemoryCheck,
  getMemoryCheck,
  getMemoryChecksByUser,
  updateMemoryCheck,
  deleteMemoryCheck,
} from '../memory-check'

describe('MemoryCheck CRUD operations', () => {
  const mockMemoryCheck = {
    id: '1',
    memoryPiece: '1',
    correct: true,
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  test('should create memory check', async () => {
    prismaMock.memoryCheck.create.mockResolvedValue(mockMemoryCheck)

    const result = await createMemoryCheck({
      memoryPiece: '1',
      correct: true,
      userId: '1',
    })

    expect(result).toEqual(mockMemoryCheck)
    expect(prismaMock.memoryCheck.create).toHaveBeenCalledWith({
      data: {
        memoryPiece: '1',
        correct: true,
        userId: '1',
      },
    })
  })

  test('should get memory check by id', async () => {
    prismaMock.memoryCheck.findUnique.mockResolvedValue(mockMemoryCheck)

    const result = await getMemoryCheck('1')

    expect(result).toEqual(mockMemoryCheck)
    expect(prismaMock.memoryCheck.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        memory: true,
        user: true
      }
    })
  })

  test('should get memory checks by user', async () => {
    prismaMock.memoryCheck.findMany.mockResolvedValue([mockMemoryCheck])

    const result = await getMemoryChecksByUser('1')

    expect(result).toEqual([mockMemoryCheck])
    expect(prismaMock.memoryCheck.findMany).toHaveBeenCalledWith({
      where: { userId: '1' },
      include: {
        memory: true,
      },
    })
  })

  test('should update memory check', async () => {
    const updatedCheck = { ...mockMemoryCheck, correct: false }
    prismaMock.memoryCheck.update.mockResolvedValue(updatedCheck)

    const result = await updateMemoryCheck('1', { correct: false })

    expect(result).toEqual(updatedCheck)
    expect(prismaMock.memoryCheck.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { correct: false },
    })
  })

  test('should delete memory check', async () => {
    prismaMock.memoryCheck.delete.mockResolvedValue(mockMemoryCheck)

    const result = await deleteMemoryCheck('1')

    expect(result).toEqual(mockMemoryCheck)
    expect(prismaMock.memoryCheck.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })

  test('should handle errors when creating memory check', async () => {
    const error = new Error('Database error')
    prismaMock.memoryCheck.create.mockRejectedValue(error)
  
    await expect(createMemoryCheck({
      memoryPiece: '1',
      correct: true,
      userId: '1',
    })).rejects.toThrow('Database error')
  })
})