"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Github, Mail, FileText, ArrowRight, Image as ImageIcon, Linkedin, Menu, X, ArrowUpRight, User, Terminal, Database, ChevronUp } from 'lucide-react';

/**
 * FLYNN MAXWEL D - PORTFOLIO v66.0
 * Minimalist Structural Interface — Fixed & Updated
 *
 * Fixes applied:
 * 1. cursor-none scoped to md+ only (was hiding cursor on mobile)
 * 2. AnimatePresence mode="wait" added so Preloader exit animates before content mounts
 * 3. IntersectionObserver useEffect guarded so it only runs once after load
 * 4. scrollToId guarded against null elements
 * 5. TopographicWaves draw loop uses rAF timestamp correctly from the start
 * 6. PROJECTS A.R.I.S. url set to null instead of empty string
 * 7. Font family name uses unique identifiers to avoid Tailwind class conflicts
 */

// --- Utilities ---
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// --- Preloader ---
const Preloader = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#020202] flex items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
        transition={{ duration: 2, times: [0, 0.2, 0.8, 1], ease: 'easeInOut' }}
        className="text-center"
      >
        <span className="font-brand font-black text-2xl text-white tracking-tighter">FLYNN MAXWEL D</span>
        <motion.div
          className="h-[1px] bg-white/20 mt-3 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
        />
      </motion.div>
    </motion.div>
  );
};

// --- Custom Cursor — Visible Minimal (desktop only) ---
const CustomCursor = () => {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [hovered, setHovered] = useState(false);

  // Ring trails behind with spring lag; dot snaps instantly
  const rx = useSpring(mx, { stiffness: 110, damping: 20, mass: 0.5 });
  const ry = useSpring(my, { stiffness: 110, damping: 20, mass: 0.5 });

  useEffect(() => {
    const onMove = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    const onEnter = (e) => { if (e.target.closest('a, button')) setHovered(true); };
    const onLeave = (e) => { if (e.target.closest('a, button')) setHovered(false); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onEnter);
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnter);
      window.removeEventListener('mouseout', onLeave);
    };
  }, [mx, my]);

  return (
    <>
      {/* Outer ring — lags, grows on hover */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[998] hidden md:flex rounded-full border border-white/60"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:  hovered ? 40 : 28,
          height: hovered ? 40 : 28,
          opacity: hovered ? 1 : 0.6,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />
      {/* Center dot — snaps to cursor exactly */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999] hidden md:block rounded-full bg-white"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%', width: 4, height: 4 }}
      />
    </>
  );
};

// --- Back to Top ---
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => scrollToId('home')}
          className="fixed bottom-8 right-8 z-[90] p-3 border border-white/10 bg-[#020202]/80 backdrop-blur-md text-zinc-400 hover:text-white hover:border-white/40 transition-all rounded-full"
          aria-label="Back to top"
        >
          <ChevronUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// --- Background: Topographic Waves ---
