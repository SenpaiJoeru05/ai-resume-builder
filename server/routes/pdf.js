import express from 'express';
import puppeteer from 'puppeteer';
const router = express.Router();

// Helper function to get template CSS
function getTemplateCSS(template) {
  const baseCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #334155;
      padding: 0;
      margin: 0;
    }
    
    .container {
      padding: 0.5in 1in 1in 1in;
      width: 794px;
      max-width: 794px;
      position: relative;
    }
    
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    
    .name {
      font-size: 30px;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .contact {
      font-size: 14px;
      color: #475569;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .section-header {
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
      color: #2563eb;
    }
    
    .section {
      margin-bottom: 16px;
    }
    
    .job-title {
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
    }
    
    .company {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-top: 2px;
    }
    
    .date {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
    }
    
    .description {
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
      margin-top: 4px;
      white-space: pre-line;
    }
    
    .skill-badge {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 4px 8px;
      margin: 2px;
      border-radius: 4px;
      font-size: 12px;
      border: 1px solid #bfdbfe;
      font-weight: 500;
    }
  `;

  if (template === 'classic') {
    return baseCSS.replace(/Segoe UI, Arial, sans-serif/g, 'Georgia, serif')
      .replace(/#2563eb/g, '#0f172a')
      .replace(/\.header \{[^}]+\}/g, '.header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 16px; text-align: center; }')
      .replace(/\.name \{[^}]+\}/g, '.name { font-size: 30px; font-weight: bold; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }')
      .replace(/\.contact \{[^}]+\}/g, '.contact { font-size: 14px; color: #374151; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }')
      .replace(/\.section-header \{[^}]+\}/g, '.section-header { font-size: 14px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #0f172a; padding-bottom: 8px; }')
      .replace(/\.company \{[^}]+\}/g, '.company { font-size: 12px; font-style: italic; color: #374151; margin-top: 2px; }')
      .replace(/\.skill-badge \{[^}]+\}/g, '.skill { font-size: 12px; color: #374151; }');
  } else if (template === 'minimal') {
    return baseCSS.replace(/Segoe UI, Arial, sans-serif/g, 'Helvetica, Arial, sans-serif')
      .replace(/\.header \{[^}]+\}/g, '.header { margin-bottom: 16px; }')
      .replace(/\.name \{[^}]+\}/g, '.name { font-size: 24px; font-weight: 300; color: #0f172a; letter-spacing: 0.05em; margin-bottom: 8px; }')
      .replace(/\.contact \{[^}]+\}/g, '.contact { font-size: 12px; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; gap: 8px; }')
      .replace(/\.section-header \{[^}]+\}/g, '')
      .replace(/\.skill-badge \{[^}]+\}/g, '.skill { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-right: 8px; }');
  }

  return baseCSS;
}

// Helper function to generate HTML from resume data
function generateResumeHTML(resume, template) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${getTemplateCSS(template)}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="name">${resume.personalInfo.fullName || 'Your Name'}</div>
          <div class="contact">
            ${resume.personalInfo.email ? `<div class="contact-item">
              <svg style="width: 16px; height: 16px; color: #2563eb; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              ${resume.personalInfo.email}
            </div>` : ''}
            ${resume.personalInfo.phone ? `<div class="contact-item">
              <svg style="width: 16px; height: 16px; color: #2563eb; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              ${resume.personalInfo.phone}
            </div>` : ''}
            ${resume.personalInfo.address ? `<div class="contact-item">
              <svg style="width: 16px; height: 16px; color: #2563eb; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${resume.personalInfo.address}
            </div>` : ''}
          </div>
        </div>
  `;

  // Summary
  if (resume.summary) {
    html += `
      <div class="section">
        <div class="section-header">Professional Summary</div>
        <div class="description">${resume.summary}</div>
      </div>
    `;
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    html += '<div class="section">';
    if (template !== 'minimal') {
      html += '<div class="section-header">Experience</div>';
    }
    resume.experience.forEach(exp => {
      html += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="job-title">${exp.title || exp.jobTitle}</div>
            <div class="date">${exp.startDate} - ${exp.endDate}</div>
          </div>
          <div class="company">${exp.company}</div>
          ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    html += '<div class="section">';
    if (template !== 'minimal') {
      html += '<div class="section-header">Education</div>';
    }
    resume.education.forEach(edu => {
      html += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="job-title">${edu.degree}</div>
            ${edu.graduationDate ? `<div class="date">${edu.graduationDate}</div>` : ''}
          </div>
          <div class="company">${edu.school}</div>
          ${edu.field ? `<div class="description">Field of Study: ${edu.field}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    html += '<div class="section">';
    if (template !== 'minimal') {
      html += '<div class="section-header">Skills</div>';
    }
    if (template === 'modern') {
      html += '<div>';
      resume.skills.forEach(skill => {
        html += `<span class="skill-badge">${skill.name}</span>`;
      });
      html += '</div>';
    } else if (template === 'classic') {
      html += `<div class="skill">${resume.skills.map(s => s.name).join(' • ')}</div>`;
    } else {
      html += `<div class="skill">${resume.skills.map(s => s.name).join(' / ')}</div>`;
    }
    html += '</div>';
  }

  html += `
      </div>
    </body>
    </html>
  `;
  return html;
}

router.post('/generate', async (req, res) => {
  try {
    const { resume, template } = req.body;
    
    console.log('Generating PDF for template:', template);
    
    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate HTML from resume data
    const html = generateResumeHTML(resume, template);
    
    // Set HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '',
      footerTemplate: `
        <div style="font-size: 14px; color: #6b7280; text-align: right; padding-right: 24px; padding-bottom: 16px; width: 100%; opacity: 0.7;">
          Page <span class="pageNumber"></span>
        </div>
      `
    });
    
    await browser.close();
    
    console.log('PDF generated successfully');
    
    // Send PDF as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

export default router;
