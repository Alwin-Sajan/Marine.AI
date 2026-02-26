'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Plus, FileText, Trash2, Search, Upload,
  BookOpen, X, Eye, MoreVertical, Clock,
  CheckCircle2, Loader2, FolderOpen, ParkingCircleOffIcon,
  MessageSquare, Database, Layers, Zap, Sparkles, Menu, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import AppSidebar from '@/components/AppSidebar'
import { getPdfs, setPdfs, getSelectedIds, setSelectedIds } from '@/lib/pdfStore'

// ── helpers ───────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
const formatDate = (d) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(d))

const userName = 'Admin'

// ── status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Processing', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    ready:      { icon: <CheckCircle2 className="w-3 h-3" />,          label: 'Ready',      cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    error:      { icon: <X className="w-3 h-3" />,                     label: 'Error',      cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
  }
  const { icon, label, cls } = map[status] || map.ready
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {icon}{label}
    </span>
  )
}

// ── drop zone ─────────────────────────────────────────────────────────────────
const DropZone = ({ onFiles }) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (files.length) onFiles(files)
  }, [onFiles])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 group overflow-hidden
        ${dragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' : 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-500/5'}`}
    >
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
        <div className="absolute inset-4 rounded-2xl border border-cyan-500/20 animate-pulse" />
        <div className="absolute inset-8 rounded-xl border border-cyan-500/10 animate-pulse" style={{ animationDelay: '150ms' }} />
      </div>
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
        ${dragging ? 'bg-cyan-500/30 scale-110' : 'bg-gray-800 group-hover:bg-cyan-500/20'}`}>
        <Upload className={`w-8 h-8 transition-colors duration-300 ${dragging ? 'text-cyan-300' : 'text-gray-500 group-hover:text-cyan-400'}`} />
      </div>
      <p className="text-lg font-semibold text-gray-200 mb-1">{dragging ? 'Drop PDFs here' : 'Upload PDF Sources'}</p>
      <p className="text-sm text-gray-500 mb-4">Drag & drop or <span className="text-cyan-400 underline underline-offset-2">browse files</span></p>
      <p className="text-xs text-gray-600">Supports PDF · Max 50 MB per file</p>
      <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
        onChange={e => { const files = Array.from(e.target.files); if (files.length) onFiles(files); e.target.value = '' }}
      />
    </div>
  )
}

