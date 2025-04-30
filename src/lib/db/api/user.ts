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

export async function findOrCreateUser(user: CreateUserInput) {
  await connectDB();
  try {
    const record = await User.findOneAndUpdate(
      { email: user.email },
      user,
      { upsert: true, new: true }
    );
    
    console.log('User found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
}