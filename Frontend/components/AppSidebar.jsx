'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Database, Plus, Sparkles, Clock } from 'lucide-react'

const NAV = [
  { icon: MessageSquare, label: 'Chat',    href: '/chatbot' },
  { icon: Database,      label: 'Sources', href: '/sources' },
]

export default function AppSidebar({ open, onNewChat, children }) {
  const pathname = usePathname()

  return (
    <aside
      className={`
        ${open ? 'w-64' : 'w-0'}
        transition-all duration-300 bg-[#1e293b] border-r border-gray-800
        flex flex-col overflow-hidden flex-shrink-0 h-full
      `}
    >
      {/* Logo + new button */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-200 text-sm whitespace-nowrap">Marine Species AI</span>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all shadow-lg hover:shadow-cyan-500/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />New Chat
        </button>
      </div>

      {/* Nav links */}
      <nav className="p-3 space-y-1 flex-shrink-0 border-b border-gray-800">
        {NAV.map(({ icon: Icon, label, href }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Scrollable slot — conversation list passed as children from chatbot page */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {children}
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-600 flex items-center gap-2 whitespace-nowrap flex-shrink-0">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />Last sync: just now
      </div>
    </aside>
  )
}