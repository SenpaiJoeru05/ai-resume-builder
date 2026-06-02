import { useState } from 'react';
import { useToast } from '../toastContext';

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

export function OptionalSectionsForm({ projects, certifications, languages, awards, addItem, updateItem, removeItem }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('projects');

  const [newProject, setNewProject] = useState({ name: '', description: '', link: '', technologies: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', date: '' });
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: '' });
  const [newAward, setNewAward] = useState({ title: '', issuer: '', date: '' });

  const handleAddProject = () => {
    if (!newProject.name) {
      toast('Please enter a project name', 'error');
      return;
    }
    addItem('projects', newProject);
    setNewProject({ name: '', description: '', link: '', technologies: '' });
    toast('Project added successfully', 'success');
  };

  const handleAddCertification = () => {
    if (!newCertification.name) {
      toast('Please enter a certification name', 'error');
      return;
    }
    addItem('certifications', newCertification);
    setNewCertification({ name: '', issuer: '', date: '' });
    toast('Certification added successfully', 'success');
  };

  const handleAddLanguage = () => {
    if (!newLanguage.name) {
      toast('Please enter a language name', 'error');
      return;
    }
    addItem('languages', newLanguage);
    setNewLanguage({ name: '', proficiency: '' });
    toast('Language added successfully', 'success');
  };

  const handleAddAward = () => {
    if (!newAward.title) {
      toast('Please enter an award title', 'error');
      return;
    }
    addItem('awards', newAward);
    setNewAward({ title: '', issuer: '', date: '' });
    toast('Award added successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['projects', 'certifications', 'languages', 'awards'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Link/URL"
                value={newProject.link}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Technologies"
                value={newProject.technologies}
                onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                className={inputClass}
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className={`${inputClass} md:col-span-2`}
                rows={3}
              />
            </div>
            <button
              onClick={handleAddProject}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Add Project
            </button>
          </div>

          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">{project.name}</h4>
                  {project.link && <p className="text-slate-600 text-sm">{project.link}</p>}
                  {project.technologies && <p className="text-slate-500 text-xs">{project.technologies}</p>}
                  {project.description && <p className="text-slate-600 text-sm mt-2">{project.description}</p>}
                </div>
                <button onClick={() => removeItem('projects', project.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Certification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Certification Name"
                value={newCertification.name}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Issuer"
                value={newCertification.issuer}
                onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Date"
                value={newCertification.date}
                onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleAddCertification}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Add Certification
            </button>
          </div>

          {certifications.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                  <p className="text-slate-600 text-sm">{cert.issuer}</p>
                  <p className="text-slate-500 text-xs">{cert.date}</p>
                </div>
                <button onClick={() => removeItem('certifications', cert.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Language</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Language"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                className={inputClass}
              />
              <select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                className={inputClass}
              >
                <option value="">Select proficiency</option>
                {LANGUAGE_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddLanguage}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Add Language
            </button>
          </div>

          {languages.map((lang) => (
            <div key={lang.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">{lang.name}</h4>
                  {lang.proficiency && <p className="text-slate-600 text-sm">{lang.proficiency}</p>}
                </div>
                <button onClick={() => removeItem('languages', lang.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Awards Tab */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Award</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Award Title"
                value={newAward.title}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Issuer"
                value={newAward.issuer}
                onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Date"
                value={newAward.date}
                onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleAddAward}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Add Award
            </button>
          </div>

          {awards.map((award) => (
            <div key={award.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">{award.title}</h4>
                  <p className="text-slate-600 text-sm">{award.issuer}</p>
                  <p className="text-slate-500 text-xs">{award.date}</p>
                </div>
                <button onClick={() => removeItem('awards', award.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
