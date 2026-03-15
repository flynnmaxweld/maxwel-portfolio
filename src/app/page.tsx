"use client";
import React, {
  useState, useEffect, useRef, memo, useCallback,
} from 'react';
import {
  motion, useScroll, useSpring, AnimatePresence,
  useMotionValue, useTransform, useInView,
} from 'framer-motion';
import {
  Linkedin, Menu, X, ArrowUpRight, ArrowRight, Moon, Sun,
  Layers, Smartphone, Monitor, Feather, ImageOff, Mail
} from 'lucide-react';

/* ============================================================================
   THEME & CONSTANTS - LUXURY UI/UX EDITORIAL WITH LIGHT MODE
============================================================================ */
const F = {
  display: `'Playfair Display', serif`,
  sans: `'Inter', sans-serif`,
} as const;

const THEMES = {
  dark: {
    bg: '#030303',
    surface: '#0A0A0A',
    card: '#111111',
    text: '#F5F5F7',
    muted: '#8A8A93',
    border: 'rgba(255,255,255,0.1)',
    accent: '#FFFFFF',
    copper: '#E27244',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    card: '#EBEBF0',
    text: '#1A1A1A',
    muted: '#666666',
    border: 'rgba(0,0,0,0.1)',
    accent: '#000000',
    copper: '#D97545',
  },
} as const;

const EASE = [0.16, 1, 0.3, 1];
const NAV_LINKS = ['About', 'Expertise', 'Work', 'Contact'] as const;

const SKILLS_DATA = [
  {
    cat: 'Languages',
    icon: '⚡',
    items: [{ n: 'Python', l: 85 }, { n: 'Java', l: 75 }, { n: 'JavaScript', l: 80 }, { n: 'C', l: 65 }]
  },
  {
    cat: 'Frontend',
    icon: '🎨',
    items: [{ n: 'React', l: 80 }, { n: 'Tailwind CSS', l: 85 }, { n: 'HTML/CSS', l: 90 }, { n: 'Framer Motion', l: 70 }]
  },
  {
    cat: 'Backend',
    icon: '⚙️',
    items: [{ n: 'Node.js', l: 75 }, { n: 'SQL', l: 70 }, { n: 'APIs', l: 80 }, { n: 'Firebase', l: 65 }]
  },
] as const;

const PROJECTS = [
  {
    id: '1',
    title: 'Smart File Organizer',
    category: 'systems',
    header: 'Systems Automation',
    desc: 'A headless Python daemon using event-driven architecture to classify and route digital assets based on content analysis and metadata.',
    tags: ['Python', 'OS Event Loop', 'Watchdog'],
    url: 'https://github.com/flynnmaxweld/smart-file-organizer',
    featured: true,
  },
  {
    id: '2',
    title: 'A.R.I.S.',
    category: 'ai',
    subtitle: 'Advance Response Intelligence System',
    header: 'Tactical Intelligence',
    desc: 'Integrated threat modeling framework using LLMs to simulate complex system vulnerabilities and generate real-time mitigation strategies.',
    tags: ['Gemini AI', 'Logic Gates', 'React'],
    url: '#',
    featured: true,
  },
] as const;

/* ============================================================================
   UTILITY HOOKS
============================================================================ */
const usePrefersReducedMotion = () => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return matches;
};

const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0), []);
  return isTouch;
};

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const newTheme = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  }, []);

  return { theme, mounted, toggleTheme, C: THEMES[theme] };
};

function throttle(func: any, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

/* ============================================================================
   AMBIENT GLOW
============================================================================ */
const AmbientGlow = memo(({ C }: { C: typeof THEMES.dark }) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: 'absolute', top: '10%', left: '20%', width: '40vw', height: '40vw', borderRadius: '50%',
        background: `radial-gradient(circle, ${C.text}20 0%, transparent 60%)`,
        filter: 'blur(60px)'
      }}
    />
  </div>
));
AmbientGlow.displayName = 'AmbientGlow';

