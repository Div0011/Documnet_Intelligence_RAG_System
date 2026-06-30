import { useEffect, useState } from 'react'
import { getAbout, type AboutInfo } from '../api'

interface Props {
  onBack: () => void
}

export default function AboutPage({ onBack }: Props) {
  const [about, setAbout] = useState<AboutInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAbout()
      .then(setAbout)
      .catch(() => setAbout({ name: 'DocIntel RAG System', version: '1.0.0', creator: 'Divyansh Awasthi', readme: '' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-150 uppercase tracking-wider"
      >
        ← Back
      </button>

      <div className="border border-neutral-200 bg-white p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-1 rounded-full bg-neutral-900" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            About
          </h2>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          {about?.name || 'DocIntel RAG System'}
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          Version {about?.version || '1.0.0'} · Created by <span className="font-medium text-neutral-700">{about?.creator || 'Divyansh Awasthi'}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-2">Optimization Target</h3>
            <p className="text-sm font-semibold text-neutral-900">Latency</p>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Local embeddings, dense retrieval, CrossEncoder reranking, and Groq inference deliver ~1–2s end-to-end.
            </p>
          </div>
          <div className="border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-2">Core Stack</h3>
            <p className="text-sm font-semibold text-neutral-900">FastAPI + React + ChromaDB</p>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              SentenceTransformers, pypdf, Groq Llama 3.1 8B Instant, Tailwind CSS, Vite.
            </p>
          </div>
          <div className="border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-2">Assignment</h3>
            <p className="text-sm font-semibold text-neutral-900">N-ERGY Intern Take-Home</p>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Built July 2026. Public repository with clean, runnable code and full documentation.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-1 rounded-full bg-neutral-900" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              README
            </h3>
          </div>
          {loading ? (
            <p className="text-sm text-neutral-400">Loading...</p>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-6 overflow-x-auto">
              <pre className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed font-mono">
                {about?.readme || 'No README found.'}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="border border-neutral-200 bg-white p-6">
        <p className="text-xs text-neutral-500 leading-relaxed">
          Built as part of the N-ERGY Intern Take-Home Assignment (July 2026). Optimized for latency using local embeddings, dense retrieval, CrossEncoder reranking, and Groq inference.
        </p>
      </div>
    </div>
  )
}
