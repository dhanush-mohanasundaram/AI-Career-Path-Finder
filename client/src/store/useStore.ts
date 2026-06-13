import { create } from 'zustand';
import { RoleAnalysis, AgentEvent } from '../types';

interface AppState {
  analysis: RoleAnalysis | null;
  agentEvents: AgentEvent[];
  isAnalyzing: boolean;
  currentRole: string;
  setAnalysis: (a: RoleAnalysis) => void;
  pushEvent: (e: AgentEvent) => void;
  startAnalysis: (role: string) => void;
  resetAnalysis: () => void;
}

export const useStore = create<AppState>((set) => ({
  analysis: null,
  agentEvents: [],
  isAnalyzing: false,
  currentRole: '',
  setAnalysis: (analysis) => set({ analysis, isAnalyzing: false }),
  pushEvent: (e) => set((s) => ({ agentEvents: [...s.agentEvents, e] })),
  startAnalysis: (role) => set({ currentRole: role, isAnalyzing: true, agentEvents: [], analysis: null }),
  resetAnalysis: () => set({ analysis: null, agentEvents: [], isAnalyzing: false, currentRole: '' }),
}));
