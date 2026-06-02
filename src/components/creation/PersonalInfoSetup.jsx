export function PersonalInfoSetup({ data, onChange }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Contact Information</h2>
        <p className="text-slate-600">Add your basic contact details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.fullName || ''}
              onChange={(e) => onChange({ ...data, fullName: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => onChange({ ...data, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              placeholder="San Francisco, CA"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Professional Links (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">Add LinkedIn, GitHub, Portfolio, etc.</p>
          <div className="space-y-2">
            {(data.links || []).map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => {
                    const newLinks = [...(data.links || [])]
                    newLinks[index] = { ...newLinks[index], label: e.target.value }
                    onChange({ ...data, links: newLinks })
                  }}
                  placeholder="Label (e.g., LinkedIn)"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={link.url || ''}
                  onChange={(e) => {
                    const newLinks = [...(data.links || [])]
                    newLinks[index] = { ...newLinks[index], url: e.target.value }
                    onChange({ ...data, links: newLinks })
                  }}
                  placeholder="URL"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newLinks = (data.links || []).filter((_, i) => i !== index)
                    onChange({ ...data, links: newLinks })
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...data, links: [...(data.links || []), { label: '', url: '' }] })}
              className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-700 transition"
            >
              + Add Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
