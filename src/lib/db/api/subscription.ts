"use server"
import { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/lib/db/model/types/Subscription.types'
import { connectDB } from '@/lib/db/utils';
import Subscription from '@/lib/db/model/Subscription';

export async function createSubscription(data: CreateSubscriptionInput) {
  await connectDB();
  return Subscription.create(data);
}

export async function getSubscription(id: string) {
  await connectDB();
  return Subscription.findById(id);
}

export async function getSubscriptionsForUser(userId: string) {
  try {
    await connectDB();
    return await Subscription.find({ userId: userId });
  } catch (error) {
    console.error(`Subscription for user ${userId} Not Found:`, error);
    throw error;
  }
}

export async function getAllSubscriptions() {
  await connectDB();
  return Subscription.find()
    .populate('userId')
    .populate('memoryPieceId');
}

export async function updateSubscription(id: string, data: UpdateSubscriptionInput) {
  await connectDB();
  return Subscription.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteSubscription(id: string) {
  await connectDB();
  return Subscription.findByIdAndDelete(id);
}

export async function getSubscriptionCount() {
  await connectDB();
  return Subscription.countDocuments();
}

export async function getSubscriptionsWithPagination(currentPage: number, pageSize: number, heroItemCount: number) {
  await connectDB();
  return Subscription.find()
    .sort({ _id: -1 })
    .skip((currentPage - 1) * pageSize + (currentPage === 1 ? 0 : heroItemCount))
    .limit(pageSize + (currentPage === 1 ? heroItemCount : 0));
}

// Check existence or create subscription
export async function findOrCreateSubscription(subscription: CreateSubscriptionInput) {
  await connectDB();
  try {
    const record = await Subscription.findOneAndUpdate(
      { userId: subscription.userId, memoryPieceId: subscription.memoryPieceId },
      subscription,
      { upsert: true, new: true }
    );
    
    console.log('Subscription found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateSubscription:', error);
    throw error;
  }
}

export async function findOrCreateSubscriptionsInBatch(subscriptions: CreateSubscriptionInput[]) {
    for (const subscription of subscriptions) {
    try {
      await findOrCreateSubscription(subscription);
    } catch (error) {
      
    }
  }
}