interface Props {
  status: { total_chunks: number; status: string; documents_indexed?: number }
  onRefresh: () => void
}

export default function StatusBar({ status, onRefresh }: Props) {
  return (
    <div className="flex items-center gap-5">
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-0.5">
          Indexed
        </p>
        <p className="text-sm font-semibold tabular-nums text-neutral-900">
          {status.total_chunks.toLocaleString()} chunks
        </p>
      </div>
      <div className="w-px h-6 bg-neutral-200" />
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-0.5">
          Documents
        </p>
        <p className="text-sm font-semibold tabular-nums text-neutral-900">
          {status.documents_indexed ?? 0}
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-150 uppercase tracking-wider"
      >
        Refresh
      </button>
    </div>
  )
}
