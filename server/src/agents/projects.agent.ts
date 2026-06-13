import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function projectsAgent(role: string) {
  const prompt = `You are a technical mentor helping Indian students build impressive portfolios for "${role}" positions.

Recommend 4 highly specific, impressive portfolio projects that will stand out to Indian recruiters at companies like Zoho, Freshworks, Amazon India, Flipkart, Swiggy, Razorpay.

Return ONLY valid JSON array:
[
  {
    "name": "Specific Project Name",
    "difficulty": "Beginner",
    "technologies": ["tech1", "tech2", "tech3", "tech4"],
    "description": "Specific 1-2 sentence description of what this project does and what makes it impressive",
    "outcome": "Specific skill/concept you master by building this"
  }
]

Rules:
- 1 Beginner project (2-3 weeks to build)
- 2 Intermediate projects (1-2 months)  
- 1 Advanced project (2-3 months, company-scale)
- Each project must be SPECIFIC to "${role}" — not generic
- Technologies must match what companies actually use
- Descriptions must mention real features (authentication, payments, real-time, etc.)`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.4, max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    });
    const parsed = parseJSONArray(res.choices[0]?.message?.content ?? '[]');
    return parsed || fallback(role);
  } catch { return fallback(role); }
}

function fallback(role: string) {
  const r = role.toLowerCase();

  if (r.includes('full stack') || r.includes('backend')) return [
    { name: 'URL Shortener Service', difficulty: 'Beginner', technologies: ['Node.js', 'Express', 'MongoDB', 'Redis'], description: 'Build a Bitly-clone with custom aliases, click analytics, and expiry dates. Implement rate limiting and Redis caching.', outcome: 'Master REST API design, caching strategies, and database operations' },
    { name: 'Job Portal Web App', difficulty: 'Intermediate', technologies: ['React', 'Node.js', 'PostgreSQL', 'JWT', 'Cloudinary'], description: 'Full-stack job portal where companies post jobs and students apply. Include resume upload, email notifications, and admin dashboard.', outcome: 'Learn full authentication flow, file uploads, and relational databases' },
    { name: 'Real-Time Food Delivery Tracker', difficulty: 'Intermediate', technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Google Maps API'], description: 'Swiggy-like app with real-time order tracking, live map updates, and payment integration using Razorpay.', outcome: 'Master WebSockets, real-time systems, and third-party API integration' },
    { name: 'Microservices E-Commerce Platform', difficulty: 'Advanced', technologies: ['Node.js', 'Docker', 'Kubernetes', 'RabbitMQ', 'PostgreSQL', 'Redis'], description: 'Flipkart-scale e-commerce with separate microservices for products, orders, payments, and notifications. Deployed on AWS with CI/CD.', outcome: 'Demonstrate system design, microservices, and production deployment skills' },
  ];

  if (r.includes('ai') || r.includes('machine learning')) return [
    { name: 'Spam Email Classifier', difficulty: 'Beginner', technologies: ['Python', 'scikit-learn', 'Pandas', 'Flask'], description: 'Train an ML model on email dataset to classify spam/ham with 95%+ accuracy. Deploy as a REST API with a simple web UI.', outcome: 'Master binary classification, text preprocessing, and model deployment' },
    { name: 'Resume Screening AI System', difficulty: 'Intermediate', technologies: ['Python', 'spaCy', 'TensorFlow', 'FastAPI', 'React'], description: 'NLP-based system that parses resumes and ranks candidates for job descriptions. Used in Indian HR tech companies.', outcome: 'Learn NLP, information extraction, and full ML pipeline' },
    { name: 'Real-Time Object Detection App', difficulty: 'Intermediate', technologies: ['Python', 'YOLOv8', 'OpenCV', 'FastAPI', 'Streamlit'], description: 'YOLO-based real-time detection that identifies objects from webcam or uploaded video. Supports custom training on new datasets.', outcome: 'Master computer vision, deep learning inference, and model optimization' },
    { name: 'LLM-Powered Customer Support Bot', difficulty: 'Advanced', technologies: ['Python', 'LangChain', 'RAG', 'FastAPI', 'Vector DB', 'React'], description: 'Production-grade chatbot using RAG architecture, trained on company documents. Handles 1000+ concurrent users.', outcome: 'Master LLM fine-tuning, RAG pipelines, and production AI deployment' },
  ];

  return [
    { name: 'Personal Portfolio with Blog', difficulty: 'Beginner', technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Markdown'], description: 'Professional portfolio website with project showcase, skills section, and a technical blog. Hosted on Vercel with custom domain.', outcome: 'Build your online presence and practice modern frontend development' },
    { name: 'Student Result Management System', difficulty: 'Intermediate', technologies: ['React', 'Node.js', 'PostgreSQL', 'Chart.js'], description: 'Web app for colleges to manage student marks, generate report cards, and visualize performance analytics with charts.', outcome: 'Learn CRUD operations, data visualization, and relational databases' },
    { name: 'Online Exam Platform', difficulty: 'Intermediate', technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'JWT'], description: 'Real-time exam system with timer, auto-submit, anti-cheating measures, and instant result generation. Used by coaching centers.', outcome: 'Master real-time systems, security, and complex state management' },
    { name: 'College ERP System', difficulty: 'Advanced', technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Redis'], description: 'Complete college management system with attendance, timetable, fees, and communication modules. Multi-tenant architecture.', outcome: 'Demonstrate full enterprise application development capabilities' },
  ];
}

function parseJSONArray(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('['), e = candidate.lastIndexOf(']');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
