import { skillIntelligenceAgent } from './skillIntelligence.agent';
import { roadmapAgent } from './roadmap.agent';
import { projectsAgent } from './projects.agent';

type SSESend = (event: string, data: unknown) => void;

export async function runAnalysis(role: string, send: SSESend) {
  const result: Record<string, unknown> = { role, status: 'running' };

  // Skills
  send('agent', { agent: 'skills', status: 'running', message: `Mapping all required skills for ${role}…` });
  result.skills = await skillIntelligenceAgent(role);
  send('agent', { agent: 'skills', status: 'done', message: 'Skills, tools & concepts mapped' });

  // Roadmap with where to learn
  send('agent', { agent: 'roadmap', status: 'running', message: 'Building learning roadmap with resources…' });
  result.roadmap = await roadmapAgent(role);
  send('agent', { agent: 'roadmap', status: 'done', message: 'Roadmap with learning resources ready' });

  // Projects
  send('agent', { agent: 'projects', status: 'running', message: 'Recommending portfolio projects…' });
  result.projects = await projectsAgent(role);
  send('agent', { agent: 'projects', status: 'done', message: 'Project recommendations ready' });

  result.status = 'complete';
  return result;
}
