import { useState } from 'react';
import { useToast } from '../toastContext';

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export function EducationForm({ education, addEducation, updateEducation, removeEducation }) {
  const toast = useToast();
  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    location: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.school) {
      toast('Please fill in degree and school', 'error');
      return;
    }
    addEducation(newEducation);
    setNewEducation({
      degree: '',
      school: '',
      location: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    toast('Education added successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Add New Education */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="School/University"
            value={newEducation.school}
            onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Location"
            value={newEducation.location}
            onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Field of Study"
            value={newEducation.field}
            onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            className={inputClass}
          />
          <input
            type="month"
            placeholder="Start Date"
            value={newEducation.startDate}
            onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
            className={inputClass}
          />
          <input
            type="month"
            placeholder="End Date"
            value={newEducation.endDate}
            onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="Description (optional)"
            value={newEducation.description}
            onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
            className={`${inputClass} md:col-span-2`}
            rows={3}
          />
        </div>
        <button
          onClick={handleAddEducation}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Add Education
        </button>
      </div>

      {/* Existing Education */}
      {education.map((edu) => (
        <div key={edu.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
              <p className="text-slate-600 text-sm">{edu.school}</p>
              {edu.location && <p className="text-slate-500 text-xs">{edu.location}</p>}
              {edu.field && <p className="text-slate-500 text-xs">Field: {edu.field}</p>}
              <p className="text-slate-500 text-xs mt-1">
                {edu.startDate} - {edu.endDate}
              </p>
              {edu.description && <p className="text-slate-600 text-sm mt-2">{edu.description}</p>}
            </div>
            <button
              onClick={() => removeEducation(edu.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
