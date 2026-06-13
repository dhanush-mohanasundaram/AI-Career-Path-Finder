import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalysis extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  status: 'running' | 'complete' | 'failed';
  career?: {
    readinessScore: number;
    recommendedPath: string;
    strengths: string[];
    summary: string;
  };
  resume?: {
    atsScore: number;
    missingKeywords: string[];
    improvements: Array<{ section: string; issue: string; suggestion: string }>;
  };
  github?: {
    healthScore: number;
    projectQualityScore: number;
    languageBreakdown: Record<string, number>;
    repoInsights: Array<{ repo: string; qualityScore: number; feedback: string }>;
    standoutRepo: string;
  };
  skillGap?: {
    coverageScore: number;
    matchedSkills: string[];
    missingSkills: Array<{ skill: string; priority: 'high' | 'medium' | 'low'; reason: string }>;
  };
  futureTwin?: {
    readinessPercent: number;
    readinessTimelineMonths: number;
    projectedRole: string;
    projection: Array<{ horizonMonths: number; role: string; confidence: number; narrative: string }>;
  };
  roadmap?: {
    plan30: Array<{ week: number; theme: string; milestones: Array<{ title: string; type: string; done: boolean }> }>;
    plan90: Array<{ week: number; theme: string; milestones: Array<{ title: string; type: string; done: boolean }> }>;
    projectRecommendations: Array<{ title: string; description: string; skillsCovered: string[]; difficulty: string }>;
    interviewPrep: Array<{ topic: string; whyItMatters: string; sampleQuestion: string }>;
  };
  errorMessage?: string;
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    status: { type: String, enum: ['running', 'complete', 'failed'], default: 'running' },
    career: Schema.Types.Mixed,
    resume: Schema.Types.Mixed,
    github: Schema.Types.Mixed,
    skillGap: Schema.Types.Mixed,
    futureTwin: Schema.Types.Mixed,
    roadmap: Schema.Types.Mixed,
    errorMessage: String,
  },
  { timestamps: true }
);

export const AnalysisModel = model<IAnalysis>('Analysis', analysisSchema);
