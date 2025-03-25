import { prismaMock } from './setup'
import {
  getUser,
  getUserByEmail,
  updateUser,
} from '../user'

describe('User CRUD operations', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  test('should get user by id', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await getUser('1')

    expect(result).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        memoryChecks: true,
      },
    })
  })

  test('should get user by email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await getUserByEmail('test@example.com')

    expect(result).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })
  })

  test('should update user', async () => {
    const updatedUser = { ...mockUser, name: 'Updated Name' }
    prismaMock.user.update.mockResolvedValue(updatedUser)

    const result = await updateUser('1', { name: 'Updated Name' })

    expect(result).toEqual(updatedUser)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Updated Name' },
    })
  })

  test('should handle errors when getting user', async () => {
    const error = new Error('Database error')
    prismaMock.user.findUnique.mockRejectedValue(error)

    await expect(getUser('1')).rejects.toThrow('Database error')
  })

  test('should return null for non-existent user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const result = await getUser('999')
    expect(result).toBeNull()
  })
})