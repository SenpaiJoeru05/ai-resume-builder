export const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with accent colors',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200 text-[8px] leading-tight" style={{fontFamily:'sans-serif'}}>
        {/* Header */}
        <div className="bg-blue-600 px-2.5 py-2">
          <div className="text-white font-bold text-[12px] tracking-wide">ALEX JOHNSON</div>
          <div className="text-blue-200 text-[9px] mt-0.5">Senior Product Designer</div>
          <div className="flex gap-2 mt-1">
            <span className="text-blue-200">alex@email.com</span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-200">San Francisco, CA</span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-200">linkedin.com/in/alexj</span>
          </div>
        </div>
        {/* Body */}
        <div className="px-2.5 py-1.5 space-y-1.5">
          {/* Summary */}
          <div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-200 pb-0.5 mb-0.5">Summary</div>
            <div className="text-slate-600 text-[8px]">Results-driven designer with 6+ years crafting intuitive digital products. Led redesigns that boosted retention by 40% at two Y Combinator startups.</div>
          </div>
          {/* Experience */}
          <div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-200 pb-0.5 mb-0.5">Experience</div>
            <div className="mb-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-[10px]">Lead Product Designer</span>
                <span className="text-slate-400 text-[8px]">2021 – Present</span>
              </div>
              <div className="text-blue-600 font-medium text-[8px]">Figma Inc. · San Francisco</div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Owned design system used by 4M+ designers worldwide</div>
              <div className="text-slate-500 text-[8px]">· Reduced onboarding time 32% via redesigned first-run flow</div>
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-[10px]">Product Designer</span>
                <span className="text-slate-400 text-[8px]">2019 – 2021</span>
              </div>
              <div className="text-blue-600 font-medium text-[8px]">Notion · Remote</div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Shipped 12 major features across web and mobile</div>
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-200 pb-0.5 mb-0.5">Skills</div>
            <div className="flex flex-wrap gap-0.5">
              {['Figma','Prototyping','Design Systems','User Research','Framer','A/B Testing'].map(s => (
                <span key={s} className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded" style={{fontSize:'7px'}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif font with elegant layout',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200 text-[8px] leading-tight" style={{fontFamily:'Georgia, serif'}}>
        {/* Header */}
        <div className="border-b-2 border-slate-800 px-2.5 py-2 text-center">
          <div className="text-[14px] font-bold text-slate-900 tracking-widest uppercase">Margaret L. Chen</div>
          <div className="text-slate-600 text-[9px] mt-0.5">Corporate Attorney · Mergers & Acquisitions</div>
          <div className="flex justify-center gap-2 mt-1 text-slate-500 text-[7px]">
            <span>New York, NY</span>
            <span>·</span>
            <span>m.chen@lawfirm.com</span>
            <span>·</span>
            <span>(212) 555-0192</span>
          </div>
        </div>
        <div className="px-2.5 py-1.5 space-y-1.5">
          {/* Education first — classic style */}
          <div>
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-0.5">Education</div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-slate-800 text-[10px]">J.D., Harvard Law School</span>
              <span className="text-slate-500 text-[7px]">2015</span>
            </div>
            <div className="text-slate-500 italic text-[7px]">Law Review · Order of the Coif · Cum Laude</div>
            <div className="flex justify-between items-baseline mt-0.5">
              <span className="font-bold text-slate-800 text-[10px]">B.A. Economics, Yale University</span>
              <span className="text-slate-500 text-[7px]">2012</span>
            </div>
            <div className="text-slate-500 italic text-[7px]">Magna Cum Laude · Phi Beta Kappa</div>
          </div>
          {/* Experience */}
          <div>
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-0.5">Professional Experience</div>
            <div className="mb-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-[10px]">Associate, M&A Group</span>
                <span className="text-slate-500 text-[7px]">2017 – Present</span>
              </div>
              <div className="text-slate-600 italic font-medium text-[8px]">Sullivan & Cromwell LLP</div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Advised on 14 cross-border transactions totaling $8.2B</div>
              <div className="text-slate-500 text-[8px]">· Drafted and negotiated purchase agreements and disclosure schedules</div>
            </div>
          </div>
          {/* Bar Admissions */}
          <div>
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-0.5">Bar Admissions</div>
            <div className="text-slate-600 text-[8px]">New York (2016) · California (2016) · U.S. District Court, S.D.N.Y.</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Lightweight design with clean typography',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200 text-[8px] leading-tight" style={{fontFamily:'system-ui, sans-serif'}}>
        <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100">
          <div className="text-[14px] font-bold text-slate-900 tracking-tight">Jordan Park</div>
          <div className="text-slate-500 mt-0.5 text-[9px]">Software Engineer · Full-Stack</div>
          <div className="flex gap-2 mt-1 text-slate-400 text-[7px]">
            <span>github.com/jordanpark</span>
            <span>·</span>
            <span>jordan@dev.io</span>
            <span>·</span>
            <span>Austin, TX</span>
          </div>
        </div>
        <div className="px-3 py-1.5 space-y-1.5">
          <div>
            <div className="text-[10px] font-semibold text-slate-800 mb-0.5">Experience</div>
            <div className="mb-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-800 text-[9px]">Senior Engineer — Stripe</span>
                <span className="text-slate-400 text-[7px]">2022–now</span>
              </div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Built payment reconciliation service handling $2B/day</div>
              <div className="text-slate-500 text-[8px]">· Reduced API latency 45ms by rewriting hot-path in Rust</div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-800 text-[9px]">Engineer II — Vercel</span>
                <span className="text-slate-400 text-[7px]">2020–22</span>
              </div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Maintained edge runtime used by 300K+ deployments</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-800 mb-0.5">Education</div>
            <div className="flex justify-between">
              <span className="text-slate-600 text-[8px]">B.S. Computer Science · UT Austin</span>
              <span className="text-slate-400 text-[7px]">2020</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-800 mb-0.5">Stack</div>
            <div className="text-slate-500 text-[8px]">TypeScript · Rust · Go · React · PostgreSQL · AWS · Kubernetes</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'two-column',
    name: 'Two-Column',
    description: 'Split layout with sidebar for skills and contact',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200 text-[8px] leading-tight flex" style={{fontFamily:'sans-serif'}}>
        {/* Sidebar */}
        <div className="w-[38%] bg-slate-800 text-white px-2 py-2 flex flex-col gap-1.5">
          {/* Avatar placeholder */}
          <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-400 flex items-center justify-center text-[10px] font-bold text-white mb-0.5">RM</div>
          <div className="text-[11px] font-bold leading-tight">Rachel Martinez</div>
          <div className="text-slate-300 text-[7px]">Data Scientist</div>
          <div className="h-px bg-slate-600 w-full my-0.5"></div>
          {/* Contact */}
          <div>
            <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Contact</div>
            <div className="text-slate-400 space-y-0.5 text-[7px]">
              <div>📍 Seattle, WA</div>
              <div>✉ rachel@ds.com</div>
              <div>🔗 linkedin/rachelm</div>
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Skills</div>
            <div className="space-y-0.5">
              {[['Python', 90], ['SQL', 85], ['ML / PyTorch', 80], ['Spark', 70], ['Tableau', 65]].map(([skill, pct]) => (
                <div key={skill}>
                  <div className="text-slate-300 mb-0.5" style={{fontSize:'7px'}}>{skill}</div>
                  <div className="h-0.5 bg-slate-600 rounded-full w-full">
                    <div className="h-full bg-blue-400 rounded-full" style={{width:`${pct}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Education */}
          <div>
            <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Education</div>
            <div className="text-slate-300 font-medium" style={{fontSize:'7px'}}>M.S. Statistics</div>
            <div className="text-slate-400" style={{fontSize:'7px'}}>University of Washington</div>
            <div className="text-slate-400" style={{fontSize:'7px'}}>2019</div>
          </div>
        </div>
        {/* Main content */}
        <div className="w-[62%] px-2 py-2 space-y-1.5">
          <div>
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-0.5 mb-0.5">Profile</div>
            <div className="text-slate-600 text-[8px]">Data scientist with 5 yrs turning messy datasets into revenue. Specializes in NLP and recommendation systems at scale.</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-0.5 mb-0.5">Experience</div>
            <div className="mb-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-800 text-[9px]">Senior Data Scientist</span>
                <span className="text-slate-400 text-[7px]">2021–now</span>
              </div>
              <div className="text-blue-600" style={{fontSize:'7px'}}>Amazon · Seattle</div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Built recommender model → +$120M annual GMV</div>
              <div className="text-slate-500 text-[8px]">· Led team of 4 analysts across 3 product lines</div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-800 text-[9px]">Data Scientist</span>
                <span className="text-slate-400 text-[7px]">2019–21</span>
              </div>
              <div className="text-blue-600" style={{fontSize:'7px'}}>Zillow · Remote</div>
              <div className="text-slate-500 mt-0.5 text-[8px]">· Improved Zestimate accuracy by 18% using gradient boosting</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ats-safe',
    name: 'ATS-Safe',
    description: 'Simple, machine-readable format for applicant tracking systems',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200 text-[8px] leading-tight" style={{fontFamily:'Arial, sans-serif'}}>
        <div className="px-2.5 py-2 border-b-2 border-slate-400">
          <div className="text-[13px] font-bold text-slate-900">DAVID OKONKWO</div>
          <div className="text-slate-700 mt-0.5 text-[9px]">Marketing Manager | Growth & Demand Generation</div>
          <div className="text-slate-500 mt-0.5 text-[7px]">Chicago, IL · david.okonkwo@email.com · (312) 555-0847 · linkedin.com/in/dokonkwo</div>
        </div>
        <div className="px-2.5 py-1.5 space-y-1.5">
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase mb-0.5">PROFESSIONAL SUMMARY</div>
            <div className="text-slate-600 text-[8px]">Results-oriented marketing manager with 7 years of B2B SaaS experience. Scaled inbound pipeline from $2M to $18M ARR through SEO, paid media, and lifecycle programs.</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase mb-0.5">WORK EXPERIENCE</div>
            <div className="mb-1">
              <div className="font-bold text-slate-800 text-[9px]">Senior Marketing Manager — HubSpot, Chicago, IL</div>
              <div className="text-slate-500 text-[7px]">January 2021 – Present</div>
              <div className="text-slate-600 mt-0.5 text-[8px]">• Grew organic traffic 210% YoY through content and technical SEO overhaul</div>
              <div className="text-slate-600 text-[8px]">• Managed $1.4M paid media budget with 3.2x blended ROAS</div>
              <div className="text-slate-600 text-[8px]">• Launched ABM program targeting Fortune 500, generating 62 enterprise SQLs</div>
            </div>
            <div>
              <div className="font-bold text-slate-800 text-[9px]">Marketing Manager — Sprout Social, Chicago, IL</div>
              <div className="text-slate-500 text-[7px]">June 2018 – December 2020</div>
              <div className="text-slate-600 mt-0.5 text-[8px]">• Owned email nurture program with 38% open rate, 2× industry avg</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase mb-0.5">CORE COMPETENCIES</div>
            <div className="text-slate-600 text-[8px]">SEO/SEM · HubSpot · Salesforce · Google Ads · Content Strategy · ABM · Marketing Analytics · Demand Generation</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold design with unique layout elements',
    preview: (
      <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden text-[8px] leading-tight" style={{fontFamily:'sans-serif'}}>
        {/* Top accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 w-full"></div>
        <div className="px-2.5 py-2">
          <div className="text-[14px] font-extrabold text-white tracking-tight leading-none">NINA VASQUEZ</div>
          <div className="text-purple-400 font-medium mt-0.5 text-[9px]">Brand Designer & Creative Director</div>
          <div className="flex gap-2 mt-1 text-slate-400 text-[7px]">
            <span>LA, California</span>
            <span className="text-purple-600">·</span>
            <span>nina@studio.co</span>
            <span className="text-purple-600">·</span>
            <span>@ninavasquez</span>
          </div>
        </div>
        <div className="h-px bg-purple-900 mx-2.5"></div>
        <div className="px-2.5 py-1.5 space-y-1.5">
          <div>
            <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">About</div>
            <div className="text-slate-300 text-[8px]">Award-winning creative director with 8 years building brand identities for Nike, Spotify, and 30+ startups. Obsessed with the space between art and strategy.</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Experience</div>
            <div className="mb-1">
              <div className="flex justify-between">
                <span className="font-bold text-white text-[9px]">Creative Director</span>
                <span className="text-slate-500 text-[7px]">2020 – now</span>
              </div>
              <div className="text-pink-400" style={{fontSize:'7px'}}>Pentagram · Los Angeles</div>
              <div className="text-slate-400 mt-0.5 text-[8px]">· Led global rebrand for 3 Fortune 500 clients, $4M+ in billings</div>
              <div className="text-slate-400 text-[8px]">· Directed team of 8 across brand, motion, and digital</div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="font-bold text-white text-[9px]">Senior Designer</span>
                <span className="text-slate-500 text-[7px]">2017–20</span>
              </div>
              <div className="text-pink-400" style={{fontSize:'7px'}}>Spotify · NYC</div>
              <div className="text-slate-400 mt-0.5 text-[8px]">· Created Wrapped campaign visuals seen by 150M+ users</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Expertise</div>
            <div className="flex flex-wrap gap-0.5">
              {['Brand Identity','Motion Design','Art Direction','Figma','Illustrator','3D / Cinema 4D'].map(s => (
                <span key={s} className="bg-purple-900 border border-purple-700 text-purple-300 px-1 py-0.5 rounded-full" style={{fontSize:'6px'}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function TemplateGallery({ selectedTemplate, onSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Choose a Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative group rounded-lg border-2 p-3 transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded">
              {template.preview}
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 text-sm">{template.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}