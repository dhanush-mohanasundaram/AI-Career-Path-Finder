import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function roadmapAgent(role: string) {
  const prompt = `You are a technical mentor. Create a learning roadmap for "${role}" that tells students WHAT to learn and WHERE to learn it (free resources preferred).

Return ONLY valid JSON:
{
  "totalDuration": "8-12 months",
  "phases": [
    {
      "phase": 1,
      "title": "Foundations",
      "duration": "2 months",
      "topics": [
        { "name": "Topic Name", "resources": ["Resource 1 (free/paid)", "Resource 2"] },
        { "name": "Topic Name 2", "resources": ["Resource 1", "Resource 2"] }
      ],
      "milestone": "What student can build/do after this phase"
    }
  ]
}

For each topic, provide 2 specific learning resources. Examples of resources:
- "CS50 by Harvard (free on edX)"
- "The Odin Project (free)"
- "freeCodeCamp YouTube"
- "Official documentation"
- "Codecademy Python (free tier)"
- "NPTEL courses (free, IIT faculty)"
- "Coursera (audit for free)"
- "YouTube: Traversy Media"
- "YouTube: Fireship"
- "LeetCode (free tier)"

Create exactly 4 phases. Be SPECIFIC to "${role}". Minimum 4 topics per phase.`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.2, max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });
    return parseJSON(res.choices[0]?.message?.content ?? '{}') ?? fallback(role);
  } catch { return fallback(role); }
}

