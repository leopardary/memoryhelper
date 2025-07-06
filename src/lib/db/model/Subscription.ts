import mongoose, { Model } from 'mongoose';
import { SubscriptionProps } from './types/Subscription.types';
import MemoryCheck from '@/lib/db/model/MemoryCheck'
import MemoryPiece from '@/lib/db/model/MemoryPiece'

let Subscription: Model<SubscriptionProps>;

if (!mongoose.models.Subscription) {
  const subscriptionSchema = new mongoose.Schema<SubscriptionProps>(
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      memoryPieceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MemoryPiece', 
        required: true 
      },
      status: { 
        type: String, 
        enum: ['new', 'learning', 'learned', 'lapsed'], 
        default: 'active' 
      },
      easeFactor: { type: Number },
      currentInterval: { type: Number },
      nextTestDate: Date,
    },
    { 
      timestamps: true,
      collection: 'subscriptions'
    }
  );

  subscriptionSchema.virtual('memoryChecks', {
    ref: MemoryCheck.modelName,
    localField: '_id',
    foreignField: 'subscription',
  });

  subscriptionSchema.virtual('memoryPiece', {
    ref: MemoryPiece.modelName,
    localField: 'memoryPieceId',
    foreignField: '_id',
  });

  // Add compound index to ensure unique user-memoryPiece pairs
  subscriptionSchema.index({ userId: 1, memoryPieceId: 1 }, { unique: true });

  Subscription = mongoose.model<SubscriptionProps>('Subscription', subscriptionSchema);
} else {
  Subscription = mongoose.models.Subscription as Model<SubscriptionProps>;
}

export default Subscription;
