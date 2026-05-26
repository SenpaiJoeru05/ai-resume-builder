export function ResumePreview({ resume, template = 'modern' }) {
  const renderModernTemplate = () => (
    <div className="bg-white p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="border-b-2 border-slate-300 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {resume.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {resume.personalInfo.email && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {resume.personalInfo.email}
            </span>
          )}
          {resume.personalInfo.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {resume.personalInfo.phone}
            </span>
          )}
          {resume.personalInfo.address && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {resume.personalInfo.address}
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Professional Summary</h2>
          <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{exp.jobTitle}</h3>
                    <p className="text-slate-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-slate-500 text-sm">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-slate-700 mt-2 text-sm leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-600 font-medium">{edu.school}</p>
                  </div>
                  {edu.graduationDate && (
                    <span className="text-slate-500 text-sm">{edu.graduationDate}</span>
                  )}
                </div>
                {edu.field && (
                  <p className="text-slate-700 text-sm">Field of Study: {edu.field}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm border border-slate-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="bg-white p-8" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
          {resume.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-700">
          {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
          {resume.personalInfo.phone && <span>| {resume.personalInfo.phone}</span>}
          {resume.personalInfo.address && <span>| {resume.personalInfo.address}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider border-b border-slate-300 pb-1">Professional Summary</h2>
          <p className="text-slate-700 leading-relaxed text-justify">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-300 pb-1">Experience</h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{exp.jobTitle}</h3>
                    <p className="text-slate-700 italic">{exp.company}</p>
                  </div>
                  <span className="text-slate-600 text-sm">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-slate-700 mt-2 text-sm leading-relaxed text-justify whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-300 pb-1">Education</h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-700 italic">{edu.school}</p>
                  </div>
                  {edu.graduationDate && (
                    <span className="text-slate-600 text-sm">{edu.graduationDate}</span>
                  )}
                </div>
                {edu.field && (
                  <p className="text-slate-700 text-sm">Field of Study: {edu.field}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider border-b border-slate-300 pb-1">Skills</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            {resume.skills.map((skill) => skill.name).join(' • ')}
          </p>
        </div>
      )}
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="bg-white p-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-900 mb-3 tracking-wide">
          {resume.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 uppercase tracking-wider">
          {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
          {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
          {resume.personalInfo.address && <span>• {resume.personalInfo.address}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <p className="text-slate-700 leading-relaxed text-sm font-light">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <div className="space-y-5">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-slate-900">{exp.jobTitle}</h3>
                  <span className="text-xs text-slate-400">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-2">{exp.company}</p>
                {exp.description && (
                  <p className="text-slate-700 text-sm leading-relaxed font-light whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-slate-900">{edu.degree}</h3>
                  {edu.graduationDate && (
                    <span className="text-xs text-slate-400">{edu.graduationDate}</span>
                  )}
                </div>
                <p className="text-slate-600 text-sm">{edu.school}</p>
                {edu.field && (
                  <p className="text-slate-700 text-xs font-light">{edu.field}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill.id}
                className="text-xs text-slate-600 uppercase tracking-wider"
              >
                {skill.name}
                {skill.id !== resume.skills[resume.skills.length - 1].id && ' /'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return renderClassicTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div
      id="resume-preview"
      className="rounded-lg shadow-lg max-w-4xl mx-auto"
    >
      {renderTemplate()}
    </div>
  );
}
