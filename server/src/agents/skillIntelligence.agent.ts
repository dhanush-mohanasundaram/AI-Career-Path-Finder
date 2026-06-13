import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function skillIntelligenceAgent(role: string) {
  const prompt = `You are an expert technical recruiter. List every single skill needed to become a "${role}". Be comprehensive and precise — include everything a student must know.

Return ONLY valid JSON:
{
  "technical": ["Programming Language 1", "Programming Language 2", "Database 1", "Database 2", "Cloud platform", "OS basics", "Networking basics", "Security basics"],
  "coreConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5", "Concept 6", "Concept 7"],
  "tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5", "Tool 6", "Tool 7", "Tool 8"],
  "frameworks": ["Framework 1", "Framework 2", "Framework 3", "Framework 4", "Framework 5"],
  "softSkills": ["Problem Solving", "Communication", "Team Collaboration", "Time Management", "Attention to Detail", "Continuous Learning", "Documentation Writing"]
}

Rules:
- Include EVERYTHING required — no vague terms like "programming"
- technical: languages, databases, cloud platforms, OS
- coreConcepts: algorithms, design patterns, system concepts
- tools: IDEs, version control, CI/CD, monitoring, testing tools
- frameworks: libraries, frameworks, runtimes
- softSkills: professional skills needed on the job
- Minimum 6 items per category, maximum 10
- Be specific to "${role}"`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.15, max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });
    return parseJSON(res.choices[0]?.message?.content ?? '{}') ?? fallback(role);
  } catch { return fallback(role); }
}

