import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

// System prompt that defines the AI's role and behavior
const SYSTEM_PROMPT = `You are an expert professional resume writer with 15+ years of experience in crafting compelling resumes for various industries. Your task is to write professional, impactful, and ATS-friendly resume content.

CRITICAL GUIDELINES:
1. Always provide a single, polished response - never give multiple options or alternatives
2. Be concise and direct - avoid conversational filler, explanations, or meta-commentary
3. Focus on the candidate's strengths and achievements
4. Use action verbs and quantifiable metrics when possible
5. Tailor the content to be professional yet authentic
6. If information is limited, create a strong foundation based on what's available without mentioning the lack of information
7. Never include phrases like "Given the lack of..." or "Since you haven't provided..."
8. Output should be ready to copy-paste directly into a resume
9. Keep summaries to 2-3 sentences maximum
10. Use professional, modern language that appeals to hiring managers`;

export async function generateSummary(personalInfo, skills, experience) {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const skillsList = skills.length > 0 ? skills.map((s) => s.name).join(', ') : 'various professional skills';
    const experienceList = experience.length > 0 
      ? experience.map((e) => `${e.jobTitle} at ${e.company}`).join('; ')
      : 'professional experience across various roles';

    const prompt = `Write a professional resume summary for ${personalInfo.fullName || 'a professional'}.

Available Information:
- Skills: ${skillsList}
- Experience: ${experienceList}

Requirements:
- Write 2-3 sentences maximum
- Focus on professional strengths, expertise, and value proposition
- Use strong action verbs and professional language
- Make it impactful and memorable
- Do NOT mention that information is limited - work with what you have
- Output ONLY the summary text, nothing else

Generate the summary now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let summary = response.text().trim();
    
    // Clean up any potential conversational elements
    summary = summary.replace(/^(Here is|Here's|The summary is:|Summary:)\s*/i, '');
    summary = summary.replace(/\n\n/g, ' ').replace(/\n/g, ' ');
    
    return summary;
  } catch (error) {
    console.error('Error generating summary - Full Error:', error);
    const message = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to generate summary: ${message}`);
  }
}

export async function improveExperience(jobTitle, description) {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const prompt = `Improve this job experience description for a resume:

Job Title: ${jobTitle}
Current Description: ${description}

Requirements:
- Make it more impactful, professional, and action-oriented
- Use strong action verbs at the beginning of bullet points
- Include quantifiable achievements where possible (use placeholders like [X%], [Y number] if specific metrics aren't provided)
- Focus on results and impact rather than just responsibilities
- Keep it concise and easy to scan
- Output ONLY the improved description, nothing else
- Do not include any explanations or conversational text

Improve the description now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let improved = response.text().trim();
    
    // Clean up any potential conversational elements
    improved = improved.replace(/^(Here is|Here's|The improved version is:|Improved:)\s*/i, '');
    improved = improved.replace(/\n\n/g, '\n').trim();
    
    return improved;
  } catch (error) {
    console.error('Error improving experience:', error);
    throw error;
  }
}

export async function suggestSkills(jobTitle, industry) {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const prompt = `Suggest 8-12 relevant skills for someone working as a ${jobTitle} in the ${industry} industry.

Requirements:
- Include a mix of technical and soft skills
- Focus on in-demand, modern skills
- Make them specific and actionable
- Return ONLY a comma-separated list
- No additional text, explanations, or numbering
- No conversational filler

Example format: JavaScript, React, Node.js, Project Management, Agile, Communication

Generate the skills list now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let skillsText = response.text().trim();
    
    // Clean up any potential conversational elements
    skillsText = skillsText.replace(/^(Here are|Here's|The skills are:|Skills:)\s*/i, '');
    skillsText = skillsText.replace(/\n/g, ', ');
    
    return skillsText.split(',').map((s) => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error('Error suggesting skills:', error);
    throw error;
  }
}
