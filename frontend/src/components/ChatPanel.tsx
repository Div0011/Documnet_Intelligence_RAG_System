import { useState, useCallback, FormEvent } from 'react'
import { query, type QueryResponse } from '../api'

interface Props {
  onQueryComplete: (result: QueryResponse) => void
  initialAnswer: QueryResponse | null
  sources: string[]
}

type ChatScope = 'all-selected' | 'specific-document'

export default function ChatPanel({ onQueryComplete, initialAnswer, sources }: Props) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatScope, setChatScope] = useState<ChatScope>('all-selected')
  const [selectedDoc, setSelectedDoc] = useState<string>('')

  const resolvedSources = chatScope === 'all-selected' ? sources : (selectedDoc ? [selectedDoc] : [])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const result = await query(question.trim(), resolvedSources)
      onQueryComplete(result)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Query failed')
    } finally {
      setLoading(false)
    }
  }, [question, loading, onQueryComplete, resolvedSources])

  const answer = initialAnswer

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border border-neutral-200 bg-white rounded-sm p-0.5">
          <button
            type="button"
            onClick={() => setChatScope('all-selected')}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-sm transition-all duration-150 ${
              chatScope === 'all-selected'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            All selected
          </button>
          <button
            type="button"
            onClick={() => {
              setChatScope('specific-document')
              if (sources.length > 0 && !selectedDoc) {
                setSelectedDoc(sources[0])
              }
            }}
            disabled={sources.length === 0}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-sm transition-all duration-150 disabled:opacity-40 ${
              chatScope === 'specific-document'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Specific document
          </button>
        </div>
        {chatScope === 'specific-document' && sources.length > 1 && (
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-[11px] text-neutral-700 outline-none focus:border-neutral-400"
          >
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          id="chat-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            chatScope === 'all-selected'
              ? 'Ask across all selected documents...'
              : `Ask about "${selectedDoc || 'selected document'}"...`
          }
          className="flex-1 bg-white border border-neutral-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-400 placeholder:tracking-wide"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-neutral-900 text-white px-6 py-3 rounded-sm text-sm font-medium disabled:opacity-30 hover:bg-neutral-800 transition-all duration-150 tracking-wide"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              ...
            </span>
          ) : 'Ask'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {answer && (
        <div className="space-y-8">
          <div className="border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-1 rounded-full bg-neutral-900" />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Answer
              </h3>
            </div>
            <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
              {answer.answer}
            </div>
          </div>

          {answer.sources.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-1 rounded-full bg-neutral-900" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Sources
                </h3>
              </div>
              <div className="space-y-2">
                {answer.sources.map((s) => (
                  <div key={s.index} className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-neutral-900 tracking-wide">
                        [{s.index}]
                      </span>
                      <span className="text-[11px] text-neutral-400 tracking-wide">
                        {s.source} · page {s.page}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
