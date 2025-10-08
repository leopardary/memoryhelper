import mongoose, { Model } from 'mongoose';
import { UserRoleProps } from './types/UserRole.types';

let UserRole: Model<UserRoleProps>;

if (!mongoose.models.UserRole) {
  const userRoleSchema = new mongoose.Schema<UserRoleProps>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
      },
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null  // null for global roles (visitor, administrator)
      }
    },
    { timestamps: true, collection: 'userRoles' }
  );

  // Compound index for efficient permission lookups
  userRoleSchema.index({ userId: 1, subjectId: 1 });
  userRoleSchema.index({ userId: 1, roleId: 1 });

  // Prevent duplicate role assignments for same user-subject combination
  userRoleSchema.index({ userId: 1, roleId: 1, subjectId: 1 }, { unique: true });

  UserRole = mongoose.model<UserRoleProps>('UserRole', userRoleSchema);
} else {
  UserRole = mongoose.models.UserRole as Model<UserRoleProps>;
}

export default UserRole;
