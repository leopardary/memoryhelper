"use server"
import { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/lib/db/model/types/Subscription.types'
import { connectDB } from '@/lib/db/utils';
import Subscription from '@/lib/db/model/Subscription';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { findOrCreateUser } from '@/lib/db/api/user';
import { initializeSubscription, processMemoryCheckWithHistory } from '@/lib/utils/subscriptionUtils';


export async function createSubscription(data: CreateSubscriptionInput) {
  await connectDB();
  return Subscription.create(data);
}

export async function getSubscription(id: string) {
  await connectDB();
  return Subscription.findById(id).populate('memoryChecks');
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

export async function getSubscriptionsDueToCheckForUser(userId: string) {
  try {
    await connectDB();
    return await Subscription.find({ userId: userId, nextTestDate: { $lte:new Date()} }).sort({ nextTestDate: 1 });
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

function getMemoryCheck(subscription: any) {
  return subscription?.memoryChecks;
}

// Based on most recent MemoryChecks, update the Subscription, like the interval, nextTestDate, etc.
export async function processSubscriptions(ids: string[]) {
  const successfulUpdates: string[] = [];
  for (const id of ids) {
    try {
      const subscription = await getSubscription(id);
      if (subscription == null) {
        throw new Error('Subscription ' + id + ' not found.');
      }
      const current_ease_factor: number = subscription?.easeFactor;
      const current_interval = subscription?.currentInterval;
      const checkHistory = getMemoryCheck(subscription);
      const newData = processMemoryCheckWithHistory(current_ease_factor, current_interval, checkHistory);
      const updatedSubscription = await updateSubscription(id, { easeFactor: newData.new_ease_factor, currentInterval: newData.new_interval, nextTestDate: newData.next_review_date, status: newData.new_status})
      if (updatedSubscription == null) {
        throw new Error('Subscription update failed for id: ' + id);
      }
      successfulUpdates.push(updatedSubscription?._id.toString());
    } catch (e) {
      console.error(e);
    }
  }
  return successfulUpdates;
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
  const user = await findOrCreateUser(session?.user);
  const subscriptions = memoryPieceIds.map(memoryPieceId => {return {memoryPieceId: memoryPieceId, userId: user._id.toString()}})
  const successfulSubscriptions = [];
  for (const subscription of subscriptions) {
    try {
      const record = await findOrCreateSubscription(initializeSubscription(subscription.memoryPieceId, subscription.userId));
      successfulSubscriptions.push(record._id.toString());
    } catch (error) {
      console.error(error);
    }
  }
  return successfulSubscriptions;
}

// if the subscriptions exist, remove. Otherwise, do nothing.
export async function removeSubscriptionsInBatch(memoryPieceIds: string[]) {
  const session = await getServerSession(authOptions);
  const user = await findOrCreateUser(session?.user);
  const subscriptions = memoryPieceIds.map(memoryPieceId => {return {memoryPieceId: memoryPieceId, userId: user._id.toString()}})
  const successfulDeletion = [];
  for (const subscription of subscriptions) {
    try {
      await deleteSubscriptionForUserAndMemoryPiece(user._id.toString(), subscription.memoryPieceId);
      successfulDeletion.push(subscription.memoryPieceId);
    } catch (error) {
      console.error(error);
    }
  }
  return successfulDeletion;
}