import mongoose from 'mongoose';

const memoryCheckSchema = new mongoose.Schema(
  {
    memoryPiece: { type: mongoose.Schema.Types.ObjectId, ref: 'MemoryPiece', required: true },
    correct: { type: Boolean, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'memorychecks' }
);

const MemoryCheck = mongoose.model('MemoryCheck', memoryCheckSchema);
export default MemoryCheck;
