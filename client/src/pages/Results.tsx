import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Code2, Map, FolderOpen, Clock, ExternalLink, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RoadmapPhase, ProjectRecommendation, TopicItem } from '../types';

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Results() {
  const nav = useNavigate();
  const { analysis } = useStore();

  useEffect(() => { if (!analysis) nav('/'); }, []);

  const a = analysis;
  if (!a) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const SECTIONS = [
    { id: 'skills',   label: 'Required Skills', icon: Code2 },
    { id: 'roadmap',  label: 'Learning Roadmap', icon: Map },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const downloadPDF = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        nav, aside, .no-print { display: none !important; }
        body { background: white !important; }
        main { padding: 0 !important; }
        * { box-shadow: none !important; }
        @page { margin: 20mm; size: A4; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,.95)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, width: '100%' }}>
        <div style={{ padding: '0 48px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => nav('/')} className="btn btn-outline" style={{ padding: '7px 12px', fontSize: 13, gap: 6 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ height: 18, width: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={downloadPDF}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#09090b', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={13} /> Download PDF
            </button>
            <button onClick={() => nav('/')} className="btn btn-outline" style={{ fontSize: 13, padding: '7px 12px', gap: 6 }}>
              <Search size={13} /> Analyze New Role
            </button>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', width: '100%', padding: '28px 48px', gap: 28 }}>
        {/* Sidebar */}
        <aside style={{ width: 180, flexShrink: 0, position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Jump to</p>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => scroll(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontFamily: 'inherit', textAlign: 'left', marginBottom: 2, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)'; }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ── Skills ── */}
          {a.skills && (
            <motion.section id="skills" {...fade} transition={{ delay: .05 }} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Code2 size={16} color="var(--muted)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Required Skills & Tools</h2>
              </div>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {[
                    { label: 'Technical Skills', items: a.skills.technical, color: 'tag-blue' },
                    { label: 'Core Concepts', items: a.skills.coreConcepts, color: 'tag-purple' },
                    { label: 'Tools & Platforms', items: a.skills.tools, color: 'tag-zinc' },
                    { label: 'Frameworks & Libraries', items: a.skills.frameworks, color: 'tag-green' },
                    { label: 'Soft Skills', items: a.skills.softSkills ?? [], color: 'tag-amber' },
                  ].filter(s => s.items.length > 0).map(({ label, items, color }) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>{label}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {items.map(item => <span key={item} className={`tag ${color}`}>{item}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Roadmap ── */}
          {a.roadmap && (
            <motion.section id="roadmap" {...fade} transition={{ delay: .1 }} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Map size={16} color="var(--muted)" />
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>What & Where to Learn</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 11px' }}>
                  <Clock size={12} /> {a.roadmap.totalDuration}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(a.roadmap.phases as RoadmapPhase[]).map((phase, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + i * .07 }}
                    className="card" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {phase.phase}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{phase.title}</p>
                          <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>{phase.duration}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, marginBottom: 14 }}>🎯 {phase.milestone}</p>

                        {/* Topics with resources */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {(phase.topics as (TopicItem | string)[]).map((topic, j) => {
                            const isObj = typeof topic === 'object' && topic !== null && 'name' in topic;
                            const name = isObj ? (topic as TopicItem).name : (topic as string);
                            const resources = isObj ? (topic as TopicItem).resources : [];
                            return (
                              <div key={j} style={{ paddingLeft: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{name}</p>
                                </div>
                                {resources.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 11 }}>
                                    {resources.map((res, k) => (
                                      <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>
                                        <ExternalLink size={9} /> {res}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── Projects ── */}
          {a.projects && (
            <motion.section id="projects" {...fade} transition={{ delay: .15 }} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FolderOpen size={16} color="var(--muted)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Hands-on Projects to Build</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                {(a.projects as ProjectRecommendation[]).map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + i * .06 }}
                    className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{p.name}</p>
                      <span className={`diff-${p.difficulty}`} style={{ flexShrink: 0 }}>{p.difficulty}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>{p.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                      {p.technologies.map(t => <span key={t} className="tag tag-blue" style={{ fontSize: 11 }}>{t}</span>)}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ {p.outcome}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

        </main>
      </div>
    </div>
  );
}
