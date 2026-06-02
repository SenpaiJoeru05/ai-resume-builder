// LandingPage.jsx

import { useState, useEffect, useRef } from "react";
import { useRouting } from '../hooks/useRouting';
import { Button } from '../components/shared/Button';
import { useResume } from '../hooks/useResume';
import { TEMPLATES } from '../components/TemplateGallery';

// ─── Scroll Reveal Component ────────────────────────────────────────
function ScrollReveal({ children, className = "" }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────
function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        let start = 0;
        const step = Math.ceil(end / 60);
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(t); } else setCount(start);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Template Card ────────────────────────────────────────────────
function TemplateCard({ name, tag, badge, preview, onClick }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <button 
      ref={ref}
      onClick={onClick} 
      className={`group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden text-left w-full cursor-pointer transform ${
        isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95'
      }`}
    >
      {badge && (
        <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
          {badge}
        </div>
      )}
      <div className="aspect-[3/4] bg-gradient-to-b from-slate-50 to-slate-100 p-4 flex items-start justify-center pt-6">
        <div className="w-full h-full rounded-xl shadow-md overflow-hidden">
          {preview}
        </div>
      </div>
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="font-bold text-slate-900 text-sm">{name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{tag}</p>
      </div>
    </button>
  );
}

// ─── Step Card ────────────────────────────────────────────────────
function Step({ num, icon, title, desc, color }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={`flex gap-4 items-start group transition-all duration-700 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {num}</span>
        </div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}



// ─── Main Landing Page ────────────────────────────────────────────
export function LandingPage() {
  const { goToCreateFromScratch, goToCreateFromPDF, goToDashboard } = useRouting();
  const { resumes } = useResume();
  const hasExistingResumes = resumes && resumes.length > 0;
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigateWithAnimation = (callback) => {
    setIsNavigating(true);
    setTimeout(() => {
      callback();
    }, 400);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Map imported TEMPLATES to match the card structure needed for landing page
  const templates = TEMPLATES.slice(0, 3).map(t => ({
    name: t.name,
    tag: t.description,
    badge: t.name === 'Modern' ? 'Popular' : undefined,
    preview: t.preview,
    onClick: goToCreateFromScratch,
  }));

  const features = [
    { icon: "⚡", color: "bg-amber-50 text-amber-600", title: "AI Content Engine", desc: "Generates tailored bullets, summaries, and skills that match any job description in seconds." },
    { icon: "📄", color: "bg-blue-50 text-blue-600", title: "PDF Import", desc: "Upload your existing resume and our AI extracts, parses, and organizes every detail perfectly." },
    { icon: "🎯", color: "bg-rose-50 text-rose-600", title: "ATS Optimization", desc: "Score and optimize your resume against real job postings to beat applicant tracking systems." },
    { icon: "🗂️", color: "bg-violet-50 text-violet-600", title: "Multiple Versions", desc: "Maintain distinct resumes for different roles, industries, or career levels — all in one place." },
    { icon: "✏️", color: "bg-emerald-50 text-emerald-600", title: "Live Editor", desc: "See changes instantly with our real-time preview editor. No lag, no guessing." },
    { icon: "📥", color: "bg-indigo-50 text-indigo-600", title: "One-Click Export", desc: "Download polished PDFs ready to send to recruiters. Pixel-perfect across all devices." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .hero-grid { background-image: radial-gradient(circle, #e0e7ff 1px, transparent 1px); background-size: 28px 28px; }
        .gradient-text { background: linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-glow:hover { box-shadow: 0 0 0 1px #818cf8, 0 20px 40px -12px rgba(99,102,241,0.25); }
        .floating { animation: float 6s ease-in-out infinite; }
        .floating-delayed { animation: float 6s ease-in-out 2s infinite; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .fade-in { animation: fadeIn 0.6s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .noise { position:relative; } .noise::before { content:''; position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events:none; border-radius:inherit; }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .slide-up { animation: slideInUp 0.6s ease-out; }
        .slide-left { animation: slideInLeft 0.6s ease-out; }
        .slide-right { animation: slideInRight 0.6s ease-out; }
        .scale-in { animation: scaleIn 0.6s ease-out; }
      `}</style>

      {/* Navigation Transition Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-400 ${
          isNavigating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">ResumeAI</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => scrollToSection('features')} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium">Features</button>
            <button onClick={() => scrollToSection('templates')} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium">Templates</button>
          </div>
          <div className="flex items-center gap-2">
            {hasExistingResumes && <Button variant="ghost" size="sm" onClick={goToDashboard}>My Resumes</Button>}
            <Button variant="primary" size="sm" onClick={goToCreateFromScratch}>Get Started Free</Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden hero-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white/60 to-white pointer-events-none"></div>
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none floating"></div>
        <div className="absolute top-32 right-1/4 w-56 h-56 bg-violet-200/30 rounded-full blur-3xl pointer-events-none floating-delayed"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="fade-in inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            AI-Powered · ATS-Optimized · Free to Start
          </div>

          <h1 className="fade-in stagger-1 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6" style={{fontFamily:"'Sora', sans-serif"}}>
            Your Dream Job
            <br />
            <span className="gradient-text">Starts Here.</span>
          </h1>

          <p className="fade-in stagger-2 text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build ATS-beating resumes with AI in minutes. Import from PDF,
            tailor to any role, and get hired faster.
          </p>

          <div className="fade-in stagger-3 flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button variant="primary" size="lg" onClick={goToCreateFromScratch}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create from Scratch
            </Button>
            <Button variant="secondary" size="lg" onClick={goToCreateFromPDF}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import from PDF
            </Button>
          </div>

          <div className="fade-in stagger-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {["bg-indigo-400","bg-violet-400","bg-pink-400","bg-amber-400","bg-emerald-400"].map((c,i) => (
                <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                  {["J","S","M","A","K"][i]}
                </div>
              ))}
            </div>
            <span><strong className="text-slate-800">12,000+</strong> resumes built this month</span>
            <div className="flex items-center gap-1">
              {"★★★★★".split("").map((s,i) => <span key={i} className="text-amber-400 text-sm">{s}</span>)}
              <span className="ml-1"><strong className="text-slate-800">4.9/5</strong> rating</span>
            </div>
          </div>
        </div>

        {/* Hero preview card */}
        <div className="relative max-w-3xl mx-auto mt-16 fade-in stagger-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="ml-3 text-slate-400 text-xs font-mono">resume-builder.ai — editor</span>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="bg-slate-50 p-6 border-r border-slate-100">
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 text-sm font-medium text-slate-800">Alex Johnson</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Job Title</div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-indigo-300 ring-1 ring-indigo-300 text-sm text-slate-800">Senior Product Designer</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">AI Summary</div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-500 text-sm">✦</span>
                        <p className="text-xs text-indigo-700 leading-relaxed">Results-driven designer with 6+ years crafting intuitive digital experiences…</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Regenerate</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">✓ Use this</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                <div className="border-t-4 border-indigo-600 pt-4">
                  <div className="h-4 bg-slate-900 rounded w-3/5 mb-1.5"></div>
                  <div className="h-2 bg-indigo-500 rounded w-2/5 mb-4"></div>
                  <div className="space-y-1.5 mb-4">
                    <div className="h-1.5 bg-slate-200 rounded w-full"></div>
                    <div className="h-1.5 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-1.5 bg-slate-200 rounded w-4/6"></div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded w-2/5 mb-2"></div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-slate-200 rounded w-full"></div>
                    <div className="h-1.5 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -left-4 top-1/3 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-2.5 hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-sm">✓</div>
            <div>
              <p className="text-xs font-bold text-slate-900">ATS Score</p>
              <p className="text-[10px] text-emerald-600 font-semibold">94% Match</p>
            </div>
          </div>
          <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-2.5 hidden sm:block">
            <p className="text-[10px] text-slate-500 font-medium mb-1">AI is writing…</p>
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 120000, suffix: "+", label: "Resumes Created" },
            { end: 94, suffix: "%", label: "ATS Pass Rate" },
            { end: 3, suffix: "×", label: "More Interviews" },
            { end: 4, suffix: " min", label: "Average Build Time" },
          ].map(({ end, suffix, label }) => (
            <div key={label}>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1" style={{fontFamily:"'Sora',sans-serif"}}>
                <Counter end={end} suffix={suffix} />
              </p>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-4" style={{fontFamily:"'Sora',sans-serif"}}>
                From blank page to hired — in minutes
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">No writing expertise needed. Just answer a few questions and let AI handle the rest.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {[
              { num: 1, icon: "✏️", color: "bg-indigo-50 text-indigo-600", title: "Enter Your Info", desc: "Fill in your experience, skills, and education — or upload an existing PDF resume." },
              { num: 2, icon: "✦", color: "bg-violet-50 text-violet-600", title: "AI Optimizes", desc: "Our AI tailors your content to match the job description and beat ATS filters." },
              { num: 3, icon: "📥", color: "bg-emerald-50 text-emerald-600", title: "Download & Apply", desc: "Export a polished PDF in one click. Start applying immediately." },
            ].map(s => <Step key={s.num} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-slate-950 noise text-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Everything You Need</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3" style={{fontFamily:"'Sora',sans-serif"}}>
                Built different. Built better.
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, color, title, desc }, idx) => (
              <ScrollReveal key={title} className={`stagger-${(idx % 3) + 1}`}>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 card-glow cursor-default">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${color} bg-opacity-20`} style={{background: 'rgba(255,255,255,0.07)'}}>
                    <span>{icon}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Templates</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3" style={{fontFamily:"'Sora',sans-serif"}}>
                Professionally designed, <span className="gradient-text">ATS-approved</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">Every template is tested against major ATS systems and reviewed by hiring professionals.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {templates.map(t => <TemplateCard key={t.name} {...t} />)}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => handleNavigateWithAnimation(goToCreateFromScratch)}>
              View All 6 Templates →
            </Button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-50/60">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Real Results</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3" style={{fontFamily:"'Sora',sans-serif"}}>
                People are getting hired
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Sarah K.", role: "UX Designer → Google", quote: "I applied to 8 places and got 6 callbacks. This tool made all the difference.", color: "bg-violet-400" },
              { name: "Marcus T.", role: "Career Changer → Finance", quote: "The AI rewrote my bullets so well that my interviewer said my resume 'stood out immediately.'", color: "bg-indigo-400" },
              { name: "Priya M.", role: "New Grad → Startup", quote: "Built my first professional resume in literally 15 minutes. Landed an offer in 3 weeks.", color: "bg-pink-400" },
            ].map(({ name, role, quote, color }, idx) => (
              <ScrollReveal key={name} className={`stagger-${idx + 1}`}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex mb-3">{"★★★★★".split("").map((s,i) => <span key={i} className="text-amber-400 text-sm">{s}</span>)}</div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-5 italic">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{name[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
              Your next job is one resume away.
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Create a professional, ATS-friendly resume in minutes with AI.
              Start free and apply with confidence.
            </p>
          </ScrollReveal>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <Button size="lg" onClick={goToCreateFromScratch} className="rounded-full px-8 bg-white text-indigo-700 font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300">
              ✨ Build My Resume Free
            </Button>
            <Button size="lg" onClick={goToCreateFromPDF} className="rounded-full px-8 bg-transparent text-white border border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              Upload Existing Resume
            </Button>
          </div>
          <p className="mt-5 text-sm text-indigo-200">
            No credit card required · ATS-friendly · Export as PDF
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-white font-bold">ResumeAI</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs">
                AI-powered resumes that get you in the door. Professional, ATS-friendly, and built in minutes.
              </p>
              <div className="flex gap-2">
                {["𝕏", "in", "GH"].map(s => (
                  <button key={s} className="w-8 h-8 bg-slate-800 hover:bg-indigo-600 rounded-lg text-xs font-bold transition-colors text-slate-400 hover:text-white">{s}</button>
                ))}
              </div>
            </div>
            {[
              { heading: "Product", links: ["Features","Templates","Pricing","Changelog"] },
              { heading: "Resources", links: ["Blog","Help Center","Resume Tips","Career Guide"] },
              { heading: "Company", links: ["About","Contact","Privacy","Terms"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-white font-semibold text-sm mb-5">{heading}</h4>
                <ul className="space-y-3">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">Get resume tips in your inbox</p>
              <p className="text-xs text-slate-500">Weekly career advice from industry experts.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 sm:w-56 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <Button variant="primary" size="sm">Subscribe</Button>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p>© 2026 ResumeAI. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy","Terms","Cookies"].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;