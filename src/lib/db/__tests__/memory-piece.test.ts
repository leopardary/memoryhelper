import { prismaMock } from './setup'
import {
  createMemoryPiece,
  getMemoryPiece,
  getMemoryPiecesByUnit,
  updateMemoryPiece,
  deleteMemoryPiece,
} from '../memory-piece'

describe('MemoryPiece CRUD operations', () => {
  const mockMemoryPiece = {
    id: '1',
    subject: '1',
    unit: '1',
    content: 'E = mc²',
    description: 'Einstein\'s famous equation',
    labels: ['physics', 'relativity'],
    imageUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  test('should create memory piece', async () => {
    prismaMock.memoryPiece.create.mockResolvedValue(mockMemoryPiece)

    const result = await createMemoryPiece({
      subject: '1',
      unit: '1',
      content: 'E = mc²',
      description: 'Einstein\'s famous equation',
      labels: ['physics', 'relativity'],
      imageUrl: ''
    })

    expect(result).toEqual(mockMemoryPiece)
    expect(prismaMock.memoryPiece.create).toHaveBeenCalledWith({
      data: {
        subject: '1',
        unit: '1',
        content: 'E = mc²',
        description: 'Einstein\'s famous equation',
        labels: ['physics', 'relativity'],
      },
    })
  })

  test('should get memory piece by id', async () => {
    prismaMock.memoryPiece.findUnique.mockResolvedValue(mockMemoryPiece)

    const result = await getMemoryPiece('1')

    expect(result).toEqual(mockMemoryPiece)
    expect(prismaMock.memoryPiece.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        subjectRef: true,
        unitRef: true,
        memoryChecks: true,
      },
    })
  })

  test('should get memory pieces by unit', async () => {
    prismaMock.memoryPiece.findMany.mockResolvedValue([mockMemoryPiece])

    const result = await getMemoryPiecesByUnit('1')

    expect(result).toEqual([mockMemoryPiece])
    expect(prismaMock.memoryPiece.findMany).toHaveBeenCalledWith({
      where: { unit: '1' },
    })
  })

  test('should update memory piece', async () => {
    const updatedPiece = { ...mockMemoryPiece, content: 'Updated content' }
    prismaMock.memoryPiece.update.mockResolvedValue(updatedPiece)

    const result = await updateMemoryPiece('1', { content: 'Updated content' })

    expect(result).toEqual(updatedPiece)
    expect(prismaMock.memoryPiece.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { content: 'Updated content' },
    })
  })

  test('should delete memory piece', async () => {
    prismaMock.memoryPiece.delete.mockResolvedValue(mockMemoryPiece)

    const result = await deleteMemoryPiece('1')

    expect(result).toEqual(mockMemoryPiece)
    expect(prismaMock.memoryPiece.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })

  test('should handle errors when creating memory piece', async () => {
    const error = new Error('Database error')
    prismaMock.memoryPiece.create.mockRejectedValue(error)

    await expect(createMemoryPiece({
      subject: '1',
      unit: '1',
      content: 'E = mc²',
      description: 'Einstein\'s famous equation',
      labels: ['physics', 'relativity'],
      imageUrl: ''
    })).rejects.toThrow('Database error')
  })
})