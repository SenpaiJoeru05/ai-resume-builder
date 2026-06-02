import { useState } from 'react';
import { generateSummaryVariations, improveSummaryWithGrammar, checkGrammar, checkImpact } from '../services/summaryVariationsService';
import { useToast } from './toastContext';

export function SummaryVariations({ resume, updateSummary }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState([]);
  const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [impactSuggestions, setImpactSuggestions] = useState([]);

  const handleGenerateVariations = async () => {
    setLoading(true);
    try {
      const result = await generateSummaryVariations(resume);
      setVariations(result);
      toast('Generated summary variations', 'success');
    } catch (error) {
      console.error('Error generating variations:', error);
      toast('Failed to generate variations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVariation = (summary) => {
    updateSummary(summary);
    toast('Summary updated', 'success');
  };

  const handleGrammarCheck = () => {
    const issues = checkGrammar(resume.summary);
    const suggestions = checkImpact(resume.summary);
    setGrammarIssues(issues);
    setImpactSuggestions(suggestions);
    setShowGrammarCheck(true);
  };

  const handleImproveGrammar = async () => {
    try {
      const improved = await improveSummaryWithGrammar(resume.summary);
      updateSummary(improved);
      toast('Summary improved', 'success');
    } catch (error) {
      console.error('Error improving summary:', error);
      toast('Failed to improve summary', 'error');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'suggestion': return 'text-blue-600 bg-blue-50';
      case 'info': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Summary Variations</h3>
        <p className="text-sm text-slate-600 mb-4">
          Generate different versions of your summary with various tones and styles
        </p>
        
        <button
          onClick={handleGenerateVariations}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Variations
            </>
          )}
        </button>
      </div>

      {variations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Variations</h3>
          <div className="space-y-4">
            {variations.map((variation) => (
              <div key={variation.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">{variation.title}</h4>
                  <button
                    onClick={() => handleApplyVariation(variation.summary)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-2">{variation.tone}</p>
                <p className="text-slate-700 text-sm">{variation.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Grammar & Impact Checker</h3>
        <p className="text-sm text-slate-600 mb-4">
          Analyze your summary for grammar issues and impact suggestions
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleGrammarCheck}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition"
          >
            Check Grammar
          </button>
          <button
            onClick={handleImproveGrammar}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition"
          >
            Auto-Improve
          </button>
        </div>
      </div>

      {showGrammarCheck && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis Results</h3>
          
          {grammarIssues.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Grammar Issues ({grammarIssues.length})</h4>
              <div className="space-y-2">
                {grammarIssues.map((issue, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}>
                    <p className="text-sm">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {impactSuggestions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Impact Suggestions ({impactSuggestions.length})</h4>
              <div className="space-y-2">
                {impactSuggestions.map((suggestion, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(suggestion.severity)}`}>
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grammarIssues.length === 0 && impactSuggestions.length === 0 && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                Great! Your summary looks good with no major issues detected.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
