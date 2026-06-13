import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  NVIDIA_NIM_API_KEY: process.env.NVIDIA_NIM_API_KEY ?? '',
  NIM_BASE_URL: process.env.NIM_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
  NIM_MODEL: process.env.NIM_MODEL ?? 'zai-org/glm-5.1',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? '',
  MOCK_AI: process.env.MOCK_AI === 'true',
} as const;