// ── pdf card ──────────────────────────────────────────────────────────────────
const PdfCard = ({ pdf, onDelete, onPreview, onChat, selected, onSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`group relative bg-[#1e293b] rounded-2xl border transition-all duration-200 overflow-hidden
      ${selected ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10' : 'border-gray-800 hover:border-gray-700'}`}>

      {/* Select checkbox */}
      <button
        onClick={() => onSelect(pdf.id)}
        className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 transition-all z-10 flex items-center justify-center
          ${selected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600 opacity-0 group-hover:opacity-100'}`}
      >
        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </button>

      <div className="h-1 w-full bg-gradient-to-r from-cyan-600 to-blue-600" />

      <div className="p-4 pt-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{pdf.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatBytes(pdf.size)} · {formatDate(pdf.uploadedAt)}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded-lg transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 w-40 overflow-hidden">
                <button onClick={() => { onPreview(pdf); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 w-full">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />Preview
                </button>
                <button onClick={() => { onChat(pdf); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 w-full">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />Chat with PDF
                </button>
                <hr className="border-gray-700" />
                <button onClick={() => { onDelete(pdf.id); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full">
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={pdf.status} />
          {pdf.pages && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />{pdf.pages} pages
            </span>
          )}
        </div>

        {pdf.summary && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">{pdf.summary}</p>
        )}
      </div>

      <div className="border-t border-gray-800 flex divide-x divide-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button onClick={() => onPreview(pdf)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors">
          <Eye className="w-3.5 h-3.5" />Preview
        </button>
        <button onClick={() => onChat(pdf)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />Chat
        </button>
      </div>
    </div>
  )
}

// ── stats bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ pdfs }) => {
  const ready = pdfs.filter(p => p.status === 'ready').length
  const totalPages = pdfs.reduce((acc, p) => acc + (p.pages || 0), 0)
  const totalSize = pdfs.reduce((acc, p) => acc + (p.size || 0), 0)
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { icon: <Database className="w-4 h-4 text-cyan-400" />,  label: 'Sources',     value: pdfs.length,         sub: `${ready} ready`  },
        { icon: <Layers className="w-4 h-4 text-purple-400" />,  label: 'Total Pages', value: totalPages,          sub: 'indexed'         },
        { icon: <Zap className="w-4 h-4 text-amber-400" />,      label: 'Storage',     value: formatBytes(totalSize), sub: 'used'          },
      ].map((s, i) => (
        <div key={i} className="bg-[#1e293b] rounded-xl border border-gray-800 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">{s.icon}</div>
          <div>
            <p className="text-lg font-bold text-gray-100 leading-none">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label} · {s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── preview modal ─────────────────────────────────────────────────────────────
const PreviewModal = ({ pdf, onClose }) => {
  if (!pdf) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-500/20 rounded-xl border border-cyan-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">{pdf.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(pdf.size)} · {pdf.pages} pages</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-5">
          <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-6 text-center">
            <FileText className="w-16 h-16 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">PDF preview would appear here</p>
            <p className="text-xs text-gray-600 mt-1">Integrate a PDF.js viewer for full rendering</p>
          </div>
          {pdf.summary && (
            <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
              <p className="text-xs font-semibold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />AI Summary
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{pdf.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MarineSources() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [previewPdf, setPreviewPdf] = useState(null)
  const [filter, setFilter] = useState('all')
  const [pdfs, setPdfsState] = useState([])

  // ── Sync from pdfStore on mount ──────────────────────────────────────────
  useEffect(() => {
    const stored = getPdfs()
    if (stored.length > 0) {
      setPdfsState(stored)
    } else {
      // Seed with demo data on first load
      const demo = [
        { id: 1, name: 'Marine Biodiversity Report 2024.pdf', size: 4820000, pages: 142, status: 'ready', uploadedAt: new Date('2024-11-10').toISOString(), summary: 'Comprehensive analysis of marine biodiversity trends across Pacific Ocean regions, covering 3,400 species.' },
        { id: 2, name: 'Coral Reef Ecosystem Study.pdf',       size: 2310000, pages: 78,  status: 'ready', uploadedAt: new Date('2024-11-08').toISOString(), summary: 'In-depth examination of coral bleaching events and recovery strategies in the Great Barrier Reef.' },
        { id: 3, name: 'Shark Migration Patterns.pdf',         size: 1940000, pages: 56,  status: 'ready', uploadedAt: new Date('2024-10-25').toISOString(), summary: 'Satellite tracking data revealing migration corridors for 12 shark species across the Atlantic.' },
      ]
      setPdfsState(demo)
      setPdfs(demo)
    }
    setSelected(new Set(getSelectedIds()))
  }, [])

  // ── Write back to store whenever pdfs or selection changes ───────────────
  useEffect(() => {
    if (pdfs.length > 0) setPdfs(pdfs)
  }, [pdfs])

  useEffect(() => {
    setSelectedIds(selected)
  }, [selected])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFiles = (files) => {
    const newPdfs = files.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
      pages: null,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      summary: null,
    }))
    setPdfsState(prev => [...newPdfs, ...prev])
    newPdfs.forEach(p => {
      setTimeout(() => {
        setPdfsState(prev => {
          const updated = prev.map(x => x.id === p.id
            ? { ...x, status: 'ready', pages: Math.floor(Math.random() * 120) + 20 }
            : x)
          setPdfs(updated)
          return updated
        })
      }, 3000)
    })
  }

  const handleDelete = (id) => {
    setPdfsState(prev => {
      const updated = prev.filter(p => p.id !== id)
      setPdfs(updated)
      return updated
    })
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const handleDeleteSelected = () => {
    setPdfsState(prev => {
      const updated = prev.filter(p => !selected.has(p.id))
      setPdfs(updated)
      return updated
    })
    setSelected(new Set())
  }

  const toggleSelect = (id) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const handleChat = (pdf) => {
    // Select this PDF as context and navigate to chat
    setSelected(new Set([pdf.id]))
    setSelectedIds(new Set([pdf.id]))
    window.location.href = '/chatbot'
  }

  const filtered = pdfs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || p.status === filter)
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0f172a] text-gray-100 overflow-hidden">

      {/* Shared Sidebar */}
      <AppSidebar
        open={sidebarOpen}
        onNewChat={() => window.location.href = '/chatbot'}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 bg-[#1e293b]/50 backdrop-blur flex-shrink-0">
          <button onClick={() => setSidebarOpen(prev => !prev)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-4">
            <h2 className="text-sm font-semibold text-gray-200">Source Library</h2>
            <p className="text-xs text-gray-500">
              {pdfs.length} documents · {pdfs.filter(p => p.status === 'ready').length} ready
              {selected.size > 0 && ` · ${selected.size} selected as context`}
            </p>
          </div>

          {/* Quick link to chat with selected */}
          {selected.size > 0 && (
            <Link href="/chatbot"
              className="ml-3 flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              Chat with {selected.size} source{selected.size > 1 ? 's' : ''}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="ml-auto">
            <a href="/login_page" className="text-xs rounded-2xl text-gray-500 flex items-center gap-1.5 border border-gray-700 px-3 py-1 bg-gray-800/50 hover:bg-gray-800 transition-colors">
              <ParkingCircleOffIcon className="w-3.5 h-3.5" />{userName}
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-100 mb-1">Knowledge Sources</h1>
              <p className="text-sm text-gray-500">Upload and manage PDFs that power your marine AI assistant.</p>
            </div>

            <StatsBar pdfs={pdfs} />

            <div className="mb-6">
              <DropZone onFiles={handleFiles} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search sources…"
                  className="w-full bg-[#1e293b] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/40 transition-colors"
                />
              </div>

              <div className="flex gap-1 bg-[#1e293b] border border-gray-800 rounded-xl p-1">
                {['all', 'ready', 'processing'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                      ${filter === f ? 'bg-cyan-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                    {f}
                  </button>
                ))}
              </div>

              {selected.size > 0 && (
                <button onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-medium transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />Delete {selected.size}
                </button>
              )}
            </div>

            {/* Info about selection for chat */}
            {selected.size > 0 && (
              <div className="mb-4 flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-4 py-2.5">
                <Database className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{selected.size} source{selected.size > 1 ? 's' : ''} selected as AI context — these will be used when you chat.</span>
                <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-500 hover:text-gray-300 text-[11px]">Clear</button>
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderOpen className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No sources found</p>
                <p className="text-sm text-gray-600 mt-1">
                  {search ? `No results for "${search}"` : 'Upload PDFs to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(pdf => (
                  <PdfCard
                    key={pdf.id}
                    pdf={pdf}
                    selected={selected.has(pdf.id)}
                    onSelect={toggleSelect}
                    onDelete={handleDelete}
                    onPreview={setPreviewPdf}
                    onChat={handleChat}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PreviewModal pdf={previewPdf} onClose={() => setPreviewPdf(null)} />
    </div>
  )
}