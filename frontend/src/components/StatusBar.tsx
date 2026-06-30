interface Props {
  status: { total_chunks: number; status: string }
  onRefresh: () => void
}

export default function StatusBar({ status, onRefresh }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-xs text-muted uppercase tracking-wider">Indexed</p>
        <p className="text-sm font-semibold tabular-nums">{status.total_chunks} chunks</p>
      </div>
      <button
        onClick={onRefresh}
        className="text-xs text-muted hover:text-ink underline underline-offset-4 transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}
