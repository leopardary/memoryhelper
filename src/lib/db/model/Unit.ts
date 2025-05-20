import mongoose, { Model } from 'mongoose';
import { UnitProps } from '@/lib/db/model/types/Unit.types';
import MemoryPiece from '@/lib/db/model/MemoryPiece'

let Unit: Model<UnitProps>;

if (!mongoose.models.Unit) {
  const unitSchema = new mongoose.Schema<UnitProps>(
    {
      title: { type: String, required: true },
      type: { type: String, required: true, enum: ['chapter', 'lesson', 'module'] },
      description: { type: String },
      imageUrls: [{ type: String }],
      parentUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
      order: { type: Number },
    },
    { timestamps: true, collection: 'units' }
  );

  unitSchema.virtual('children', {
    ref: 'Unit',
    localField: '_id',
    foreignField: 'parentUnit',
  });

  unitSchema.virtual('memoryPieces', {
    ref: MemoryPiece.modelName,
    localField: '_id',
    foreignField: 'unit',
  });

  Unit = mongoose.model<UnitProps>('Unit', unitSchema);
} else {
  Unit = mongoose.models.Unit as Model<UnitProps>;
}

export default Unit;
