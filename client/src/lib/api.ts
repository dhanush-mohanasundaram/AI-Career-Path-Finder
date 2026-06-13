import axios from 'axios';

const BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:5000';

export const api = axios.create({ baseURL: BASE });

export const analysisApi = {
  analyze: (role: string) => api.post('/api/analyze', { role }).then(r => r.data),
  getById: (id: string) => api.get(`/api/analyze/${id}`).then(r => r.data),
  stream: (role: string): EventSource =>
    new EventSource(`${BASE}/api/analyze/stream?role=${encodeURIComponent(role)}`),
};
