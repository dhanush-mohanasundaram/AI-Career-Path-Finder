import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Zap, Map, Code2, BookOpen, X, TrendingUp, Star, CheckCircle2 } from 'lucide-react';

const QUICK_ROLES = ['Full Stack Developer', 'Backend Engineer', 'AI Engineer', 'DevOps Engineer'];

const ALL_ROLES = [
  { role: 'AI Engineer',               demand: 'Very High', hot: true  },
  { role: 'Machine Learning Engineer', demand: 'Very High', hot: true  },
  { role: 'Generative AI Engineer',    demand: 'Very High', hot: true  },
  { role: 'MLOps Engineer',            demand: 'Very High', hot: true  },
  { role: 'Data Engineer',             demand: 'Very High', hot: true  },
  { role: 'Full Stack Developer',      demand: 'Very High', hot: true  },
  { role: 'Backend Engineer',          demand: 'Very High', hot: true  },
  { role: 'DevOps Engineer',           demand: 'High',      hot: true  },
  { role: 'Cloud Engineer',            demand: 'High',      hot: true  },
  { role: 'Platform Engineer',         demand: 'High',      hot: true  },
  { role: 'Frontend Engineer',         demand: 'High',      hot: false },
  { role: 'Mobile App Developer',      demand: 'High',      hot: false },
  { role: 'Cybersecurity Engineer',    demand: 'High',      hot: false },
  { role: 'Site Reliability Engineer', demand: 'High',      hot: false },
  { role: 'Data Scientist',            demand: 'High',      hot: false },
  { role: 'Data Analyst',              demand: 'High',      hot: false },
  { role: 'Android Developer',         demand: 'High',      hot: false },
  { role: 'iOS Developer',             demand: 'High',      hot: false },
  { role: 'QA Automation Engineer',    demand: 'High',      hot: false },
  { role: 'Blockchain Developer',      demand: 'Growing',   hot: false },
  { role: 'Embedded Systems Engineer', demand: 'Growing',   hot: false },
  { role: 'Game Developer',            demand: 'Growing',   hot: false },
  { role: 'Database Administrator',    demand: 'Medium',    hot: false },
  { role: 'Network Engineer',          demand: 'Medium',    hot: false },
];

