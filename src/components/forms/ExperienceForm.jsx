import { useState } from 'react';
import { improveBullet } from '../../services/geminiService';
import { useToast } from '../toastContext';

let bulletIdCounter = 0;
const newBulletId = () => `bullet-${Date.now()}-${bulletIdCounter++}`;

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export function ExperienceForm({ experience, addExperience, updateExperience, removeExperience }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    jobTitle: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [],
  });
  const [newBullet, setNewBullet] = useState('');

  const handleAddExperience = () => {
    if (!newExperience.company || !newExperience.jobTitle) {
      toast('Please fill in company and job title', 'error');
      return;
    }
    addExperience(newExperience);
    setNewExperience({
      company: '',
      jobTitle: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [],
    });
    toast('Experience added successfully', 'success');
  };

  const handleAddBullet = (expId) => {
    if (!newBullet.trim()) return;
    updateExperience(expId, {
      bullets: [...(experience.find(e => e.id === expId)?.bullets || []), { id: newBulletId(), text: newBullet.trim() }],
    });
    setNewBullet('');
  };

  const handleUpdateBullet = (expId, bulletId, text) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, {
        bullets: exp.bullets.map(b => (b.id === bulletId ? { ...b, text } : b)),
      });
    }
  };

  const handleRemoveBullet = (expId, bulletId) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, {
        bullets: exp.bullets.filter(b => b.id !== bulletId),
      });
    }
  };

  const handleImproveBullet = async (expId, bulletId) => {
    const exp = experience.find(e => e.id === expId);
    const bullet = exp?.bullets.find(b => b.id === bulletId);
    if (!bullet) return;

    setLoading(true);
    setLoadingAction(`bullet-${bulletId}`);
    try {
      const improved = await improveBullet(bullet.text);
      handleUpdateBullet(expId, bulletId, improved);
      toast('Bullet point improved with AI', 'success');
    } catch (error) {
      console.error('Error improving bullet:', error);
      toast('Failed to improve bullet point', 'error');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Experience */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Title"
            value={newExperience.jobTitle}
            onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Location"
            value={newExperience.location}
            onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
            className={inputClass}
          />
          <input
            type="month"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            className={inputClass}
          />
          <input
            type="month"
            placeholder="End Date"
            value={newExperience.endDate}
            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
            disabled={newExperience.current}
            className={inputClass}
          />
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={newExperience.current}
              onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked, endDate: '' })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Currently working here</span>
          </label>
        </div>
        <button
          onClick={handleAddExperience}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Add Experience
        </button>
      </div>

      {/* Existing Experience */}
      {experience.map((exp) => (
        <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">{exp.jobTitle}</h4>
              <p className="text-slate-600 text-sm">
                {exp.company}
                {exp.location && ` • ${exp.location}`}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </p>
            </div>
            <button
              onClick={() => removeExperience(exp.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Bullet Points */}
          <div className="space-y-2">
            {exp.bullets?.map((bullet) => (
              <div key={bullet.id} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={bullet.text}
                  onChange={(e) => handleUpdateBullet(exp.id, bullet.id, e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="Describe your achievement..."
                />
                <button
                  onClick={() => handleImproveBullet(exp.id, bullet.id)}
                  disabled={loading && loadingAction === `bullet-${bullet.id}`}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                  title="Improve with AI"
                >
                  {loading && loadingAction === `bullet-${bullet.id}` ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleRemoveBullet(exp.id, bullet.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newBullet}
                onChange={(e) => setNewBullet(e.target.value)}
                className={inputClass}
                placeholder="Add a bullet point..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddBullet(exp.id)}
              />
              <button
                onClick={() => handleAddBullet(exp.id)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
