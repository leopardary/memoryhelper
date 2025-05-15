"use server"
import { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/lib/db/model/types/Subscription.types'
import { connectDB } from '@/lib/db/utils';
import Subscription from '@/lib/db/model/Subscription';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { findOrCreateUser } from '@/lib/db/api/user';
import { initializeSubscription } from '@/lib/utils/subscriptionUtils';


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

export async function deleteSubscriptionForUserAndMemoryPiece(userId: string, memoryPieceId: string) {
  await connectDB();
  const subscription = await Subscription.find({ userId: userId, memoryPieceId: memoryPieceId });
  if (subscription.length > 0) {
    await deleteSubscription(subscription[0].id);
  }
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
    if (subscription.userId == null || subscription.memoryPieceId == null) {
      throw new Error('Subscription needs to have valid values for both userId and memoryPieceId.')
    }
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

export async function findOrCreateSubscriptionsInBatch(memoryPieceIds: string[]) {
  const session = await getServerSession(authOptions);
  const user = await findOrCreateUser(session.user);
  const subscriptions = memoryPieceIds.map(memoryPieceId => {return {memoryPieceId: memoryPieceId, userId: user._id.toString()}})
  const successfulSubscriptions = [];
  for (const subscription of subscriptions) {
    try {
      const record = await findOrCreateSubscription(initializeSubscription(subscription));
      successfulSubscriptions.push(record._id.toString());
    } catch (error) {
    }
  }
  return successfulSubscriptions;
}

// if the subscriptions exist, remove. Otherwise, do nothing.
export async function removeSubscriptionsInBatch(memoryPieceIds: string[]) {
  const session = await getServerSession(authOptions);
  const user = await findOrCreateUser(session.user);
  const subscriptions = memoryPieceIds.map(memoryPieceId => {return {memoryPieceId: memoryPieceId, userId: user._id.toString()}})
  const successfulDeletion = [];
  for (const subscription of subscriptions) {
    try {
      const record = await deleteSubscriptionForUserAndMemoryPiece(user._id.toString(), subscription.memoryPieceId);
      successfulDeletion.push(record._id.toString());
    } catch (error) {
    }
  }
  return successfulDeletion;
}