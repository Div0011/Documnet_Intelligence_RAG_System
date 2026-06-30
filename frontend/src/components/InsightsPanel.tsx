interface Props {
  insights?: string
}

export default function InsightsPanel({ insights }: Props) {
  if (!insights) {
    return (
      <div className="border border-neutral-200 bg-white p-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-neutral-900" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Suggested Insights
          </h3>
        </div>
        <p className="text-sm text-neutral-400">No insights available yet. Select documents and switch to the Insights tab.</p>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 bg-white">
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-neutral-900" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Suggested Insights
          </h3>
        </div>
      </div>
      <div className="p-6">
        <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
          {insights}
        </div>
      </div>
    </div>
  )
}
