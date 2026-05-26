import { useState } from 'react';
import { generateSummary, improveExperience, suggestSkills } from '../services/geminiService';

export function ResumeForm({
  resume,
  updatePersonalInfo,
  updateSummary,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  activeSection,
  setActiveSection,
  sections,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    graduationDate: '',
  });
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (id, type) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`]
    }));
  };

  const handleGenerateSummary = async () => {
    if (!resume.personalInfo.fullName) {
      alert('Please enter your name first');
      return;
    }

    setLoading(true);
    setLoadingAction('summary');
    try {
      const summary = await generateSummary(
        resume.personalInfo,
        resume.skills,
        resume.experience
      );
      updateSummary(summary);
    } catch (error) {
      console.error('Full error:', error);
      alert(`Error generating summary: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleSuggestSkills = async () => {
    const jobTitle = resume.experience.length > 0 
      ? resume.experience[0].jobTitle 
      : newExperience.jobTitle;
    
    if (!jobTitle) {
      alert('Please add a job title first');
      return;
    }

    setLoading(true);
    setLoadingAction('skills');
    try {
      const suggested = await suggestSkills(jobTitle, 'Technology');
      suggested.forEach((skill) => {
        if (!resume.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
          addSkill(skill);
        }
      });
      alert(`Added ${suggested.length} suggested skills!`);
    } catch (error) {
      console.error('Full error:', error);
      alert(`Error suggesting skills: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleImproveExperience = async (expId, currentDescription) => {
    const exp = resume.experience.find(e => e.id === expId);
    if (!exp || !exp.description) {
      alert('Please add a description first');
      return;
    }

    setLoading(true);
    setLoadingAction(`improve-${expId}`);
    try {
      const improved = await improveExperience(exp.jobTitle, exp.description);
      updateExperience(expId, { description: improved });
    } catch (error) {
      console.error('Full error:', error);
      alert(`Error improving experience: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      addSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.jobTitle) {
      addExperience(newExperience);
      setNewExperience({
        company: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  };

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.degree) {
      addEducation(newEducation);
      setNewEducation({
        school: '',
        degree: '',
        field: '',
        graduationDate: '',
      });
    }
  };

  const getCurrentSectionIndex = () => sections.findIndex(s => s.id === activeSection);
  const goToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const goToPrevSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
              <p className="text-slate-600">Let's start with your basic contact details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={resume.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={resume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={resume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={resume.personalInfo.address}
                  onChange={(e) => updatePersonalInfo({ address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </section>
        );

      case 'summary':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Summary</h2>
              <p className="text-slate-600">Write a compelling summary or let AI generate one for you</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder="Your professional summary..."
                  value={resume.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-40 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                  {resume.summary.length} characters
                </div>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loading || loadingAction === 'summary' || !resume.personalInfo.fullName}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && loadingAction === 'summary' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </section>
        );

      case 'experience':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Work Experience</h2>
              <p className="text-slate-600">Add your professional work history</p>
            </div>

            {/* Add New Experience Form */}
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Add New Experience</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Company *</label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Job Title *</label>
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newExperience.jobTitle}
                      onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <input
                      type="date"
                      value={newExperience.endDate}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-32 resize-none"
                  />
                </div>
                <button
                  onClick={handleAddExperience}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Add Experience
                </button>
              </div>
            </div>

            {/* Experience List */}
            <div className="space-y-4">
              {resume.experience.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No experience added yet. Add your first work experience above.</p>
                </div>
              ) : (
                resume.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition cursor-pointer" onClick={() => toggleExpanded(exp.id, 'experience')}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900">{exp.jobTitle}</h3>
                          <p className="text-sm text-slate-600">{exp.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImproveExperience(exp.id);
                          }}
                          disabled={loading && loadingAction === `improve-${exp.id}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Improve with AI"
                        >
                          {loading && loadingAction === `improve-${exp.id}` ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExperience(exp.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedItems[`experience-${exp.id}`] ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedItems[`experience-${exp.id}`] && (
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{exp.description}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'education':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Education</h2>
              <p className="text-slate-600">Add your educational background</p>
            </div>

            {/* Add New Education Form */}
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Add New Education</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">School/University *</label>
                  <input
                    type="text"
                    placeholder="School Name"
                    value={newEducation.school}
                    onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Degree *</label>
                    <input
                      type="text"
                      placeholder="Bachelor's, Master's, etc."
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Field of Study</label>
                    <input
                      type="text"
                      placeholder="Computer Science, Business, etc."
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Graduation Date</label>
                  <input
                    type="date"
                    value={newEducation.graduationDate}
                    onChange={(e) => setNewEducation({ ...newEducation, graduationDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  onClick={handleAddEducation}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Add Education
                </button>
              </div>
            </div>

            {/* Education List */}
            <div className="space-y-4">
              {resume.education.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No education added yet. Add your first education above.</p>
                </div>
              ) : (
                resume.education.map((edu, index) => (
                  <div key={edu.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition cursor-pointer" onClick={() => toggleExpanded(edu.id, 'education')}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                          <p className="text-sm text-slate-600">{edu.school}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEducation(edu.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedItems[`education-${edu.id}`] ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedItems[`education-${edu.id}`] && (
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
                        {edu.field && (
                          <p className="text-sm text-slate-700 mb-2">
                            <span className="font-medium">Field:</span> {edu.field}
                          </p>
                        )}
                        {edu.graduationDate && (
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">Graduated:</span> {edu.graduationDate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'skills':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Skills</h2>
              <p className="text-slate-600">Add your technical and professional skills</p>
            </div>

            <div className="space-y-6">
              {/* Add Skills */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add a skill (e.g., JavaScript, Project Management)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Add
                </button>
              </div>

              {/* AI Suggest Skills */}
              <button
                onClick={handleSuggestSkills}
                disabled={loading || loadingAction === 'skills'}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && loadingAction === 'skills' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Suggesting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Suggest Skills with AI
                  </>
                )}
              </button>

              {/* Skills List */}
              {resume.skills.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No skills added yet. Add your first skill above or let AI suggest some.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {resume.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200"
                    >
                      {skill.name}
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="text-blue-500 hover:text-blue-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">
            Section {getCurrentSectionIndex() + 1} of {sections.length}
          </span>
          <span className="text-sm text-slate-500">
            {Math.round(((getCurrentSectionIndex() + 1) / sections.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((getCurrentSectionIndex() + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Section */}
      {renderSection()}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={goToPrevSection}
          disabled={getCurrentSectionIndex() === 0}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={goToNextSection}
          disabled={getCurrentSectionIndex() === sections.length - 1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
