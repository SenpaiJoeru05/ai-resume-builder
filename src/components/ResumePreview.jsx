const SKILL_ORDER = ['Technical', 'Tools', 'Soft Skills', 'Languages', 'Other'];

const FONT_FAMILIES = {
  sans: "'Segoe UI', Arial, sans-serif",
  serif: "'Georgia', serif",
  modern: "'Helvetica', Arial, sans-serif",
};

const DENSITY_SPACING = {
  comfortable: { padding: '0.5in 1in 1in 1in', gap: '1rem' },
  compact: { padding: '0.3in 0.75in 0.75in 0.75in', gap: '0.5rem' },
};

export function ResumePreview({ resume, template = 'modern' }) {
  const {
    personalInfo,
    summary,
    experience,
    education,
    skills,
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
    meta = {},
    sectionConfig = [],
  } = resume;

  const theme = meta.theme || { accentColor: '#2563eb', font: 'sans', density: 'comfortable' };
  const spacing = DENSITY_SPACING[theme.density] || DENSITY_SPACING.comfortable;
  const fontFamily = FONT_FAMILIES[theme.font] || FONT_FAMILIES.sans;

  const links = (personalInfo.links || []).filter((l) => l.url || l.label);

  // Get visible sections in order from sectionConfig, or use default order if not configured
  const getVisibleSections = () => {
    if (sectionConfig.length > 0) {
      return sectionConfig
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(s => s.key);
    }
    // Default order if sectionConfig is not set
    return ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards'];
  };

  const visibleSections = getVisibleSections();

  const hasBullets = (exp) => Array.isArray(exp.bullets) && exp.bullets.some((b) => b.text && b.text.trim());

  const expDateLabel = (exp) => {
    const end = exp.current ? 'Present' : exp.endDate;
    return [exp.startDate, end].filter(Boolean).join(' - ');
  };

  // Bullets when present, otherwise the legacy single-description fallback.
  const renderExpBody = (exp, bodyClass) => {
    if (hasBullets(exp)) {
      return (
        <ul className={`list-disc ml-4 space-y-0.5 ${bodyClass}`}>
          {exp.bullets
            .filter((b) => b.text && b.text.trim())
            .map((b) => (
              <li key={b.id}>{b.text}</li>
            ))}
        </ul>
      );
    }
    if (exp.description) {
      return <p className={`whitespace-pre-line ${bodyClass}`}>{exp.description}</p>;
    }
    return null;
  };

  const skillGroups = () =>
    SKILL_ORDER.map((cat) => [cat, skills.filter((s) => (s.category || 'Other') === cat)]).filter(
      ([, items]) => items.length
    );

  // Projects / Certifications / Languages / Awards — shared across templates, heading style injected.
  const renderSection = (sectionKey, headingClass) => {
    const sectionLabel = sectionConfig.find(s => s.key === sectionKey)?.label || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);

    switch (sectionKey) {
      case 'summary':
        return summary && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <p className="text-slate-700 leading-relaxed text-justify text-xs">{summary}</p>
          </div>
        );

      case 'experience':
        return experience.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.jobTitle}</h3>
                      <p className="text-slate-600 font-semibold text-xs">
                        {[exp.company, exp.location].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <span className="text-slate-500 text-xs whitespace-nowrap ml-2">{expDateLabel(exp)}</span>
                  </div>
                  <div className="mt-1 text-slate-700 text-xs leading-relaxed">{renderExpBody(exp, '')}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return education.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                      <p className="text-slate-600 font-semibold text-xs">{edu.school}</p>
                    </div>
                    {edu.graduationDate && (
                      <span className="text-slate-500 text-xs whitespace-nowrap ml-2">{edu.graduationDate}</span>
                    )}
                  </div>
                  {edu.field && <p className="text-slate-700 text-xs">Field of Study: {edu.field}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        const groups = skillGroups();
        return skills.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-2">
              {groups.map(([cat, items]) => (
                <div key={cat}>
                  {groups.length > 1 && <p className="text-xs font-semibold text-slate-500 mb-1">{cat}</p>}
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill.id} className="px-2 py-1 rounded text-xs border font-medium" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}>
                        {skill.name}
                        {skill.level ? ` · ${skill.level}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return projects.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                    {p.link && <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">{p.link}</span>}
                  </div>
                  {p.technologies && <p className="text-slate-600 text-xs italic">{p.technologies}</p>}
                  {p.description && <p className="text-slate-700 text-xs leading-relaxed">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return certifications.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-1">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900 text-xs">{c.name}</h3>
                  <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">
                    {[c.issuer, c.date].filter(Boolean).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        return languages.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <p className="text-slate-700 text-xs">
              {languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join('  •  ')}
            </p>
          </div>
        );

      case 'awards':
        return awards.length > 0 && (
          <div className="mb-4">
            <h2 className={headingClass}>{sectionLabel}</h2>
            <div className="space-y-1">
              {awards.map((a) => (
                <div key={a.id} className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900 text-xs">{a.title}</h3>
                  <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">
                    {[a.issuer, a.date].filter(Boolean).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ------------------------------- Modern -------------------------------- */
  const renderModernTemplate = () => {
    const heading = `text-sm font-bold mb-2 uppercase tracking-widest`;
    return (
      <div className="bg-white h-full flex flex-col" style={{ fontFamily, fontSize: '12px', padding: spacing.padding }}>
        <div className="border-b-2 pb-4 mb-4" style={{ borderColor: theme.accentColor }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" style={{ color: theme.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" style={{ color: theme.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.address && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" style={{ color: theme.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {personalInfo.address}
              </span>
            )}
            {links.map((l) => (
              <span key={l.id} className="flex items-center gap-1">
                <svg className="w-4 h-4" style={{ color: theme.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
                </svg>
                {l.url || l.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {visibleSections.map(sectionKey => renderSection(sectionKey, heading))}
        </div>
      </div>
    );
  };

  /* ------------------------------- Classic ------------------------------- */
  const renderClassicTemplate = () => {
    const heading = 'text-sm font-bold mb-2 uppercase tracking-widest border-b pb-2';
    return (
      <div className="bg-white h-full flex flex-col" style={{ fontFamily, fontSize: '12px', padding: spacing.padding }}>
        <div className="text-center border-b-2 pb-4 mb-4" style={{ borderColor: theme.accentColor }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-slate-700">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>| {personalInfo.phone}</span>}
            {personalInfo.address && <span>| {personalInfo.address}</span>}
            {links.map((l) => (
              <span key={l.id}>| {l.url || l.label}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {visibleSections.map(sectionKey => renderSection(sectionKey, heading))}
        </div>
      </div>
    );
  };

  /* ------------------------------- Minimal ------------------------------- */
  const renderMinimalTemplate = () => {
    const heading = 'text-xs font-semibold uppercase tracking-widest mb-1';
    return (
      <div className="bg-white h-full flex flex-col" style={{ fontFamily, fontSize: '12px', padding: spacing.padding }}>
        <div className="mb-4">
          <h1 className="text-2xl font-light text-slate-900 mb-2 tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest" style={{ color: theme.accentColor }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
            {links.map((l) => (
              <span key={l.id}>• {l.url || l.label}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {visibleSections.map(sectionKey => renderSection(sectionKey, heading))}
        </div>
      </div>
    );
  };

  /* ------------------------------- Two-Column ------------------------------- */
  const renderTwoColumnTemplate = () => {
    const heading = `text-xs font-bold mb-2 uppercase tracking-widest`;
    const groups = skillGroups();
    return (
      <div className="bg-white h-full flex flex-col" style={{ fontFamily, fontSize: '11px', padding: spacing.padding }}>
        <div className="flex gap-4 mb-4" style={{ borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: '1rem' }}>
          <div className="w-2/3">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
            </div>
          </div>
          <div className="w-1/3">
            {links.map((l) => (
              <div key={l.id} className="text-xs text-slate-600 mb-1">
                {l.label}: {l.url || l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 flex-1 overflow-y-auto pr-2">
          {/* Left Column - Main Content */}
          <div className="w-2/3 space-y-4">
            {visibleSections.filter(s => ['summary', 'experience', 'education'].includes(s)).map(sectionKey => renderSection(sectionKey, heading))}
          </div>

          {/* Right Column - Skills & Extras */}
          <div className="w-1/3 space-y-4">
            {skills.length > 0 && (
              <div className="mb-4">
                <h2 className={heading} style={{ color: theme.accentColor }}>Skills</h2>
                <div className="space-y-2">
                  {groups.map(([cat, items]) => (
                    <div key={cat}>
                      {groups.length > 1 && <p className="text-xs font-semibold text-slate-500 mb-1">{cat}</p>}
                      <div className="flex flex-wrap gap-1">
                        {items.map((skill) => (
                          <span key={skill.id} className="px-1.5 py-0.5 rounded text-xs border font-medium" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}40` }}>
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {visibleSections.filter(s => ['projects', 'certifications', 'languages', 'awards'].includes(s)).map(sectionKey => renderSection(sectionKey, heading))}
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------- ATS-Safe ------------------------------- */
  const renderATSSafeTemplate = () => {
    const heading = `text-sm font-bold mb-2 uppercase tracking-widest`;
    return (
      <div className="bg-white h-full flex flex-col" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: spacing.padding }}>
        <div className="mb-4" style={{ borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: '1rem' }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>| {personalInfo.phone}</span>}
            {personalInfo.address && <span>| {personalInfo.address}</span>}
            {links.map((l) => (
              <span key={l.id}>| {l.url || l.label}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {visibleSections.map(sectionKey => renderSection(sectionKey, heading))}
        </div>
      </div>
    );
  };

  /* ------------------------------- Creative ------------------------------- */
  const renderCreativeTemplate = () => {
    const heading = `text-sm font-bold mb-2 uppercase tracking-widest`;
    const groups = skillGroups();
    return (
      <div className="h-full flex flex-col" style={{ fontFamily, fontSize: '12px', padding: spacing.padding, backgroundColor: theme.accentColor }}>
        <div className="bg-white rounded-lg p-6 mb-4 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
            {links.map((l) => (
              <span key={l.id}>• {l.url || l.label}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 bg-white rounded-lg p-6 shadow-lg">
          {visibleSections.map(sectionKey => renderSection(sectionKey, heading))}
        </div>
      </div>
    );
  };

  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return renderClassicTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      case 'two-column':
        return renderTwoColumnTemplate();
      case 'ats-safe':
        return renderATSSafeTemplate();
      case 'creative':
        return renderCreativeTemplate();
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div id="resume-preview" className="h-full w-full overflow-y-auto flex flex-col">
      {renderTemplate()}
    </div>
  );
}
