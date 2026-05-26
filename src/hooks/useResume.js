import { useState } from 'react';

const initialResume = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
  },
  professionalInfo: {
    jobTitle: '',
    industry: '',
    yearsExperience: '',
    keyAchievements: '',
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
};

// Simple unique ID generator
let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
};

export function useResume() {
  const [resume, setResume] = useState(initialResume);

  const updatePersonalInfo = (data) => {
    setResume((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateProfessionalInfo = (data) => {
    setResume((prev) => ({
      ...prev,
      professionalInfo: { ...prev.professionalInfo, ...data },
    }));
  };

  const updateSummary = (summary) => {
    setResume((prev) => ({ ...prev, summary }));
  };

  const addSkill = (skill) => {
    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: generateId(), name: skill }],
    }));
  };

  const removeSkill = (id) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  const addExperience = (exp) => {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), ...exp }],
    }));
  };

  const updateExperience = (id, data) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, ...data } : exp
      ),
    }));
  };

  const removeExperience = (id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = (edu) => {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { id: generateId(), ...edu }],
    }));
  };

  const updateEducation = (id, data) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...data } : edu
      ),
    }));
  };

  const removeEducation = (id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  return {
    resume,
    updatePersonalInfo,
    updateProfessionalInfo,
    updateSummary,
    addSkill,
    removeSkill,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
  };
}
