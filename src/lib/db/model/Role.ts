import mongoose, { Model } from 'mongoose';
import { RoleProps } from './types/Role.types';

let Role: Model<RoleProps>;

if (!mongoose.models.Role) {
  const roleSchema = new mongoose.Schema<RoleProps>(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        enum: ['visitor', 'student', 'teacher', 'administrator']
      },
      displayName: { type: String, required: true },
      description: { type: String },
      permissions: [{
        type: String,
        enum: ['view', 'practice', 'manage_content', 'manage_student', 'manage_subject', 'manage_teacher']
      }],
      isGlobal: { type: Boolean, required: true, default: false }
    },
    { timestamps: true, collection: 'roles' }
  );

  // Index for quick role lookups by name
  roleSchema.index({ name: 1 }, { unique: true });

  Role = mongoose.model<RoleProps>('Role', roleSchema);
} else {
  Role = mongoose.models.Role as Model<RoleProps>;
}

export default Role;
