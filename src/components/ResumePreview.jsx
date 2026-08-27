// ResumePreview.jsx
import React, { useRef, useEffect, useState } from 'react'
import { getPageSize } from '../utils/pageSizes'

// Default ordering for the built-in categories. Custom categories a user types
// ("Front-End", "Back-End & AI") are NOT limited to this list — they render
// after these, in the order they first appear in the skills array.
const SKILL_ORDER = ['Technical', 'Tools', 'Soft Skills', 'Languages', 'Other'];

// Groups skills by category for rendering.
//
// This used to map over SKILL_ORDER and filter, which meant any skill with a
// category outside those five matched no group and was SILENTLY DROPPED from
// both the preview and the PDF — a resume imported with "Front-End" or
// "Databases & Tools" lost those skills with no error. Now every category
// present in the data gets a group.
function groupSkills(skills) {
  const groups = new Map();
  for (const skill of skills) {
    const cat = (skill.category || 'Other').trim() || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(skill);
  }
  // Built-ins keep their conventional order (so existing resumes don't shuffle);
  // anything user-named follows, in first-appearance order.
  const known = SKILL_ORDER.filter(c => groups.has(c));
  const custom = [...groups.keys()].filter(c => !SKILL_ORDER.includes(c));
  return [...known, ...custom].map(cat => [cat, groups.get(cat)]);
}

// ─── Professional resume margins (96 dpi: 0.75in = 72px) ─────────────────────
const MARGINS = {
  comfortable: { top: 72, right: 72, bottom: 72, left: 72 },
  compact:     { top: 48, right: 54, bottom: 48, left: 54 },
};

// Height of the footer strip that sits inside the bottom margin.
// MUST be subtracted from the paginator budget so content never overlaps it.
const FOOTER_H = 24;

// Approx height of the name/contact header on page 1
const HEADER_H = 100;
// Gap between entries (px)
const ENTRY_GAP = 8;
// Gap between sections
const SECTION_GAP = 16;

// Per-template pagination tuning. `header` = approx height of the page-1
// name/contact block; `extra` = vertical chrome a template adds on EVERY page
// (e.g. Creative's white content card padding). Subtracting these from the
// paginator budget keeps content from overflowing and getting clipped.
const TEMPLATE_CHROME = {
  modern:       { extra: 0,  header: 100 },
  classic:      { extra: 0,  header: 120 },
  minimal:      { extra: 0,  header: 90  },
  'ats-safe':   { extra: 0,  header: 100 },
  creative:     { extra: 64, header: 150 },
  'two-column': { extra: 0,  header: 90  },
};

// Two-column template: long-form sections fill the wide main column; short
// list-style sections go in the narrow sidebar. Used by BOTH the paginator
// (to measure at the right width) and the renderer (to place sections), so
// they stay in sync.
const TWO_COL_LEFT  = ['summary', 'experience', 'education', 'projects'];
const TWO_COL_RIGHT = ['skills', 'certifications', 'languages', 'awards'];

