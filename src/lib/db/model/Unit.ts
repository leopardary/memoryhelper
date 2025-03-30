import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
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

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;
