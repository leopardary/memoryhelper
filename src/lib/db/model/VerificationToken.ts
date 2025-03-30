import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
    token: { type: String, unique: true, required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true, collection: 'verificationtokens' }
);

verificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);
export default VerificationToken;
