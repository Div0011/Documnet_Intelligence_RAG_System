import { useState, useCallback } from 'react'
import UploadZone from './components/UploadZone'
import ChatPanel from './components/ChatPanel'
import InsightsPanel from './components/InsightsPanel'
import StatusBar from './components/StatusBar'
import { getStatus, getInsights, type QueryResponse } from './api'

type Tab = 'chat' | 'insights'

function App() {
  const [status, setStatus] = useState({ total_chunks: 0, status: 'idle' })
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [currentAnswer, setCurrentAnswer] = useState<QueryResponse | null>(null)

  const refreshStatus = useCallback(async () => {
    try {
      const s = await getStatus()
      setStatus(s)
    } catch {
      // ignore
    }
  }, [])

  const handleQueryComplete = useCallback((result: QueryResponse) => {
    setCurrentAnswer(result)
    setActiveTab('chat')
  }, [])

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DocIntel</h1>
            <p className="text-sm text-muted mt-1">Document Intelligence RAG System</p>
          </div>
          <StatusBar status={status} onRefresh={refreshStatus} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-4 space-y-6">
            <UploadZone onUploaded={refreshStatus} />
            <div className="bg-surface border border-border rounded-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-ink" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">System</h2>
              </div>
              <p className="text-sm text-ink/70 leading-relaxed">
                Upload 1–50 PDFs. Ask natural language questions. Receive answers with exact citations.
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8">
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-border mb-6">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-ink border-b-2 border-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Chat
              </button>
              <button
                onClick={async () => {
                  setActiveTab('insights')
                  try {
                    const data = await getInsights()
                    setCurrentAnswer({ answer: '', sources: [], insights: data.insights })
                  } catch {
                    // ignore
                  }
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'text-ink border-b-2 border-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Insights
              </button>
            </div>

            {activeTab === 'chat' && (
              <ChatPanel onQueryComplete={handleQueryComplete} initialAnswer={currentAnswer} />
            )}
            {activeTab === 'insights' && (
              <InsightsPanel insights={currentAnswer?.insights} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted">
          <span>DocIntel RAG System</span>
          <span>Optimized for latency</span>
        </div>
      </footer>
    </div>
  )
}

export default App
