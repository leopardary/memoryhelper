import mongoose, {Model} from 'mongoose';
import { UserProps } from '@/lib/db/model/types/User.types';

let User: Model<UserProps>;

if (!mongoose.models.User) {
  const userSchema = new mongoose.Schema<UserProps>(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      imageUrl: { type: String },
      password: { type: String },
      defaultRole: {
        type: String,
        enum: ['visitor', 'student', 'teacher', 'administrator'],
        default: 'visitor'
      }
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

  userSchema.virtual('userRoles', {
    ref: 'UserRole',
    localField: '_id',
    foreignField: 'userId',
  });

  User = mongoose.model<UserProps>('User', userSchema);
} else {
  User = mongoose.models.User as Model<UserProps>;
}

export default User;
