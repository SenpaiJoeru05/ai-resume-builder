// DashboardPage.jsx

import { useState } from 'react'
import { useRouting } from '../hooks/useRouting'
import { useResume } from '../hooks/useResume'
import { ResumeCard } from '../components/dashboard/ResumeCard'

// ─── Stat Card ────────────────────────────────────────────────────
// ─── Quick Action Card ────────────────────────────────────────────
// ─── Empty State ──────────────────────────────────────────────────
// Clock captured once at load. Reading Date.now() during render is impure, and
// these labels only need day granularity, so a per-load value is accurate enough.
const PAGE_LOADED_AT = Date.now();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Was duplicated verbatim in the filter and in the recent count.
const isRecent = (updatedAt) =>
  new Date(updatedAt).getTime() > PAGE_LOADED_AT - WEEK_MS;

function EmptyState({ onCreateResume }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
          📄
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">+</span>
        </div>
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
        No resumes yet
      </h3>
      <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
        Create your first AI-powered resume in minutes and start landing interviews.
      </p>
      <button
        onClick={onCreateResume}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Create My First Resume
      </button>
    </div>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────
export function DashboardPage() {
  const { goToCreateFromScratch, goToCreateFromPDF, goToEditor, goToLanding } = useRouting()
  const { resumes, activeResumeId, setActiveResumeId, createResume, deleteResume, duplicateResume } = useResume()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  // Scroll effect for header
  useState(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  })

  const filteredResumes = [...resumes]
    .filter(resume => {
      const matchesSearch = resume.meta.title?.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false
      if (filter === 'recent') return isRecent(resume.meta.updatedAt)
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.meta.updatedAt) - new Date(a.meta.updatedAt)
      if (sortBy === 'name') return a.meta.title.localeCompare(b.meta.title)
      if (sortBy === 'template') return a.meta.template.localeCompare(b.meta.template)
      return 0
    })

  const handleSelectResume = (resumeId) => {
    try {
      setActiveResumeId(resumeId)
      goToEditor(resumeId)
    } catch (error) {
      console.error('Error selecting resume:', error)
      alert('Failed to open resume. Please try again.')
    }
  }

  // Most recently edited resume — drives the hero subtitle and the tip CTA.
  // True first run: the single resume is the untouched default the hook seeds,
  // not something the user actually made.
  const isFirstRun =
    resumes.length === 1 &&
    resumes[0].meta.id === 'default' &&
    !resumes[0].personalInfo?.fullName?.trim() &&
    !resumes[0].summary?.trim() &&
    (resumes[0].experience?.length ?? 0) === 0;

  const lastEdited = [...resumes].sort(
    (a, b) => new Date(b.meta.updatedAt || 0) - new Date(a.meta.updatedAt || 0)
  )[0];

  const recentCount = resumes.filter(r => isRecent(r.meta.updatedAt)).length

  return (
    <div
      className="min-h-screen bg-white font-sans"
      style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .dash-grid { background-image: radial-gradient(circle, #e0e7ff 1px, transparent 1px); background-size: 28px 28px; }
        .gradient-text { background: linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-hover { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15); }
        .resume-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
        @media (min-width: 1280px) { .resume-grid { grid-template-columns: repeat(3, 1fr); } }
        .filter-pill { transition: all 0.15s ease; }
        .filter-pill.active { background: #4f46e5; color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
        .search-glow:focus-within { box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <button onClick={goToLanding} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">ResumeAI</span>
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-medium text-slate-600">My Resumes</span>
            </div>
          </div>

          {/* Nav Right */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={goToCreateFromPDF}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import PDF
            </button>
            <button
              onClick={goToCreateFromScratch}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Resume
            </button>
          </div>
        </div>
      </nav>

      {/* ── HEADER BANNER ── */}
      <div className="pt-16">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 overflow-hidden">
          <div className="absolute inset-0 dash-grid opacity-10 pointer-events-none"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-violet-500/30 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-200 text-sm font-medium">👋 Welcome back</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  My Resumes
                </h1>
                <p className="text-indigo-200 text-sm mt-1">
                  {isFirstRun
                    ? 'Create your first resume to get started'
                    : <>Last edited &ldquo;{lastEdited.meta.title}&rdquo;</>}
                </p>
              </div>

              {/* Stat pills — meaningless before the first real resume exists */}
              <div className={`flex items-center gap-2 flex-wrap ${isFirstRun ? 'hidden' : ''}`}>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-white text-lg font-bold">{resumes.length}</span>
                  <span className="text-indigo-100 text-xs font-medium">Total</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-white text-lg font-bold">{recentCount}</span>
                  <span className="text-indigo-100 text-xs font-medium">This week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">


        {/* Searching and sorting are noise when there is nothing to search yet. */}
        {!isFirstRun && (
          <>
          {/* ── FILTER / SEARCH BAR ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-xs search-glow rounded-xl transition-all">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search resumes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:bg-white transition-all"
              />
            </div>
  
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              {[{ value: 'all', label: 'All' }, { value: 'recent', label: 'Recent' }].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`filter-pill px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f.value
                      ? 'active'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
  
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-sm text-slate-700 font-medium cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="date">Latest first</option>
                <option value="name">Name A–Z</option>
                <option value="template">By template</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
  
            {/* Result count */}
            {searchQuery && (
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                {filteredResumes.length} result{filteredResumes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
  
          {/* ── SECTION HEADING ── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              {filter === 'recent' ? 'Recent Resumes' : 'All Resumes'}
            </h2>
            {filteredResumes.length > 0 && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredResumes.length}
              </span>
            )}
          </div>
  
          </>
        )}

        {/* ── RESUME GRID ── */}
        {isFirstRun ? (
          <EmptyState onCreateResume={() => createResume('My First Resume')} />
        ) : filteredResumes.length > 0 ? (
          <div className="resume-grid">
            {/* New resume card */}
            <button
              onClick={goToCreateFromScratch}
              className="group relative bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center gap-3 card-hover"
            >
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center transition-colors duration-200 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">New Resume</p>
                <p className="text-xs text-slate-400 mt-0.5">Start from scratch</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </button>

            {filteredResumes.map(resume => (
              <ResumeCard
                key={resume.meta.id}
                resume={resume}
                isActive={resume.meta.id === activeResumeId}
                onSelect={() => handleSelectResume(resume.meta.id)}
                onDuplicate={duplicateResume}
                onDelete={deleteResume}
                canDelete={resumes.length > 1}
                now={PAGE_LOADED_AT}
              />
            ))}
          </div>
        ) : (
          /* No results for search */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No results found</h3>
            <p className="text-sm text-slate-500">Try a different search term or clear the filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setFilter('all'); }}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── TIPS BANNER ── */}
        {!isFirstRun && (
          <div className="mt-10 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">💡</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 mb-0.5">Pro tip: Tailor each resume to a job posting</p>
              <p className="text-xs text-slate-500 leading-relaxed">Open any resume, go to "Tailor to Job", and paste a job description. Our AI will optimize your resume to beat ATS filters.</p>
            </div>
            <button
              onClick={() => lastEdited && handleSelectResume(lastEdited.meta.id)}
              className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 bg-white rounded-xl px-4 py-2.5 transition-all whitespace-nowrap"
            >
              Open {lastEdited ? `“${lastEdited.meta.title}”` : 'a resume'} →
            </button>
          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-500">ResumeAI</span>
            <span>© 2026</span>
          </div>
          {/* Was Privacy / Terms / Help as href="#" — three links to pages that
              don't exist. Replaced with something true and actually useful. */}
          <p>Resumes are saved in this browser only.</p>
        </div>
      </footer>
    </div>
  )
}

export default DashboardPage