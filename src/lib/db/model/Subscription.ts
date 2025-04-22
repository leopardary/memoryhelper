import mongoose, { Model } from 'mongoose';
import { SubscriptionProps } from './types/Subscription.types';

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
        enum: ['active', 'paused', 'completed'], 
        default: 'active' 
      },
      lastReviewed: { type: Date },
      nextReview: { type: Date },
      reviewCount: { 
        type: Number, 
        default: 0 
      }
    },
    { 
      timestamps: true,
      collection: 'subscriptions'
    }
  );

  // Add compound index to ensure unique user-memoryPiece pairs
  subscriptionSchema.index({ userId: 1, memoryPieceId: 1 }, { unique: true });

  Subscription = mongoose.model<SubscriptionProps>('Subscription', subscriptionSchema);
} else {
  Subscription = mongoose.models.Subscription as Model<SubscriptionProps>;
}

export default Subscription;
