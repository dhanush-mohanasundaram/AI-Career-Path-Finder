import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function industryAgent(role: string) {
  const prompt = `You are a career counselor with deep knowledge of the Indian IT job market.

Provide industry expectations and insights for "${role}" in India.

Return ONLY valid JSON:
{
  "topCompanies": ["Company1 (₹X-Y LPA)", "Company2 (₹X-Y LPA)", "Company3", "Company4", "Company5", "Company6"],
  "keyInsights": [
    "Practical insight about getting hired in India as ${role}",
    "What Indian companies look for beyond technical skills",
    "Common mistakes freshers make when applying",
    "Important certifications or platforms that boost credibility",
    "Networking and job search tips specific to Indian market"
  ],
  "trends": ["Current tech trend 1", "Current tech trend 2", "Current tech trend 3", "Current tech trend 4", "Current tech trend 5"],
  "timelineMonths": 9
}

Include Indian companies (Zoho, Freshworks, Razorpay, CRED, Swiggy, Meesho, etc.) AND MNCs (Google India, Microsoft India, Amazon India). Use INR salary ranges.`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.3, max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });
    const parsed = parseJSON(res.choices[0]?.message?.content ?? '{}');
    return parsed || fallback(role);
  } catch { return fallback(role); }
}

function fallback(role: string) {
  const r = role.toLowerCase();
  const isAI = r.includes('ai') || r.includes('machine learning');

  return {
    topCompanies: [
      isAI ? 'Google India (₹20-60 LPA)' : 'Zoho (₹4-15 LPA)',
      isAI ? 'Microsoft India (₹25-70 LPA)' : 'Freshworks (₹8-25 LPA)',
      isAI ? 'Amazon India (₹20-55 LPA)' : 'TCS Digital (₹7-15 LPA)',
      isAI ? 'Flipkart AI (₹18-50 LPA)' : 'Infosys Power (₹6-12 LPA)',
      'Razorpay (₹12-40 LPA)',
      'Swiggy (₹10-30 LPA)',
    ],
    keyInsights: [
      'Build a strong GitHub profile with at least 3-5 quality projects before applying',
      'Indian companies value problem-solving speed — practice timed coding on LeetCode daily',
      'CGPA matters for service-based companies (TCS, Infosys) but projects matter more for product companies',
      'Get certifications: AWS Solutions Architect, Google Cloud, or Meta Frontend Developer increase callbacks by 40%',
      'Referrals account for 60% of hires — connect with alumni on LinkedIn and attend tech meetups',
    ],
    trends: [
      'AI/ML integration in every product',
      'Cloud-Native & Serverless Architecture',
      'Low-Code/No-Code Platforms',
      'Cybersecurity & Zero Trust',
      'Open Source Contribution',
    ],
    timelineMonths: isAI ? 12 : 8,
  };
}

function parseJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('{'), e = candidate.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
