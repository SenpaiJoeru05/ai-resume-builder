/**
 * ATS (Applicant Tracking System) Scoring Service
 * Calculates how well a resume matches a job description based on keyword analysis
 */

export function calculateATSScore(resume, jobDescription = '') {
  if (!jobDescription) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: [],
    };
  }

  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  
  // Extract keywords from resume
  const resumeKeywords = extractResumeKeywords(resume);
  
  // Calculate matches
  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeKeywords.some(resumeKeyword => 
      resumeKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(resumeKeyword.toLowerCase())
    )
  );
  
  const missingKeywords = jobKeywords.filter(keyword => 
    !matchedKeywords.includes(keyword)
  );
  
  // Calculate score (percentage of matched keywords)
  const score = jobKeywords.length > 0 
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 0;
  
  // Generate suggestions
  const suggestions = generateSuggestions(missingKeywords, resume);
  
  return {
    score,
    matchedKeywords,
    missingKeywords,
    suggestions,
  };
}

function extractKeywords(text) {
  if (!text) return [];
  
  // Common technical and professional terms to look for
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what',
    'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
    'here', 'there', 'then', 'once', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'work', 'experience', 'role', 'position', 'team', 'company', 'looking', 'seeking',
    'join', 'join our', 'we are', 'we\'re', 'you will', 'you\'ll', 'ability', 'skills',
    'requirements', 'qualifications', 'responsibilities', 'duties', 'including',
    'such as', 'including but not limited', 'etc', 'various', 'multiple', 'several',
  ]);
  
  // Split into words and filter out stop words and short words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Also extract multi-word phrases (2-3 words)
  const phrases = [];
  const wordsArray = text.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/);
  
  for (let i = 0; i < wordsArray.length - 1; i++) {
    const twoWord = `${wordsArray[i]} ${wordsArray[i + 1]}`;
    if (!stopWords.has(wordsArray[i]) && !stopWords.has(wordsArray[i + 1])) {
      phrases.push(twoWord);
    }
  }
  
  for (let i = 0; i < wordsArray.length - 2; i++) {
    const threeWord = `${wordsArray[i]} ${wordsArray[i + 1]} ${wordsArray[i + 2]}`;
    if (!stopWords.has(wordsArray[i]) && !stopWords.has(wordsArray[i + 1]) && !stopWords.has(wordsArray[i + 2])) {
      phrases.push(threeWord);
    }
  }
  
  // Combine and deduplicate
  const allKeywords = [...new Set([...words, ...phrases])];
  
  // Return top keywords (prioritize longer phrases)
  return allKeywords
    .sort((a, b) => b.length - a.length)
    .slice(0, 50); // Limit to top 50 keywords
}

function extractResumeKeywords(resume) {
  const keywords = [];
  
  // From skills
  if (resume.skills) {
    resume.skills.forEach(skill => {
      keywords.push(skill.name);
      if (skill.category) keywords.push(skill.category);
    });
  }
  
  // From experience
  if (resume.experience) {
    resume.experience.forEach(exp => {
      keywords.push(exp.jobTitle);
      keywords.push(exp.company);
      if (exp.bullets) {
        exp.bullets.forEach(bullet => {
          if (bullet.text) {
            keywords.push(...bullet.text.split(/\s+/).filter(w => w.length > 3));
          }
        });
      }
    });
  }
  
  // From education
  if (resume.education) {
    resume.education.forEach(edu => {
      keywords.push(edu.degree);
      keywords.push(edu.school);
      if (edu.field) keywords.push(edu.field);
    });
  }
  
  // From summary
  if (resume.summary) {
    keywords.push(...resume.summary.split(/\s+/).filter(w => w.length > 3));
  }
  
  // From projects
  if (resume.projects) {
    resume.projects.forEach(project => {
      keywords.push(project.name);
      if (project.technologies) {
        keywords.push(...project.technologies.split(/[,;\s]+/).filter(w => w.length > 2));
      }
    });
  }
  
  // From certifications
  if (resume.certifications) {
    resume.certifications.forEach(cert => {
      keywords.push(cert.name);
      keywords.push(cert.issuer);
    });
  }
  
  // Return unique keywords
  return [...new Set(keywords.map(k => k.toLowerCase()))];
}

function generateSuggestions(missingKeywords, resume) {
  const suggestions = [];
  
  if (missingKeywords.length === 0) {
    suggestions.push('Your resume matches the job description well!');
    return suggestions;
  }
  
  // Categorize missing keywords
  const techKeywords = missingKeywords.filter(k => 
    ['javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'kubernetes', 
     'sql', 'nosql', 'mongodb', 'postgresql', 'git', 'agile', 'scrum', 'ci/cd',
     'devops', 'microservices', 'api', 'rest', 'graphql', 'typescript', 'angular',
     'vue', 'django', 'flask', 'spring', 'machine learning', 'ai', 'data science',
     'cloud', 'azure', 'gcp', 'linux', 'html', 'css', 'sass', 'webpack', 'testing',
     'jest', 'cypress', 'selenium', 'jira', 'confluence', 'slack'].some(tech => 
      k.toLowerCase().includes(tech)
    )
  );
  
  const softSkillKeywords = missingKeywords.filter(k => 
    ['communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
     'analytical', 'strategic', 'management', 'organization', 'time management',
     'adaptability', 'creativity', 'innovation', 'detail-oriented', 'results-driven',
     'self-motivated', 'proactive', 'client-facing', 'stakeholder management'].some(skill =>
      k.toLowerCase().includes(skill)
    )
  );
  
  if (techKeywords.length > 0) {
    suggestions.push(`Consider adding these technical skills to your Skills section: ${techKeywords.slice(0, 5).join(', ')}`);
  }
  
  if (softSkillKeywords.length > 0) {
    suggestions.push(`Highlight these soft skills in your experience bullet points: ${softSkillKeywords.slice(0, 5).join(', ')}`);
  }
  
  if (missingKeywords.length > 10) {
    suggestions.push('Tailor your summary to include more keywords from the job description');
  }
  
  // Check if skills section could be improved
  if (resume.skills && resume.skills.length < 5 && techKeywords.length > 3) {
    suggestions.push('Add more technical skills to better match the job requirements');
  }
  
  // Check if experience could be improved
  if (resume.experience && resume.experience.length > 0) {
    suggestions.push('Incorporate missing keywords into your experience bullet points to improve ATS matching');
  }
  
  return suggestions;
}

export function generateTailoredSuggestions(resume, jobDescription) {
  const atsResult = calculateATSScore(resume, jobDescription);
  
  return {
    atsScore: atsResult.score,
    matchedKeywords: atsResult.matchedKeywords,
    missingKeywords: atsResult.missingKeywords,
    suggestions: atsResult.suggestions,
    summaryImprovement: generateSummaryImprovement(resume, jobDescription, atsResult),
  };
}

function generateSummaryImprovement(resume, jobDescription, atsResult) {
  if (!jobDescription || atsResult.missingKeywords.length === 0) {
    return null;
  }
  
  const topMissingKeywords = atsResult.missingKeywords.slice(0, 5);
  
  return {
    suggestion: `Consider incorporating these keywords into your summary: ${topMissingKeywords.join(', ')}`,
    example: `Results-driven professional with expertise in ${topMissingKeywords.slice(0, 3).join(', ')}. Proven track record of delivering high-quality solutions with strong ${topMissingKeywords[3] || 'technical'} and ${topMissingKeywords[4] || 'problem-solving'} skills.`,
  };
}