function fallback(role: string) {
  const r = role.toLowerCase();
  const isBackend = r.includes('backend');
  const isAI = r.includes('ai') || r.includes('machine learning');
  const isFrontend = r.includes('frontend');

  if (isAI) return {
    totalDuration: '10-14 months',
    phases: [
      { phase: 1, title: 'Python & Mathematics', duration: '2 months', milestone: 'Solve basic ML problems using Python', topics: [
        { name: 'Python Programming', resources: ['Python.org official tutorial (free)', 'freeCodeCamp Python full course (YouTube, free)'] },
        { name: 'NumPy & Pandas', resources: ['Kaggle Learn: Pandas (free, hands-on)', 'YouTube: Keith Galli - Pandas tutorial'] },
        { name: 'Statistics & Probability', resources: ['Khan Academy Statistics (free)', 'StatQuest with Josh Starmer (YouTube, free)'] },
        { name: 'Linear Algebra & Calculus', resources: ['3Blue1Brown: Essence of Linear Algebra (YouTube, free)', 'Khan Academy Calculus (free)'] },
      ]},
      { phase: 2, title: 'Machine Learning Core', duration: '3 months', milestone: 'Train and deploy 3 ML models', topics: [
        { name: 'ML Algorithms (Regression, Classification, Clustering)', resources: ['Andrew Ng ML Course on Coursera (audit free)', 'scikit-learn official documentation (free)'] },
        { name: 'Deep Learning & Neural Networks', resources: ['fast.ai Practical Deep Learning (free)', 'Deep Learning Specialization by Andrew Ng (Coursera, audit free)'] },
        { name: 'Model Evaluation & Hyperparameter Tuning', resources: ['Kaggle Learn: Intro to ML (free)', 'YouTube: Krish Naik - ML tutorials (free)'] },
        { name: 'Feature Engineering & Data Preprocessing', resources: ['Kaggle competitions (free, hands-on)', 'Book: Hands-On Machine Learning with scikit-learn (library/buy)'] },
      ]},
      { phase: 3, title: 'Deep Learning & Specialization', duration: '3 months', milestone: 'Build a computer vision or NLP project', topics: [
        { name: 'TensorFlow or PyTorch', resources: ['TensorFlow official tutorials (free)', 'PyTorch official 60-minute blitz (free)'] },
        { name: 'NLP & Transformers', resources: ['Hugging Face NLP course (free)', 'YouTube: Andrej Karpathy - Neural Networks Zero to Hero'] },
        { name: 'Computer Vision', resources: ['OpenCV Python tutorial (official docs, free)', 'CS231n Stanford slides & videos (free)'] },
        { name: 'MLOps & Model Deployment', resources: ['MLflow documentation (free)', 'YouTube: DataTalks.Club MLOps Zoomcamp (free)'] },
      ]},
      { phase: 4, title: 'Projects & Job Readiness', duration: '2 months', milestone: 'Have 3 deployed ML projects on GitHub', topics: [
        { name: 'Kaggle Competitions', resources: ['kaggle.com (free, real datasets)', 'Kaggle Learn micro-courses (free)'] },
        { name: 'Build End-to-End ML Projects', resources: ['GitHub for hosting projects (free)', 'Streamlit for deployment (free tier)'] },
        { name: 'LLMs & Generative AI', resources: ['LangChain documentation (free)', 'OpenAI / Hugging Face free tier APIs'] },
        { name: 'Interview Prep & Portfolio', resources: ['LeetCode Python problems (free tier)', 'GitHub portfolio building guide (free)'] },
      ]},
    ],
  };

  if (isFrontend) return {
    totalDuration: '8-10 months',
    phases: [
      { phase: 1, title: 'Web Fundamentals', duration: '2 months', milestone: 'Build 3 responsive websites from scratch', topics: [
        { name: 'HTML5', resources: ['MDN Web Docs HTML (free)', 'freeCodeCamp Responsive Web Design (free certification)'] },
        { name: 'CSS3 & Flexbox & Grid', resources: ['CSS Tricks (free articles)', 'Kevin Powell CSS YouTube channel (free)'] },
        { name: 'JavaScript Fundamentals', resources: ['javascript.info (free, best JS resource)', 'freeCodeCamp JavaScript Algorithms (free)'] },
        { name: 'Git & GitHub', resources: ['GitHub official docs (free)', 'The Odin Project - Git chapter (free)'] },
      ]},
      { phase: 2, title: 'JavaScript Advanced & React', duration: '3 months', milestone: 'Build a full React app with API integration', topics: [
        { name: 'ES6+, Async/Await, Promises', resources: ['javascript.info (free)', 'YouTube: Traversy Media JavaScript Crash Course (free)'] },
        { name: 'React.js & Hooks', resources: ['React official documentation (free)', 'Scrimba React course (free tier)'] },
        { name: 'TypeScript', resources: ['TypeScript handbook (official, free)', 'YouTube: Matt Pocock TypeScript tutorials (free)'] },
        { name: 'REST API Integration & Fetch', resources: ['MDN Fetch API docs (free)', 'RapidAPI public APIs for practice (free tier)'] },
      ]},
      { phase: 3, title: 'Advanced Frontend', duration: '2 months', milestone: 'Deploy a production-grade Next.js app', topics: [
        { name: 'Next.js', resources: ['Next.js official tutorial (free)', 'YouTube: Fireship Next.js crash course (free)'] },
        { name: 'State Management (Redux or Zustand)', resources: ['Redux Toolkit docs (free)', 'YouTube: Jack Herrington - Redux Toolkit (free)'] },
        { name: 'Testing (Jest & React Testing Library)', resources: ['Testing Library docs (free)', 'YouTube: Traversy Media Testing React (free)'] },
        { name: 'Performance & Web Vitals', resources: ['web.dev by Google (free)', 'Lighthouse DevTools (free, built-in browser)'] },
      ]},
      { phase: 4, title: 'Portfolio & Job Search', duration: '1-2 months', milestone: '3 projects live, resume ready, apply to jobs', topics: [
        { name: 'Build & Deploy Projects', resources: ['Vercel free deployment (free)', 'GitHub Pages (free)'] },
        { name: 'CSS Frameworks (Tailwind CSS)', resources: ['Tailwind CSS docs (free)', 'YouTube: Fireship Tailwind in 100 seconds (free)'] },
        { name: 'Responsive Design & Accessibility', resources: ['WebAIM accessibility guide (free)', 'Chrome DevTools mobile simulator (free, built-in)'] },
        { name: 'DSA Basics for Frontend Interviews', resources: ['LeetCode easy problems (free tier)', 'YouTube: NeetCode roadmap (free)'] },
      ]},
    ],
  };

  if (isBackend) return {
    totalDuration: '10-12 months',
    phases: [
      { phase: 1, title: 'Programming & CS Basics', duration: '2 months', milestone: 'Write clean programs solving real problems', topics: [
        { name: 'Java or Python (choose one)', resources: ['NPTEL Java Programming by IIT (free)', 'freeCodeCamp Python for Everybody (YouTube, free)'] },
        { name: 'Data Structures & Algorithms', resources: ['Abdul Bari DSA YouTube (free)', 'Striver DSA Sheet on TakeUForward (free)'] },
        { name: 'OOP Concepts', resources: ['NPTEL OOP course (free)', 'YouTube: Mosh Hamedani OOP crash course (free)'] },
        { name: 'Git & Linux Terminal', resources: ['The Missing Semester MIT (free)', 'GitHub official Git handbook (free)'] },
      ]},
      { phase: 2, title: 'Backend Development', duration: '3 months', milestone: 'Build and deploy a REST API with authentication', topics: [
        { name: 'Node.js & Express or Spring Boot or Django', resources: ['Node.js official docs (free)', 'YouTube: Traversy Media Node.js crash course (free)'] },
        { name: 'SQL (PostgreSQL or MySQL)', resources: ['PostgreSQL tutorial on pgexercises.com (free)', 'W3Schools SQL (free)'] },
        { name: 'MongoDB (NoSQL)', resources: ['MongoDB University M001 course (free)', 'YouTube: Traversy Media MongoDB in 1 hour (free)'] },
        { name: 'REST API Design & JWT Authentication', resources: ['REST API tutorial (restfulapi.net, free)', 'YouTube: Web Dev Simplified JWT (free)'] },
      ]},
      { phase: 3, title: 'System Design & DevOps Basics', duration: '2-3 months', milestone: 'Deploy a multi-service app on AWS/GCP', topics: [
        { name: 'System Design Fundamentals', resources: ['Grokking System Design (book/Educative)', 'YouTube: Gaurav Sen System Design playlist (free)'] },
        { name: 'Docker & Containers', resources: ['Docker official Get Started tutorial (free)', 'YouTube: TechWorld with Nana Docker full course (free)'] },
        { name: 'AWS or GCP Basics', resources: ['AWS Skill Builder free tier (free)', 'Google Cloud Skills Boost free tier (free)'] },
        { name: 'Redis & Caching', resources: ['Redis official documentation (free)', 'YouTube: Web Dev Simplified Redis crash course (free)'] },
      ]},
      { phase: 4, title: 'Projects & Job Preparation', duration: '2 months', milestone: '3 backend projects on GitHub, job applications live', topics: [
        { name: 'Build Production Projects', resources: ['GitHub (host projects, free)', 'Render or Railway free deployment (free tier)'] },
        { name: 'DSA Practice for Interviews', resources: ['LeetCode free tier (top 150 problems)', 'Striver SDE Sheet (free, TakeUForward.com)'] },
        { name: 'Open Source Contribution', resources: ['GitHub Explore (free)', 'First Contributions guide (free, firstcontributions.github.io)'] },
        { name: 'Resume & LinkedIn Optimization', resources: ['Resume.io free template (free)', 'LinkedIn for Tech guide (free articles)'] },
      ]},
    ],
  };

  // Full Stack / default
  return {
    totalDuration: '10-12 months',
    phases: [
      { phase: 1, title: 'Web & Programming Foundations', duration: '2-3 months', milestone: 'Build and deploy a basic website independently', topics: [
        { name: 'HTML5 & CSS3', resources: ['freeCodeCamp Responsive Web Design (free)', 'MDN Web Docs (free, comprehensive)'] },
        { name: 'JavaScript (ES6+)', resources: ['javascript.info (free, best resource)', 'The Odin Project JavaScript path (free)'] },
        { name: 'Git & GitHub', resources: ['GitHub official Git handbook (free)', 'YouTube: Traversy Media Git crash course (free)'] },
        { name: 'Linux & Terminal Basics', resources: ['The Missing Semester MIT (free)', 'YouTube: NetworkChuck Linux basics (free)'] },
      ]},
      { phase: 2, title: 'Frontend & Backend Development', duration: '3 months', milestone: 'Build a full-stack app with user authentication', topics: [
        { name: 'React.js', resources: ['React official documentation (free)', 'Scrimba React course (free tier)'] },
        { name: 'Node.js & Express.js', resources: ['Node.js official docs (free)', 'YouTube: Traversy Media Node.js crash course (free)'] },
        { name: 'MongoDB & PostgreSQL', resources: ['MongoDB University M001 (free)', 'PostgreSQL tutorial (postgresqltutorial.com, free)'] },
        { name: 'REST APIs & JWT Auth', resources: ['REST API tutorial (restfulapi.net, free)', 'YouTube: Web Dev Simplified JWT Auth (free)'] },
      ]},
      { phase: 3, title: 'Advanced Skills & Tools', duration: '2 months', milestone: 'Deploy 3 full-stack projects on cloud', topics: [
        { name: 'TypeScript', resources: ['TypeScript handbook (official, free)', 'YouTube: Matt Pocock TypeScript (free)'] },
        { name: 'Docker & Deployment', resources: ['Docker official tutorial (free)', 'YouTube: TechWorld with Nana Docker (free)'] },
        { name: 'AWS or GCP Basics', resources: ['AWS Free Tier (hands-on, free)', 'Google Cloud Skills Boost (free courses)'] },
        { name: 'System Design Basics', resources: ['YouTube: Gaurav Sen System Design (free)', 'Grokking System Design (Educative)'] },
      ]},
      { phase: 4, title: 'Portfolio & Job Readiness', duration: '1-2 months', milestone: 'Get first job offer', topics: [
        { name: 'DSA for Interviews', resources: ['LeetCode free tier (top 150)', 'NeetCode.io roadmap (free)'] },
        { name: 'Project Portfolio on GitHub', resources: ['GitHub (free)', 'Vercel free deployment (free)'] },
        { name: 'Resume Building', resources: ['Resume.io (free template)', 'LinkedIn profile optimization guide (free)'] },
        { name: 'Open Source Contributions', resources: ['GitHub Explore (free)', 'firstcontributions.github.io (free)'] },
      ]},
    ],
  };
}

function parseJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('{'), e = candidate.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
