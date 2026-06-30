import { useCallback, useState } from 'react'
import { uploadFiles, type UploadResponse } from '../api'

interface Props {
  onUploaded: () => void
}

export default function UploadZone({ onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResponse[]>([])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (!e.dataTransfer.files.length) return
    await processFiles(e.dataTransfer.files)
  }, [])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    await processFiles(e.target.files)
  }, [])

  const processFiles = async (files: FileList) => {
    setUploading(true)
    setResults([])
    try {
      const data = await uploadFiles(files)
      setResults(data)
      onUploaded()
    } catch (err: any) {
      setResults([{ filename: 'Error', status: 'error', message: err.response?.data?.detail || 'Upload failed' }])
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="p-5 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Upload</h2>
      </div>
      <div className="p-5">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`block border border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-ink bg-ink/5' : 'border-border hover:border-ink/40'
          }`}
        >
          <input type="file" accept="application/pdf" multiple onChange={handleChange} className="hidden" disabled={uploading} />
          {uploading ? (
            <p className="text-sm text-muted">Processing documents...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">Drop PDFs here or click to browse</p>
              <p className="text-xs text-muted mt-2">1–50 files, up to 50 MB each</p>
            </>
          )}
        </label>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs border border-border rounded-sm px-3 py-2">
                <span className="truncate flex-1">{r.filename}</span>
                <span className={`ml-3 font-medium ${
                  r.status === 'ok' ? 'text-ink' :
                  r.status === 'empty' ? 'text-muted' : 'text-red-600'
                }`}>
                  {r.status === 'ok' ? `${r.chunks} chunks` : r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
