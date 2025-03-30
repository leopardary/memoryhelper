import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    emailVerified: { type: Date },
    image: { type: String },
  },
  { timestamps: true, collection: 'users' }
);

userSchema.virtual('accounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('memoryChecks', {
  ref: 'MemoryCheck',
  localField: '_id',
  foreignField: 'userId',
});

const User = mongoose.model('User', userSchema);
export default User;
