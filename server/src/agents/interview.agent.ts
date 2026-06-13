import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function interviewAgent(role: string) {
  const prompt = `You are a technical interviewer at top Indian IT companies. Generate comprehensive interview preparation for "${role}".

Return ONLY valid JSON:
{
  "dsa": [
    "Specific DSA topic 1 with what companies ask",
    "Specific DSA topic 2",
    "Specific DSA topic 3",
    "Specific DSA topic 4",
    "Specific DSA topic 5",
    "Specific DSA topic 6"
  ],
  "systemDesign": [
    "Design Swiggy's delivery tracking system",
    "Design a scalable URL shortener like bit.ly",
    "Design a chat system like WhatsApp",
    "Design an API rate limiter"
  ],
  "technical": [
    "Role-specific technical question 1",
    "Role-specific technical question 2",
    "Role-specific technical question 3",
    "Role-specific technical question 4",
    "Role-specific technical question 5",
    "Role-specific technical question 6"
  ],
  "behavioral": [
    "Tell me about a project you are most proud of and its technical challenges",
    "How do you handle tight deadlines and conflicting priorities?",
    "Describe a time you had to learn a new technology quickly",
    "How do you approach debugging a complex issue in production?",
    "Where do you see yourself in 3 years?"
  ]
}

Be SPECIFIC to "${role}". DSA and technical questions must match what Indian FAANG, Zoho, Freshworks, Flipkart, Amazon India actually ask.`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.3, max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });
    const parsed = parseJSON(res.choices[0]?.message?.content ?? '{}');
    return parsed || fallback(role);
  } catch { return fallback(role); }
}

function fallback(role: string) {
  const r = role.toLowerCase();

  if (r.includes('backend') || r.includes('full stack') || r.includes('software')) return {
    dsa: ['Arrays & Strings: Two pointers, Sliding window (asked at Amazon, Flipkart)', 'Linked Lists: Reversal, cycle detection, merge sorted lists', 'Trees & BST: Traversals, LCA, diameter (asked at Google, Microsoft)', 'Dynamic Programming: Longest subsequences, knapsack, coin change', 'Graphs: BFS/DFS, shortest path (Dijkstra), topological sort', 'Hash Maps & Sets: Frequency counting, anagram detection'],
    systemDesign: ['Design a food delivery app like Swiggy (real-time tracking, surge pricing)', 'Design a payment system like Razorpay (transactions, fraud detection)', 'Design a job portal like Naukri.com (search, recommendations)', 'Design a scalable notification system (push, email, SMS at 10M users)'],
    technical: ['Explain the difference between SQL and NoSQL databases with examples', 'What is indexing? When would you use it and when not?', 'Explain how HTTP and HTTPS work, difference between GET and POST', 'What is REST API? What are HTTP status codes?', 'Explain database transactions and ACID properties', 'What is caching? When would you use Redis vs Memcached?'],
    behavioral: ['Tell me about your best project — what problem it solved and technical decisions made', 'How do you handle a bug in production at 2 AM?', 'Describe a time you disagreed with a technical decision and how you handled it', 'How do you stay updated with new technologies?', 'Why do you want to work at this company specifically?'],
  };

  return {
    dsa: ['Arrays: Two Sum, Maximum subarray, Rotate array (Amazon, Flipkart)', 'Strings: Palindrome, Anagram, Longest without repeating characters', 'Trees: Level order traversal, height, diameter (Google, Microsoft)', 'Dynamic Programming: Fibonacci, Climbing stairs, House robber', 'Recursion & Backtracking: Permutations, Combinations', 'Sorting: Merge sort, Quick sort, their time complexities'],
    systemDesign: ['Design a URL shortener (bit.ly clone) — scale to 100M URLs', 'Design a real-time chat application (WhatsApp-like)', 'Design a recommendation system for an e-commerce platform', 'Design a distributed cache like Redis'],
    technical: ['What is the difference between == and === in JavaScript?', 'Explain how garbage collection works', 'What are design patterns? Explain Singleton and Observer', 'What is a deadlock? How do you prevent it?', 'Explain OOP concepts: inheritance, polymorphism, encapsulation', 'What is the difference between process and thread?'],
    behavioral: ['Tell me about your most challenging project and how you overcame obstacles', 'How do you prioritize tasks when you have multiple deadlines?', 'Describe a situation where you had to learn something new very quickly', 'How do you handle criticism of your code in a code review?', 'What do you do when you are stuck on a problem for a long time?'],
  };
}

function parseJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('{'), e = candidate.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
