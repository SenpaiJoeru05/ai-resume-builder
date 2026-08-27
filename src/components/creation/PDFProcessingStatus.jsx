import { useEffect, useState } from 'react'

// The import has two phases with very different characters: text extraction is
// fast and genuinely measurable (we know the page count), while the AI parse is
// a single opaque request of a few seconds. Showing one static label for both
// reads as a hang, so each phase gets the strongest honest signal it has —
// real page counts for extraction, elapsed time plus a settling bar for the AI.

const STAGES = [
  { key: 'read',    label: 'Reading your file',        hint: 'Opening the document' },
  { key: 'extract', label: 'Extracting the text',      hint: 'Pulling out every page' },
  { key: 'parse',   label: 'Understanding your career', hint: 'Sorting experience, education and skills' },
]

// Weights reflect how long each phase actually takes, so the bar advances at a
// roughly even rate rather than stalling through the longest step.
const STAGE_WEIGHT = { read: 0.1, extract: 0.25, parse: 0.65 }

// retrySecondsLeft is owned by the parent and arrives as a plain number, so this
// component stays pure — no clock reads during render.
export function PDFProcessingStatus({ stage, fileName, pageProgress, retrySecondsLeft = 0 }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - started) / 1000), 100)
    return () => clearInterval(id)
  }, [])

  const waitLeft = retrySecondsLeft

  const activeIndex = Math.max(0, STAGES.findIndex((s) => s.key === stage))

  // Completed phases contribute their full weight; the active one contributes a
  // fraction. Extraction knows its true fraction from the page count. The AI call
  // can't report progress, so it eases toward — but never reaches — its full
  // weight, which keeps the bar honest: it only completes when the work does.
  let progress = 0
  for (let i = 0; i < activeIndex; i++) progress += STAGE_WEIGHT[STAGES[i].key]

  const activeKey = STAGES[activeIndex].key
  if (activeKey === 'extract' && pageProgress?.totalPages) {
    progress += STAGE_WEIGHT.extract * (pageProgress.page / pageProgress.totalPages)
  } else if (activeKey === 'parse') {
    // Approaches 1 asymptotically: ~63% of the phase at 4s, ~86% at 8s, never 100%.
    progress += STAGE_WEIGHT.parse * (1 - Math.exp(-Math.max(0, elapsed - 1) / 4))
  }

  const pct = Math.min(97, Math.round(progress * 100))

  return (
    <div className="w-full max-w-md mx-auto">
      <style>{`
        @keyframes pdfimport-sheen {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes pdfimport-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: .55; transform: scale(.9); }
        }
        @keyframes pdfimport-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pdfimport-sheen::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: pdfimport-sheen 1.4s ease-in-out infinite;
        }
        .pdfimport-row { animation: pdfimport-rise .32s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .pdfimport-sheen::after { animation: none; }
          .pdfimport-row { animation: none; }
          .pdfimport-dot { animation: none !important; }
        }
      `}</style>

      {/* File being read */}
      {fileName && (
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-600">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <span className="truncate max-w-[16rem] font-medium">{fileName}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-1.5">
        <div
          className="pdfimport-sheen relative h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out overflow-hidden"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-6 tabular-nums">
        <span>{pct}%</span>
        <span>{elapsed.toFixed(0)}s</span>
      </div>

      {/* Stage checklist */}
      <div className="space-y-3 text-left">
        {STAGES.map((s, i) => {
          const done = i < activeIndex
          const active = i === activeIndex
          return (
            <div
              key={s.key}
              className={`pdfimport-row flex items-start gap-3 ${done || active ? '' : 'opacity-40'}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : active ? (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>

              <div className="min-w-0">
                <p className={`text-sm font-medium leading-tight ${active ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-500'}`}>
                  {s.label}
                  {active && s.key === 'extract' && pageProgress?.totalPages > 0 && (
                    <span className="ml-1.5 text-indigo-600 tabular-nums font-normal">
                      page {Math.max(1, pageProgress.page)} of {pageProgress.totalPages}
                    </span>
                  )}
                </p>
                {active && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    {s.hint}
                    <span className="pdfimport-dot inline-block w-1 h-1 rounded-full bg-indigo-500" style={{ animation: 'pdfimport-pulse 1s ease-in-out infinite' }} />
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* A rate-limit pause is the one case where the honest thing is to say
          "we are deliberately waiting", not "still working". */}
      {waitLeft > 0 ? (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
          <p className="text-xs text-amber-900 text-center">
            The AI service hit its free-tier request limit. Waiting{' '}
            <span className="font-semibold tabular-nums">{waitLeft}s</span> and retrying
            automatically — no need to do anything.
          </p>
        </div>
      ) : elapsed > 12 && (
        <p className="text-xs text-slate-400 mt-6 text-center">
          Taking longer than usual — larger resumes need a little more time.
        </p>
      )}
    </div>
  )
}
