import { useState, useCallback } from 'react'
import UploadZone from './components/UploadZone'
import ChatPanel from './components/ChatPanel'
import InsightsPanel from './components/InsightsPanel'
import StatusBar from './components/StatusBar'
import AboutPage from './components/AboutPage'
import Hero from './components/Hero'
import Footer from './components/Footer'
import { getStatus, getInsights, type QueryResponse } from './api'

type Tab = 'chat' | 'insights' | 'about'

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
        active
          ? 'border-neutral-900 text-neutral-900'
          : 'border-transparent text-neutral-400 hover:text-neutral-600'
      }`}
    >
      {children}
    </button>
  )
}

function App() {
  const [status, setStatus] = useState({ total_chunks: 0, status: 'idle', documents_indexed: 0 })
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [currentAnswer, setCurrentAnswer] = useState<QueryResponse | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  const refreshStatus = useCallback(async () => {
    try {
      const s = await getStatus()
      setStatus(s)
    } catch {
      // ignore
    }
  }, [])

  const handleSelectionChange = useCallback((selected: Set<string>) => {
    setSelectedFiles(selected)
  }, [])

  const handleQueryComplete = useCallback((result: QueryResponse) => {
    setCurrentAnswer(result)
  }, [])

  const handleInsights = useCallback(async () => {
    setActiveTab('insights')
    try {
      const data = await getInsights(Array.from(selectedFiles))
      setCurrentAnswer({ answer: '', sources: [], insights: data.insights })
    } catch {
      // ignore
    }
  }, [selectedFiles])

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 cursor-pointer" onClick={() => setActiveTab('chat')}>
              DocIntel
            </h1>
            <p className="text-[11px] text-neutral-400 mt-0.5 uppercase tracking-widest">
              Document Intelligence RAG System
            </p>
          </div>
          <StatusBar status={status} onRefresh={refreshStatus} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {activeTab === 'about' ? (
          <AboutPage onBack={() => setActiveTab('chat')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column */}
            <div className="lg:col-span-4 space-y-6">
              <UploadZone onUploaded={refreshStatus} selectedFiles={selectedFiles} onSelectionChange={handleSelectionChange} />
              <div className="border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-1 rounded-full bg-neutral-900" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    System
                  </h2>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Upload 1–50 PDFs. Select documents to query. Ask natural language questions. Receive answers with exact citations.
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-8 space-y-8">
              <Hero onStart={() => {
                const input = document.getElementById('chat-input')
                input?.focus()
              }} />

              {/* Tab bar */}
              <div className="flex items-center gap-1 border-b border-neutral-200">
                <TabButton active={(activeTab as string) === 'chat'} onClick={() => setActiveTab('chat')}>
                  Chat
                </TabButton>
                <TabButton active={(activeTab as string) === 'insights'} onClick={handleInsights}>
                  Insights
                </TabButton>
                <TabButton active={(activeTab as string) === 'about'} onClick={() => setActiveTab('about')}>
                  About
                </TabButton>
              </div>

              {(activeTab as string) === 'chat' && (
                <ChatPanel onQueryComplete={handleQueryComplete} initialAnswer={currentAnswer} sources={Array.from(selectedFiles)} />
              )}
              {(activeTab as string) === 'insights' && (
                <InsightsPanel insights={currentAnswer?.insights} />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