const FONT_FAMILIES = {
  sans:   "'Segoe UI', Arial, sans-serif",
  serif:  "'Georgia', serif",
  modern: "'Helvetica', Arial, sans-serif",
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function expDateLabel(exp) {
  return [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
}
function hasBullets(exp) {
  return Array.isArray(exp.bullets) && exp.bullets.some(b => b.text?.trim());
}
// Renders a multi-role headline with pipes rather than commas: "Web Developer |
// Data Analyst" reads as two distinct roles, where a comma reads as one long
// title. Splits on commas the user typed, drops empties, and leaves a title that
// already uses pipes untouched.
function formatJobTitle(raw) {
  const parts = String(raw || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  return parts.join(' | ');
}

// The target role rendered under the name. Module-scope (not defined during
// render) so it keeps a stable identity across renders.
function JobTitleLine({ jobTitle, className = '', style = {} }) {
  return jobTitle ? <p className={className} style={style}>{jobTitle}</p> : null;
}
function ExpBody({ exp }) {
  if (hasBullets(exp))
    return (
      <ul className="list-disc ml-4 space-y-0.5">
        {exp.bullets.filter(b => b.text?.trim()).map(b => <li key={b.id}>{b.text}</li>)}
      </ul>
    );
  if (exp.description) return <p className="whitespace-pre-line">{exp.description}</p>;
  return null;
}

// ─── main ─────────────────────────────────────────────────────────────────────
export function ResumePreview({ resume, template = 'modern', currentPage = 1, onPageCountChange }) {
  const {
    personalInfo, professionalInfo = {}, summary, experience = [], education = [], skills = [],
    projects = [], certifications = [], languages = [], awards = [],
    meta = {}, sectionConfig = [],
  } = resume;

  const theme   = meta.theme || { accentColor: '#2563eb', font: 'sans', density: 'comfortable' };
  // Chosen paper size drives both the rendered page box and the pagination
  // budget, so a taller page genuinely fits more content per page.
  const page    = getPageSize(theme.pageSize);
  const pageW   = page.width;
  const pageH   = page.height;
  const margins = MARGINS[theme.density] ?? MARGINS.comfortable;
  const font    = FONT_FAMILIES[theme.font] ?? FONT_FAMILIES.sans;
  const links   = (personalInfo.links || []).filter(l => l.url || l.label);

  // The target role, shown under the name — the convention on virtually every
  // real resume. Comes from Job Target (professionalInfo), not the latest job,
  // so it reflects the role being applied FOR rather than the one last held.
  const jobTitle = formatJobTitle(professionalInfo.jobTitle);

  // ── Optional profile photo ────────────────────────────────────────────────
  // Shown in the page-1 header of photo-friendly templates. Skipped for
  // 'ats-safe' on purpose — ATS parsers can't read images and a photo can hurt
  // automated screening, so that template stays text-only.
  const showPhoto  = !!personalInfo.photo && theme.showPhoto !== false && template !== 'ats-safe';
  const photoAlign = theme.photoAlign || 'left';            // left | center | right
  const photoRadius =                                       // shape → corner radius
    theme.photoShape === 'square'  ? '4px'  :
    theme.photoShape === 'rounded' ? '14px' : '9999px';     // default: circle

  // The avatar floats so the name/contacts flow beside it (left/right), or sits
  // as a centered block above the name (center). Header containers set
  // `display: flow-root` so the float is contained and the divider sits below.
  const PhotoAvatar = ({ size = 72, style = {} }) => {
    if (!showPhoto) return null;
    const renderSize = theme.photoSize || size;             // user-set size overrides the template default
    const place =
      photoAlign === 'center' ? { display: 'block', margin: '0 auto 12px' } :
      photoAlign === 'right'  ? { float: 'right', margin: '0 0 8px 18px' } :
                                { float: 'left',  margin: '0 18px 8px 0' };
    return (
      <img
        src={personalInfo.photo}
        alt=""
        aria-hidden="true"
        style={{
          width: renderSize, height: renderSize, objectFit: 'cover', borderRadius: photoRadius,
          border: `2px solid ${theme.accentColor}`, ...place, ...style,
        }}
      />
    );
  };

  const orderedSections = sectionConfig.length > 0
    ? sectionConfig.filter(s => s.visible).sort((a,b) => a.order - b.order).map(s => s.key)
    : ['summary','experience','education','skills','projects','certifications','languages','awards'];

  const labelFor = key =>
    sectionConfig.find(s => s.key === key)?.label ||
    key.charAt(0).toUpperCase() + key.slice(1);

  const skillGroups = () => groupSkills(skills);
  // Inline ("Front-End: React, Vue, Tailwind") is the default: it fits roughly
  // 4x more skills per line than chips and is far easier for an ATS to parse,
  // since each skill isn't wrapped in its own styled element. Chips stay
  // available via Customize for the more visual templates.
  const skillsAsPills = theme.skillStyle === 'pills';

  // ── Build flat entry list ─────────────────────────────────────────────────
  const buildEntries = (headingClass) => {
    const entries = [];
    const add = (sectionKey, isFirst, node, id) =>
      entries.push({ id, sectionKey, isFirst, node });

    for (const sk of orderedSections) {
      if (sk === 'summary' && summary) {
        add(sk, true,
          <div>
            <h2 className={headingClass}>{labelFor(sk)}</h2>
            <p className="text-slate-700 leading-relaxed text-justify text-xs">{summary}</p>
          </div>,
          'summary-0');
      }
      else if (sk === 'experience' && experience.length) {
        experience.forEach((exp, i) => {
          add(sk, i === 0, (
            <div>
              {i === 0 && <h2 className={headingClass}>{labelFor(sk)}</h2>}
              <div className="text-xs text-slate-700 leading-relaxed">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{exp.jobTitle}</h3>
                    <p className="text-slate-600 font-semibold text-xs">
                      {[exp.company, exp.location].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <span className="text-slate-500 text-xs whitespace-nowrap ml-2">{expDateLabel(exp)}</span>
                </div>
                <div className="mt-1"><ExpBody exp={exp} /></div>
              </div>
            </div>
          ), `exp-${exp.id}`);
        });
      }
      else if (sk === 'education' && education.length) {
        education.forEach((edu, i) => {
          add(sk, i === 0, (
            <div>
              {i === 0 && <h2 className={headingClass}>{labelFor(sk)}</h2>}
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                    <p className="text-slate-600 font-semibold text-xs">{edu.school}</p>
                  </div>
                  {edu.graduationDate && <span className="text-slate-500 text-xs whitespace-nowrap ml-2">{edu.graduationDate}</span>}
                </div>
                {edu.field && <p className="text-slate-700 text-xs">Field of Study: {edu.field}</p>}
              </div>
            </div>
          ), `edu-${edu.id}`);
        });
      }
      else if (sk === 'skills' && skills.length) {
        const groups = skillGroups();
        add(sk, true, (
          <div>
            <h2 className={headingClass}>{labelFor(sk)}</h2>
            {skillsAsPills ? (
              <div className="space-y-2">
                {groups.map(([cat, items]) => (
                  <div key={cat}>
                    {groups.length > 1 && <p className="text-xs font-semibold text-slate-500 mb-1">{cat}</p>}
                    <div className="flex flex-wrap gap-2">
                      {items.map(skill => (
                        <span key={skill.id} className="px-2 py-1 rounded text-xs border font-medium"
                          style={{ backgroundColor:`${theme.accentColor}15`, color:theme.accentColor, borderColor:`${theme.accentColor}40` }}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {groups.map(([cat, items]) => (
                  <p key={cat} className="text-xs text-slate-700 leading-relaxed">
                    {groups.length > 1 && (
                      <span className="font-semibold text-slate-900">{cat}: </span>
                    )}
                    {items.map(sk2 => sk2.name).filter(Boolean).join(', ')}
                  </p>
                ))}
              </div>
            )}
          </div>
        ), 'skills-0');
      }
      else if (sk === 'projects' && projects.length) {
        projects.forEach((p, i) => {
          add(sk, i === 0, (
            <div>
              {i === 0 && <h2 className={headingClass}>{labelFor(sk)}</h2>}
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  {p.link && <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">{p.link}</span>}
                </div>
                {p.technologies && <p className="text-slate-600 text-xs italic">{p.technologies}</p>}
                {p.description  && <p className="text-slate-700 text-xs leading-relaxed">{p.description}</p>}
              </div>
            </div>
          ), `proj-${p.id}`);
        });
      }
      else if (sk === 'certifications' && certifications.length) {
        certifications.forEach((c, i) => {
          add(sk, i === 0, (
            <div>
              {i === 0 && <h2 className={headingClass}>{labelFor(sk)}</h2>}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-900 text-xs">{c.name}</h3>
                <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">
                  {[c.issuer, c.date].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          ), `cert-${c.id}`);
        });
      }
      else if (sk === 'languages' && languages.length) {
        add(sk, true, (
          <div>
            <h2 className={headingClass}>{labelFor(sk)}</h2>
            <p className="text-slate-700 text-xs">
              {languages.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join('  •  ')}
            </p>
          </div>
        ), 'lang-0');
      }
      else if (sk === 'awards' && awards.length) {
        awards.forEach((a, i) => {
          add(sk, i === 0, (
            <div>
              {i === 0 && <h2 className={headingClass}>{labelFor(sk)}</h2>}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-900 text-xs">{a.title}</h3>
                <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">
                  {[a.issuer, a.date].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          ), `award-${a.id}`);
        });
      }
    }
    return entries;
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const measureRef  = useRef(null);
  const [pageBreaks, setPageBreaks] = useState([]);

  const computeBreaks = (headingClass) => {
    setTimeout(() => {
      if (!measureRef.current) return;
      const nodes = Array.from(measureRef.current.querySelectorAll('[data-entry]'));
      if (!nodes.length) return;

      // ── Budget: how many px of entries fit per page ───────────────────────
      //
      //  Total inner height = page height − top margin − bottom margin
      //  We then subtract FOOTER_H so entries can never visually reach
      //  the footer strip (which lives inside the bottom margin).
      //
      //   Page 1  → also subtract HEADER_H (name/contact block)
      //   Page 2+ → full inner height minus footer only
      //
      // A centered photo stacks above the name (adds its full height); a
      // left/right photo floats beside it (adds height only past the text block).
      const psize = theme.photoSize || 80;
      const photoExtra = showPhoto ? (photoAlign === 'center' ? psize + 28 : Math.max(28, psize - 52)) : 0;
      const chrome     = TEMPLATE_CHROME[template] || { extra: 0, header: HEADER_H };
      const innerH     = pageH - margins.top - margins.bottom;
      const contentH   = innerH - FOOTER_H - chrome.extra;          // footer + per-template chrome guard
      const titleExtra = jobTitle ? 22 : 0;                          // the job-title line under the name
      const page1Limit = contentH - chrome.header - photoExtra - titleExtra;
      const breaks     = [];

      if (template === 'two-column') {
        // The two columns share each page's height, so a page is "full" when
        // EITHER column reaches the limit. Entry heights are measured at their
        // real column widths (see MeasurePane), so this matches what renders —
        // no phantom overflow page from summing both columns as one tall list.
        let leftUsed = 0, rightUsed = 0, limit = page1Limit;
        nodes.forEach((el, i) => {
          const isLeft = el.getAttribute('data-col') === 'L';
          const h      = el.offsetHeight + ENTRY_GAP;
          const used   = isLeft ? leftUsed : rightUsed;
          if (i > 0 && used + h > limit) {
            breaks.push(i);
            limit     = contentH;          // page 2+ has no header
            leftUsed  = isLeft ? h : 0;
            rightUsed = isLeft ? 0 : h;
          } else if (isLeft) {
            leftUsed  += h;
          } else {
            rightUsed += h;
          }
        });
      } else {
        let used = 0, limit = page1Limit;
        nodes.forEach((el, i) => {
          const h = el.offsetHeight + ENTRY_GAP;
          if (i > 0 && used + h > limit) {
            breaks.push(i);
            limit = contentH;   // page 2+
            used  = h;
          } else {
            used += h;
          }
        });
      }

      setPageBreaks(breaks);
      onPageCountChange?.(breaks.length + 1);
    }, 100);
  };

  const headingClassRef = useRef('');

  useEffect(() => {
    computeBreaks(headingClassRef.current);
  }, [resume, template, theme.density]);

  const totalPages = pageBreaks.length + 1;
  const entryStart = currentPage === 1 ? 0 : (pageBreaks[currentPage - 2] ?? 0);
  const entryEnd   = pageBreaks[currentPage - 1] ?? Infinity;

  // ── Measure pane ─────────────────────────────────────────────────────────
  const MeasurePane = ({ headingClass }) => {
    headingClassRef.current = headingClass;
    const all    = buildEntries(headingClass);
    const innerW = pageW - margins.left - margins.right;

    // Two-column: measure each entry at its actual column width (and the
    // template's 11px font) so the paginator's per-column budget is accurate.
    if (template === 'two-column') {
      const gap    = 16; // matches the `gap-4` between columns
      const leftW  = Math.floor((innerW - gap) * 2 / 3);
      const rightW = innerW - gap - leftW;
      return (
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: 'fixed', left: '-9999px', top: '0px',
            pointerEvents: 'none', visibility: 'hidden',
            fontFamily: font, fontSize: '11px', boxSizing: 'border-box', zIndex: -9999,
          }}
        >
          {all.map((e, i) => {
            const isLeft = TWO_COL_LEFT.includes(e.sectionKey);
            return (
              <div
                key={e.id}
                data-entry={i}
                data-col={isLeft ? 'L' : 'R'}
                style={{ width: isLeft ? leftW : rightW, marginBottom: ENTRY_GAP }}
              >
                {e.node}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed', left: '-9999px', top: '0px',
          width: `${innerW}px`,
          pointerEvents: 'none', visibility: 'hidden',
          fontFamily: font, fontSize: '12px', boxSizing: 'border-box', zIndex: -9999,
        }}
      >
        {all.map((e, i) => (
          <div key={e.id} data-entry={i} style={{ marginBottom: ENTRY_GAP }}>
            {e.node}
          </div>
        ))}
      </div>
    );
  };

  // ── Page content ─────────────────────────────────────────────────────────
  const PageContent = ({ headingClass, sections }) => {
    const all  = buildEntries(headingClass);
    const pool = sections ? all.filter(e => sections.includes(e.sectionKey)) : all;

    const visible = pool
      .map(e => ({ ...e, globalIdx: all.findIndex(a => a.id === e.id) }))
      .filter(e => e.globalIdx >= entryStart && e.globalIdx < entryEnd);

    if (!visible.length) return null;

    const groups = [];
    let cur = null;
    visible.forEach(e => {
      if (!cur || cur.sectionKey !== e.sectionKey) {
        cur = { sectionKey: e.sectionKey, startsFromBeginning: e.isFirst, items: [] };
        groups.push(cur);
      }
      cur.items.push(e);
    });

    return (
      <div style={{ fontFamily: font, fontSize: '12px' }}>
        {groups.map(g => (
          <div key={`${g.sectionKey}-${g.items[0].id}`} style={{ marginBottom: SECTION_GAP }}>
            {!g.startsFromBeginning && (
              <h2 className={headingClass}>
                {labelFor(g.sectionKey)}
                <span className="text-slate-400 font-normal normal-case tracking-normal text-xs ml-1">(cont.)</span>
              </h2>
            )}
            {g.items.map((e, idx) => (
              <div key={e.id} style={{ marginBottom: idx < g.items.length - 1 ? ENTRY_GAP : 0 }}>
                {e.node}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ── Page-number footer ────────────────────────────────────────────────────
  //
  // Absolutely positioned inside the bottom margin. Because FOOTER_H is
  // already subtracted from the paginator budget, entries can never reach
  // this zone — no overlap is possible.
  //
  // Shown only when the resume spans more than one page.
  // Left:  applicant full name
  // Right: "Page X of Y"
  //
  const PageFooter = ({ colorOverride } = {}) => {
    if (totalPages <= 1) return null;
    const name   = personalInfo?.fullName || '';
    // Centre the strip vertically in the bottom margin
    const bottom = Math.max(0, Math.round((margins.bottom - FOOTER_H) / 2));
    const color  = colorOverride || '#94a3b8';

    return (
      <div
        aria-hidden="true"
        style={{
          position:       'absolute',
          bottom,
          left:           margins.left,
          right:          margins.right,
          height:         FOOTER_H,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          borderTop:      `0.5px solid ${colorOverride ? 'rgba(255,255,255,0.35)' : '#e2e8f0'}`,
          paddingTop:     5,
          fontFamily:     font,
          fontSize:       9,
          color,
          letterSpacing:  '0.04em',
          userSelect:     'none',
          pointerEvents:  'none',
        }}
      >
        <span style={{ fontWeight: 500 }}>{name}</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    );
  };

  // ── Page wrapper ──────────────────────────────────────────────────────────
  // position:relative  → anchors the absolute footer
  // overflow:hidden    → clips content at the exact A4 boundary
  // NO flex needed     → paginator budget already guarantees content stops
  //                      before the footer zone
  const pageStyle = (extra = {}) => ({
    fontFamily:      font,
    fontSize:        '12px',
    position:        'relative',
    paddingTop:      margins.top,
    paddingRight:    margins.right,
    paddingBottom:   margins.bottom,
    paddingLeft:     margins.left,
    width:           '100%',
    boxSizing:       'border-box',
    height:          `${pageH}px`,
    overflow:        'hidden',
    backgroundColor: 'white',
    ...extra,
  });

  // ── Contact headers ───────────────────────────────────────────────────────
  const ModernHeader = () => (
    <div className="pb-3 mb-4" style={{ borderBottom: `1px solid ${theme.accentColor}`, display: 'flow-root' }}>
      <PhotoAvatar size={76} />
      <h1 className="text-3xl font-bold text-slate-900">{personalInfo.fullName || 'Your Name'}</h1>
      <JobTitleLine jobTitle={jobTitle} className="text-base font-semibold mb-1.5" style={{ color: theme.accentColor }} />
      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        {personalInfo.email && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" style={{color:theme.accentColor}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>{personalInfo.email}
          </span>
        )}
        {personalInfo.phone && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" style={{color:theme.accentColor}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>{personalInfo.phone}
          </span>
        )}
        {personalInfo.address && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" style={{color:theme.accentColor}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>{personalInfo.address}
          </span>
        )}
        {links.map(l => (
          <span key={l.id} className="flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" style={{color:theme.accentColor}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"/>
            </svg>{l.url || l.label}
          </span>
        ))}
      </div>
    </div>
  );

  // ── Templates ──────────────────────────────────────────────────────────────

  if (template === 'modern') {
    const h = 'text-sm font-bold mb-2 uppercase tracking-widest';
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle()}>
          {currentPage === 1 && <ModernHeader />}
          <PageContent headingClass={h} />
          <PageFooter />
        </div>
      </>
    );
  }

  if (template === 'classic') {
    const h = 'text-sm font-bold mb-2 uppercase tracking-widest border-b pb-1';
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle()}>
          {currentPage === 1 && (
            <div className="text-center pb-4 mb-4" style={{ borderBottom: `1px solid ${theme.accentColor}`, display: 'flow-root' }}>
              <PhotoAvatar size={72} />
              <h1 className="text-3xl font-bold text-slate-900 mb-1 uppercase tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
              <JobTitleLine jobTitle={jobTitle} className="text-sm font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: theme.accentColor }} />
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-slate-700">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                {personalInfo.address && <span>| {personalInfo.address}</span>}
                {links.map(l => <span key={l.id}>| {l.url || l.label}</span>)}
              </div>
            </div>
          )}
          <PageContent headingClass={h} />
          <PageFooter />
        </div>
      </>
    );
  }

  if (template === 'minimal') {
    const h = 'text-xs font-semibold uppercase tracking-widest mb-1';
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle()}>
          {currentPage === 1 && (
            <div className="mb-4" style={{ display: 'flow-root' }}>
              <PhotoAvatar size={64} />
              <h1 className="text-2xl font-light text-slate-900 mb-1 tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
              <JobTitleLine jobTitle={jobTitle} className="text-sm font-normal text-slate-600 mb-2 tracking-wide" />
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest" style={{ color: theme.accentColor }}>
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.address && <span>• {personalInfo.address}</span>}
                {links.map(l => <span key={l.id}>• {l.url || l.label}</span>)}
              </div>
            </div>
          )}
          <PageContent headingClass={h} />
          <PageFooter />
        </div>
      </>
    );
  }

  if (template === 'ats-safe') {
    const h = 'text-sm font-bold mb-2 uppercase tracking-widest';
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle({ fontFamily: 'Arial, sans-serif' })}>
          {currentPage === 1 && (
            <div className="mb-4" style={{ borderBottom: `1px solid ${theme.accentColor}`, paddingBottom: '1rem' }}>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{personalInfo.fullName || 'Your Name'}</h1>
              <JobTitleLine jobTitle={jobTitle} className="text-sm text-slate-700 mb-2" />
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                {personalInfo.address && <span>| {personalInfo.address}</span>}
                {links.map(l => <span key={l.id}>| {l.url || l.label}</span>)}
              </div>
            </div>
          )}
          <PageContent headingClass={h} />
          <PageFooter />
        </div>
      </>
    );
  }

  if (template === 'creative') {
    const h = 'text-sm font-bold mb-2 uppercase tracking-widest';
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle({ backgroundColor: theme.accentColor, display: 'flex', flexDirection: 'column' })}>
          {currentPage === 1 && (
            <div className="bg-white rounded-lg p-6 mb-4 shadow-lg" style={{ flexShrink: 0, display: 'flow-root' }}>
              <PhotoAvatar size={76} />
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{personalInfo.fullName || 'Your Name'}</h1>
              <JobTitleLine jobTitle={jobTitle} className="text-base font-semibold mb-2" style={{ color: theme.accentColor }} />
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.address && <span>• {personalInfo.address}</span>}
                {links.map(l => <span key={l.id}>• {l.url || l.label}</span>)}
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ flex: 1, overflow: 'hidden' }}>
            <PageContent headingClass={h} />
          </div>
          <PageFooter colorOverride="rgba(255,255,255,0.8)" />
        </div>
      </>
    );
  }

  if (template === 'two-column') {
    const h = 'text-xs font-bold mb-2 uppercase tracking-widest';
    // Long-form sections go in the wide main column; short list-style sections
    // go in the narrow sidebar (keeps Projects/Experience readable, avoids the
    // sidebar wrapping long titles onto 3 lines). Shared with the paginator.
    const leftSections  = orderedSections.filter(s => TWO_COL_LEFT.includes(s));
    const rightSections = orderedSections.filter(s => TWO_COL_RIGHT.includes(s));
    return (
      <>
        <MeasurePane headingClass={h} />
        <div style={pageStyle({ fontSize: '11px' })}>
          {currentPage === 1 && (
            <div className="flex gap-4 mb-4" style={{ borderBottom:`1px solid ${theme.accentColor}`, paddingBottom:'1rem' }}>
              <div className="w-2/3" style={{ display: 'flow-root' }}>
                <PhotoAvatar size={60} />
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{personalInfo.fullName || 'Your Name'}</h1>
                <JobTitleLine jobTitle={jobTitle} className="text-sm font-semibold mb-2" style={{ color: theme.accentColor }} />
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {personalInfo.email && <span>{personalInfo.email}</span>}
                  {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                  {personalInfo.address && <span>• {personalInfo.address}</span>}
                </div>
              </div>
              <div className="w-1/3">
                {links.map(l => <div key={l.id} className="text-xs text-slate-600 mb-1">{l.label}: {l.url||l.label}</div>)}
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <div className="w-2/3"><PageContent headingClass={h} sections={leftSections} /></div>
            <div className="w-1/3"><PageContent headingClass={h} sections={rightSections} /></div>
          </div>
          <PageFooter />
        </div>
      </>
    );
  }

  // fallback → modern
  const h = 'text-sm font-bold mb-2 uppercase tracking-widest';
  return (
    <>
      <MeasurePane headingClass={h} />
      <div style={pageStyle()}>
        {currentPage === 1 && <ModernHeader />}
        <PageContent headingClass={h} />
        <PageFooter />
      </div>
    </>
  );
}