import mongoose, { Model } from 'mongoose';
import { MemoryCheckProps } from '@/lib/db/model/types/MemoryCheck.types';

let MemoryCheck: Model<MemoryCheckProps>;

if (!mongoose.models.MemoryCheck) {
const memoryCheckSchema = new mongoose.Schema<MemoryCheckProps>(
    {
      memoryPiece: { type: mongoose.Schema.Types.ObjectId, ref: 'MemoryPiece', required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      correctness: { type: Boolean, required: true },
    },
    { timestamps: true, collection: 'memoryChecks' }
  );

  MemoryCheck = mongoose.model<MemoryCheckProps>('MemoryCheck', memoryCheckSchema);
} else {
  MemoryCheck = mongoose.models.MemoryCheck as Model<MemoryCheckProps>;
}

export default MemoryCheck;