// Reuse the single source of truth for templates (all 6 live in TemplateGallery
// and are shared with the editor's "Change template" modal) so this step can
// never drift out of sync with what the app actually supports.
import { TEMPLATES, TemplateThumbnail } from '../TemplateGallery'

export function TemplateSelection({ selectedTemplate, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            aria-pressed={selectedTemplate === template.id}
            className={`relative group rounded-xl border-2 p-3 sm:p-4 text-left transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              selectedTemplate === template.id
                ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 shadow-lg'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="mb-3 overflow-hidden rounded-lg ring-1 ring-slate-200/70 shadow-sm">
              <TemplateThumbnail template={template.id} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{template.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2.5 right-2.5 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
