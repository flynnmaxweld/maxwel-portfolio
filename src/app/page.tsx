"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Github, Mail, FileText, ArrowRight, Image as ImageIcon, Linkedin, Menu, X, ArrowUpRight, User, Terminal, Database, ChevronUp } from 'lucide-react';

/**
 * FLYNN MAXWEL D - PORTFOLIO v78.0 (Strict TypeScript & Fixed Image Logic)
 * * FIXES APPLIED:
 * 1. Resolved 'segmentCount' ReferenceError in animation loop.
 * 2. Full TypeScript type definitions for all parameters and DOM refs.
 * 3. SmartImage logic updated to prevent overlapping/ghosting icons.
 * 4. Restored Hero typography scale and leading from requested version.
 */

// --- Interfaces ---
interface Project {
  id: string;
  displayId: string;
  header: string;
  title: string;
  desc: string;
  tags: string[];
  icon: React.ElementType;
  url: string | null;
  subtitle?: string;
}

interface PreloaderProps {
  onDone: () => void;
}

interface SmartImageProps {
  src: string;
  alt: string;
  className: string;
  fallbackIcon?: React.ElementType;
}

interface NavProps {
  activeSection: string;
}

// --- Utilities ---
const scrollToId = (id: string): void => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// --- Preloader ---
const Preloader: React.FC<PreloaderProps> = ({ onDone }) => {
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 px-6 text-center"
      >
        <span className="font-brand font-black text-xl text-white tracking-tighter uppercase">FLYNN MAXWEL D</span>
        <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-white/40"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Custom Cursor ---
const CustomCursor: React.FC = () => {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [hovered, setHovered] = useState(false);

  const rx = useSpring(mx, { stiffness: 110, damping: 20, mass: 0.5 });
  const ry = useSpring(my, { stiffness: 110, damping: 20, mass: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    const onEnter = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('a, button')) setHovered(true); };
    const onLeave = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('a, button')) setHovered(false); };
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onEnter as EventListener);
    window.addEventListener('mouseout', onLeave as EventListener);
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnter as EventListener);
      window.removeEventListener('mouseout', onLeave as EventListener);
    };
  }, [mx, my]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[998] hidden md:flex rounded-full border border-white/40"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovered ? 36 : 24,
          height: hovered ? 36 : 24,
          opacity: hovered ? 1 : 0.4,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999] hidden md:block rounded-full bg-white"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%', width: 3, height: 3 }}
      />
    </>
  );
};

