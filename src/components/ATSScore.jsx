import { useState } from 'react';
import { calculateATSScore, generateTailoredSuggestions } from '../services/atsService';

export function ATSScore({ resume, professionalInfo, onApplySuggestions }) {
  const [jobDescription, setJobDescription] = useState(professionalInfo?.jobDescription || '');
  const [atsResult, setAtsResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      return;
    }
    setAnalyzing(true);
    // Simulate analysis delay for better UX
    setTimeout(() => {
      const result = calculateATSScore(resume, jobDescription);
      setAtsResult(result);
      setAnalyzing(false);
    }, 500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Tailor to Job</h3>
        <p className="text-sm text-slate-600 mb-4">
          Paste a job description to see how well your resume matches and get AI-powered suggestions
        </p>
        
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          rows={6}
        />
        
        <button
          onClick={handleAnalyze}
          disabled={!jobDescription.trim() || analyzing}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Analyze Match
            </>
          )}
        </button>
      </div>

      {atsResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">ATS Analysis Results</h3>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${getScoreColor(atsResult.score)}`}>
                {atsResult.score}%
              </span>
              <div className="w-32 bg-slate-200 rounded-full h-3">
                <div
                  className={`${getScoreBgColor(atsResult.score)} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${atsResult.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matched Keywords */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Matched Keywords ({atsResult.matchedKeywords.length})
            </h4>
            {atsResult.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {atsResult.matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No matching keywords found</p>
            )}
          </div>

          {/* Missing Keywords */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Missing Keywords ({atsResult.missingKeywords.length})
            </h4>
            {atsResult.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {atsResult.missingKeywords.slice(0, 20).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
                {atsResult.missingKeywords.length > 20 && (
                  <span className="text-slate-500 text-sm">
                    +{atsResult.missingKeywords.length - 20} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Great! All keywords are matched</p>
            )}
          </div>

          {/* Suggestions */}
          {atsResult.suggestions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Suggestions
              </h4>
              <div className="space-y-2">
                {atsResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-slate-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          {onApplySuggestions && atsResult.missingKeywords.length > 0 && (
            <button
              onClick={() => onApplySuggestions(atsResult)}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Apply Suggestions to Resume
            </button>
          )}
        </div>
      )}
    </div>
  );
}
