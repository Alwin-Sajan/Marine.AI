'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  SendHorizontal, X, Image, FileText, Edit3, Trash2,
  MessageSquare, ChevronRight, Sparkles, ParkingCircleOffIcon,
  Menu, Database, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import AppSidebar from '@/components/AppSidebar'
import { getPdfs, getSelectedIds, setSelectedIds, getSelectedPdfs } from '@/lib/pdfStore'

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
const userName = 'Admin'
const API_BASE_URL = 'http://localhost:8001/taxonomyChat'

const formatBytes = (b) => {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF context panel (shown above input when PDFs are selected as context)
// ─────────────────────────────────────────────────────────────────────────────
function PdfContextBar({ selectedPdfs, allPdfs, onToggle, onRemove }) {
  const [open, setOpen] = useState(false)

  if (allPdfs.length === 0) return null

  return (
    <div className="border-b border-gray-800 bg-[#1e293b]/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-400 hover:text-gray-300 transition-colors"
      >
        <Database className="w-3.5 h-3.5 text-cyan-400" />
        <span>
          {selectedPdfs.length === 0
            ? 'No sources selected — AI uses general knowledge'
            : `${selectedPdfs.length} source${selectedPdfs.length > 1 ? 's' : ''} active`}
        </span>
        {selectedPdfs.length > 0 && (
          <span className="ml-1 flex gap-1">
            {selectedPdfs.slice(0, 3).map(p => (
              <span key={p.id} className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded-full text-[10px] truncate max-w-[120px]">
                {p.name.replace('.pdf', '')}
              </span>
            ))}
            {selectedPdfs.length > 3 && (
              <span className="bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px]">
                +{selectedPdfs.length - 3}
              </span>
            )}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1 max-h-52 overflow-y-auto">
          <p className="text-[11px] text-gray-600 mb-2">Toggle which PDFs the AI uses as context:</p>
          {allPdfs.map(pdf => {
            const active = selectedPdfs.some(p => p.id === pdf.id)
            const disabled = pdf.status !== 'ready'
            return (
              <label
                key={pdf.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800/60'}
                  ${active ? 'bg-cyan-500/5 border-cyan-500/20' : 'border-gray-800'}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  disabled={disabled}
                  onChange={() => !disabled && onToggle(pdf.id)}
                  className="accent-cyan-500"
                />
                <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />
                <span className="text-xs text-gray-300 truncate flex-1">{pdf.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border
                  ${pdf.status === 'ready'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  {pdf.status}
                </span>
              </label>
            )
          })}
          <div className="flex gap-2 mt-2">
            <button onClick={() => onToggle('all')} className="text-[11px] text-cyan-400 hover:underline">Select all</button>
            <span className="text-gray-700">·</span>
            <button onClick={() => onToggle('none')} className="text-[11px] text-gray-500 hover:text-gray-300 hover:underline">Clear</button>
            <span className="text-gray-700">·</span>
            <Link href="/sources" className="text-[11px] text-gray-500 hover:text-gray-300 hover:underline flex items-center gap-1">
              Manage sources <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ message, isTyping }) {
  const isUser = message.sender === 'user'

  const renderText = (text) =>
    text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
        : part
    )

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideIn`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-cyan-500 to-blue-500'}`}>
          {isUser ? <span className="text-xs font-bold">You</span> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Bubble */}
        <div className={`inline-block rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'
            : message.isError
            ? 'bg-red-500/20 border border-red-500/50 text-red-200'
            : 'bg-gray-800 text-gray-100'}`}>

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.attachments.map((att, i) => (
                <div key={i} className="bg-black/20 rounded-lg p-2 flex items-center gap-2">
                  {att.type === 'image' ? (
                    <><img src={att.preview} alt={att.name} className="w-12 h-12 object-cover rounded" /><span className="text-xs truncate">{att.name}</span></>
                  ) : (
                    <><FileText className="w-6 h-6 text-blue-400" /><span className="text-xs truncate">{att.name}</span></>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PDF context tags on user message */}
          {isUser && message.contextPdfs?.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {message.contextPdfs.map(p => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] text-cyan-200">
                  <FileText className="w-2.5 h-2.5" />{p.name.replace('.pdf', '')}
                </span>
              ))}
            </div>
          )}

          {message.text && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-left">{renderText(message.text)}</p>
          )}

          {/* Typing dots */}
          {!message.text && isTyping && !isUser && (
            <span className="inline-flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chatbot
// ─────────────────────────────────────────────────────────────────────────────
export default function MarineChatbot() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState([
    { id: 1, title: 'New Conversation', messages: [], timestamp: new Date() }
  ])
  const [currentConvId, setCurrentConvId] = useState(1)
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState([])
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // PDF store state
  const [allPdfs, setAllPdfs] = useState([])
  const [selectedPdfIds, setSelectedPdfIdsState] = useState(new Set())

  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  // ── Sync PDF store on mount + listen for cross-page changes ──────────────
  useEffect(() => {
    const sync = () => {
      setAllPdfs(getPdfs())
      setSelectedPdfIdsState(new Set(getSelectedIds()))
    }
    sync()
    window.addEventListener('marinestore:pdfs', sync)
    window.addEventListener('marinestore:selected', sync)
    return () => {
      window.removeEventListener('marinestore:pdfs', sync)
      window.removeEventListener('marinestore:selected', sync)
    }
  }, [])

  const selectedPdfs = allPdfs.filter(p => selectedPdfIds.has(p.id))

  const handleTogglePdf = (id) => {
    if (id === 'all') {
      const readyIds = allPdfs.filter(p => p.status === 'ready').map(p => p.id)
      const next = new Set(readyIds)
      setSelectedPdfIdsState(next)
      setSelectedIds(next)
    } else if (id === 'none') {
      setSelectedPdfIdsState(new Set())
      setSelectedIds(new Set())
    } else {
      setSelectedPdfIdsState(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        setSelectedIds(next)
        return next
      })
    }
  }

  // ── Scroll ───────────────────────────────────────────────────────────────
  const currentConv = conversations.find(c => c.id === currentConvId)
  const messages = currentConv?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Conversation management ──────────────────────────────────────────────
  const createNewConversation = () => {
    const newConv = { id: Date.now(), title: 'New Conversation', messages: [], timestamp: new Date() }
    setConversations(prev => [newConv, ...prev])
    setCurrentConvId(newConv.id)
  }

  const deleteConversation = (id, e) => {
    e.stopPropagation()
    if (conversations.length === 1) return
    const filtered = conversations.filter(c => c.id !== id)
    setConversations(filtered)
    if (currentConvId === id) setCurrentConvId(filtered[0].id)
  }

  const updateTitle = (id, text) => {
    setConversations(cs => cs.map(c =>
      c.id === id && c.title === 'New Conversation'
        ? { ...c, title: text.slice(0, 30) + (text.length > 30 ? '…' : '') }
        : c
    ))
  }

  // ── File handling ────────────────────────────────────────────────────────
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [
      ...prev,
      ...files.map(file => ({
        file, type,
        preview: type === 'image' ? URL.createObjectURL(file) : null,
        name: file.name
      }))
    ])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const next = [...prev]
      if (next[index].preview) URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    // Stop streaming if active
    if (isTyping) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      setIsTyping(false)
      return
    }

    if (!input.trim() && attachments.length === 0) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      attachments: [...attachments],
      contextPdfs: [...selectedPdfs], // snapshot which PDFs were active
      timestamp: new Date()
    }
    const botMessageId = Date.now() + 1
    const botMessage = { id: botMessageId, text: '', sender: 'bot', timestamp: new Date() }

    setConversations(cs => cs.map(c =>
      c.id === currentConvId
        ? { ...c, messages: [...c.messages, userMessage, botMessage], timestamp: new Date() }
        : c
    ))

    if (!currentConv.messages.length) updateTitle(currentConvId, input)

    const messageText = input
    const currentAttachments = [...attachments]
    setInput('')
    setAttachments([])
    setIsTyping(true)

    try {
      const formData = new FormData()
      formData.append('user_input', messageText)

      currentAttachments.forEach(a => formData.append('files', a.file))

      // ── Send selected PDF IDs / names as context ──────────────────────
      if (selectedPdfs.length > 0) {
        formData.append('context_pdf_ids', JSON.stringify(selectedPdfs.map(p => p.id)))
        formData.append('context_pdf_names', JSON.stringify(selectedPdfs.map(p => p.name)))
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          setConversations(cs => cs.map(conv => {
            if (conv.id !== currentConvId) return conv
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
              )
            }
          }))
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Error sending message:', error)
      setConversations(cs => cs.map(c =>
        c.id === currentConvId
          ? {
              ...c,
              messages: c.messages.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, text: "I'm having trouble connecting right now. Please try again.", isError: true }
                  : msg
              )
            }
          : c
      ))
    } finally {
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }

  // ── Example prompts ──────────────────────────────────────────────────────
  const examplePrompts = [
    { icon: '🐋', text: 'What are the largest marine mammals?',  gradient: 'from-blue-500 to-cyan-500'    },
    { icon: '🐠', text: 'Identify this fish species',           gradient: 'from-purple-500 to-pink-500'  },
    { icon: '🌊', text: 'Explain coral reef ecosystems',        gradient: 'from-teal-500 to-emerald-500' },
    { icon: '🦈', text: 'Tell me about shark behavior',         gradient: 'from-indigo-500 to-blue-500'  },
  ]

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0f172a] text-gray-100 overflow-hidden">

      {/* ── Shared Sidebar with conversation list passed as children ── */}
      <AppSidebar
        open={sidebarOpen}
        onNewChat={createNewConversation}
      >
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => setCurrentConvId(conv.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
              ${currentConvId === conv.id ? 'bg-gray-800 shadow-lg' : 'hover:bg-gray-800/50'}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-sm truncate text-gray-300">{conv.title}</span>
            </div>
            {conversations.length > 1 && (
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            )}
          </div>
        ))}
      </AppSidebar>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 bg-[#1e293b]/50 backdrop-blur flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-300">Marine Species Assistant</h2>
          </div>

          {/* Active sources pill */}
          {selectedPdfs.length > 0 && (
            <div className="ml-3 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-1">
              <Database className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400">{selectedPdfs.length} source{selectedPdfs.length > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="ml-auto">
            <a href="/login_page" className="text-xs rounded-2xl text-gray-500 flex items-center gap-1 border border-gray-700 px-3 py-1 bg-gray-800/50 hover:bg-gray-800 transition-colors">
              <ParkingCircleOffIcon className="w-4 h-4" />
              <p>{userName}</p>
            </a>
          </div>
        </div>

        {/* PDF Context Bar */}
        <PdfContextBar
          selectedPdfs={selectedPdfs}
          allPdfs={allPdfs}
          onToggle={handleTogglePdf}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto">
              <div className="mb-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#0f172a]" />
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to Marine AI
              </h1>
              <p className="text-gray-400 text-center mb-4 max-w-md">
                Your intelligent assistant for marine biology, species identification, and ocean ecosystems
              </p>

              {allPdfs.length === 0 ? (
                <Link href="/sources"
                  className="mb-8 flex items-center gap-2 text-sm text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 px-4 py-2.5 rounded-xl transition-colors">
                  <Database className="w-4 h-4" />
                  Add PDF sources to supercharge your answers
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="mb-8 flex items-center gap-2 text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedPdfs.length > 0
                    ? `${selectedPdfs.length} source${selectedPdfs.length > 1 ? 's' : ''} active — ask anything!`
                    : `${allPdfs.length} source${allPdfs.length > 1 ? 's' : ''} available — enable above ↑`}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(prompt.text); setTimeout(handleSend, 100) }}
                    className="group relative overflow-hidden bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${prompt.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className="relative flex items-start gap-3">
                      <span className="text-2xl">{prompt.icon}</span>
                      <span className="text-sm text-gray-300 flex-1">{prompt.text}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} isTyping={isTyping && index === messages.length - 1} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-gray-800 bg-[#1e293b]/50 backdrop-blur flex-shrink-0">
          <div className="max-w-3xl mx-auto p-4">

            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-gray-800 rounded-lg p-2 pr-8 flex items-center gap-2 border border-gray-700">
                      {att.type === 'image' ? (
                        <><img src={att.preview} alt={att.name} className="w-10 h-10 object-cover rounded" /><span className="text-xs text-gray-300 truncate max-w-[100px]">{att.name}</span></>
                      ) : (
                        <><FileText className="w-6 h-6 text-cyan-400" /><span className="text-xs text-gray-300 truncate max-w-[100px]">{att.name}</span></>
                      )}
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              {/* Attach button */}
              <div className="relative">
                <button
                  onClick={() => setShowFileMenu(!showFileMenu)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors border border-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {showFileMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 z-20">
                    <button onClick={() => { imageInputRef.current?.click(); setShowFileMenu(false) }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-left">
                      <Image className="w-4 h-4 text-cyan-400" /><span className="text-sm">Upload Image</span>
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false) }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-left">
                      <FileText className="w-4 h-4 text-emerald-400" /><span className="text-sm">Upload Document</span>
                    </button>
                  </div>
                )}
              </div>

              <input type="file" ref={imageInputRef} onChange={e => handleFileChange(e, 'image')} accept="image/*" className="hidden" multiple />
              <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e, 'file')} accept=".pdf,.doc,.docx,.txt" className="hidden" multiple />

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={selectedPdfs.length > 0
                    ? `Ask about your ${selectedPdfs.length} source${selectedPdfs.length > 1 ? 's' : ''}…`
                    : 'Ask about marine species…'}
                  rows={1}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 placeholder-gray-500 resize-none max-h-32"
                  style={{ minHeight: '44px' }}
                />
              </div>

              {/* Send / Stop */}
              <button
                onClick={handleSend}
                disabled={!isTyping && !input.trim() && attachments.length === 0}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg
                  ${isTyping
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed hover:shadow-cyan-500/50 disabled:shadow-none'}`}
              >
                {isTyping
                  ? <X className="w-4 h-4 text-white" />
                  : <SendHorizontal className="w-5 h-5" />}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Marine AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}