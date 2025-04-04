import mongoose from 'mongoose';
import { MemoryPieceProps } from './types/MemoryPiece.types';

const memoryPieceSchema = new mongoose.Schema<MemoryPieceProps>({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  content: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String },
  labels: [{ type: String }]
}, {
  timestamps: true
});

const MemoryPiece = mongoose.models.MemoryPiece || mongoose.model<MemoryPieceProps>('MemoryPiece', memoryPieceSchema);

export default MemoryPiece;