export interface RoleAnalysis {
  _id?: string;
  role: string;
  status: 'running' | 'complete' | 'failed';
  skills?: SkillMatrix;
  roadmap?: LearningRoadmap;
  projects?: ProjectRecommendation[];
  createdAt?: string;
}

export interface SkillMatrix {
  technical: string[];
  coreConcepts: string[];
  tools: string[];
  frameworks: string[];
  softSkills: string[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  topics: TopicItem[];
  milestone: string;
}

export interface TopicItem {
  name: string;
  resources: string[];
}

export interface LearningRoadmap {
  totalDuration: string;
  phases: RoadmapPhase[];
}

export interface ProjectRecommendation {
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  outcome: string;
  description: string;
}

export type AgentKey = 'skills' | 'roadmap' | 'projects';

export interface AgentEvent {
  agent: AgentKey;
  status: 'running' | 'done' | 'failed';
  message: string;
}