// --- Topographic Waves ---
const TopographicWaves: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    interface Line {
      y: number;
      offset: number;
      speed: number;
      amplitude: number;
    }

    const lines: Line[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const buildLines = () => {
      const isMobile = window.innerWidth < 768;
      lines.length = 0;
      const count = isMobile ? 20 : 40;
      for (let i = 0; i < count; i++) {
        lines.push({
          y: (canvas.height / count) * i,
          offset: Math.random() * 2000,
          speed: 0.0003 + Math.random() * 0.0007,
          amplitude: 20 + Math.random() * 40,
        });
      }
    };

    const draw = (time: number) => {
      // FIX: Ensure segmentCount is defined inside or accessible to the scope
      const segmentCount = window.innerWidth < 768 ? 40 : 80;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.8;

      lines.forEach((line) => {
        ctx.beginPath();
        for (let j = 0; j <= segmentCount; j++) {
          const x = (canvas.width / segmentCount) * j;
          const noise = Math.sin(j * 0.08 + line.offset + time * line.speed) * line.amplitude;
          const y = line.y + noise;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', () => { 
      resize(); 
      buildLines();
    });
    
    resize();
    buildLines();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none bg-[#020202]" />;
};

// --- Smart Image (Ghosting Fix) ---
const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className, fallbackIcon: FallbackIcon }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-900/50 flex items-center justify-center">
      {/* GHOSTING FIX: The fallback icon and status indicator only appear 
        if the image hasn't loaded or encountered an error. 
      */}
      {status === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-800 bg-zinc-900">
          {FallbackIcon ? <FallbackIcon size={80} strokeWidth={0.1} /> : <ImageIcon size={48} strokeWidth={0.5} />}
        </div>
      ) : status === 'loading' ? (
         <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-800">
           {FallbackIcon && <FallbackIcon size={80} strokeWidth={0.1} />}
         </div>
      ) : null}

      <img 
        src={src} 
        alt={alt} 
        className={`${className} transition-opacity duration-1000 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')} 
      />
    </div>
  );
};

const ProjectCard: React.FC<{ p: Project; i: number }> = ({ p, i }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.15 }}
      className="group flex flex-col gap-6"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        className="relative aspect-[16/10] bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
      >
        <SmartImage 
          src={`/project-${p.id}.jpg`} 
          alt={p.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" 
          fallbackIcon={p.icon} 
        />
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start pointer-events-auto">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest bg-[#020202]/80 px-3 py-1 backdrop-blur-md rounded-full border border-white/5">
              {p.header}
            </span>
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <div>
            <span className="font-mono text-2xl text-white/5 font-black block mb-1 tracking-tighter">/{p.displayId}</span>
            <h3 className="text-2xl font-serif italic text-white leading-none">{p.title}</h3>
          </div>
        </div>
      </motion.div>
      <p className="text-zinc-500 font-sans text-sm leading-relaxed px-1">{p.desc}</p>
      <div className="flex flex-wrap gap-2">
        {p.tags.map(t => (
          <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-500 rounded-full tracking-wider uppercase">{t}</span>
        ))}
      </div>
    </motion.div>
  );
};

// --- NAVIGATION ---
const Navbar: React.FC<NavProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${isScrolled ? 'bg-[#020202]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center uppercase">
          <div className="cursor-pointer group flex flex-col" onClick={() => scrollToId('home')}>
            <span className="font-brand font-black text-xl text-white tracking-tighter leading-none">FLYNN MAXWEL D</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-10">
              {['About', 'Projects', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToId(item.toLowerCase())}
                  className={`text-[10px] font-mono tracking-[0.3em] transition-all relative ${activeSection === item.toLowerCase() ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-white transition-all ${activeSection === item.toLowerCase() ? 'w-full' : 'w-0'}`} />
                </button>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <div className="flex items-center gap-5 text-zinc-500">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Resume"><FileText size={16} /></a>
              <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Linkedin size={16} /></a>
              <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Github size={16} /></a>
            </div>
          </div>

          <button className="md:hidden text-white z-[110] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-[100] bg-[#020202] flex flex-col justify-center items-center md:hidden">
             {['About', 'Projects', 'Contact'].map(item => (
                <button key={item} onClick={() => { setMobileMenuOpen(false); scrollToId(item.toLowerCase()); }} className="text-4xl font-serif italic text-zinc-500 hover:text-white my-4">{item}</button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- DATA ---
const PROJECTS: Project[] = [
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
    url: null,
  },
];

// --- MAIN APP ---
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!loaded) return;
    const sections = ['home', 'about', 'projects', 'contact'];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (el) {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveSection(id); }, { threshold: 0.4 });
        obs.observe(el);
        return obs;
      }
      return null;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [loaded]);

  return (
    <div className="bg-[#020202] text-white min-h-screen selection:bg-white selection:text-black antialiased overflow-x-hidden md:cursor-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@200;400&display=swap');
        html { scroll-behavior: smooth; }
        .font-sans  { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-brand { font-family: 'Montserrat', sans-serif; }
        .font-mono  { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <AnimatePresence mode="wait">
        {!loaded && <Preloader key="loader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <>
          <CustomCursor />
          <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-white/20 origin-left z-[110]" style={{ scaleX }} />
          <Navbar activeSection={activeSection} />

          <main className="relative z-10 w-full">
            {/* HERO - RESTORED TYPOGRAPHY PER SCREENSHOT */}
            <section id="home" className="h-[100svh] w-full relative flex flex-col justify-center items-center overflow-hidden">
              <TopographicWaves />
              <div className="text-center max-w-5xl relative z-10 px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}>
                  
                  {/* Original Subtitle Styling */}
                  <h2 className="text-3xl md:text-5xl font-serif italic text-zinc-400 font-light tracking-wide leading-tight mb-4">
                    Learning how systems work.
                  </h2>
                  
                  {/* Original Main Title Styling */}
                  <h1 className="text-5xl sm:text-7xl md:text-[7.5rem] font-serif font-medium text-white leading-[0.9] tracking-tight">
                    Designing how <br /> they feel.
                  </h1>

                  <button onClick={() => scrollToId('about')} className="mt-20 flex flex-col items-center gap-4 mx-auto group">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent group-hover:h-16 transition-all duration-500" />
                    <span className="font-mono text-[10px] tracking-[0.5em] text-zinc-600 group-hover:text-white transition-colors">Begin</span>
                  </button>
                </motion.div>
              </div>
            </section>

            {/* IDENTITY */}
            <section id="about" className="min-h-screen py-32 px-6 md:px-24 flex flex-col justify-center">
              <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-16 items-start">
                <div className="md:col-span-5 flex justify-center">
                   <div className="relative group w-full max-w-[340px]">
                      <div className="aspect-square bg-zinc-950 border border-white/5 rounded-full overflow-hidden relative shadow-2xl transition-all duration-1000 group-hover:border-white/20">
                         {/* Corrected logic to prevent fallback icon overlapping face */}
                         <SmartImage src="/max.jpg" alt="Flynn" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" fallbackIcon={User} />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/60 via-transparent to-transparent pointer-events-none" />
                      </div>
                   </div>
                </div>
                <div className="md:col-span-7 space-y-12">
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-[11px] text-zinc-600 tracking-tighter">[01]</span>
                      <div className="h-[1px] w-12 bg-zinc-800" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-zinc-500">Identity</span>
                   </div>
                   <div className="space-y-8 text-zinc-400 font-sans text-lg md:text-xl leading-relaxed tracking-tight">
                      <p>I don't see computers as machines, but as complex systems shaped by structure and intent. What started as curiosity about what happens beneath the screen gradually became a focus on <span className="text-white italic font-serif">building systems that are deliberate, stable, and well thought out.</span></p>
                      <p>During periods of isolation, working with logic and machines helped me regain clarity. That foundation led me into system-level automation and UI/UX design, where I now focus on balancing performance with human-centered experience.</p>
                      <blockquote className="text-white font-serif italic text-2xl border-l-2 border-white/10 pl-8">"Take risks only when you are prepared to face failure."</blockquote>
                   </div>
                   
                   <div className="pt-12 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div>
                         <span className="font-mono text-[10px] text-zinc-600 uppercase mb-5 block tracking-widest">🧠 Logic Layer</span>
                         <div className="flex flex-wrap gap-2">{['Java', 'Python', 'C', 'JavaScript'].map(s => <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono rounded-full">{s}</span>)}</div>
                      </div>
                      <div>
                         <span className="font-mono text-[10px] text-zinc-600 uppercase mb-5 block tracking-widest">🎨 Frontend</span>
                         <div className="flex flex-wrap gap-2">{['HTML', 'CSS', 'React', 'Tailwind'].map(s => <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono rounded-full">{s}</span>)}</div>
                      </div>
                      <div>
                         <span className="font-mono text-[10px] text-zinc-600 uppercase mb-5 block tracking-widest">⚙ Core Systems</span>
                         <div className="flex flex-wrap gap-2">{['Git', 'DSA', 'SQL'].map(s => <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono rounded-full">{s}</span>)}</div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* ARCHIVE */}
            <section id="projects" className="min-h-screen py-32 px-6 md:px-24 bg-[#040404]/30 flex flex-col justify-center">
              <div className="max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-20">
                   <span className="font-mono text-[11px] text-zinc-600 tracking-tighter">[02]</span>
                   <div className="h-[1px] w-12 bg-zinc-800" />
                   <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-zinc-500">Archive</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                   {PROJECTS.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
                </div>
              </div>
            </section>

            {/* INQUIRY */}
            <section id="contact" className="min-h-[80vh] py-32 px-6 md:px-24 flex flex-col justify-center">
              <div className="max-w-4xl mx-auto text-center space-y-16">
                 <div className="flex items-center justify-center gap-4">
                    <span className="font-mono text-[11px] text-zinc-600 tracking-tighter">[03]</span>
                    <div className="h-[1px] w-12 bg-zinc-800" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-zinc-500">Inquiry</span>
                 </div>
                 <h2 className="text-4xl md:text-7xl font-serif italic leading-tight">If it's worth building, <br /><span className="text-zinc-600">it's worth discussing.</span></h2>
                 <a href="mailto:flynnmaxwel7@gmail.com" className="inline-flex items-center gap-6 text-xl md:text-3xl font-serif italic group hover:text-white text-zinc-400 transition-colors">
                    flynnmaxwel7@gmail.com
                    <ArrowRight className="group-hover:translate-x-3 transition-transform" />
                 </a>
                 
                 <div className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-12 text-left">
                    <div className="flex items-center gap-8 text-zinc-500">
                       <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" className="hover:text-white transition-colors">
                          <Linkedin size={20} />
                       </a>
                       <a href="https://github.com/flynnmaxweld/" target="_blank" className="hover:text-white transition-colors">
                          <Github size={20} />
                       </a>
                       <a href="/resume.pdf" target="_blank" className="hover:text-white transition-colors">
                          <FileText size={20} />
                       </a>
                    </div>
                    <div className="md:text-right flex flex-col justify-end">
                       <span className="font-mono text-[9px] tracking-[0.5em] text-zinc-700 uppercase">© 2026 Flynn Maxwel D</span>
                       <span className="font-mono text-[9px] tracking-[0.5em] text-zinc-800 mt-1 uppercase">All rights reserved</span>
                    </div>
                 </div>
              </div>
            </section>
          </main>
          <BackToTop />
        </>
      )}
    </div>
  );
}

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => scrollToId('home')} className="fixed bottom-8 right-8 z-[90] p-4 bg-white/5 backdrop-blur-md rounded-full border border-white/5 text-zinc-500 hover:text-white transition-all shadow-2xl">
           <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
