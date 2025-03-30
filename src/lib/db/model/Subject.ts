import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    labels: [{ type: String }],
    imageUrl: { type: String },
  },
  { timestamps: true, collection: 'subjects' }
);

interface SubjectSchema {
  title: string;
  description: string;
  labels: string[];
  imageUrl: string
}

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
