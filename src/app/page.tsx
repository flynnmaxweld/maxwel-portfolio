"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Github, Instagram, Mail, FileText, ArrowRight, Image as ImageIcon, Linkedin, Menu, X } from 'lucide-react';

/**
 * THE ARCHITECTURAL SEQUENCE v42.3
 * Theme: "Cinematic Control Interface"
 * Focus: Added Resume Link Configuration.
 */

// --- Utilities ---

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// --- Background: Topographic Waves ---

const TopographicWaves = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const lines = [];
    const lineCount = 45;
    const segmentCount = 100;

    const init = () => {
      for (let i = 0; i < lineCount; i++) {
        lines.push({
          y: (canvas.height / lineCount) * i,
          offset: Math.random() * 1000,
          speed: 0.0005 + Math.random() * 0.001
        });
      }
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.8;

      lines.forEach((line) => {
        ctx.beginPath();
        for (let j = 0; j <= segmentCount; j++) {
          const x = (canvas.width / segmentCount) * j;
          const noise = Math.sin(j * 0.05 + line.offset + time * line.speed) * 35;
          const y = line.y + noise;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none bg-[#050505]" />;
};

// --- Components ---

const GrainOverlay = () => (
  // Changed from fixed to absolute so it stays within the Home section
  <div className="absolute inset-0 z-[20] pointer-events-none opacity-[0.03] contrast-150 brightness-100">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`min-h-screen w-full flex flex-col justify-center py-40 relative z-10 ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </section>
);

const TechTag = ({ text }) => (
  <span className="px-4 py-2 bg-zinc-900/30 border border-zinc-800/40 text-[11px] font-sans font-medium text-zinc-400 uppercase tracking-wide hover:border-zinc-500 hover:text-white transition-all cursor-default rounded-full">
    {text}
  </span>
);

const SectionLabel = ({ number, text }) => (
  <div className="flex items-center gap-4 mb-16">
    <span className="font-mono text-[10px] text-zinc-600 tracking-tighter">[{number}]</span>
    <div className="h-[0.5px] w-12 bg-zinc-800" />
    <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-zinc-500">{text}</span>
  </div>
);

// --- RESPONSIVE NAVIGATION ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = ['About', 'Projects', 'Contact'];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    scrollToId(id.toLowerCase());
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/10 py-4' 
            : 'bg-transparent border-b border-transparent py-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 md:px-12 flex justify-between items-center">
          
          {/* Identity */}
          <div 
            className="cursor-pointer group z-[110] relative" 
            onClick={() => handleNavClick('home')}
          >
            <span className="font-serif italic text-xl md:text-2xl text-white tracking-tight">Flynn Maxwel D</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-12">
            {navLinks.map((item) => (
              <button 
                key={item} 
                onClick={() => handleNavClick(item)}
                className="text-[11px] font-sans font-medium text-zinc-400 hover:text-white uppercase tracking-widest transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white z-[110] relative focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col justify-center items-center md:hidden"
          >
            <div className="flex flex-col items-center gap-10">
              {navLinks.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="text-3xl font-serif italic text-zinc-300 hover:text-white transition-colors tracking-tight"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN APP ---

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black antialiased overflow-x-hidden font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');
          
          html { scroll-behavior: smooth; }
          
          .font-sans { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            letter-spacing: -0.01em; 
          }

          .font-serif {
            font-family: 'Cormorant Garamond', serif;
          }

          body::-webkit-scrollbar { width: 6px; }
          body::-webkit-scrollbar-track { background: #050505; }
          body::-webkit-scrollbar-thumb { background: #333333; border-radius: 10px; border: 2px solid #000000; }
        `}
      </style>
      
      {/* Scroll Progress Line */}
      <motion.div className="fixed top-0 left-0 right-0 h-[1px] bg-white/20 origin-left z-[110]" style={{ scaleX }} />

      <Navbar />

      {/* Persistent Left Socials */}
      <div className="fixed bottom-0 left-0 z-[100] p-8 md:p-12 pointer-events-none hidden md:block">
        <div className="pointer-events-auto flex flex-col gap-6 text-zinc-600">
          <a href="https://www.linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-zinc-300 transition-all transform hover:scale-110">
            <Linkedin size={22} fill="currentColor" strokeWidth={0} />
          </a>
          <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-white hover:text-zinc-300 transition-all transform hover:scale-110">
            <Github size={22} fill="currentColor" strokeWidth={0} />
          </a>
          {/* UPDATED RESUME LINK: Points to public/resume.pdf */}
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume" className="text-white hover:text-zinc-300 transition-all transform hover:scale-110">
            <FileText size={22} fill="currentColor" stroke="#050505" strokeWidth={2} />
          </a>
        </div>
      </div>

      <main className="relative z-10 px-8 md:px-24">
        
        {/* HERO SECTION */}
        <section id="home" className="h-screen w-full relative flex flex-col justify-center items-center overflow-hidden">
          {/* Grain and Waves are now localized here */}
          <GrainOverlay />
          <TopographicWaves />
          
          <div className="text-center max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-serif italic text-zinc-400 font-light tracking-wide leading-tight mb-4">
                  Learning how systems work.
                </h2>
                
                <h1 className="text-5xl md:text-[7rem] font-serif font-medium text-white leading-[0.9] tracking-tight">
                  Designing how they feel.
                </h1>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <Section id="about" className="md:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-24 items-start">
            <div className="md:col-span-5">
              <div className="relative group w-full max-w-[340px]">
                <div className="aspect-square bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden relative shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
                  <img src="/max.jpg" alt="Flynn Maxwel D" className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="mt-10 space-y-2 text-center">
                   <h2 className="font-sans font-semibold text-white text-3xl tracking-tight leading-none">Flynn Maxwel D</h2>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-12">
              <div className="space-y-8 text-zinc-300 font-sans font-normal text-xl leading-relaxed tracking-tight">
                <p>I don’t see computers as machines, but as complex systems shaped by structure and intent. What started as curiosity about what happens beneath the screen gradually became a focus on <span className="text-white font-medium font-serif italic">building systems that are deliberate, stable, and well thought out</span>.</p>
                <p>During periods of isolation, working with logic and machines helped me regain clarity. That foundation led me into system-level automation and UI/UX design, where I now focus on balancing performance with human-centered experience.</p>
                <p className="text-white font-medium pl-6 border-l-2 border-white/20 py-1">
                  "Take risks only when you are prepared to face failure."
                </p>
              </div>

              <div className="pt-12 border-t border-zinc-900">
                  <div className="flex flex-wrap gap-3">
                    {['Python', 'System Architecture', 'React', 'Tailwind CSS', 'AI/ML', 'Problem Solving'].map(s => <TechTag key={s} text={s} />)}
                  </div>
              </div>
            </div>
          </div>
        </Section>

        {/* PROJECTS SECTION */}
        <Section id="projects" className="md:px-12">
          <div className="max-w-5xl mx-auto space-y-48">
            {[
              {
                header: "01 — Systems Automation",
                title: "Smart File Organizer",
                challenge: "Manual file management is inefficient, creating technical debt at the OS level and increasing retrieval latency.",
                solution: "Engineered an event-driven desktop daemon using Python watchdog libraries. Automates real-time sorting and classification, reducing digital clutter by ~40% with near-zero latency.",
                tags: ["Python", "Watchdog API", "Event-Driven"],
                link: "View Source",
                image: "/project-1.jpg" 
              },
              {
                header: "02 — Tactical Intelligence",
                title: "A.R.I.S.",
                subtitle: "Advance Response Intelligence System",
                challenge: "Tactical operators lack a deterministic simulation framework to model complex scenarios before real-world deployment.",
                solution: "Architected a simulation-first tactical framework integrating Gemini API for generative threat modeling. Features persistent state management and strict schema validation, reducing scenario planning time by over 30%.",
                tags: ["JavaScript", "Gemini API", "JSON Schema"],
                image: "/project-2.jpg"
              }
            ].map((p, i) => (
              <div key={i} className="relative group">
                <div className="grid md:grid-cols-12 gap-12 items-start">
                  
                  {/* Left Column: Title & Meta */}
                  <div className="md:col-span-4 sticky top-32">
                    <span className="font-mono text-[11px] font-medium text-zinc-500 block mb-6 uppercase tracking-widest">{p.header}</span>
                    <h3 className="text-5xl font-serif font-medium text-white tracking-tight leading-none italic mb-4">{p.title}</h3>
                    {p.subtitle && (
                      <p className="text-zinc-400 font-sans text-sm tracking-wide mb-6">{p.subtitle}</p>
                    )}
                    {p.link && (
                      <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-widest mt-8 cursor-pointer hover:text-zinc-300 transition-colors">
                        {p.link} <ArrowRight size={12} />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Image & Content */}
                  <div className="md:col-span-8 border-l border-zinc-900 pl-16 space-y-12">
                    
                    {/* Project Screenshot Area */}
                    <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative group/image">
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="object-cover w-full h-full transition-all duration-700" 
                        onError={(e) => {
                          e.currentTarget.style.opacity = '0'; // Hide broken image
                        }}
                      />
                      
                      {/* Fallback visual if image fails or is missing */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -z-10">
                        <ImageIcon size={48} className="text-zinc-800 mb-4" />
                        <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">Upload Screenshot Here</span>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">The Challenge</h4>
                        <p className="text-zinc-400 font-sans font-light leading-relaxed text-lg tracking-wide">{p.challenge}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">The Solution</h4>
                        <p className="text-zinc-200 font-sans font-normal leading-relaxed text-lg tracking-wide">{p.solution}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-4">
                         {p.tags.map(tag => <TechTag key={tag} text={tag} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CONTACT SECTION */}
        <Section id="contact" className="border-b-0">
          <div className="flex flex-col items-center text-center py-20">
            <h2 className="text-5xl md:text-8xl font-serif font-medium text-white italic tracking-tight leading-none mb-12">
              If it’s worth building, <br />
              <span className="text-zinc-500">it’s worth discussing.</span>
            </h2>
            
            <a href="mailto:flynnmaxwel7@gmail.com" className="group flex items-center gap-4 text-zinc-400 hover:text-white transition-all duration-300">
              <span className="font-sans text-sm md:text-lg tracking-widest border-b border-zinc-800 group-hover:border-white pb-2">flynnmaxwel7@gmail.com</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>

            {/* FOOTER TEXT */}
            <div className="mt-32">
                <p className="font-sans text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
                    Architected by Flynn Maxwel D // 2025
                </p>
            </div>
          </div>
        </Section>

      </main>
    </div>
  );
}