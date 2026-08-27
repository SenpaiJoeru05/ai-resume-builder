import { useState, useEffect, useRef } from 'react'

// A resume in the dashboard grid.
//
// The previous version had the priorities inverted: opening the resume — the
// thing you do 95% of the time — had no visible control at all (you had to
// guess that the card was clickable), while Duplicate and Delete each got a
// permanent button, so every card advertised its two rarest actions. Now Open
// is the explicit primary and the destructive/secondary pair lives behind a
// "more" menu.
// `now` is passed in rather than read here: calling Date.now() during render
// is impure and makes the output non-idempotent.
export function ResumeCard({ resume, isActive, onSelect, onDuplicate, onDelete, canDelete, now }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onAway = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onAway)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onAway)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const days = Math.floor((now - date.getTime()) / 864e5)
    // Relative time is what you actually want when scanning for "the one I was
    // just working on"; an absolute date makes you do the arithmetic yourself.
    if (days === 0) return 'Edited today'
    if (days === 1) return 'Edited yesterday'
    if (days < 7) return `Edited ${days} days ago`
    if (days < 30) return `Edited ${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`
    return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const name = resume.personalInfo?.fullName?.trim()
  const role = resume.professionalInfo?.jobTitle?.trim()

  // How complete is it? A card that says "3 sections left" is more useful than
  // one that just repeats the title, and it nudges you back to unfinished work.
  const filled = [
    !!name,
    !!resume.summary?.trim(),
    (resume.experience?.length ?? 0) > 0,
    (resume.education?.length ?? 0) > 0,
    (resume.skills?.length ?? 0) > 0,
  ]
  const done = filled.filter(Boolean).length
  const complete = done === filled.length

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 ${
        isActive ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
      }`}
    >
      {/* Header: title + overflow menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 leading-snug truncate">{resume.meta.title}</h4>
          <p className="text-sm text-slate-600 truncate mt-0.5">{name || 'Unnamed'}</p>
          {role && <p className="text-xs text-slate-400 truncate">{role}</p>}
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`More actions for ${resume.meta.title}`}
            aria-expanded={menuOpen}
            className="p-1.5 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-20">
              <button
                onClick={() => { setMenuOpen(false); onDuplicate(resume.meta.id) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Duplicate
              </button>
              {canDelete && (
                <button
                  onClick={() => { setMenuOpen(false); setConfirmingDelete(true) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap text-xs mb-4">
        <span className="text-slate-400">{formatDate(resume.meta.updatedAt)}</span>
        <span className="text-slate-300">·</span>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium capitalize">
          {resume.meta.template}
        </span>
        {!complete && (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">
            {filled.length - done} section{filled.length - done === 1 ? '' : 's'} left
          </span>
        )}
      </div>

      {/* Primary action — was previously invisible */}
      <button
        onClick={onSelect}
        className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        Open
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Inline delete confirm. window.confirm() is jarring, unstyled, and on
          some browsers can be suppressed entirely — which would have deleted
          without asking. */}
      {confirmingDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-5 text-center z-30">
          <p className="text-sm font-semibold text-slate-900 mb-1">Delete this resume?</p>
          <p className="text-xs text-slate-500 mb-4">
            &ldquo;{resume.meta.title}&rdquo; will be gone for good.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirmingDelete(false)}
              className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmingDelete(false); onDelete(resume.meta.id) }}
              className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
