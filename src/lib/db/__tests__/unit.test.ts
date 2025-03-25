import { prismaMock } from './setup'
import {
  createUnit,
  getUnit,
  getUnitsBySubject,
  updateUnit,
  deleteUnit,
} from '../unit'

describe('Unit CRUD operations', () => {
  const mockUnit = {
    id: '1',
    title: 'Algebra Basics',
    type: 'chapter',
    description: 'Introduction to algebra',
    parentUnit: null,
    subject: '1',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  test('should create unit', async () => {
    prismaMock.unit.create.mockResolvedValue(mockUnit)

    const result = await createUnit({
      title: 'Algebra Basics',
      type: 'chapter',
      description: 'Introduction to algebra',
      subject: '1',
      order: 1,
    })

    expect(result).toEqual(mockUnit)
    expect(prismaMock.unit.create).toHaveBeenCalledWith({
      data: {
        title: 'Algebra Basics',
        type: 'chapter',
        description: 'Introduction to algebra',
        subject: '1',
        order: 1,
      },
    })
  })

  test('should get unit by id', async () => {
    prismaMock.unit.findUnique.mockResolvedValue(mockUnit)

    const result = await getUnit('1')

    expect(result).toEqual(mockUnit)
    expect(prismaMock.unit.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        parent: true,
        children: true,
        memoryPieces: true,
        subjectRef: true,
      },
    })
  })

  test('should get units by subject', async () => {
    prismaMock.unit.findMany.mockResolvedValue([mockUnit])

    const result = await getUnitsBySubject('1')

    expect(result).toEqual([mockUnit])
    expect(prismaMock.unit.findMany).toHaveBeenCalledWith({
      where: { subject: '1' },
      orderBy: { order: 'asc' },
    })
  })

  test('should update unit', async () => {
    const updatedUnit = { ...mockUnit, title: 'Advanced Algebra' }
    prismaMock.unit.update.mockResolvedValue(updatedUnit)

    const result = await updateUnit('1', { title: 'Advanced Algebra' })

    expect(result).toEqual(updatedUnit)
    expect(prismaMock.unit.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { title: 'Advanced Algebra' },
    })
  })

  test('should delete unit', async () => {
    prismaMock.unit.delete.mockResolvedValue(mockUnit)

    const result = await deleteUnit('1')

    expect(result).toEqual(mockUnit)
    expect(prismaMock.unit.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })

  test('should handle errors when creating unit', async () => {
    const error = new Error('Database error')
    prismaMock.unit.create.mockRejectedValue(error)

    await expect(createUnit({
      title: 'Algebra Basics',
      type: 'chapter',
      description: 'Introduction to algebra',
      subject: '1',
      order: 1,
    })).rejects.toThrow('Database error')
  })
})