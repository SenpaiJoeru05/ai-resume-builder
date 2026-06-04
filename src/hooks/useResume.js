import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'ai-resume-builder:resumes';
const ACTIVE_RESUME_KEY = 'ai-resume-builder:active-resume';

const initialResume = {
  meta: {
    id: 'default',
    title: 'Untitled Resume',
    updatedAt: new Date().toISOString(),
    template: 'modern',
    theme: {
      accentColor: '#2563eb',  // blue-600
      font: 'sans',            // sans | serif | modern
      density: 'comfortable',  // comfortable | compact
    },
  },
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    links: [],             // [{ id, label, url }] e.g. LinkedIn, Portfolio, GitHub
  },
  // Job Target drives all AI output (role-aware summaries, skill suggestions, etc.)
  professionalInfo: {
    jobTitle: '',          // target job title the resume is aimed at
    industry: '',
    yearsExperience: '',
    seniority: '',         // entry | mid | senior | lead | executive
    jobDescription: '',    // optional pasted JD for targeting
    tone: 'professional',  // professional | confident | creative
    keyAchievements: '',
  },
  summary: '',
  skills: [],              // [{ id, name, category, level }]
  experience: [],          // [{ id, jobTitle, company, location, startDate, endDate, current, bullets: [{id,text}] }]
  education: [],
  // Optional sections (rendered only when non-empty)
  projects: [],            // [{ id, name, description, link, technologies }]
  certifications: [],      // [{ id, name, issuer, date }]
  languages: [],           // [{ id, name, proficiency }]
  awards: [],              // [{ id, title, issuer, date }]
  // Section configuration for customization
  sectionConfig: [
    { key: 'summary', label: 'Professional Summary', visible: true, order: 0 },
    { key: 'experience', label: 'Experience', visible: true, order: 1 },
    { key: 'education', label: 'Education', visible: true, order: 2 },
    { key: 'skills', label: 'Skills', visible: true, order: 3 },
    { key: 'projects', label: 'Projects', visible: true, order: 4 },
    { key: 'certifications', label: 'Certifications', visible: true, order: 5 },
    { key: 'languages', label: 'Languages', visible: true, order: 6 },
    { key: 'awards', label: 'Awards', visible: true, order: 7 },
  ],
};

// Merge persisted data over defaults so newly-added fields always exist.
const mergeWithDefaults = (saved) => ({
  ...initialResume,
  ...saved,
  meta: { ...initialResume.meta, ...(saved?.meta || {}), theme: { ...initialResume.meta.theme, ...(saved?.meta?.theme || {}) } },
  personalInfo: { ...initialResume.personalInfo, ...(saved?.personalInfo || {}) },
  professionalInfo: { ...initialResume.professionalInfo, ...(saved?.professionalInfo || {}) },
  sectionConfig: saved?.sectionConfig || initialResume.sectionConfig,
});

const loadResumes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return Array.isArray(saved) ? saved : [mergeWithDefaults(saved)];
    }
  } catch (error) {
    console.warn('Could not load saved resumes:', error);
  }
  return [initialResume];
};

const loadActiveResumeId = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_RESUME_KEY);
    if (raw) return raw;
  } catch (error) {
    console.warn('Could not load active resume ID:', error);
  }
  return null;
};

// Simple unique ID generator
let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
};

