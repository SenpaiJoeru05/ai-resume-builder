// EditorPreview.jsx

import { useRef, useEffect, useState } from 'react'
import { ResumePreview } from '../ResumePreview'

const A4_WIDTH  = 794
const A4_HEIGHT = 1123
const SIDE_PAD  = 48

export function EditorPreview({
  resume,
  template,
  onTemplateChange,
  showTemplateGallery,
  setShowTemplateGallery,
  TemplateGallery,
}) {
  const selectedTemplate = template || 'modern'
  const panelRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth - SIDE_PAD * 2
      setScale(Math.min(1, available / A4_WIDTH))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scaledMinH = A4_HEIGHT * scale

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: 'inherit' }}>
      <style>{`
        /* full-bleed dot-grid canvas */
        .cv-canvas {
          background-color: #ffffff;
          background-image: radial-gradient(circle, #E2E8F0 1px, transparent 1px);
          background-size: 20px 20px;
        }
        /* very soft centre spotlight so the paper area feels lit */
        .cv-canvas-inner {
          background: radial-gradient(
            ellipse 70% 60% at 50% 30%,
            rgba(99,102,241,0.05) 0%,
            transparent 70%
          );
        }
        /* floating paper */
        .cv-paper {
          background: #ffffff;
          transform-origin: top left;
          border-radius: 2px;
          box-shadow:
            0 1px 3px  rgba(0,0,0,0.12),
            0 4px 16px rgba(0,0,0,0.1),
            0 16px 48px rgba(0,0,0,0.08),
            0 40px 80px rgba(0,0,0,0.05),
            0 0 0 0.5px rgba(0,0,0,0.05);
          overflow: visible;
        }
        /* thin dashed page-break line */
        .cv-pagebreak {
          position: absolute;
          left: 0; right: 0;
          border-top: 1px dashed rgba(148,155,255,0.2);
          pointer-events: none;
        }
        /* page label pill */
        .cv-page-label {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -26px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(180,185,255,0.5);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          padding: 2px 10px;
          border-radius: 99px;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        /* scrollbar */
        .cv-canvas::-webkit-scrollbar { width: 4px; }
        .cv-canvas::-webkit-scrollbar-track { background: transparent; }
        .cv-canvas::-webkit-scrollbar-thumb {
          background: rgba(148,155,255,0.25);
          border-radius: 99px;
        }
        /* modal */
        @keyframes cvModalIn {
          from { opacity:0; transform:scale(0.94) translateY(12px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
      `}</style>

      {/* ══ CANVAS ══ */}
      <div
        ref={panelRef}
        className="cv-canvas flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,155,255,0.25) transparent' }}
      >
        {/* inner spotlight layer */}
        <div
          className="cv-canvas-inner"
          style={{
            padding: `${SIDE_PAD}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* flow wrapper — sized to scaled paper height */}
          <div style={{ position: 'relative', width: A4_WIDTH * scale }}>

            {/* THE PAPER */}
            <div
              className="cv-paper"
              style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
            >
              <ResumePreview resume={resume} template={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>

      {/* print footer */}
      <div className="hidden print:block text-xs text-center py-1">
        Page <span className="page-number" />
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