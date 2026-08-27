// PreviewPage.jsx

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useResume } from '../hooks/useResume'
import { useRouting } from '../hooks/useRouting'
import { Button } from '../components/shared/Button'
import { ResumePreview } from '../components/ResumePreview'
import { getResumePageSize } from '../utils/pageSizes'
import { generateResumePDF, saveBlobAsFile } from '../services/pdfDownloadService'

export function PreviewPage() {
  const { resumeId } = useParams()
  const { goToDashboard, goToEditor } = useRouting()
  const { resume, activeResumeId, setActiveResumeId } = useResume()
  const [zoom, setZoom] = useState(100)
  const [scrolled, setScrolled] = useState(false)

  // Set the active resume based on URL param
  useEffect(() => {
    if (resumeId && activeResumeId !== resumeId) {
      setActiveResumeId(resumeId)
    }
  }, [resumeId, activeResumeId, setActiveResumeId])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { width: pageW, height: pageH } = getResumePageSize(resume)
  const selectedTemplate = resume.meta?.template || 'modern'
  const resumeTitle = resume.meta?.title || 'My Resume'

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      const blob = await generateResumePDF({ resume, template: selectedTemplate })
      saveBlobAsFile(blob, `${resumeTitle}.pdf`)
    } catch (error) {
      console.error('Download error:', error)
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .gradient-text { background: linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .preview-grid { background-image: radial-gradient(circle, #e0e7ff 1px, transparent 1px); background-size: 28px 28px; }
        .zoom-control-btn { transition: all 0.2s ease; }
        .zoom-control-btn:hover:not(:disabled) { transform: scale(1.05); }
        .zoom-control-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media print {
          body { background: white; }
          nav, .action-bar, .tips-section, .zoom-controls { display: none !important; }
          .preview-container { background: white !important; padding: 0 !important; }
          .preview-shadow { box-shadow: none !important; }
          .min-h-screen { min-height: auto; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={goToDashboard} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">ResumeAI</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-medium text-slate-600">Preview</span>
            </div>
          </div>
          <button onClick={goToDashboard} className="text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div className="pt-16">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 overflow-hidden">
          <div className="absolute inset-0 preview-grid opacity-10 pointer-events-none"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-violet-500/30 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {resumeTitle}
                </h1>
                <p className="text-indigo-200 text-sm">
                  Template: <span className="text-white font-semibold capitalize">{selectedTemplate}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 w-fit">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-white text-sm font-medium">{resumeTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Action Bar */}
        <div className="action-bar bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Zoom Controls */}
            <div className="zoom-controls flex items-center gap-2 bg-slate-50 rounded-xl p-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="zoom-control-btn p-2 hover:bg-white rounded-lg transition-all"
                title="Zoom out"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <div className="px-3 py-1.5 bg-white rounded-lg">
                <span className="text-sm font-semibold text-slate-700 min-w-[40px] text-center block">{zoom}%</span>
              </div>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                className="zoom-control-btn p-2 hover:bg-white rounded-lg transition-all"
                title="Zoom in"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={handleResetZoom}
                className="zoom-control-btn px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white rounded-lg transition-all"
                title="Reset zoom"
              >
                Reset
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => goToEditor(resumeId)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="preview-container bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 sm:p-8 overflow-auto min-h-[900px] flex justify-center items-start">
          <div 
            className="preview-shadow bg-white rounded-lg transition-transform duration-200"
            style={{ 
              width: `${pageW}px`,
              minHeight: `${pageH}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
          >
            <ResumePreview resume={resume} template={selectedTemplate} />
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Preview Tips</h3>
                <ul className="space-y-1.5 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Use zoom controls to see details clearly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Click <span className="font-semibold">"Edit Resume"</span> to make changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><span className="font-semibold">"Download PDF"</span> for sharing with recruiters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><span className="font-semibold">"Print"</span> directly from your browser for best quality</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
