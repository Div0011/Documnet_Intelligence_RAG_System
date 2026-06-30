import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Source {
  index: number;
  source: string;
  page: number;
  text: string;
  score?: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  insights?: string;
}

export const uploadFiles = async (files: FileList): Promise<any[]> => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('files', f));
  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const query = async (question: string): Promise<QueryResponse> => {
  const res = await api.post('/query', { question });
  return res.data;
};

export const getInsights = async (): Promise<{ insights: string }> => {
  const res = await api.get('/insights');
  return res.data;
};

export const getStatus = async (): Promise<{ total_chunks: number; status: string }> => {
  const res = await api.get('/status');
  return res.data;
};

export const reset = async (): Promise<{ status: string }> => {
  const res = await api.post('/reset');
  return res.data;
};
