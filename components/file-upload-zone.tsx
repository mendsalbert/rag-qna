'use client'

import { cn } from '@/lib/utils'
import { FileText, Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

const ACCEPTED_TYPES = '.txt,.md,.markdown,.csv,.json,.html,.htm,.xml,.yaml,.yml,.log,.pdf'

interface FileUploadZoneProps {
  disabled?: boolean
  isUploading?: boolean
  onUpload: (file: File) => Promise<void>
}

export function FileUploadZone({ disabled, isUploading, onUpload }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file || disabled || isUploading) {
      return
    }

    await onUpload(file)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border border-dashed px-4 py-5 transition-colors',
        isDragging
          ? 'border-primary/60 bg-primary/5'
          : 'border-border/70 bg-background/40 hover:border-border',
        (disabled || isUploading) && 'pointer-events-none opacity-50',
      )}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragging(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        void handleFiles(event.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary/60">
          {isUploading ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <Upload className="size-4 text-primary" strokeWidth={2.25} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground/90">
            {isUploading ? 'Indexing file…' : 'Drop a file here or browse'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            TXT, MD, CSV, JSON, HTML, YAML, PDF · up to 10 MB
          </p>
        </div>

        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
        >
          <FileText className="size-3.5" />
          Choose file
        </button>
      </div>
    </div>
  )
}