function fallback(role: string) {
  const r = role.toLowerCase();

  if (r.includes('full stack')) return {
    technical: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'SQL', 'MongoDB', 'Redis', 'Linux Basics'],
    coreConcepts: ['Data Structures & Algorithms', 'REST API Design', 'Database Normalization', 'OOP Principles', 'System Design Basics', 'Web Security (OWASP)', 'Responsive Design'],
    tools: ['Git & GitHub', 'VS Code', 'Docker', 'Postman', 'JIRA', 'Figma (basics)', 'Chrome DevTools', 'npm/yarn'],
    frameworks: ['React.js', 'Node.js', 'Express.js', 'Next.js', 'Tailwind CSS'],
    softSkills: ['Problem Solving', 'Communication', 'Team Collaboration', 'Time Management', 'Attention to Detail', 'Continuous Learning'],
  };
  if (r.includes('backend')) return {
    technical: ['Java or Python or Node.js', 'SQL (PostgreSQL/MySQL)', 'MongoDB', 'Redis', 'Linux', 'Networking Basics', 'AWS or GCP', 'Bash Scripting'],
    coreConcepts: ['Data Structures & Algorithms', 'System Design', 'Microservices Architecture', 'Database Design', 'ACID & CAP Theorem', 'API Security & OAuth', 'Caching Strategies'],
    tools: ['Git & GitHub', 'Docker', 'Postman', 'IntelliJ or PyCharm', 'JIRA', 'Jenkins or GitHub Actions', 'Kubernetes (basics)', 'pgAdmin'],
    frameworks: ['Spring Boot (Java)', 'Express.js (Node)', 'Django or FastAPI (Python)', 'Hibernate', 'GraphQL'],
    softSkills: ['Analytical Thinking', 'Documentation Writing', 'Code Review', 'Ownership Mindset', 'Collaboration', 'Debugging Patience'],
  };
  if (r.includes('frontend')) return {
    technical: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'Browser APIs', 'Web Accessibility', 'HTTP/HTTPS', 'JSON & REST APIs'],
    coreConcepts: ['DOM Manipulation', 'Component Architecture', 'State Management', 'Responsive Design', 'Web Performance', 'Cross-browser Compatibility', 'SEO Basics'],
    tools: ['Git & GitHub', 'VS Code', 'Chrome DevTools', 'Figma', 'npm/yarn', 'Webpack or Vite', 'ESLint', 'Storybook'],
    frameworks: ['React.js', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'React Query'],
    softSkills: ['UI/UX Sense', 'Attention to Detail', 'Communication with Designers', 'Self-Review', 'Time Management', 'Pixel-Perfect Execution'],
  };
  if (r.includes('ai') || r.includes('machine learning')) return {
    technical: ['Python', 'SQL', 'Linear Algebra', 'Statistics & Probability', 'Calculus Basics', 'NumPy', 'Pandas', 'Matplotlib'],
    coreConcepts: ['Supervised & Unsupervised Learning', 'Neural Networks & Deep Learning', 'Model Training & Evaluation', 'Feature Engineering', 'MLOps', 'NLP Fundamentals', 'Computer Vision Basics'],
    tools: ['Jupyter Notebook', 'Git & GitHub', 'Docker', 'MLflow', 'AWS SageMaker or GCP AI', 'Hugging Face', 'Google Colab', 'VS Code'],
    frameworks: ['TensorFlow or PyTorch', 'scikit-learn', 'Keras', 'LangChain', 'Transformers'],
    softSkills: ['Research & Experimentation Mindset', 'Data Storytelling', 'Communication', 'Problem Formulation', 'Curiosity', 'Patience with Results'],
  };
  if (r.includes('devops')) return {
    technical: ['Linux & Shell Scripting', 'Python or Go', 'Docker', 'Kubernetes', 'AWS/GCP/Azure', 'Networking (TCP/IP, DNS, HTTP)', 'YAML & JSON', 'Terraform'],
    coreConcepts: ['CI/CD Pipelines', 'Infrastructure as Code', 'Container Orchestration', 'Site Reliability Engineering', 'Monitoring & Alerting', 'Security (DevSecOps)', 'Cloud Architecture'],
    tools: ['Git & GitHub', 'Jenkins or GitHub Actions', 'Prometheus & Grafana', 'Ansible', 'ArgoCD', 'Helm', 'ELK Stack', 'Vault'],
    frameworks: ['AWS CDK or Pulumi', 'GitOps', 'Service Mesh (Istio)', 'Nginx', 'Kafka (basics)'],
    softSkills: ['Incident Response', 'On-Call Readiness', 'Documentation', 'Systematic Thinking', 'Collaboration with Dev teams', 'Learning Under Pressure'],
  };
  if (r.includes('data engineer')) return {
    technical: ['Python', 'SQL (advanced)', 'Spark (PySpark)', 'Kafka', 'Hadoop basics', 'Airflow', 'AWS/GCP', 'Scala (basics)'],
    coreConcepts: ['ETL & ELT Pipelines', 'Data Warehousing', 'Data Modeling (Star/Snowflake)', 'Stream vs Batch Processing', 'Data Quality & Governance', 'Distributed Systems Basics'],
    tools: ['Git & GitHub', 'Apache Airflow', 'dbt', 'BigQuery or Snowflake', 'Databricks', 'Kafka UI', 'Metabase', 'Terraform'],
    frameworks: ['PySpark', 'Apache Beam', 'Delta Lake', 'dbt Core', 'Great Expectations'],
    softSkills: ['Business Acumen', 'Stakeholder Communication', 'Data Intuition', 'Attention to Detail', 'Documentation', 'Cross-Team Collaboration'],
  };
  if (r.includes('cloud')) return {
    technical: ['AWS or GCP or Azure', 'Linux & Bash', 'Python', 'Networking (VPC, DNS, Load Balancing)', 'Docker', 'Kubernetes', 'Terraform', 'SQL basics'],
    coreConcepts: ['Cloud Architecture Patterns', 'High Availability & Fault Tolerance', 'Security & IAM', 'Cost Optimization', 'Serverless Computing', 'Auto Scaling', 'Disaster Recovery'],
    tools: ['AWS CLI or gcloud CLI', 'Terraform', 'CloudFormation', 'Git & GitHub', 'Jenkins', 'Prometheus & Grafana', 'kubectl', 'Ansible'],
    frameworks: ['AWS CDK', 'Serverless Framework', 'Pulumi', 'Helm Charts', 'Nginx'],
    softSkills: ['Architecture Thinking', 'Cost Awareness', 'Documentation', 'Security Mindset', 'Collaboration', 'Certification Drive (AWS/GCP)'],
  };
  if (r.includes('mobile')) return {
    technical: ['Kotlin (Android) or Swift (iOS)', 'React Native or Flutter', 'JavaScript/TypeScript', 'REST APIs', 'Firebase', 'SQLite', 'JSON', 'Push Notifications'],
    coreConcepts: ['Mobile UI/UX Principles', 'State Management', 'Offline-First Architecture', 'App Performance Optimization', 'App Store Deployment', 'Deep Linking', 'Security (Keychain/Keystore)'],
    tools: ['Android Studio or Xcode', 'Git & GitHub', 'Firebase Console', 'Postman', 'Figma', 'VS Code', 'Flipper (debugging)', 'Google Play Console'],
    frameworks: ['Flutter', 'React Native', 'Expo', 'GetX or Riverpod (Flutter state)', 'Retrofit (Android)'],
    softSkills: ['User Empathy', 'Attention to UI Details', 'Testing Mindset', 'Communication', 'Continuous Learning', 'Platform Guidelines Adherence'],
  };
  return {
    technical: ['Python or JavaScript', 'SQL', 'REST APIs', 'Linux Basics', 'Git', 'Cloud Basics (AWS/GCP)', 'JSON & Data Formats', 'HTTP Protocol'],
    coreConcepts: ['Data Structures & Algorithms', 'OOP Principles', 'System Design Basics', 'Database Design', 'API Design', 'Testing Fundamentals', 'Agile/Scrum'],
    tools: ['Git & GitHub', 'VS Code', 'Docker', 'Postman', 'JIRA', 'Slack', 'Linux Terminal', 'npm or pip'],
    frameworks: ['React or Vue (frontend)', 'Node.js or Django (backend)', 'PostgreSQL or MongoDB', 'Tailwind CSS', 'Jest or Pytest'],
    softSkills: ['Problem Solving', 'Communication', 'Team Collaboration', 'Time Management', 'Adaptability', 'Continuous Learning'],
  };
}

function parseJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('{'), e = candidate.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
