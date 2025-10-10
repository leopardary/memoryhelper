import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import User from '@/lib/db/model/User';
import { connectDB } from '@/lib/db/utils';
import mongoose from 'mongoose';

// DELETE - Deregister user (delete account and all associated data)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    // Delete user's data in order (to respect foreign key constraints)

    // 1. Delete memory checks
    const MemoryCheck = mongoose.models.MemoryCheck;
    if (MemoryCheck) {
      await MemoryCheck.deleteMany({ userId });
    }

    // 2. Delete subscriptions
    const Subscription = mongoose.models.Subscription;
    if (Subscription) {
      await Subscription.deleteMany({ userId });
    }

    // 3. Delete user roles
    const UserRole = mongoose.models.UserRole;
    if (UserRole) {
      await UserRole.deleteMany({ userId });
    }

    // 4. Delete sessions
    const Session = mongoose.models.Session;
    if (Session) {
      await Session.deleteMany({ userId });
    }

    // 5. Delete accounts (OAuth connections)
    const Account = mongoose.models.Account;
    if (Account) {
      await Account.deleteMany({ userId });
    }

    // 6. Finally delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been deleted'
    });
  } catch (error) {
    console.error('Deregister error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete account', details: errorMessage },
      { status: 500 }
    );
  }
}
