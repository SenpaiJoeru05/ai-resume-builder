import { Button } from '../shared/Button'

export function EditorHeader({ 
  resumeTitle, 
  onTitleChange, 
  saveStatus, 
  onTemplateChange, 
  onDownload, 
  onAutoFill,
  onBackToDashboard 
}) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 w-64"
                placeholder="Untitled Resume"
              />
              <p className="text-slate-600 text-sm mt-0.5">AI Resume Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Autosave indicator */}
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
              {saveStatus === 'saving' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              )}
            </span>
            <Button variant="outline" onClick={onTemplateChange}>
              Change Template
            </Button>
            <Button 
              variant="secondary" 
              onClick={onAutoFill}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto Fill
            </Button>
            <Button variant="success" onClick={onDownload}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
