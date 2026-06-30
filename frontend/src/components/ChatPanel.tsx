import { useState, useCallback, FormEvent } from 'react'
import { query, type QueryResponse } from '../api'

interface Props {
  onQueryComplete: (result: QueryResponse) => void
  initialAnswer: QueryResponse | null
}

export default function ChatPanel({ onQueryComplete, initialAnswer }: Props) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const result = await query(question.trim())
      onQueryComplete(result)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Query failed')
    } finally {
      setLoading(false)
    }
  }, [question, loading, onQueryComplete])

  const answer = initialAnswer

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-surface border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-ink transition-colors placeholder:text-muted"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-ink text-paper px-5 py-3 rounded-sm text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {answer && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Answer</h3>
            </div>
            <div className="prose prose-sm max-w-none text-ink/90 whitespace-pre-wrap leading-relaxed">
              {answer.answer}
            </div>
          </div>

          {answer.sources.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-ink" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Sources</h3>
              </div>
              <div className="space-y-3">
                {answer.sources.map((s) => (
                  <div key={s.index} className="bg-surface border border-border rounded-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-ink">[{s.index}]</span>
                      <span className="text-xs text-muted">
                        {s.source} · page {s.page}
                      </span>
                    </div>
                    <p className="text-sm text-ink/80 leading-relaxed line-clamp-3">
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
