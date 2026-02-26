/**
 * pdfStore.js
 * A lightweight cross-page store backed by sessionStorage so selected PDFs
 * survive Next.js client-side navigation without a full state-management lib.
 * 
 * Usage:
 *   import { getPdfs, setPdfs, getSelectedIds, setSelectedIds } from '@/lib/pdfStore'
 */

const PDFS_KEY = 'marine_pdfs'
const SELECTED_KEY = 'marine_selected_ids'

// ── helpers ───────────────────────────────────────────────────────────────────
const isBrowser = typeof window !== 'undefined'

export const getPdfs = () => {
  if (!isBrowser) return []
  try { return JSON.parse(sessionStorage.getItem(PDFS_KEY) || '[]') } catch { return [] }
}

export const setPdfs = (pdfs) => {
  if (!isBrowser) return
  sessionStorage.setItem(PDFS_KEY, JSON.stringify(pdfs))
  window.dispatchEvent(new CustomEvent('marinestore:pdfs', { detail: pdfs }))
}

export const getSelectedIds = () => {
  if (!isBrowser) return []
  try { return JSON.parse(sessionStorage.getItem(SELECTED_KEY) || '[]') } catch { return [] }
}

export const setSelectedIds = (ids) => {
  if (!isBrowser) return
  sessionStorage.setItem(SELECTED_KEY, JSON.stringify([...ids]))
  window.dispatchEvent(new CustomEvent('marinestore:selected', { detail: [...ids] }))
}

// Convenience: get the full PDF objects that are currently selected
export const getSelectedPdfs = () => {
  const pdfs = getPdfs()
  const ids = new Set(getSelectedIds())
  return pdfs.filter(p => ids.has(p.id))
}