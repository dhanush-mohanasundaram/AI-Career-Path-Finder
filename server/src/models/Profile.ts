import { Schema, model, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  userId: Types.ObjectId;
  resumeText: string;
  githubUsername: string;
  currentSkills: string[];
  targetRole: string;
  dreamCompany: string;
  experienceLevel: 'student' | 'junior' | 'mid' | 'senior';
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    resumeText: { type: String, required: true, maxlength: 20000 },
    githubUsername: { type: String, required: true, trim: true },
    currentSkills: [{ type: String }],
    targetRole: { type: String, required: true, trim: true },
    dreamCompany: { type: String, required: true, trim: true },
    experienceLevel: { type: String, enum: ['student', 'junior', 'mid', 'senior'], default: 'student' },
  },
  { timestamps: true }
);

export const ProfileModel = model<IProfile>('Profile', profileSchema);
