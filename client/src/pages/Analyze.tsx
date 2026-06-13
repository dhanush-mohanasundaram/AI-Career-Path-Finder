import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Clock, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { analysisApi } from '../lib/api';
import { AgentKey, AgentEvent } from '../types';

const AGENTS: { key: AgentKey; label: string; desc: string }[] = [
  { key: 'skills',   label: 'Skill Intelligence Agent', desc: 'Mapping all required skills, tools & concepts' },
  { key: 'roadmap',  label: 'Learning Roadmap Agent',   desc: 'Building phase-by-phase roadmap with resources' },
  { key: 'projects', label: 'Project Recommendation Agent', desc: 'Curating hands-on portfolio projects' },
];

export default function Analyze() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const role = params.get('role') ?? '';
  const { agentEvents, startAnalysis, pushEvent, setAnalysis } = useStore();

  useEffect(() => {
    if (!role) { nav('/'); return; }
    startAnalysis(role);
    const es = analysisApi.stream(role);
    es.addEventListener('agent', (e: MessageEvent) => pushEvent(JSON.parse(e.data) as AgentEvent));
    es.addEventListener('complete', (e: MessageEvent) => { setAnalysis(JSON.parse(e.data)); es.close(); nav('/results'); });
    es.addEventListener('error', () => { es.close(); nav('/results'); });
    return () => es.close();
  }, [role]);

  const latest = new Map<AgentKey, AgentEvent>(agentEvents.map(e => [e.agent, e] as [AgentKey, AgentEvent]));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Zap size={20} color="white" strokeWidth={2.2} />
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Forging Your Path</h2>
            <span style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{role}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AGENTS.map(({ key, label, desc }, i) => {
              const ev = latest.get(key);
              const status = ev?.status ?? 'idle';
              return (
                <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 10, background: status === 'running' ? '#eff6ff' : 'var(--surface)', border: `1px solid ${status === 'running' ? '#bfdbfe' : 'var(--border)'}`, transition: 'all .25s' }}>
                  <div className={`agent-dot ${status}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev?.message ?? desc}
                    </p>
                  </div>
                  {status === 'idle'    && <Clock size={14} color="var(--muted2)" />}
                  {status === 'running' && <Loader2 size={14} color="var(--accent)" style={{ animation: 'spin .7s linear infinite' }} />}
                  {status === 'done'    && <CheckCircle2 size={14} color="var(--success)" />}
                </motion.div>
              );
            })}
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted2)', textAlign: 'center', marginTop: 24 }}>
            SkillForge AI · Generating your career intelligence…
          </p>
        </motion.div>
      </div>
    </div>
  );
}
