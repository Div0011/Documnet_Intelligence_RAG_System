import { useCallback, useEffect, useState } from 'react'
import { uploadFiles, getDocuments, deleteDocument, type UploadResponse } from '../api'

interface FileItem {
  filename: string
  status: string
  chunks?: number
  message?: string
}

interface Props {
  onUploaded: () => void
  selectedFiles: Set<string>
  onSelectionChange: (selected: Set<string>) => void
}

export default function UploadZone({ onUploaded, selectedFiles, onSelectionChange }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)

  const loadFiles = useCallback(async () => {
    try {
      const data = await getDocuments()
      setFiles(
        data.documents.map((name) => ({
          filename: name,
          status: 'ok',
          chunks: undefined,
        })),
      )
    } catch {
      // ignore
    } finally {
      setLoadingFiles(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const toggleFile = useCallback(
    (filename: string) => {
      const next = new Set(selectedFiles)
      if (next.has(filename)) {
        next.delete(filename)
      } else {
        next.add(filename)
      }
      onSelectionChange(next)
    },
    [selectedFiles, onSelectionChange],
  )

  const toggleAll = useCallback(() => {
    if (selectedFiles.size === files.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(files.map((f) => f.filename)))
    }
  }, [files, selectedFiles, onSelectionChange])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (!e.dataTransfer.files.length) return
      await processFiles(e.dataTransfer.files)
    },
    [],
  )

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    await processFiles(e.target.files)
  }, [])

  const processFiles = async (filesList: FileList) => {
    setUploading(true)
    try {
      const data = await uploadFiles(filesList)
      const newFiles: FileItem[] = data.map((r: UploadResponse) => ({
        filename: r.filename,
        status: r.status,
        chunks: r.chunks,
        message: r.message,
      }))
      setFiles((prev) => {
        const existing = new Set(prev.map((f) => f.filename))
        const uniqueNew = newFiles.filter((f) => !existing.has(f.filename))
        const updated = [...prev, ...uniqueNew]
        if (updated.length > 0 && selectedFiles.size === 0) {
          onSelectionChange(new Set(updated.map((f) => f.filename)))
        }
        return updated
      })
      onUploaded()
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Upload failed'
      setFiles((prev) => [
        ...prev,
        { filename: 'Error', status: 'error', message: msg },
      ])
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = useCallback(
    async (filename: string) => {
      await deleteDocument(filename)
      setFiles((prev) => prev.filter((f) => f.filename !== filename))
      const next = new Set(selectedFiles)
      next.delete(filename)
      onSelectionChange(next)
      onUploaded()
    },
    [onUploaded, onSelectionChange, selectedFiles],
  )

  return (
    <div className="border border-neutral-200 bg-white">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Upload
        </h2>
      </div>
      <div className="p-5">
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`block border border-dashed rounded-sm p-10 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/50'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-neutral-500 font-medium">Processing documents...</p>
              <p className="text-xs text-neutral-400">This may take a moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-900">
                Drop PDFs here or click to browse
              </p>
              <p className="text-xs text-neutral-400 tracking-wide">
                Up to 50 files, 50 MB each
              </p>
            </div>
          )}
        </label>

        {files.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Documents ({files.length})
              </p>
              <button
                onClick={toggleAll}
                className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-150 uppercase tracking-wider"
              >
                {selectedFiles.size === files.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-1">
              {files.map((file) => {
                const checked = selectedFiles.has(file.filename)
                return (
                  <div
                    key={file.filename}
                    className="flex items-center justify-between py-2.5 px-3 border border-neutral-100 rounded-sm hover:border-neutral-200 hover:bg-neutral-50/30 transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleFile(file.filename)}
                        className={`shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-150 ${
                          checked
                            ? 'bg-neutral-900 border-neutral-900'
                            : 'border-neutral-300 bg-white hover:border-neutral-400'
                        }`}
                      >
                        {checked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <svg
                        className="w-4 h-4 text-neutral-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs text-neutral-700 truncate font-medium">
                        {file.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {file.status === 'ok' && file.chunks !== undefined && (
                        <span className="text-[11px] text-neutral-400 tabular-nums tracking-wide">
                          {file.chunks} chunks
                        </span>
                      )}
                      {file.status === 'empty' && (
                        <span className="text-[11px] text-neutral-400 italic">empty</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-[11px] text-red-600">
                          {file.message || 'error'}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-all duration-150 p-1"
                        title="Remove file"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loadingFiles && (
          <div className="mt-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-3">
              Documents
            </p>
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-neutral-400">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
