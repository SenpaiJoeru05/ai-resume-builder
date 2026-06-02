import { useState } from 'react';
import { generateSummary, improveBullet, suggestSkills } from '../services/geminiService';
import { useToast } from './toastContext';
import { SectionManager } from './SectionManager';
import { ThemeControls } from './ThemeControls';
import { ATSScore } from './ATSScore';
import { ResumesDashboard } from './ResumesDashboard';
import { SummaryVariations } from './SummaryVariations';
import { PDFImport } from './PDFImport';

const SKILL_CATEGORIES = ['Technical', 'Tools', 'Soft Skills', 'Languages', 'Other'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

// Stable-ish id for newly added bullets (runs only in the browser).
let bulletIdCounter = 0;
const newBulletId = () => `bullet-${Date.now()}-${bulletIdCounter++}`;

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export function ResumeForm({
  resume,
  resumes,
  activeResumeId,
  setActiveResumeId,
  createResume,
  deleteResume,
  duplicateResume,
  updatePersonalInfo,
  updateProfessionalInfo,
  updateSummary,
  addSkill,
  updateSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  removeEducation,
  addLink,
  updateLink,
  removeLink,
  addItem,
  updateItem,
  removeItem,
  activeSection,
  setActiveSection,
  sections,
  updateTheme,
  updateSectionConfig,
  toggleSectionVisibility,
  renameSection,
  reorderSections,
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillCategory, setSkillCategory] = useState('Technical');
  const [skillLevel, setSkillLevel] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    jobTitle: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    graduationDate: '',
  });
  const [newProject, setNewProject] = useState({ name: '', link: '', technologies: '', description: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', date: '' });
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: 'Professional' });
  const [newAward, setNewAward] = useState({ title: '', issuer: '', date: '' });
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (id, type) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  };

  /* ----------------------------- AI handlers ----------------------------- */

  const handleGenerateSummary = async () => {
    if (!resume.personalInfo.fullName) {
      toast.error('Please enter your name in Personal Info first');
      return;
    }
    setLoading(true);
    setLoadingAction('summary');
    try {
      const summary = await generateSummary(
        resume.personalInfo,
        resume.skills,
        resume.experience,
        resume.professionalInfo
      );
      updateSummary(summary);
      toast.success('Summary generated based on your target role');
    } catch (error) {
      console.error('Full error:', error);
      toast.error(`Error generating summary: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleSuggestSkills = async () => {
    const jobTitle =
      resume.professionalInfo.jobTitle ||
      (resume.experience.length > 0 ? resume.experience[0].jobTitle : newExperience.jobTitle);
    const industry = resume.professionalInfo.industry || 'your industry';

    if (!jobTitle) {
      toast.error('Add a target job title in Job Target first');
      return;
    }
    setLoading(true);
    setLoadingAction('skills');
    try {
      const suggested = await suggestSkills(jobTitle, industry);
      let added = 0;
      suggested.forEach((skill) => {
        if (!resume.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
          addSkill({ name: skill, category: 'Technical', level: '' });
          added += 1;
        }
      });
      toast.success(added > 0 ? `Added ${added} suggested skills` : 'No new skills to add');
    } catch (error) {
      console.error('Full error:', error);
      toast.error(`Error suggesting skills: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  /* --------------------------- Bullet handlers --------------------------- */

  const setBullets = (expId, bullets) => updateExperience(expId, { bullets });

  const addBullet = (expId) => {
    const exp = resume.experience.find((e) => e.id === expId);
    setBullets(expId, [...(exp.bullets || []), { id: newBulletId(), text: '' }]);
  };

  const updateBullet = (expId, bulletId, text) => {
    const exp = resume.experience.find((e) => e.id === expId);
    setBullets(expId, (exp.bullets || []).map((b) => (b.id === bulletId ? { ...b, text } : b)));
  };

  const removeBullet = (expId, bulletId) => {
    const exp = resume.experience.find((e) => e.id === expId);
    setBullets(expId, (exp.bullets || []).filter((b) => b.id !== bulletId));
  };

  const handleImproveBullet = async (expId, bulletId) => {
    const exp = resume.experience.find((e) => e.id === expId);
    const bullet = (exp.bullets || []).find((b) => b.id === bulletId);
    if (!bullet || !bullet.text.trim()) {
      toast.error('Write something in the bullet first');
      return;
    }
    setLoading(true);
    setLoadingAction(`bullet-${bulletId}`);
    try {
      const improved = await improveBullet(bullet.text, exp.jobTitle, resume.professionalInfo);
      updateBullet(expId, bulletId, improved);
      toast.success('Bullet improved with AI');
    } catch (error) {
      console.error('Full error:', error);
      toast.error(`Error improving bullet: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  /* ----------------------------- Add handlers ---------------------------- */

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      addSkill({ name: skillInput.trim(), category: skillCategory, level: skillLevel });
      setSkillInput('');
    }
  };

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.jobTitle) {
      // Turn the "one achievement per line" textarea into structured bullets.
      const bullets = newExperience.description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ id: newBulletId(), text }));
      const { description, ...rest } = newExperience;
      addExperience({ ...rest, bullets });
      setNewExperience({
        company: '',
        jobTitle: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
      toast.success('Experience added');
    } else {
      toast.error('Company and job title are required');
    }
  };

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.degree) {
      addEducation(newEducation);
      setNewEducation({ school: '', degree: '', field: '', graduationDate: '' });
      toast.success('Education added');
    } else {
      toast.error('School and degree are required');
    }
  };

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      addItem('projects', newProject);
      setNewProject({ name: '', link: '', technologies: '', description: '' });
      toast.success('Project added');
    } else {
      toast.error('Project name is required');
    }
  };

  const handleAddCertification = () => {
    if (newCertification.name.trim()) {
      addItem('certifications', newCertification);
      setNewCertification({ name: '', issuer: '', date: '' });
      toast.success('Certification added');
    } else {
      toast.error('Certification name is required');
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.name.trim()) {
      addItem('languages', newLanguage);
      setNewLanguage({ name: '', proficiency: 'Professional' });
      toast.success('Language added');
    } else {
      toast.error('Language name is required');
    }
  };

  const handleAddAward = () => {
    if (newAward.title.trim()) {
      addItem('awards', newAward);
      setNewAward({ title: '', issuer: '', date: '' });
      toast.success('Award added');
    } else {
      toast.error('Award title is required');
    }
  };

  /* ----------------------------- Navigation ------------------------------ */

  const getCurrentSectionIndex = () => sections.findIndex((s) => s.id === activeSection);
  const goToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1].id);
  };
  const goToPrevSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
  };

  /* ------------------------------ Sub-render ----------------------------- */

  const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600">{subtitle}</p>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'resumes':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <ResumesDashboard
              resumes={resumes || [resume]}
              activeResumeId={activeResumeId}
              setActiveResumeId={setActiveResumeId}
              createResume={createResume}
              deleteResume={deleteResume}
              duplicateResume={duplicateResume}
            />
          </section>
        );

      case 'import':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <PDFImport onResumeImport={(data) => {
              if (data.personalInfo) updatePersonalInfo(data.personalInfo);
              if (data.professionalInfo) updateProfessionalInfo(data.professionalInfo);
              if (data.summary) updateSummary(data.summary);
            }} />
          </section>
        );

      case 'target':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader
              title="Job Target"
              subtitle="Tell us the role you're aiming for. The AI uses this to tailor your summary, skills, and descriptions to the right job."
            />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Target Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Frontend Engineer"
                    value={resume.professionalInfo.jobTitle}
                    onChange={(e) => updateProfessionalInfo({ jobTitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={resume.professionalInfo.industry}
                    onChange={(e) => updateProfessionalInfo({ industry: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Seniority Level</label>
                  <select
                    value={resume.professionalInfo.seniority}
                    onChange={(e) => updateProfessionalInfo({ seniority: e.target.value })}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                  <input
                    type="text"
                    placeholder="e.g., 5+"
                    value={resume.professionalInfo.yearsExperience}
                    onChange={(e) => updateProfessionalInfo({ yearsExperience: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tone</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'professional', label: 'Professional' },
                    { value: 'confident', label: 'Confident' },
                    { value: 'creative', label: 'Creative' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateProfessionalInfo({ tone: option.value })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        resume.professionalInfo.tone === option.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Job Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Paste the job description you're applying for. The AI will tailor your resume toward it."
                  value={resume.professionalInfo.jobDescription}
                  onChange={(e) => updateProfessionalInfo({ jobDescription: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                />
              </div>
            </div>
          </section>
        );

      case 'personal':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Personal Information" subtitle="Let's start with your basic contact details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={resume.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={resume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={resume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={resume.personalInfo.address}
                  onChange={(e) => updatePersonalInfo({ address: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Links</h3>
                <button
                  onClick={() => addLink()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Link
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-3">LinkedIn, portfolio, GitHub, etc.</p>
              <div className="space-y-3">
                {(resume.personalInfo.links || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No links added yet.</p>
                ) : (
                  resume.personalInfo.links.map((link) => (
                    <div key={link.id} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g., LinkedIn)"
                        value={link.label}
                        onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        className={`${inputClass} md:w-1/3`}
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        className={inputClass}
                      />
                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                        title="Remove link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );

      case 'experience':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Work Experience" subtitle="Add your professional work history with achievement bullet points" />

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
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Job Title *</label>
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newExperience.jobTitle}
                      onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    placeholder="City, State or Remote"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="month"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <input
                      type="month"
                      value={newExperience.endDate}
                      disabled={newExperience.current}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={newExperience.current}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        current: e.target.checked,
                        endDate: e.target.checked ? '' : newExperience.endDate,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  I currently work here
                </label>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Achievements & Responsibilities</label>
                  <textarea
                    placeholder="Enter one achievement per line. You can polish each one with AI after adding."
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    className={`${inputClass} h-28 resize-none`}
                  />
                  <p className="text-xs text-slate-400">Each line becomes its own bullet point.</p>
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
                    <div
                      className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => toggleExpanded(exp.id, 'experience')}
                    >
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
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            expandedItems[`experience-${exp.id}`] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedItems[`experience-${exp.id}`] && (
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 space-y-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span>
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate || '—'}
                          </span>
                          {exp.location && <span>📍 {exp.location}</span>}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">Bullet Points</label>
                            <button
                              onClick={() => addBullet(exp.id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Bullet
                            </button>
                          </div>
                          {(exp.bullets || []).length === 0 ? (
                            <p className="text-sm text-slate-400">No bullets yet. Add one above.</p>
                          ) : (
                            (exp.bullets || []).map((bullet) => (
                              <div key={bullet.id} className="flex gap-2 items-start">
                                <span className="mt-3 text-slate-400 select-none">•</span>
                                <textarea
                                  value={bullet.text}
                                  onChange={(e) => updateBullet(exp.id, bullet.id, e.target.value)}
                                  placeholder="Describe an achievement..."
                                  className={`${inputClass} flex-1 h-16 resize-none text-sm`}
                                />
                                <button
                                  onClick={() => handleImproveBullet(exp.id, bullet.id)}
                                  disabled={loading && loadingAction === `bullet-${bullet.id}`}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition flex-shrink-0 mt-0.5"
                                  title="Improve with AI"
                                >
                                  {loading && loadingAction === `bullet-${bullet.id}` ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                                  onClick={() => removeBullet(exp.id, bullet.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 mt-0.5"
                                  title="Remove bullet"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
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
            <SectionHeader title="Education" subtitle="Add your educational background" />

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
                    className={inputClass}
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
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Field of Study</label>
                    <input
                      type="text"
                      placeholder="Computer Science, Business, etc."
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Graduation Date</label>
                  <input
                    type="month"
                    value={newEducation.graduationDate}
                    onChange={(e) => setNewEducation({ ...newEducation, graduationDate: e.target.value })}
                    className={inputClass}
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

            <div className="space-y-4">
              {resume.education.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No education added yet. Add your first education above.</p>
                </div>
              ) : (
                resume.education.map((edu, index) => (
                  <div key={edu.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-600">{edu.school}</p>
                        {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                        {edu.graduationDate && <p className="text-xs text-slate-400 mt-1">{edu.graduationDate}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'skills':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Skills" subtitle="Group your skills by category and set a proficiency level" />

            <div className="space-y-6">
              {/* Add Skill */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="Add a skill (e.g., JavaScript)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className={`${inputClass} md:col-span-5`}
                />
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className={`${inputClass} bg-white md:col-span-3`}
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className={`${inputClass} bg-white md:col-span-2`}
                >
                  <option value="">Level</option>
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddSkill}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition md:col-span-2"
                >
                  Add
                </button>
              </div>

              {/* AI Suggest */}
              <button
                onClick={handleSuggestSkills}
                disabled={loading || loadingAction === 'skills'}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && loadingAction === 'skills' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

              {/* Grouped skills */}
              {resume.skills.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No skills added yet. Add your first skill above or let AI suggest some.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {SKILL_CATEGORIES.map((category) => {
                    const items = resume.skills.filter((s) => (s.category || 'Other') === category);
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {items.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                            >
                              <span className="flex-1 text-sm text-slate-800">{skill.name}</span>
                              <select
                                value={skill.level || ''}
                                onChange={(e) => updateSkill(skill.id, { level: e.target.value })}
                                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">No level</option>
                                {SKILL_LEVELS.map((lvl) => (
                                  <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeSkill(skill.id)}
                                className="text-slate-400 hover:text-red-600 transition"
                                title="Remove"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );

      case 'projects':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Projects" subtitle="Showcase notable projects (optional)" />
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project name *"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Link (optional)"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  className={inputClass}
                />
              </div>
              <input
                type="text"
                placeholder="Technologies used (e.g., React, Node.js)"
                value={newProject.technologies}
                onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                className={inputClass}
              />
              <textarea
                placeholder="Short description of the project and your impact"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className={`${inputClass} h-24 resize-none`}
              />
              <button
                onClick={handleAddProject}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Add Project
              </button>
            </div>
            <div className="space-y-3">
              {resume.projects.length === 0 ? (
                <div className="text-center py-6 text-slate-500"><p>No projects added yet.</p></div>
              ) : (
                resume.projects.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      {p.technologies && <p className="text-xs text-slate-500 mt-0.5">{p.technologies}</p>}
                      {p.description && <p className="text-sm text-slate-600 mt-1">{p.description}</p>}
                      {p.link && <p className="text-xs text-blue-600 mt-1">{p.link}</p>}
                    </div>
                    <button
                      onClick={() => removeItem('projects', p.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'certifications':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Certifications" subtitle="Add professional certifications (optional)" />
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200 space-y-4">
              <input
                type="text"
                placeholder="Certification name *"
                value={newCertification.name}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Issuing organization"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Year (e.g., 2023)"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleAddCertification}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Add Certification
              </button>
            </div>
            <div className="space-y-3">
              {resume.certifications.length === 0 ? (
                <div className="text-center py-6 text-slate-500"><p>No certifications added yet.</p></div>
              ) : (
                resume.certifications.map((c) => (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-sm text-slate-600">
                        {[c.issuer, c.date].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem('certifications', c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'languages':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Languages" subtitle="Add languages you speak (optional)" />
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="Language *"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className={`${inputClass} md:col-span-6`}
                />
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                  className={`${inputClass} bg-white md:col-span-4`}
                >
                  {LANGUAGE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddLanguage}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition md:col-span-2"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {resume.languages.length === 0 ? (
                <div className="text-center py-6 text-slate-500"><p>No languages added yet.</p></div>
              ) : (
                resume.languages.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm text-slate-800">{l.name}</span>
                    <span className="text-xs text-slate-500">{l.proficiency}</span>
                    <button
                      onClick={() => removeItem('languages', l.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'awards':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader title="Awards & Honors" subtitle="Add recognitions you've received (optional)" />
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200 space-y-4">
              <input
                type="text"
                placeholder="Award title *"
                value={newAward.title}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Issued by"
                  value={newAward.issuer}
                  onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Year (e.g., 2022)"
                  value={newAward.date}
                  onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleAddAward}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Add Award
              </button>
            </div>
            <div className="space-y-3">
              {resume.awards.length === 0 ? (
                <div className="text-center py-6 text-slate-500"><p>No awards added yet.</p></div>
              ) : (
                resume.awards.map((a) => (
                  <div key={a.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="text-sm text-slate-600">
                        {[a.issuer, a.date].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem('awards', a.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'summary':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader
              title="Professional Summary"
              subtitle={
                resume.professionalInfo.jobTitle
                  ? `AI will tailor this to your ${resume.professionalInfo.jobTitle} target using your experience and skills.`
                  : 'Write a compelling summary or let AI generate one. Tip: set a Job Target first for a tailored result.'
              }
            />
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder="Your professional summary..."
                  value={resume.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className={`${inputClass} h-40 resize-none`}
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
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
              <SummaryVariations resume={resume} updateSummary={updateSummary} />
            </div>
          </section>
        );

      case 'customize':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader
              title="Customize Your Resume"
              subtitle="Personalize the appearance and structure of your resume"
            />
            <div className="space-y-8">
              <ThemeControls theme={resume.meta?.theme || { accentColor: '#2563eb', font: 'sans', density: 'comfortable' }} onUpdate={updateTheme} />
              <hr className="border-slate-200" />
              <SectionManager
                sectionConfig={resume.sectionConfig || []}
                onReorder={reorderSections}
                onToggleVisibility={toggleSectionVisibility}
                onRename={renameSection}
              />
            </div>
          </section>
        );

      case 'ats':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
            <SectionHeader
              title="Tailor to Job"
              subtitle="Analyze how well your resume matches a job description and get AI-powered suggestions"
            />
            <ATSScore resume={resume} professionalInfo={resume.professionalInfo} />
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
