import { useState, useRef, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { astApi } from '@/lib/api'
import { useInspectorStore } from '@/store/inspectorStore'
import FileInspector from '@/components/inspector/FileInspector'
import { Upload, FileCode } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ASTInspectorPage() {
  const { inspection, isLoading, error, setInspection, setLoading, setError, clear } = useInspectorStore()
  const [dragging, setDragging] = useState(false)
  const [rawMode, setRawMode] = useState(false)
  const [rawContent, setRawContent] = useState('')
  const [rawFileName, setRawFileName] = useState('main.go')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => astApi.inspectFile(file),
    onMutate: () => setLoading(true),
    onSuccess: ({ data }) => {
      setInspection(data)
      toast.success(`Parsed ${data.fileName}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Failed to parse file'
      setError(msg)
      toast.error(msg)
    },
  })

  const rawMutation = useMutation({
    mutationFn: () => astApi.inspectRaw(rawFileName, rawContent),
    onMutate: () => setLoading(true),
    onSuccess: ({ data }) => {
      setInspection(data)
      toast.success('Parsed successfully')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Failed to parse source'
      setError(msg)
      toast.error(msg)
    },
  })

  function handleFile(file: File) {
    if (!file.name.endsWith('.go')) {
      toast.error('Only .go files are supported')
      return
    }
    uploadMutation.mutate(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="flex h-full">
      {/* Left: upload panel */}
      <div className="w-80 shrink-0 border-r border-border bg-card flex flex-col p-4 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Go AST Inspector</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a .go file or paste source to inspect its structure
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => setRawMode(false)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              !rawMode ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
            data-testid="upload-mode"
          >
            Upload file
          </button>
          <button
            onClick={() => setRawMode(true)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              rawMode ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
            data-testid="raw-mode"
          >
            Paste source
          </button>
        </div>

        {!rawMode ? (
          <>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              data-testid="drop-zone"
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors ${
                dragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
              } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {isLoading
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <Upload size={18} className="text-muted-foreground" />
                }
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground font-medium">
                  {isLoading ? 'Parsing…' : 'Drop a .go file'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".go"
              onChange={handleFileInput}
              className="hidden"
              data-testid="file-input"
            />
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">File name</label>
              <input
                value={rawFileName}
                onChange={(e) => setRawFileName(e.target.value)}
                placeholder="main.go"
                className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="filename-input"
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-xs text-muted-foreground mb-1">Source code</label>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="package main&#10;&#10;import &quot;fmt&quot;&#10;&#10;func main() {&#10;    fmt.Println(&quot;Hello&quot;)&#10;}"
                className="flex-1 w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[200px]"
                data-testid="source-input"
              />
            </div>
            <button
              onClick={() => rawMutation.mutate()}
              disabled={isLoading || !rawContent.trim()}
              data-testid="parse-button"
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Parsing…' : 'Parse source'}
            </button>
          </>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {inspection && (
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            data-testid="clear-button"
          >
            Clear result
          </button>
        )}
      </div>

      {/* Right: inspection result */}
      <div className="flex-1 min-w-0">
        {inspection ? (
          <FileInspector inspection={inspection} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <FileCode size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No file inspected yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a .go file or paste source code to see functions, types, interfaces, imports, and more
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
