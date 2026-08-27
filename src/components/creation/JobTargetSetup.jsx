import { AutocompleteInput } from '../shared/AutocompleteInput'
import { JOB_TITLES, INDUSTRIES } from '../../data/suggestions'

const fieldClass = 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

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
          <AutocompleteInput
            value={data.jobTitle || ''}
            onChange={(v) => onChange({ ...data, jobTitle: v })}
            suggestions={JOB_TITLES}
            placeholder="e.g., Senior Software Engineer"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <AutocompleteInput
            value={data.industry || ''}
            onChange={(v) => onChange({ ...data, industry: v })}
            suggestions={INDUSTRIES}
            placeholder="e.g., Technology, Healthcare, Finance"
            className={fieldClass}
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
            placeholder={'Paste the full job post you\'re applying to — copy it straight from LinkedIn, Indeed, JobStreet, or the company\'s careers page.\n\nInclude the responsibilities and requirements sections; those are what get matched against your resume.'}
            rows={5}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            The only field we can&rsquo;t fill from your resume — it describes the job you want,
            not the one you have. Paste it and we&rsquo;ll match your wording to theirs and score
            how well you fit.
          </p>
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
