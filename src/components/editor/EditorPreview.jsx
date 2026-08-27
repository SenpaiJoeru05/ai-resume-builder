// EditorPreview.jsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { ResumePreview } from '../ResumePreview'
import { getResumePageSize } from '../../utils/pageSizes'

const SIDE_PAD = 48

export function EditorPreview({
  resume,
  template,
  onTemplateChange,
  showTemplateGallery,
  setShowTemplateGallery,
  TemplateGallery,
  currentPage = 1,
  onPageCountChange,
  onPageChange,
}) {
  // Paper size comes from the resume, so the fit-to-width scaler and the
  // rendered page always agree with what the PDF will be.
  const { width: pageW, height: pageH } = getResumePageSize(resume)

  const selectedTemplate = template || 'modern'
  const panelRef = useRef(null)
  const [scale, setScale]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fit the A4 paper width into the available panel width
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth - SIDE_PAD * 2
      setScale(Math.min(1, available / pageW))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePageCount = useCallback((n) => {
    setTotalPages(n)
    onPageCountChange?.(n)
  }, [onPageCountChange])

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: 'inherit' }}>
      <style>{`
        /* dot-grid canvas */
        .cv-canvas {
          background-color: #f0f2f7;
          background-image: radial-gradient(circle, #c8cfdc 1px, transparent 1px);
          background-size: 20px 20px;
        }
        /* subtle inner glow */
        .cv-canvas-inner {
          background: radial-gradient(
            ellipse 80% 50% at 50% 20%,
            rgba(99,102,241,0.04) 0%,
            transparent 70%
          );
        }
        /* the paper card */
        .cv-paper {
          background: #ffffff;
          transform-origin: top center;
          border-radius: 2px;
          box-shadow:
            0 1px 2px  rgba(0,0,0,0.08),
            0 4px 12px rgba(0,0,0,0.08),
            0 16px 40px rgba(0,0,0,0.07),
            0 32px 64px rgba(0,0,0,0.05),
            0 0 0 0.5px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        /* scrollbar */
        .cv-canvas::-webkit-scrollbar { width: 5px; }
        .cv-canvas::-webkit-scrollbar-track { background: transparent; }
        .cv-canvas::-webkit-scrollbar-thumb {
          background: rgba(148,155,200,0.3);
          border-radius: 99px;
        }
        .cv-canvas::-webkit-scrollbar-thumb:hover {
          background: rgba(148,155,200,0.5);
        }
        /* template gallery modal */
        @keyframes cvModalIn {
          from { opacity:0; transform:scale(0.94) translateY(12px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
      `}</style>

      {/* ══ SCROLLABLE CANVAS ══ */}
      <div
        ref={panelRef}
        className="cv-canvas flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,155,200,0.3) transparent' }}
      >
        <div
          className="cv-canvas-inner"
          style={{
            padding:         `${SIDE_PAD}px ${SIDE_PAD}px ${SIDE_PAD * 2}px`,
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            minHeight:       '100%',
          }}
        >
          {/*
            Flow wrapper — reserves exactly the scaled paper footprint so
            the scrollable area sizes correctly.
            The paper itself is full A4 width, CSS-scaled down to fit.
          */}
          <div
            style={{
              position:  'relative',
              width:     pageW * scale,
              height:    pageH * scale,
              flexShrink: 0,
            }}
          >
            <div
              className="cv-paper"
              style={{
                width:           pageW,
                height:          pageH,
                transform:       `scale(${scale})`,
                transformOrigin: 'top left',
                position:        'absolute',
                top:             0,
                left:            0,
              }}
            >
              <ResumePreview
                resume={resume}
                template={selectedTemplate}
                currentPage={currentPage}
                onPageCountChange={handlePageCount}
              />
            </div>
          </div>

          {/* Page indicator pill below the paper */}
          {totalPages > 1 && (
            <div
              style={{
                marginTop:    16 * scale,
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                background:   'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                border:       '1px solid rgba(200,207,220,0.6)',
                borderRadius: 99,
                padding:      '4px 12px',
                fontSize:     11,
                fontWeight:   600,
                color:        '#64748b',
                letterSpacing: '0.04em',
                userSelect:   'none',
              }}
            >
              <span style={{ color: '#6366f1' }}>●</span>
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* ══ TEMPLATE GALLERY MODAL ══ */}
      {showTemplateGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(8,9,18,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            style={{ animation: 'cvModalIn 0.22s cubic-bezier(0.34,1.4,0.64,1) both' }}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Choose a Template</h2>
                <p className="text-xs text-slate-500 mt-0.5">All templates are ATS-friendly and recruiter-approved</p>
              </div>
              <button
                onClick={() => setShowTemplateGallery(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TemplateGallery
                selectedTemplate={selectedTemplate}
                onSelect={(t) => { onTemplateChange(t); setShowTemplateGallery(false) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}