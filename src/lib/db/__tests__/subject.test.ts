import { prismaMock } from './setup'
import {
  createSubject,
  getSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
} from '../subject'

describe('Subject CRUD operations', () => {
  const mockSubject = {
    id: '1',
    title: 'Mathematics',
    description: 'Advanced math topics',
    labels: ['math', 'advanced'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  test('should create subject', async () => {
    prismaMock.subject.create.mockResolvedValue(mockSubject)

    const result = await createSubject({
      title: 'Mathematics',
      description: 'Advanced math topics',
      labels: ['math', 'advanced'],
    })

    expect(result).toEqual(mockSubject)
    expect(prismaMock.subject.create).toHaveBeenCalledWith({
      data: {
        title: 'Mathematics',
        description: 'Advanced math topics',
        labels: ['math', 'advanced'],
      },
    })
  })

  test('should get subject by id', async () => {
    prismaMock.subject.findUnique.mockResolvedValue(mockSubject)

    const result = await getSubject('1')

    expect(result).toEqual(mockSubject)
    expect(prismaMock.subject.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        units: true,
        memoryPieces: true,
      },
    })
  })

  test('should get all subjects', async () => {
    prismaMock.subject.findMany.mockResolvedValue([mockSubject])

    const result = await getAllSubjects()

    expect(result).toEqual([mockSubject])
    expect(prismaMock.subject.findMany).toHaveBeenCalledWith({
      include: {
        units: true,
      },
    })
  })

  test('should update subject', async () => {
    const updatedSubject = { ...mockSubject, title: 'Updated Math' }
    prismaMock.subject.update.mockResolvedValue(updatedSubject)

    const result = await updateSubject('1', { title: 'Updated Math' })

    expect(result).toEqual(updatedSubject)
    expect(prismaMock.subject.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { title: 'Updated Math' },
    })
  })

  test('should delete subject', async () => {
    prismaMock.subject.delete.mockResolvedValue(mockSubject)

    const result = await deleteSubject('1')

    expect(result).toEqual(mockSubject)
    expect(prismaMock.subject.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })
})