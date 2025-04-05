import mongoose, { Model } from 'mongoose';
import { UnitProps } from '@/lib/db/model/types/Unit.types';

let Unit: Model<UnitProps>;

if (!mongoose.models.Unit) {
  const unitSchema = new mongoose.Schema<UnitProps>(
    {
      title: { type: String, required: true },
      type: { type: String, required: true, enum: ['chapter', 'lesson', 'module'] },
      description: { type: String },
      imageUrl: { type: String },
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

  Unit = mongoose.model<UnitProps>('Unit', unitSchema);
} else {
  Unit = mongoose.models.Unit as Model<UnitProps>;
}

export default Unit;