export function useResume() {
  const [resumes, setResumes] = useState(() => loadResumes());
  const [activeResumeId, setActiveResumeIdState] = useState(() => loadActiveResumeId());
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  // Get the active resume
  const resume = resumes.find(r => r.meta.id === activeResumeId) || resumes[0] || initialResume;

  // Set active resume ID if not set
  useEffect(() => {
    if (!activeResumeId && resumes.length > 0) {
      setActiveResumeIdState(resumes[0].meta.id);
    }
  }, [activeResumeId, resumes]);

  // Save resumes to localStorage with debounce
  useEffect(() => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
        localStorage.setItem(ACTIVE_RESUME_KEY, activeResumeId || resume.meta.id);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Could not save resumes:', error);
        setSaveStatus('error');
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resumes, activeResumeId, resume.meta.id]);

  // Helper to update the active resume
  const updateActiveResume = (updater) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.meta.id === (activeResumeId || resume.meta.id)
          ? { ...updater(r), meta: { ...r.meta, updatedAt: new Date().toISOString() } }
          : r
      )
    );
  };

  const setActiveResumeId = (id) => {
    setActiveResumeIdState(id);
  };

  // Resume CRUD operations
  const createResume = (title = 'New Resume') => {
    const newResume = {
      ...initialResume,
      meta: {
        ...initialResume.meta,
        id: generateId(),
        title,
        updatedAt: new Date().toISOString(),
      },
    };
    setResumes((prev) => [...prev, newResume]);
    setActiveResumeId(newResume.meta.id);
    return newResume;
  };

  const createResumeWithData = (title = 'New Resume', data = {}) => {
    const newResume = {
      ...initialResume,
      personalInfo: {
        ...initialResume.personalInfo,
        ...(data.personalInfo || {}),
      },
      professionalInfo: {
        ...initialResume.professionalInfo,
        ...(data.professionalInfo || {}),
      },
      meta: {
        ...initialResume.meta,
        id: generateId(),
        title,
        template: data.template || 'modern',
        updatedAt: new Date().toISOString(),
      },
    };
    setResumes((prev) => [...prev, newResume]);
    setActiveResumeId(newResume.meta.id);
    return newResume;
  };

  const deleteResume = (id) => {
    setResumes((prev) => {
      const filtered = prev.filter((r) => r.meta.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one resume
        return [initialResume];
      }
      return filtered;
    });
    // If we deleted the active resume, switch to the first one
    if (activeResumeId === id) {
      setActiveResumeIdState(resumes[0]?.meta.id || null);
    }
  };

  const duplicateResume = (id) => {
    const source = resumes.find((r) => r.meta.id === id);
    if (!source) return;
    const newResume = {
      ...JSON.parse(JSON.stringify(source)),
      meta: {
        ...source.meta,
        id: generateId(),
        title: `${source.meta.title} (Copy)`,
        updatedAt: new Date().toISOString(),
      },
    };
    setResumes((prev) => [...prev, newResume]);
    setActiveResumeId(newResume.meta.id);
  };

  const updatePersonalInfo = (data) => {
    updateActiveResume((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateProfessionalInfo = (data) => {
    updateActiveResume((prev) => ({
      ...prev,
      professionalInfo: { ...prev.professionalInfo, ...data },
    }));
  };

  const updateSummary = (summary) => {
    updateActiveResume((prev) => ({ ...prev, summary }));
  };

  // Accepts either a plain string (e.g. from AI suggestions) or a full object.
  const addSkill = (skill) => {
    const normalized = typeof skill === 'string'
      ? { name: skill, category: 'Other', level: '' }
      : { category: 'Other', level: '', ...skill };
    updateActiveResume((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: generateId(), ...normalized }],
    }));
  };

  const updateSkill = (id, data) => {
    updateActiveResume((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === id ? { ...skill, ...data } : skill
      ),
    }));
  };

  const removeSkill = (id) => {
    updateActiveResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  // Contact links live inside personalInfo.
  const addLink = (link = {}) => {
    updateActiveResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        links: [...(prev.personalInfo.links || []), { id: generateId(), label: '', url: '', ...link }],
      },
    }));
  };

  const updateLink = (id, data) => {
    updateActiveResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        links: (prev.personalInfo.links || []).map((l) => (l.id === id ? { ...l, ...data } : l)),
      },
    }));
  };

  const removeLink = (id) => {
    updateActiveResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        links: (prev.personalInfo.links || []).filter((l) => l.id !== id),
      },
    }));
  };

  // Generic handlers for the optional list sections (projects, certifications, languages, awards).
  const addItem = (section, item = {}) => {
    updateActiveResume((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: generateId(), ...item }],
    }));
  };

  const updateItem = (section, id, data) => {
    updateActiveResume((prev) => ({
      ...prev,
      [section]: (prev[section] || []).map((it) => (it.id === id ? { ...it, ...data } : it)),
    }));
  };

  const removeItem = (section, id) => {
    updateActiveResume((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((it) => it.id !== id),
    }));
  };

  const addExperience = (exp) => {
    updateActiveResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), ...exp }],
    }));
  };

  const updateExperience = (id, data) => {
    updateActiveResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, ...data } : exp
      ),
    }));
  };

  const removeExperience = (id) => {
    updateActiveResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = (edu) => {
    updateActiveResume((prev) => ({
      ...prev,
      education: [...prev.education, { id: generateId(), ...edu }],
    }));
  };

  const updateEducation = (id, data) => {
    updateActiveResume((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...data } : edu
      ),
    }));
  };

  const removeEducation = (id) => {
    updateActiveResume((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const resetResume = () => {
    updateActiveResume(() => initialResume);
  };

  // Theme handlers
  const updateTheme = (themeUpdates) => {
    updateActiveResume((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        theme: { ...prev.meta.theme, ...themeUpdates },
      },
    }));
  };

  const updateTemplate = (template) => {
    updateActiveResume((prev) => ({
      ...prev,
      meta: { ...prev.meta, template },
    }));
  };

  // Section configuration handlers
  const updateSectionConfig = (sectionConfig) => {
    updateActiveResume((prev) => ({ ...prev, sectionConfig }));
  };

  const toggleSectionVisibility = (key) => {
    updateActiveResume((prev) => ({
      ...prev,
      sectionConfig: prev.sectionConfig.map((section) =>
        section.key === key ? { ...section, visible: !section.visible } : section
      ),
    }));
  };

  const renameSection = (key, label) => {
    updateActiveResume((prev) => ({
      ...prev,
      sectionConfig: prev.sectionConfig.map((section) =>
        section.key === key ? { ...section, label } : section
      ),
    }));
  };

  const reorderSections = (newOrder) => {
    updateActiveResume((prev) => ({
      ...prev,
      sectionConfig: newOrder.map((key, index) => {
        const existing = prev.sectionConfig.find((s) => s.key === key);
        return existing ? { ...existing, order: index } : { key, label: key, visible: true, order: index };
      }),
    }));
  };

  // Flush storage immediately (bypass debounce)
  const flushStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
      localStorage.setItem(ACTIVE_RESUME_KEY, activeResumeId || resume.meta.id);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Could not flush storage:', error);
      setSaveStatus('error');
    }
  };

  return {
    resume,
    resumes,
    activeResumeId,
    saveStatus,
    setActiveResumeId,
    createResume,
    createResumeWithData,
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
    updateEducation,
    removeEducation,
    addLink,
    updateLink,
    removeLink,
    addItem,
    updateItem,
    removeItem,
    resetResume,
    updateTheme,
    updateTemplate,
    updateSectionConfig,
    toggleSectionVisibility,
    renameSection,
    reorderSections,
    flushStorage,
  };
}
