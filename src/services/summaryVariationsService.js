/**
 * Summary Variations Service
 * Generates multiple variations of a resume summary with different tones and styles
 */

export async function generateSummaryVariations(resume) {
  const { summary, professionalInfo, experience, skills, education } = resume;
  
  // If no existing summary, generate based on resume content
  const baseContent = summary || buildBaseContent(resume);
  
  const variations = [
    {
      id: 'professional',
      title: 'Professional',
      tone: 'Professional and polished',
      summary: await generateVariation(baseContent, professionalInfo, 'professional'),
    },
    {
      id: 'confident',
      title: 'Confident',
      tone: 'Bold and achievement-focused',
      summary: await generateVariation(baseContent, professionalInfo, 'confident'),
    },
    {
      id: 'creative',
      title: 'Creative',
      tone: 'Innovative and dynamic',
      summary: await generateVariation(baseContent, professionalInfo, 'creative'),
    },
    {
      id: 'concise',
      title: 'Concise',
      tone: 'Brief and impactful',
      summary: await generateVariation(baseContent, professionalInfo, 'concise'),
    },
  ];
  
  return variations;
}

function buildBaseContent(resume) {
  const parts = [];
  
  if (resume.professionalInfo?.jobTitle) {
    parts.push(`Target role: ${resume.professionalInfo.jobTitle}`);
  }
  
  if (resume.experience?.length > 0) {
    const exp = resume.experience.map(e => e.jobTitle).join(', ');
    parts.push(`Experience: ${exp}`);
  }
  
  if (resume.skills?.length > 0) {
    const skillNames = resume.skills.slice(0, 5).map(s => s.name).join(', ');
    parts.push(`Key skills: ${skillNames}`);
  }
  
  return parts.join('. ');
}

async function generateVariation(baseContent, professionalInfo, tone) {
  // In a real implementation, this would call an AI service
  // For now, we'll generate variations based on the tone
  
  const jobTitle = professionalInfo?.jobTitle || 'professional';
  const industry = professionalInfo?.industry || 'industry';
  
  const tonePrompts = {
    professional: `Write a professional summary for a ${jobTitle} in the ${industry} industry. Focus on expertise, experience, and qualifications. Use formal language and a confident but measured tone.`,
    confident: `Write a bold, achievement-focused summary for a ${jobTitle}. Emphasize accomplishments, results, and impact. Use strong action verbs and confident language.`,
    creative: `Write an innovative and dynamic summary for a ${jobTitle}. Highlight creativity, problem-solving, and forward-thinking approaches. Use engaging and energetic language.`,
    concise: `Write a brief, impactful summary for a ${jobTitle} in 2-3 sentences. Focus on the most important qualifications and value proposition. Be direct and punchy.`,
  };
  
  // Simulate AI generation with templates
  const templates = {
    professional: `Results-driven ${jobTitle} with proven expertise in ${industry}. Skilled in delivering high-quality solutions and driving business outcomes. Strong background in project management and team collaboration.`,
    confident: `Accomplished ${jobTitle} with a track record of exceeding expectations and delivering measurable results. Expert in ${industry} with a history of leading successful initiatives and driving organizational growth.`,
    creative: `Innovative ${jobTitle} passionate about pushing boundaries and finding creative solutions in ${industry}. Known for thinking outside the box and bringing fresh perspectives to complex challenges.`,
    concise: `${jobTitle} with expertise in ${industry}. Proven track record of delivering results and driving business value.`,
  };
  
  // If there's existing content, try to incorporate it
  if (baseContent && baseContent.length > 50) {
    return `${templates[tone]} ${baseContent.substring(0, 100)}...`;
  }
  
  return templates[tone];
}

export async function improveSummaryWithGrammar(summary) {
  // In a real implementation, this would use a grammar checking service
  // For now, we'll do basic improvements
  
  if (!summary) return '';
  
  let improved = summary
    .replace(/\s+/g, ' ') // Remove extra spaces
    .replace(/\s+([.,;:])/g, '$1') // Fix spacing before punctuation
    .replace(/([.,;:])\s*$/g, '$1') // Remove trailing spaces
    .trim();
  
  // Capitalize first letter
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  // Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(improved)) {
    improved += '.';
  }
  
  return improved;
}

export function checkGrammar(text) {
  const issues = [];
  
  if (!text) return issues;
  
  // Check for common grammar issues
  const checks = [
    {
      pattern: /\bi\b/g,
      message: 'Consider capitalizing "I" when referring to yourself',
      severity: 'warning',
    },
    {
      pattern: /\s{2,}/g,
      message: 'Multiple spaces detected',
      severity: 'info',
    },
    {
      pattern: /[.!?]\s*[a-z]/g,
      message: 'Sentence may not start with a capital letter',
      severity: 'warning',
    },
    {
      pattern: /\b(very|really)\s+/gi,
      message: 'Consider removing intensifiers for stronger writing',
      severity: 'suggestion',
    },
    {
      pattern: /\b(responsible for|worked on|helped with)\b/gi,
      message: 'Use stronger action verbs instead of passive phrases',
      severity: 'suggestion',
    },
  ];
  
  checks.forEach(check => {
    const matches = text.match(check.pattern);
    if (matches) {
      issues.push({
        message: check.message,
        severity: check.severity,
        count: matches.length,
      });
    }
  });
  
  return issues;
}

export function checkImpact(text) {
  const suggestions = [];
  
  if (!text) return suggestions;
  
  // Check for impact indicators
  const hasNumbers = /\d+%|\$\d+|\d+\+|\d+ years/gi.test(text);
  const hasActionVerbs = /\b(achieved|delivered|increased|decreased|improved|created|developed|managed|led|built|launched)\b/gi.test(text);
  const hasResults = /\b(result|outcome|impact|success|growth|revenue|savings)\b/gi.test(text);
  
  if (!hasNumbers) {
    suggestions.push({
      message: 'Add quantifiable metrics (percentages, numbers) to strengthen your impact',
      severity: 'warning',
    });
  }
  
  if (!hasActionVerbs) {
    suggestions.push({
      message: 'Use stronger action verbs to describe your achievements',
      severity: 'suggestion',
    });
  }
  
  if (!hasResults) {
    suggestions.push({
      message: 'Highlight the results and outcomes of your work',
      severity: 'suggestion',
    });
  }
  
  return suggestions;
}
