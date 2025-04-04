import mongoose, { Model } from 'mongoose';
import { SubjectProps } from './types/Subject.types';

let Subject: Model<SubjectProps>;

if (!mongoose.models.Subject) {
  const subjectSchema = new mongoose.Schema<SubjectProps>(
    {
      title: { type: String, required: true, unique: true },
      description: { type: String },
      labels: [{ type: String }],
      imageUrl: { type: String },
    },
    { timestamps: true, collection: 'subjects' }
  );
  
  Subject = mongoose.model<SubjectProps>('Subject', subjectSchema);
} else {
  Subject = mongoose.models.Subject as Model<SubjectProps>;
}

export default Subject;