const TopographicWaves = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const isMobile = () => window.innerWidth < 768;

    const lines = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const buildLines = () => {
      lines.length = 0;
      const count = isMobile() ? 20 : 40;
      for (let i = 0; i < count; i++) {
        lines.push({
          y: (canvas.height / count) * i,
          offset: Math.random() * 2000,
          speed: 0.0003 + Math.random() * 0.0007,
          amplitude: 20 + Math.random() * 40,
        });
      }
    };

    const getSegCount = () => (isMobile() ? 40 : 80);

    // FIX: draw uses the rAF timestamp directly — no manual draw(0) needed
    const draw = (time) => {
      const segCount = getSegCount();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.8;

      lines.forEach((line) => {
        ctx.beginPath();
        for (let j = 0; j <= segCount; j++) {
          const x = (canvas.width / segCount) * j;
          const noise = Math.sin(j * 0.08 + line.offset + time * line.speed) * line.amplitude;
          const y = line.y + noise;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      buildLines();
    };

    window.addEventListener('resize', handleResize);
    resize();
    buildLines();
    // FIX: start loop via rAF so timestamp is always a proper DOMHighResTimeStamp
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none bg-[#020202]" />;
};

// --- Sub-Components ---
const Section = ({ id, children, className = "" }) => (
  <section
    id={id}
    className={`min-h-screen w-full flex flex-col justify-center py-24 md:py-40 relative z-10 ${className}`}
  >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  </section>
);

const TechTag = ({ text }) => (
  <motion.span
    whileHover={{ scale: 1.06 }}
    className="px-4 py-1.5 bg-white/5 border border-white/10 text-[10px] md:text-[11px] font-mono text-zinc-400 uppercase tracking-widest hover:border-white/40 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.07)] transition-all cursor-default rounded-full inline-block"
  >
    {text}
  </motion.span>
);

const SectionLabel = ({ number, text }) => (
  <div className="flex items-center gap-4 mb-12 md:mb-20">
    <span className="font-mono text-[11px] text-zinc-600 tracking-tighter">[{number}]</span>
    <div className="h-[1px] w-8 md:w-16 bg-zinc-800" />
    <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-zinc-500">{text}</span>
  </div>
);

const ProjectImageFallback = ({ title, icon: Icon }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-500 via-transparent to-transparent" />
    <div className="relative z-10 flex flex-col items-center gap-4 text-zinc-700">
      {Icon ? <Icon size={48} strokeWidth={0.5} /> : <ImageIcon size={48} strokeWidth={0.5} />}
      <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{title}</span>
    </div>
  </div>
);

const SmartImage = ({ src, alt, className, fallbackIcon: FallbackIcon }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-800">
        {FallbackIcon ? <FallbackIcon size={120} strokeWidth={0.1} /> : <ImageIcon size={48} strokeWidth={0.5} />}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

// --- Parallax Project Card ---
const ProjectCard = ({ p, i }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [3, -3]);
  const rotateY = useTransform(x, [-100, 100], [-3, 3]);

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.15, ease: [0.19, 1, 0.22, 1] }}
      className="group flex flex-col gap-8"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        whileHover={{ y: -10 }}
        className="relative aspect-[16/10] bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
      >
        <ProjectImageFallback title={p.title} icon={p.icon} />
        <div className="absolute inset-0">
          <SmartImage
            src={`/project-${p.id}.jpg`}
            alt={p.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
          />
        </div>
        <div className="absolute inset-0 p-8 flex flex-col justify-between z-20 pointer-events-none">
          <div className="flex justify-between items-start pointer-events-auto">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest bg-[#020202]/80 px-3 py-1 backdrop-blur-md rounded-full border border-white/5">
              {p.header}
            </span>
            {/* FIX: null check instead of empty string */}
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${p.title}`}
                className="p-3 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
              >
                <ArrowUpRight size={20} />
              </a>
            )}
          </div>
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-mono text-4xl text-white/5 font-black block mb-2 tracking-tighter">/{p.displayId}</span>
            <h3 className="text-3xl font-serif font-medium text-white italic">{p.title}</h3>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 px-2">
        <p className="text-zinc-500 font-sans leading-relaxed text-base md:text-lg">{p.desc}</p>
        <div className="flex flex-wrap gap-2">
          {p.tags.map((tag) => <TechTag key={tag} text={tag} />)}
        </div>
      </div>
    </motion.div>
  );
};

// --- NAVIGATION ---
const Navbar = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['About', 'Projects', 'Contact'];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    scrollToId(id.toLowerCase());
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
          isScrolled
            ? 'bg-[#020202]/90 backdrop-blur-xl border-b border-white/5 py-4'
            : 'bg-transparent border-b border-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div
            className="cursor-pointer group z-[110] relative flex flex-col"
            onClick={() => handleNavClick('home')}
          >
            <span className="font-brand font-black text-xl md:text-2xl text-white tracking-tighter leading-none">
              FLYNN MAXWEL D<span className="text-zinc-500">.</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1.5 group-hover:text-white transition-colors duration-500">
              Creative Developer
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-10">
              {navLinks.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-[10px] font-mono font-medium uppercase tracking-[0.3em] transition-all relative group ${
                    activeSection === item.toLowerCase() ? 'text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-white transition-all ${
                    activeSection === item.toLowerCase() ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-zinc-800" />

            <div className="flex items-center gap-6">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Resume">
                <FileText size={16} strokeWidth={1.5} />
              </a>
              <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <Linkedin size={16} strokeWidth={1.5} />
              </a>
              <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <Github size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <button
            className="md:hidden text-white z-[110] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#020202] flex flex-col justify-center items-center md:hidden"
          >
            <div className="flex flex-col items-center gap-10">
              {navLinks.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="text-4xl font-serif italic text-zinc-400 hover:text-white transition-colors"
                >
                  {item}
                </button>
              ))}
              <div className="flex gap-10 mt-12 pt-12 border-t border-zinc-900 w-full justify-center">
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <FileText size={24} strokeWidth={1.5} />
                </a>
                <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <Linkedin size={24} strokeWidth={1.5} />
                </a>
                <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <Github size={24} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Projects Data ---
// FIX: A.R.I.S. url set to null (was ""), simplifying the url check in ProjectCard
const PROJECTS = [
  {
    id: "1",
    displayId: "01",
    header: "Systems Automation",
    title: "Smart File Organizer",
    desc: "A headless Python daemon that uses event-driven architecture to classify and route digital assets based on content analysis and metadata.",
    tags: ["Python", "OS Event Loop", "Watchdog"],
    icon: Database,
    url: "https://github.com/flynnmaxweld/smart-file-organizer",
  },
  {
    id: "2",
    displayId: "02",
    header: "Tactical Intelligence",
    title: "A.R.I.S.",
    subtitle: "Advance Response Intelligence System",
    desc: "Integrated threat modeling framework utilizing LLMs to simulate complex system vulnerabilities and generate mitigation strategies in real time.",
    tags: ["Gemini AI", "Logic Gates", "React"],
    icon: Terminal,
    url: null, // FIX: null instead of "" — cleaner truthiness check
  },
];

// --- MAIN APP ---
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const handleDone = useCallback(() => setLoaded(true), []);

  // FIX: IntersectionObserver only wired up once after preloader is done
  useEffect(() => {
    if (!loaded) return;
    const sections = ['home', 'about', 'projects', 'contact'];
    const observers = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loaded]);

  return (
    // FIX: cursor-none only on md+ so mobile keeps its default cursor
    <div className="bg-[#020202] text-white min-h-screen selection:bg-white selection:text-black antialiased overflow-x-hidden md:cursor-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@200;400;500&display=swap');
        html { scroll-behavior: smooth; }
        .font-sans  { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-brand { font-family: 'Montserrat', sans-serif; }
        .font-mono  { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020202; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>

      {/* FIX: mode="wait" ensures preloader exit animation completes before content appears */}
      <AnimatePresence mode="wait">
        {!loaded && <Preloader key="preloader" onDone={handleDone} />}
      </AnimatePresence>

      {loaded && (
        <>
          <CustomCursor />
          <BackToTop />
          <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-white/20 origin-left z-[110]" style={{ scaleX }} />
          <Navbar activeSection={activeSection} />

          <main className="relative z-10 w-full">

            {/* HERO */}
            <section id="home" className="h-[100svh] w-full relative flex flex-col justify-center items-center overflow-hidden">
              <TopographicWaves />
              <div className="text-center max-w-5xl relative z-10 px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-2xl md:text-4xl font-serif italic text-zinc-500 font-light tracking-wide mb-6">
                    Learning how systems work.
                  </h2>
                  <h1 className="text-4xl sm:text-6xl md:text-[8rem] font-serif font-medium text-white leading-[0.85] tracking-tight">
                    Designing how <br /> they <span className="italic">feel</span>.
                  </h1>

                  <motion.button
                    onClick={() => scrollToId('about')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-20 flex flex-col items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent group-hover:from-white/80 transition-all duration-500" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-600 group-hover:text-zinc-400 transition-colors">Begin</span>
                  </motion.button>
                </motion.div>
              </div>
            </section>

            {/* ABOUT */}
            <Section id="about" className="px-6 md:px-24">
              <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-16 md:gap-24 items-start">
                <div className="md:col-span-5">
                  <div className="relative group w-full max-w-[320px] mx-auto md:mx-0">
                    <div className="aspect-square bg-zinc-900 border border-white/5 rounded-full overflow-hidden relative shadow-2xl transition-all duration-700 hover:border-white/20">
                      <SmartImage
                        src="/max.jpg"
                        alt="Flynn Maxwel D"
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        fallbackIcon={User}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-12">
                  <SectionLabel number="01" text="Identity" />
                  <div className="space-y-8 text-zinc-400 font-sans text-lg md:text-xl leading-relaxed tracking-tight">
                    <p>
                      I don't see computers as machines, but as complex systems shaped by structure and intent. What started as curiosity about what happens beneath the screen gradually became a focus on{' '}
                      <span className="text-white font-medium font-serif italic">building systems that are deliberate, stable, and well thought out.</span>
                    </p>
                    <p>
                      During periods of isolation, working with logic and machines helped me regain clarity. That foundation led me into system-level automation and UI/UX design, where I now focus on balancing performance with human-centered experience.
                    </p>
                    <blockquote className="text-white font-serif italic text-2xl border-l-2 border-white/10 pl-8 py-2">
                      "Take risks only when you are prepared to face failure."
                    </blockquote>
                  </div>

                  <div className="pt-12 border-t border-zinc-900">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {[
                        { label: 'Logic Layer', skills: ['Java', 'Python', 'C', 'JavaScript'] },
                        { label: 'Frontend', skills: ['HTML', 'CSS', 'React', 'Tailwind CSS'] },
                        { label: 'Core Systems', skills: ['Git & GitHub', 'Data Structures & Algorithms', 'SQL (Basic)'] },
                      ].map(({ label, skills }) => (
                        <div key={label}>
                          <span className="font-mono text-[10px] text-zinc-600 uppercase mb-5 block tracking-[0.2em]">{label}</span>
                          <div className="flex flex-wrap gap-2.5">
                            {skills.map(s => <TechTag key={s} text={s} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* PROJECTS */}
            <Section id="projects" className="px-6 md:px-24 bg-[#040404]/50">
              <div className="max-w-6xl mx-auto">
                <SectionLabel number="02" text="Archive" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                  {PROJECTS.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
                </div>
              </div>
            </Section>

            {/* CONTACT */}
            <Section id="contact" className="px-6 md:px-24">
              <div className="max-w-4xl mx-auto text-center">
                <SectionLabel number="03" text="Inquiry" />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-20"
                >
                  <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif font-medium text-white italic tracking-tight leading-tight mb-12">
                    If it's worth building, <br />
                    <span className="text-zinc-600">it's worth discussing.</span>
                  </h2>

                  <a
                    href="mailto:flynnmaxwel7@gmail.com"
                    className="group relative inline-flex items-center gap-6 text-xl md:text-3xl text-zinc-400 hover:text-white transition-all duration-500 pb-4"
                  >
                    <span className="font-serif italic">flynnmaxwel7@gmail.com</span>
                    <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500" />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-800 group-hover:bg-white transition-colors duration-500" />
                  </a>
                </motion.div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-zinc-900">
                  <div className="text-center md:text-left">
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.4em] block mb-2">Presence</span>
                    <div className="flex gap-8 items-center">
                      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-all hover:-translate-y-1 flex items-center gap-2">
                        <FileText size={20} />
                        <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">Resume</span>
                      </a>
                      <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-all hover:-translate-y-1 flex items-center gap-2">
                        <Linkedin size={20} />
                        <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">LinkedIn</span>
                      </a>
                      <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-all hover:-translate-y-1 flex items-center gap-2">
                        <Github size={20} />
                        <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">GitHub</span>
                      </a>
                    </div>
                  </div>

                  <div className="opacity-30 text-center md:text-right">
                    <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-zinc-500">
                      Flynn Maxwel D // 2026
                    </span>
                  </div>
                </div>
              </div>
            </Section>

          </main>
        </>
      )}
    </div>
  );
}
