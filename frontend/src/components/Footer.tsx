export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white/40 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            DocIntel
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-[11px] text-neutral-400 uppercase tracking-[0.2em]">
            Document Intelligence
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Optimized for latency
          </span>
          <span className="text-[10px] text-neutral-300 font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  )
}
