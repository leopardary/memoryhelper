import mongoose, { Model } from 'mongoose';
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';

let MemoryPiece: Model<MemoryPieceProps>;

if (!mongoose.models.MemoryPiece) {
  const memoryPieceSchema = new mongoose.Schema<MemoryPieceProps>(
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
      unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
      content: { type: String, required: true },
      imageUrls: [{ type: String }],
      description: { type: String },
      labels: [{ type: String }]
    },
    { timestamps: true, collection: 'memoryPieces' }
  );

  MemoryPiece = mongoose.model<MemoryPieceProps>('MemoryPiece', memoryPieceSchema);
} else {
  MemoryPiece = mongoose.models.MemoryPiece as Model<MemoryPieceProps>;
}

export default MemoryPiece;