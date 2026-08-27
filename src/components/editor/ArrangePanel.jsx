// Floating "Arrange" panel that overlays the live preview. Lets the user drag
// to reorder sections, toggle their visibility, and tune the photo — all while
// the resume reflows live behind it. Reuses the same tested controls as the
// Customize form (SectionManager + PhotoControls) so behaviour stays consistent.
import { SectionManager } from '../SectionManager'
import { PhotoControls } from '../PhotoControls'

export function ArrangePanel({
  resume,
  reorderSections,
  toggleSectionVisibility,
  renameSection,
  updateTheme,
  onClose,
}) {
  const hasPhoto = !!resume?.personalInfo?.photo

  return (
    <div
      className="absolute top-4 left-4 z-30 w-[300px] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      style={{ animation: 'cvModalIn 0.2s cubic-bezier(0.34,1.4,0.64,1) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-indigo-500 text-base">⇅</span>
          <h3 className="text-sm font-bold text-slate-900">Arrange</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Done"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <SectionManager
          sectionConfig={resume?.sectionConfig || []}
          onReorder={reorderSections}
          onToggleVisibility={toggleSectionVisibility}
          onRename={renameSection}
        />

        {/* Photo */}
        <div className="pt-1 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mt-4 mb-2">Photo</h3>
          {hasPhoto ? (
            <PhotoControls theme={resume?.meta?.theme} updateTheme={updateTheme} hasPhoto />
          ) : (
            <p className="text-xs text-slate-400">
              Add a photo in <span className="font-medium text-slate-500">Personal Info</span> to position and resize it here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
