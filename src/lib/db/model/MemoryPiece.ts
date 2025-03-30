import mongoose from 'mongoose';

const memoryPieceSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    content: { type: String, unique: true },
    imageUrl: { type: String },
    description: { type: String },
    labels: [{ type: String }],
  },
  { timestamps: true, collection: 'memorypieces' }
);

const MemoryPiece = mongoose.model('MemoryPiece', memoryPieceSchema);
export default MemoryPiece;