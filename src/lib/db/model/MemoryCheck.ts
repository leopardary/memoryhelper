import mongoose, { Model } from 'mongoose';
import { MemoryCheckProps } from '@/lib/db/model/types/MemoryCheck.types';

let MemoryCheck: Model<MemoryCheckProps>;

if (!mongoose.models.MemoryCheck) {
const memoryCheckSchema = new mongoose.Schema<MemoryCheckProps>(
    {
      subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
      score: { type: Number, required: true },
    },
    { timestamps: true, collection: 'memoryChecks' }
  );

  MemoryCheck = mongoose.model<MemoryCheckProps>('MemoryCheck', memoryCheckSchema);
} else {
  MemoryCheck = mongoose.models.MemoryCheck as Model<MemoryCheckProps>;
}

export default MemoryCheck;