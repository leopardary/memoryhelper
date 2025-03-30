import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    sessionToken: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true, collection: 'sessions' }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
