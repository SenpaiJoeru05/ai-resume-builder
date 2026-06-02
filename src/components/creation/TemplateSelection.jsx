const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with accent colors',
    preview: (
      <div className="w-full h-full bg-white border border-slate-200 rounded-lg p-4">
        <div className="border-b-2 border-blue-600 pb-2 mb-2">
          <div className="h-4 bg-slate-800 rounded w-3/4 mb-1"></div>
          <div className="flex gap-2">
            <div className="h-2 bg-slate-400 rounded w-1/4"></div>
            <div className="h-2 bg-slate-400 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-400 rounded w-full"></div>
          <div className="h-2 bg-slate-400 rounded w-5/6"></div>
          <div className="h-2 bg-slate-400 rounded w-4/6"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif font with elegant layout',
    preview: (
      <div className="w-full h-full bg-white border border-slate-200 rounded-lg p-4" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="text-center border-b-2 border-slate-800 pb-2 mb-2">
          <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto mb-1"></div>
          <div className="flex justify-center gap-2">
            <div className="h-2 bg-slate-400 rounded w-1/5"></div>
            <div className="h-2 bg-slate-400 rounded w-1/5"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-400 rounded w-full"></div>
          <div className="h-2 bg-slate-400 rounded w-5/6"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Lightweight design with clean typography',
    preview: (
      <div className="w-full h-full bg-white border border-slate-200 rounded-lg p-4">
        <div className="mb-2">
          <div className="h-4 bg-slate-800 rounded w-1/2 mb-1"></div>
          <div className="flex gap-2">
            <div className="h-2 bg-slate-400 rounded w-1/4"></div>
            <div className="h-2 bg-slate-400 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-400 rounded w-full"></div>
          <div className="h-2 bg-slate-400 rounded w-5/6"></div>
        </div>
      </div>
    ),
  },
];

export function TemplateSelection({ selectedTemplate, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose a Template</h2>
        <p className="text-slate-600">Select a professional template to get started</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative group rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="aspect-[3/4] mb-4 overflow-hidden rounded bg-gradient-to-br from-slate-50 to-slate-100 p-4">
              {template.preview}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900">{template.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
