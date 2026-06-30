interface Props {
  onStart: () => void
}

export default function Hero({ onStart }: Props) {
  return (
    <div className="border border-neutral-200 bg-white mb-10">
      <div className="px-8 py-10 lg:px-12 lg:py-14">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Latency-Optimized
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm border border-neutral-900 bg-neutral-900 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              RAG System
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mb-4">
            Turn your PDFs into <br className="hidden sm:block" />
            <span className="text-neutral-500">intelligent answers</span>
          </h1>

          <p className="text-sm lg:text-base text-neutral-600 leading-relaxed max-w-2xl mb-8">
            Upload documents, ask natural language questions, and receive precise answers with exact citations. 
            Built for speed, designed for clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-sm hover:bg-neutral-800 transition-colors duration-150 tracking-wide"
            >
              Get Started
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-sm hover:border-neutral-400 transition-colors duration-150 tracking-wide"
            >
              How it works
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-200" id="how-it-works">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-1 rounded-full bg-neutral-900" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Upload</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Upload 1–50 PDFs at once. Supports up to 50 MB per file.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-1 rounded-full bg-neutral-900" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Query</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ask natural language questions across selected documents or the full collection.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-1 rounded-full bg-neutral-900" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Cite</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive answers with exact source citations and page references.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