const demandColor: Record<string, { bg: string; color: string; border: string }> = {
  'Very High': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'High':      { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Growing':   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Medium':    { bg: '#f4f4f5', color: '#52525b', border: '#d4d4d8' },
};

const QUOTES = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Every expert was once a beginner. Start today.", author: "Helen Hayes" },
  { text: "Learning to write programs stretches your mind and helps you think better.", author: "Bill Gates" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
];

const FEATURES = [
  { icon: Code2,    title: 'Skill Matrix',          desc: 'Every language, tool, framework & soft skill for your exact role.' },
  { icon: Map,      title: 'Learning Roadmap',       desc: 'Phase-by-phase plan with timelines and milestones.' },
  { icon: BookOpen, title: 'Free Resources',         desc: 'Curated free courses, docs & YouTube for every topic.' },
  { icon: Zap,      title: 'Portfolio Projects',     desc: 'Hands-on builds with real tech that impress recruiters.' },
];

export default function Home() {
  const nav = useNavigate();
  const [role, setRole] = useState('');
  const [focused, setFocused] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const suggestions = role.length > 0
    ? ALL_ROLES.map(r => r.role).filter(r => r.toLowerCase().includes(role.toLowerCase())).slice(0, 6)
    : [];

  const submit = (r?: string) => {
    const target = (r ?? role).trim();
    if (!target) return;
    setShowExplore(false);
    nav(`/analyze?role=${encodeURIComponent(target)}`);
  };

  const q = QUOTES[quoteIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Inter,-apple-system,sans-serif' }}>

      {/* â”€â”€ Nav â€” full width, no gaps â”€â”€ */}
      <nav style={{ background: '#fff', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 50, width: '100%' }}>
        <div style={{ padding: '0 48px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#09090b', letterSpacing: '-0.01em' }}>SkillForge AI</span>
          </div>
          <button onClick={() => setShowExplore(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e4e4e7', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#52525b', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            <TrendingUp size={12} /> Explore Roles
          </button>
        </div>
      </nav>

      {/* â”€â”€ Explore Panel â”€â”€ */}
      <AnimatePresence>
        {showExplore && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExplore(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)', zIndex: 100 }} />
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff', borderLeft: '1px solid #e4e4e7', zIndex: 101, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#09090b' }}>Explore Tech Roles</p>
                  <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Click any role to forge your learning path</p>
                </div>
                <button onClick={() => setShowExplore(false)} style={{ width: 30, height: 30, borderRadius: 7, background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={14} color="#52525b" />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Star size={11} color="#7c3aed" /> Most In-Demand
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 20 }}>
                  {ALL_ROLES.filter(r => r.hot).map(({ role: r, demand }) => {
                    const dc = demandColor[demand];
                    return (
                      <button key={r} onClick={() => submit(r)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, background: '#fafafa', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'border-color .12s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#09090b' }}>{r}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`, borderRadius: 5, padding: '1px 7px' }}>{demand}</span>
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <TrendingUp size={11} /> All Roles
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {ALL_ROLES.filter(r => !r.hot).map(({ role: r, demand }) => {
                    const dc = demandColor[demand];
                    return (
                      <button key={r} onClick={() => submit(r)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: '#fafafa', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'border-color .12s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{r}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`, borderRadius: 5, padding: '1px 7px' }}>{demand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* â”€â”€ Hero â€” full width â”€â”€ */}
      <section style={{ padding: '72px 48px 56px', textAlign: 'center', background: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: 999, padding: '3px 11px', fontSize: 11, fontWeight: 600, color: '#52525b', marginBottom: 24 }}>
            AI-Powered Career Intelligence
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#09090b', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Discover the Skills Behind<br />Every Tech Career
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.75, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Enter any technology role and get a complete AI-powered breakdown of required skills, learning roadmaps, recommended projects, tools, and career guidance.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1.5px solid ${focused ? '#6366f1' : '#e4e4e7'}`, borderRadius: 12, padding: '5px 5px 5px 16px', boxShadow: focused ? '0 0 0 3px rgba(99,102,241,.1)' : '0 1px 4px rgba(0,0,0,.05)', transition: 'all .15s' }}>
              <Search size={14} color="#a1a1aa" style={{ flexShrink: 0 }} />
              <input value={role} onChange={e => setRole(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Enter a role (e.g. AI Engineer, Backend Engineer, DevOps Engineer...)"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit', color: '#09090b', background: 'transparent', padding: '7px 0' }} />
              <button onClick={() => submit()} disabled={!role.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#09090b', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: role.trim() ? 'pointer' : 'not-allowed', opacity: role.trim() ? 1 : .45, fontFamily: 'inherit' }}>
                Forge My Path <ArrowRight size={13} />
              </button>
            </div>
            {suggestions.length > 0 && focused && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #e4e4e7', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.08)', overflow: 'hidden', zIndex: 50, textAlign: 'left' }}>
                {suggestions.map(s => (
                  <button key={s} onMouseDown={() => submit(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#09090b', fontFamily: 'inherit', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <Search size={12} color="#a1a1aa" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
            {QUICK_ROLES.map(r => (
              <button key={r} onClick={() => submit(r)}
                style={{ fontSize: 12, color: '#52525b', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .12s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e4e7')}>
                {r}
              </button>
            ))}
            <button onClick={() => setShowExplore(true)}
              style={{ fontSize: 12, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
              View all roles â†’
            </button>
          </div>
        </motion.div>
      </section>

      {/* â”€â”€ Quote section â€” pure white, no lines â”€â”€ */}
      <section style={{ background: '#fff', padding: '56px 48px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 20 }}>Daily Motivation</p>
          <AnimatePresence mode="wait">
            <motion.div key={quoteIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }}>
              <p style={{ fontSize: 22, fontWeight: 600, color: '#09090b', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>
                "{q.text}"
              </p>
              <p style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>â€” {q.author}</p>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
            {QUOTES.map((_, i) => (
              <div key={i} onClick={() => setQuoteIdx(i)}
                style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === quoteIdx ? '#09090b' : '#d4d4d8', cursor: 'pointer', transition: 'all .25s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ What you get â”€â”€ */}
      <section style={{ background: '#fff', padding: '56px 48px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>What You'll Get</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#09090b', marginBottom: 28 }}>Everything in one analysis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            'Complete skills & tools list for your role',
            'Phase-by-phase learning roadmap',
            'Free learning resources for every topic',
            'Portfolio project ideas with tech stack',
            'Soft skills required on the job',
            'Organized by priority and difficulty',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '14px 16px', background: '#fff', borderRadius: 10, border: 'none' }}>
              <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ How it works â”€â”€ */}
      <section style={{ background: '#fff', padding: '56px 48px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>How It Works</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#09090b', marginBottom: 28 }}>Three steps to your learning plan</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { n: '01', t: 'Enter Your Role', d: 'Type any software engineering role â€” from AI Engineer to DevOps Engineer.' },
            { n: '02', t: 'AI Does the Research', d: '3 specialized AI agents map every skill, build your roadmap, and recommend projects.' },
            { n: '03', t: 'Start Learning', d: 'Follow the structured guide with free resources â€” clear direction, zero confusion.' },
          ].map(({ n, t, d }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '22px 0', borderBottom: '1px solid #f4f4f5' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#d1d5db', letterSpacing: '.05em', flexShrink: 0, paddingTop: 2, minWidth: 28 }}>{n}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#09090b', marginBottom: 5 }}>{t}</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ Features â”€â”€ */}
      <section style={{ background: '#fff', padding: '56px 48px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Features</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#09090b', marginBottom: 28 }}>Built for aspiring engineers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '20px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={16} color="#374151" strokeWidth={1.8} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#09090b', marginBottom: 5 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#09090b', padding: '24px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>SkillForge AI Â· Forge the Skills. Build the Future. Â· Powered by NVIDIA NIM</p>
      </footer>
    </div>
  );
}
