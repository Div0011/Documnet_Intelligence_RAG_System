import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const __VITE_READONLY__: any;

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

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

export interface UploadedFile {
  filename: string;
  status: string;
  chunks?: number;
  message?: string;
}

export type UploadResponse = UploadedFile;

export const uploadFiles = async (files: FileList): Promise<any[]> => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('files', f));
  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const query = async (question: string, sources: string[] = []): Promise<QueryResponse> => {
  const res = await api.post('/query', { question, sources });
  return res.data;
};

export const getInsights = async (sources: string[] = []): Promise<{ insights: string }> => {
  const params = sources.length ? { sources: sources.join(',') } : {};
  const res = await api.get('/insights', { params });
  return res.data;
};

export const getStatus = async (): Promise<{ total_chunks: number; status: string; documents_indexed: number }> => {
  const res = await api.get('/status');
  return res.data;
};

export const getDocuments = async (): Promise<{ documents: string[] }> => {
  const res = await api.get('/documents');
  return res.data;
};

export const deleteDocument = async (filename: string): Promise<{ deleted: number }> => {
  const res = await api.delete(`/documents/${encodeURIComponent(filename)}`);
  return res.data;
};

export const reset = async (): Promise<{ status: string }> => {
  const res = await api.post('/reset');
  return res.data;
};

export interface AboutInfo {
  name: string;
  version: string;
  creator: string;
  readme: string;
}

export const getAbout = async (): Promise<AboutInfo> => {
  const res = await api.get('/about');
  return res.data;
};