const Img = ({ src, alt, className, style: s, loading = 'lazy' }: any) => {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const img = new Image();
    img.src = src;
    if (img.complete) setStatus('loaded');
    else {
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('error');
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`} style={{ background: 'var(--bg-card)', ...s }}>
      {status === 'error' && <ImageOff size={32} strokeWidth={1} color={'var(--text-muted)'} />}
      {status === 'loading' && <div className="absolute inset-0 animate-pulse" style={{ background: 'var(--bg-surface)' }} />}
      <img
        src={src} alt={alt}
        loading={loading}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: status === 'loaded' ? 1 : 0,
          transform: status === 'loaded' ? 'scale(1)' : 'scale(1.05)',
        }}
      />
    </div>
  );
};

/* ============================================================================
   SMOOTH MAGNETIC CURSOR
============================================================================ */
const Cursor = ({ C }: { C: typeof THEMES.dark }) => {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  
  const rx = useSpring(mx, { stiffness: 150, damping: 20, mass: 0.5 });
  const ry = useSpring(my, { stiffness: 150, damping: 20, mass: 0.5 });

  useEffect(() => {
    if (reduced || isTouch) return;
    const onMouseMove = throttle((e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); }, 16);
    const onMouseOver = (e: MouseEvent) => { if ((e.target as Element)?.closest?.('a,button,[role=button]')) setIsHovering(true); };
    const onMouseOut = (e: MouseEvent) => { if ((e.target as Element)?.closest?.('a,button,[role=button]')) setIsHovering(false); };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [mx, my, reduced, isTouch]);

  if (reduced || isTouch) return null;

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[998] mix-blend-difference">
      <motion.div
        className="absolute top-0 left-0 rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ 
          width: isHovering ? 64 : 12, 
          height: isHovering ? 64 : 12,
          opacity: isHovering ? 1 : 0.8
        }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-black"
            >
              <ArrowUpRight size={24} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ============================================================================
   SECTIONS
============================================================================ */
const HeroText = ({ C }: { C: typeof THEMES.dark }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100vh', padding: '0 5vw', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        style={{ maxWidth: '1000px' }}
      >
        <p style={{ fontFamily: F.sans, fontSize: '1rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
          Flynn Maxwel D - FullStack Developer
        </p>
        
        <h1 style={{
          fontFamily: F.display, fontWeight: 400, fontSize: 'clamp(3rem, 8vw, 7rem)',
          lineHeight: 1.1, color: C.text, margin: 0, letterSpacing: '-0.02em'
        }}>
          Learning how systems work.<br/>
          <span style={{ fontStyle: 'italic', color: C.muted }}>Designing how they feel.</span>
        </h1>
        
        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <motion.button
            onClick={() => scrollToId('work')}
            whileHover={{ paddingRight: '2rem' }}
            aria-label="View my work"
            style={{
              fontFamily: F.sans, fontSize: '1rem', color: C.bg, background: C.text, padding: '1rem 1.5rem',
              borderRadius: '99px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'padding 0.3s ease'
            }}
          >
            View Work <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const About = ({ C }: { C: typeof THEMES.dark }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} style={{ padding: 'clamp(6rem, 12vw, 12rem) 5vw' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
        
        <div className="md:col-span-5 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ 
              aspectRatio: '1/1', 
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto',
              borderRadius: '50%', 
              padding: '12px',
              border: `1px solid ${C.border}`,
              position: 'relative',
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
              <Img src="/api/placeholder/380/380" alt="Flynn Maxwel D" />
            </div>
          </motion.div>
          
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            style={{ fontFamily: F.display, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: C.text, fontStyle: 'italic', borderLeft: `1px solid ${C.border}`, paddingLeft: '1.5rem', lineHeight: 1.5 }}
          >
            "Take risks only when you are prepared to face failure."
          </motion.blockquote>
        </div>

        <div className="md:col-span-7 flex flex-col gap-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE }}
            style={{ fontFamily: F.display, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, color: C.text }}
          >
            About <span style={{ fontStyle: 'italic', color: C.muted }}>Me.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.1, ease: EASE }}
            style={{ fontFamily: F.sans, fontSize: 'clamp(1.05rem, 1.5vw, 1.15rem)', color: C.text, lineHeight: 1.8, fontWeight: 300 }}
          >
            I don't see computers as machines — I see them as complex systems shaped by structure and intent. What started as curiosity about what lies beneath the screen became a focus on building things that are deliberate, stable, and well thought out.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.2, ease: EASE }}
            style={{ fontFamily: F.sans, fontSize: 'clamp(1rem, 1.5vw, 1.1rem)', color: C.muted, lineHeight: 1.8, fontWeight: 300 }}
          >
            During periods of isolation, working with logic and machines helped me regain clarity. That foundation led me into system-level automation and UI/UX design, where I focus on balancing raw performance with human-centered experience.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

const SkillBar = ({ name, level, index, C }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: F.sans, fontSize: '1rem', color: C.text, fontWeight: 300, letterSpacing: '0.02em' }}>{name}</span>
        <span style={{ fontFamily: F.display, fontSize: '0.95rem', color: C.muted, fontStyle: 'italic' }}>{level}%</span>
      </div>
      <div style={{ height: '1px', background: C.border, width: '100%', position: 'relative' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: level / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.1 + index * 0.1, ease: EASE }}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: C.text, transformOrigin: 'left' }}
        />
      </div>
    </div>
  );
};

const ExpertiseRow = ({ group, index, isOpen, onToggle, C }: any) => {
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', padding: '2.5rem 0', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left'
        }}
        className="group"
        aria-expanded={isOpen}
        aria-label={`${group.cat} skills section`}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <span style={{ fontFamily: F.display, fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', color: isOpen ? C.text : C.muted, fontStyle: 'italic', transition: 'color 0.4s ease' }}>
            0{index + 1}
          </span>
          <h3 style={{
            fontFamily: F.sans, fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: isOpen ? C.text : C.muted,
            fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.4s ease'
          }}>
            {group.cat}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ color: isOpen ? C.text : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', border: `1px solid ${isOpen ? C.text : C.border}`, transition: 'border-color 0.4s ease, color 0.4s ease' }}
        >
          <div style={{ position: 'relative', width: 14, height: 14 }}>
             <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'currentColor', transform: 'translateY(-50%)' }} />
             <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'currentColor', transform: 'translateX(-50%)' }} />
          </div>
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: '3.5rem', paddingTop: '0.5rem' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 pl-[clamp(3rem,6vw,4.5rem)]">
                {group.items.map((skill: any, i: number) => (
                  <SkillBar key={skill.n} name={skill.n} level={skill.l} index={i} C={C} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Expertise = ({ C }: { C: typeof THEMES.dark }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="expertise" ref={ref} style={{ padding: 'clamp(6rem, 12vw, 10rem) 5vw', background: C.surface }}>
      <div className="max-w-6xl mx-auto">
        <motion.div style={{ marginBottom: '6rem' }} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: EASE }}>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(3rem, 6vw, 5rem)', color: C.text, lineHeight: 1 }}>
            Technical<br/><span style={{ fontStyle: 'italic', color: C.muted }}>Expertise</span>
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={inView ? { opacity: 1, y: 0 } : {}} 
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          style={{ borderTop: `1px solid ${C.border}` }}
          role="region"
          aria-labelledby="expertise-title"
        >
          {SKILLS_DATA.map((group, idx) => (
            <ExpertiseRow 
              key={group.cat} 
              group={group} 
              index={idx} 
              isOpen={openIndex === idx} 
              onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              C={C}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index, C }: any) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.1, ease: EASE }}
      className="group cursor-pointer"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      onClick={() => window.open(project.url, '_blank')}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && window.open(project.url, '_blank')}
      aria-label={`${project.title} project`}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '12px', background: C.surface }}>
        <motion.div className="w-full h-full" whileHover={{ scale: 1.03 }} transition={{ duration: 1.2, ease: EASE }}>
          <Img src={`/api/placeholder/1200/900`} alt={project.title} className="opacity-90 group-hover:opacity-100 transition-opacity duration-700" loading="lazy" />
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontFamily: F.sans, fontSize: '0.85rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {project.header}
        </span>
        <h3 style={{ fontFamily: F.display, fontSize: '2rem', color: C.text, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {project.title}
        </h3>
        {project.subtitle && (
          <span style={{ fontFamily: F.sans, fontSize: '0.9rem', color: C.muted, marginTop: '-0.25rem' }}>
            {project.subtitle}
          </span>
        )}
        <p style={{ fontFamily: F.sans, fontSize: '1rem', color: C.muted, lineHeight: 1.6, maxWidth: '80%' }}>
          {project.desc}
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {project.tags?.map(tag => (
            <span key={tag} style={{ fontFamily: F.sans, fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '99px', border: `1px solid ${C.border}`, color: C.text }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

const Work = ({ C }: { C: typeof THEMES.dark }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilter(params.get('filter') || 'all');
  }, []);

  const updateFilter = (newFilter: string) => {
    setFilter(newFilter);
    window.history.pushState({}, '', `?filter=${newFilter}`);
  };

  const filtered = filter === 'all' 
    ? PROJECTS 
    : PROJECTS.filter(p => (p as any).category === filter);

  return (
    <section id="work" style={{ padding: 'clamp(6rem, 12vw, 12rem) 5vw' }}>
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div style={{ marginBottom: '6rem' }} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: EASE }}>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(3rem, 6vw, 5rem)', color: C.text, lineHeight: 1 }}>Featured<br/><span style={{ fontStyle: 'italic', color: C.muted }}>Projects</span></h2>
        </motion.div>

        {/* Project Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          {['all', 'systems', 'ai', 'frontend'].map(f => (
            <motion.button
              key={f}
              onClick={() => updateFilter(f)}
              style={{
                fontFamily: F.sans, fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '99px',
                border: `1px solid ${filter === f ? C.text : C.border}`, background: filter === f ? C.text : 'transparent',
                color: filter === f ? C.bg : C.text, cursor: 'pointer', transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
              whileHover={{ scale: 1.05 }}
            >
              {f === 'all' ? 'All Projects' : f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem 4rem' }}>
            {filtered.map((p: any, i: number) => <ProjectCard key={p.id} project={p} index={i} C={C} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const Contact = memo(({ C }: { C: typeof THEMES.dark }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" ref={ref} style={{ padding: 'clamp(6rem, 12vw, 12rem) 5vw', background: C.surface }}>
      <div className="max-w-4xl mx-auto text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
        
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE }}
          style={{ fontFamily: F.display, fontSize: 'clamp(3rem, 7vw, 6rem)', color: C.text, lineHeight: 1.1 }}>
          Let's design <br/>
          <span style={{ fontStyle: 'italic', color: C.muted }}>the future.</span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.1, ease: EASE }}
          style={{ fontFamily: F.sans, fontSize: '1.1rem', color: C.muted }}>
          Currently open for new opportunities and collaborations.
        </motion.p>

        <motion.a href="mailto:flynnmaxweld@gmail.com"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.2, ease: EASE }}
          style={{
            fontFamily: F.sans, fontSize: '1.2rem', color: C.bg, background: C.text, textDecoration: 'none', padding: '1.2rem 2.5rem',
            borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', transition: 'opacity 0.3s'
          }}
          className="hover:opacity-80"
        >
          <Mail size={20} /> Get in touch
        </motion.a>

        <motion.div style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.4, ease: EASE }}>
          <a href="https://linkedin.com/in/flynn-maxwel/" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, textDecoration: 'none', fontFamily: F.sans, fontSize: '0.9rem' }} className="hover:text-white transition-colors">LinkedIn</a>
          <a href="https://github.com/flynnmaxweld" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, textDecoration: 'none', fontFamily: F.sans, fontSize: '0.9rem' }} className="hover:text-white transition-colors">GitHub</a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, textDecoration: 'none', fontFamily: F.sans, fontSize: '0.9rem' }} className="hover:text-white transition-colors">Resume</a>
        </motion.div>

        <motion.div style={{ marginTop: '2rem', fontFamily: F.sans, fontSize: '0.8rem', color: C.muted }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.5 }}>
          © {new Date().getFullYear()} Flynn Maxwel D. All rights reserved.
        </motion.div>
      </div>
    </section>
  );
});
Contact.displayName = 'Contact';

/* ============================================================================
   NAVBAR WITH THEME TOGGLE
============================================================================ */
const Navbar = memo(({ active, theme, onThemeToggle }: { active: string; theme: 'light' | 'dark'; onThemeToggle: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const C = THEMES[theme];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 w-full z-[100] flex justify-center py-6 pointer-events-none"
        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2, ease: EASE }}
      >
        <div 
          className="pointer-events-auto flex items-center justify-between px-6 md:px-8 py-3 rounded-full"
          style={{
            background: scrolled ? `${C.bg}B3` : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            border: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
            width: 'calc(100% - 4rem)',
            maxWidth: '1200px',
            transition: 'all 0.4s ease'
          }}
        >
          <button onClick={() => scrollToId('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Go to home">
            <span style={{ fontFamily: F.display, fontSize: 20, color: C.text, fontStyle: 'italic' }}>F.M.</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(item => {
              const isActive = active === item.toLowerCase();
              return (
                <button key={item} onClick={() => scrollToId(item.toLowerCase())}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: F.sans, fontSize: '0.85rem', color: isActive ? C.text : C.muted,
                    transition: 'color 0.3s'
                  }}
                  className="hover:text-white"
                  aria-label={`Navigate to ${item}`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={onThemeToggle}
              style={{ background: 'none', border: 'none', color: C.text, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="md:hidden" onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: C.text, padding: 0 }} aria-label="Open menu">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ background: `${C.bg}F8` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
          >
            <button className="absolute top-8 right-8" onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: C.text }} aria-label="Close menu">
              <X size={32} strokeWidth={1} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((item, i) => (
                <motion.button key={item}
                  onClick={() => { setMenuOpen(false); scrollToId(item.toLowerCase()); }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
                  style={{ fontFamily: F.display, fontSize: '3rem', color: C.text, background: 'none', border: 'none', fontStyle: active === item.toLowerCase() ? 'italic' : 'normal' }}
                  aria-label={`Navigate to ${item}`}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
Navbar.displayName = 'Navbar';

/* ============================================================================
   PRELOADER
============================================================================ */
const Preloader = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(onDone, 600);
      }
      setProgress(current);
    }, 150);
    return () => clearInterval(interval);
  }, [onDone]);

  const C = THEMES.dark;
  return (
    <motion.div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: C.bg }}
      exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.8, ease: EASE }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontFamily: F.display, fontSize: '4rem', color: C.text, fontStyle: 'italic', fontVariantNumeric: 'tabular-nums' }}>
          {progress}%
        </span>
      </div>
    </motion.div>
  );
};

/* ============================================================================
   MAIN APP
============================================================================ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, mounted, toggleTheme, C } = useTheme();

  useEffect(() => {
    if (!loaded) return;
    const sectionIds = ['home', 'about', 'expertise', 'work', 'contact'];
    const observers = sectionIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActiveSection(id); }, { threshold: 0.3 });
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, [loaded]);

  if (!mounted) return null;

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', overflowX: 'hidden', cursor: 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0px; }
        ::selection { background: rgba(255,255,255,0.2); color: #fff; }
        @media (prefers-color-scheme: light) { ::selection { background: rgba(0,0,0,0.2); color: #000; } }
        #__next { background: ${C.bg}; }
      `}</style>

      <AnimatePresence mode="wait">
        {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && mounted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: EASE }}>
          <AmbientGlow C={C} />
          <Cursor C={C} />
          <Navbar active={activeSection} theme={theme} onThemeToggle={toggleTheme} />

          <main style={{ position: 'relative', zIndex: 10 }}>
            <section id="home">
              <HeroText C={C} />
            </section>
            
            <About C={C} />
            <Expertise C={C} />
            <Work C={C} />
            <Contact C={C} />
          </main>
        </motion.div>
      )}
    </div>
  );
}
