import { useState } from 'react';
import { suggestSkills } from '../../services/geminiService';
import { useToast } from '../toastContext';

const SKILL_CATEGORIES = ['Technical', 'Tools', 'Soft Skills', 'Languages', 'Other'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export function SkillsForm({ skills, professionalInfo, addSkill, updateSkill, removeSkill }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillCategory, setSkillCategory] = useState('Technical');
  const [skillLevel, setSkillLevel] = useState('');

  const handleAddSkill = () => {
    if (!skillInput.trim()) {
      toast('Please enter a skill name', 'error');
      return;
    }
    addSkill({ name: skillInput.trim(), category: skillCategory, level: skillLevel });
    setSkillInput('');
    setSkillLevel('');
    toast('Skill added successfully', 'success');
  };

  const handleSuggestSkills = async () => {
    if (!professionalInfo?.jobTitle) {
      toast('Please set a Job Target first for better suggestions', 'error');
      return;
    }
    setLoading(true);
    try {
      const suggestions = await suggestSkills(professionalInfo);
      suggestions.forEach(skill => {
        addSkill({ name: skill.name, category: 'Technical', level: '' });
      });
      toast(`Added ${suggestions.length} skill suggestions`, 'success');
    } catch (error) {
      console.error('Error suggesting skills:', error);
      toast('Failed to get skill suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Skill Suggestions</h3>
            <p className="text-sm text-slate-600 mt-1">
              Get personalized skill suggestions based on your job target
            </p>
          </div>
          <button
            onClick={handleSuggestSkills}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Suggest Skills
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add New Skill */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Skill</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Skill name (e.g., JavaScript)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            className={inputClass}
          />
          <select
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            className={inputClass}
          >
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className={inputClass}
          >
            <option value="">Select proficiency (optional)</option>
            {SKILL_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddSkill}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Add Skill
        </button>
      </div>

      {/* Existing Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Skills</h3>
        {skills.length === 0 ? (
          <p className="text-slate-500 text-sm">No skills added yet</p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-slate-900">{skill.name}</span>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded">{skill.category}</span>
                    {skill.level && <span className="text-xs text-slate-600 bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{skill.level}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
