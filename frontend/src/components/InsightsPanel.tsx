interface Props {
  insights?: string
}

export default function InsightsPanel({ insights }: Props) {
  if (!insights) {
    return (
      <div className="bg-surface border border-border rounded-sm p-8 text-center">
        <p className="text-sm text-muted">No insights available yet. Try uploading documents first.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-ink" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Suggested Insights</h3>
      </div>
      <div className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">
        {insights}
      </div>
    </div>
  )
}
