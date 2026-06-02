export function JobTargetSetup({ data, onChange }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">What job are you targeting?</h2>
        <p className="text-slate-600">This helps AI tailor your resume to the right role</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Target Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.jobTitle || ''}
            onChange={(e) => onChange({ ...data, jobTitle: e.target.value })}
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.industry || ''}
            onChange={(e) => onChange({ ...data, industry: e.target.value })}
            placeholder="e.g., Technology, Healthcare, Finance"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Years of Experience
          </label>
          <select
            value={data.yearsExperience || ''}
            onChange={(e) => onChange({ ...data, yearsExperience: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years (Entry Level)</option>
            <option value="1-3">1-3 years (Junior)</option>
            <option value="3-5">3-5 years (Mid-Level)</option>
            <option value="5-10">5-10 years (Senior)</option>
            <option value="10+">10+ years (Lead/Executive)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Seniority Level
          </label>
          <select
            value={data.seniority || ''}
            onChange={(e) => onChange({ ...data, seniority: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select seniority</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid-Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Description (Optional)
          </label>
          <textarea
            value={data.jobDescription || ''}
            onChange={(e) => onChange({ ...data, jobDescription: e.target.value })}
            placeholder="Paste the job description here for AI to optimize your resume..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">This helps AI tailor your resume to match job requirements</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tone Preference
          </label>
          <div className="flex gap-4">
            {['professional', 'confident', 'creative'].map((tone) => (
              <label key={tone} className="flex items-center">
                <input
                  type="radio"
                  value={tone}
                  checked={data.tone === tone}
                  onChange={(e) => onChange({ ...data, tone: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700 capitalize">{tone}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
