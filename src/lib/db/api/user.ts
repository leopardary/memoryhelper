import User from '@/lib/db/model/User';
import { connectDB } from '@/lib/db/utils';
import { CreateUserInput } from '@/lib/db/model/types/User.types'

export async function getUserByEmail(email: string) {
  try {
    await connectDB();
    return await User.findOne({ email: email });
  } catch (error) {
    console.error(`User with email ${email} Not Found:`, error);
    throw error;
  }
}

export async function getUser(id: string) {
  try {
    await connectDB();
    return await User.findById(id);
  } catch (error) {
    console.error(`User with id ${id} Not Found:`, error);
    throw error;
  }
}

export async function getUsers() {
  try {
    await connectDB();
    return await User.find().select('-password').sort({ email: 1 });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function findOrCreateUser(user: CreateUserInput) {
  await connectDB();
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      // User exists - only update name if it changed, don't overwrite imageUrl
      // This preserves custom profile images users have uploaded
      if (existingUser.name !== user.name) {
        existingUser.name = user.name;
        await existingUser.save();
      }
      console.log('Existing user found:', existingUser);
      return existingUser;
    } else {
      // User doesn't exist - create new user with all provided data
      const newUser = await User.create(user);
      console.log('New user created:', newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
}