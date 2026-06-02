import { useRouting } from '../../hooks/useRouting'

export function Header({ showBackButton = false, backTo = 'dashboard', title = '', actions = [] }) {
  const { goToDashboard, goToLanding } = useRouting()
  
  const handleBack = () => {
    if (backTo === 'landing') {
      goToLanding()
    } else {
      goToDashboard()
    }
  }
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Resume Builder</h1>
              {title && <p className="text-slate-600 text-sm mt-0.5">{title}</p>}
            </div>
          </div>
          {actions.length > 0 && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
