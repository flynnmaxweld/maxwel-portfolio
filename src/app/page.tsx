"use client";

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
  type ElementType, type CSSProperties,
} from 'react';
import {
  motion, useScroll, useSpring, AnimatePresence,
  useMotionValue, useTransform, useInView,
} from 'framer-motion';
import {
  Github, FileText, ArrowRight, Linkedin, Menu, X,
  ArrowUpRight, User, Terminal, Database, ChevronUp, ImageOff, Mail,
} from 'lucide-react';

/* ----------------------------------------------------------------------------
   THEME & CONSTANTS
---------------------------------------------------------------------------- */
const F = {
  display: `'Cormorant Garamond', Georgia, serif`,
  brand:   `'Montserrat', 'Arial Black', sans-serif`,
  body:    `'DM Sans', system-ui, sans-serif`,
  mono:    `'JetBrains Mono', 'Courier New', monospace`,
} as const;

const C = {
  bg:        '#111318',
  surface:   '#191c24',
  card:      '#1e222c',
  gold:      '#d4a84b',
  goldLight: '#e8c878',
  goldDim:   'rgba(212,168,75,0.13)',
  ivory:     '#f2ede4',
  text:      '#c4beb4',
  muted:     '#7a7568',
  border:    'rgba(212,168,75,0.18)',
  borderHov: 'rgba(212,168,75,0.45)',
} as const;

const NAV_LINKS = ['About', 'Skills', 'Projects', 'Contact'] as const;
const SOCIAL_LINKS = [
  { href: '/resume.pdf', icon: FileText, label: 'Resume' },
  { href: 'https://linkedin.com/in/flynn-maxwel/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com/flynnmaxweld', icon: Github, label: 'GitHub' },
] as const;

const SKILLS_DATA = [
  { cat: 'Logic Layer',  icon: '🧠', items: [{ n: 'Python', l: 85 }, { n: 'Java', l: 75 }, { n: 'JavaScript', l: 80 }, { n: 'C', l: 65 }] },
  { cat: 'Frontend',     icon: '🎨', items: [{ n: 'React', l: 80 }, { n: 'Tailwind CSS', l: 85 }, { n: 'HTML/CSS', l: 90 }, { n: 'Framer Motion', l: 70 }] },
  { cat: 'Core Systems', icon: '⚙️', items: [{ n: 'Git', l: 80 }, { n: 'SQL', l: 70 }, { n: 'DSA', l: 75 }, { n: 'Linux', l: 65 }] },
] as const;

const PROJECTS: Array<{
  id: string;
  displayId: string;
  header: string;
  title: string;
  subtitle?: string;
  desc: string;
  tags: string[];
  icon: ElementType;
  url: string | null;
}> = [
  {
    id: '1',
    displayId: '01',
    header: 'Systems Automation',
    title: 'Smart File Organizer',
    desc: 'A headless Python daemon using event-driven architecture to classify and route digital assets based on content analysis and metadata.',
    tags: ['Python', 'OS Event Loop', 'Watchdog'],
    icon: Database,
    url: 'https://github.com/flynnmaxweld/smart-file-organizer',
  },
  {
    id: '2',
    displayId: '02',
    header: 'Tactical Intelligence',
    title: 'A.R.I.S.',
    subtitle: 'Advance Response Intelligence System',
    desc: 'Integrated threat modeling framework using LLMs to simulate complex system vulnerabilities and generate real-time mitigation strategies.',
    tags: ['Gemini AI', 'Logic Gates', 'React'],
    icon: Terminal,
    url: null,
  },
] as const;

/* ----------------------------------------------------------------------------
   UTILITY HOOKS
---------------------------------------------------------------------------- */
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
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
};

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

/* ----------------------------------------------------------------------------
   SCROLL UTILITY
---------------------------------------------------------------------------- */
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

/* ----------------------------------------------------------------------------
   REUSABLE COMPONENTS
---------------------------------------------------------------------------- */

const Noise = memo(() => (
  <svg
    className="fixed inset-0 w-full h-full pointer-events-none z-[500] opacity-[0.025]"
    style={{ mixBlendMode: 'overlay' }}
    aria-hidden="true"
  >
    <filter id="nz">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves={3} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#nz)" />
  </svg>
));
Noise.displayName = 'Noise';

const Orbs = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    <div
      style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '55vw',
        height: '55vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,75,0.06) 0%, transparent 65%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '-12%',
        right: '-6%',
        width: '48vw',
        height: '48vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,130,200,0.05) 0%, transparent 65%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,75,0.025) 0%, transparent 65%)',
      }}
    />
  </div>
));
Orbs.displayName = 'Orbs';

const Img = ({ src, alt, className, style: s, fallbackIcon: FI }: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallbackIcon?: ElementType;
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setStatus('loaded');
    } else {
      setStatus('loading');
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('error');
    }
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{ background: C.card }}
    >
      {status === 'error' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'rgba(212,168,75,0.22)' }}
        >
          {FI ? <FI size={52} strokeWidth={0.7} /> : <ImageOff size={52} strokeWidth={0.7} />}
        </div>
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse" style={{ background: C.card }} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...s,
          transition: 'opacity 0.7s',
          opacity: status === 'loaded' ? 1 : 0,
        }}
      />
    </div>
  );
};

const Cursor = () => {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [isHovering, setIsHovering] = useState(false);
  const rx = useSpring(mx, { stiffness: 160, damping: 20, mass: 0.4 });
  const ry = useSpring(my, { stiffness: 160, damping: 20, mass: 0.4 });

  useEffect(() => {
    if (reduced || isTouch) return;

    const onMouseMove = throttle((e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    }, 16);

    const onMouseOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('a,button,[role=button]')) {
        setIsHovering(true);
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('a,button,[role=button]')) {
        setIsHovering(false);
      }
    };

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
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[998]">
      <motion.div
        className="absolute top-0 left-0 rounded-full border"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: isHovering ? 50 : 36,
          height: isHovering ? 50 : 36,
          borderColor: isHovering ? C.gold : 'rgba(212,168,75,0.25)',
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      />
      <motion.div
        className="absolute top-0 left-0 rounded-full"
        style={{
          x: mx,
          y: my,
          translateX: '-50%',
          translateY: '-50%',
          width: 5,
          height: 5,
          background: C.gold,
        }}
      />
    </div>
  );
};

const BackToTop = memo(() => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 700);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.8 }}
          onClick={() => scrollToId('home')}
          aria-label="Back to top"
          className="fixed flex items-center justify-center rounded-full"
          style={{
            bottom: 28,
            right: 28,
            zIndex: 90,
            width: 52,
            height: 52,
            background: `linear-gradient(135deg,${C.surface},${C.card})`,
            border: `1.5px solid ${C.border}`,
            color: C.gold,
            boxShadow: `0 8px 32px rgba(0,0,0,0.45)`,
          }}
          whileHover={{ scale: 1.1, borderColor: C.borderHov }}
          whileTap={{ scale: 0.93 }}
        >
          <ChevronUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
});
BackToTop.displayName = 'BackToTop';

const ScrollProgress = memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed left-0 right-0 origin-left pointer-events-none"
      style={{
        top: 0,
        height: 2,
        background: `linear-gradient(90deg,${C.gold},${C.goldLight})`,
        scaleX,
        zIndex: 200,
      }}
    />
  );
});
ScrollProgress.displayName = 'ScrollProgress';

/* ----------------------------------------------------------------------------
   PARTICLES
---------------------------------------------------------------------------- */
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animationFrame = useRef<number>();
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (reduced || isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Array<{
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
      sz: number;
      op: number;
      sp: number;
      ph: number;
    }> = [];

    const initParticles = () => {
      particles = [];
      const cols = width < 640 ? 9 : width < 1024 ? 18 : 24;
      const rows = width < 640 ? 7 : width < 1024 ? 11 : 15;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (width / (cols + 1)) * (c + 1) + (Math.random() - 0.5) * 14;
          const oy = (height / (rows + 1)) * (r + 1) + (Math.random() - 0.5) * 10;
          particles.push({
            x: ox,
            y: oy,
            ox,
            oy,
            vx: 0,
            vy: 0,
            sz: Math.random() * 1.1 + 0.3,
            op: Math.random() * 0.15 + 0.05,
            sp: Math.random() * 0.5 + 0.7,
            ph: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    let time = 0;
    const MAX_DIST = 165;
    const REPEL = 0.55;
    const RETURN_SPEED = 0.04;
    const DAMP = 0.78;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      if (isVisible) {
        time += 0.003;
        const { x: mx, y: my } = mouse.current;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.hypot(dx, dy);
            if (d < 85) {
              ctx.strokeStyle = `rgba(212,168,75,${(1 - d / 85) * 0.065})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        for (const p of particles) {
          p.ox += Math.sin(time + p.ph) * 0.007;
          p.oy += Math.cos(time + p.ph * 0.7) * 0.005;

          const dx = mx - p.x;
          const dy = my - p.y;
          const d = Math.hypot(dx, dy);
          if (d < MAX_DIST && mx > 0) {
            const f = (MAX_DIST - d) / MAX_DIST;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * f * REPEL * p.sp;
            p.vy -= Math.sin(angle) * f * REPEL * p.sp;
          }

          p.vx += (p.ox - p.x) * RETURN_SPEED;
          p.vy += (p.oy - p.y) * RETURN_SPEED;
          p.vx *= DAMP;
          p.vy *= DAMP;
          p.x += p.vx;
          p.y += p.vy;

          const glow = mx > 0 ? Math.max(0, 1 - d / MAX_DIST) : 0;
          ctx.fillStyle = `rgba(212,168,75,${p.op + glow * 0.45})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.sz + glow * 2.8), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrame.current = requestAnimationFrame(draw);
    };

    const onMouseMove = throttle((e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    }, 16);

    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animationFrame.current!);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [reduced, isTouch, isVisible]);

  if (reduced || isTouch) return null;
  return <canvas ref={canvasRef} className="absolute inset-0" style={{ background: C.bg }} />;
};

/* ----------------------------------------------------------------------------
   HERO
---------------------------------------------------------------------------- */
const HeroText = ({ onScroll }: { onScroll: () => void }) => {
  const [showCue, setShowCue] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setShowCue(true), reduced ? 80 : 2000);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(1rem,3.5vw,2rem)',
      }}
    >
      <motion.p
        style={{
          fontFamily: F.display,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(1.05rem,3.5vw,2rem)',
          color: C.gold,
          letterSpacing: '0.03em',
          lineHeight: 1.35,
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: reduced ? 0 : 0.3 }}
      >
        Learning how systems work.
      </motion.p>

      <motion.h1
        style={{
          fontFamily: F.display,
          fontWeight: 500,
          fontSize: 'clamp(2.8rem,11.5vw,9.5rem)',
          lineHeight: 0.88,
          letterSpacing: '-0.025em',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <span style={{ display: 'block', color: C.ivory }}>Designing how</span>
        <span style={{ display: 'block', color: 'rgba(242,237,228,0.28)' }}>they feel.</span>
      </motion.h1>

      <motion.button
        onClick={onScroll}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.9rem',
          marginTop: 'clamp(2.5rem,7vw,5rem)',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showCue ? 1 : 0, y: showCue ? 0 : 10 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Scroll to about"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ width: 1.5, borderRadius: 9999, background: C.gold }}
              animate={{ height: [10, 22, 10], opacity: [0.35, 0.8, 0.35] }}
              transition={{ duration: 1.7, delay: i * 0.22, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 'clamp(9px,2vw,11px)',
            letterSpacing: '0.6em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          Begin
        </span>
      </motion.button>
    </div>
  );
};

const Photo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'min(300px,75vw)',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: -18,
          borderRadius: '50%',
          border: `1px solid ${C.border}`,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1, rotate: [0, 360] } : {}}
        transition={{ opacity: { delay: 0.8, duration: 0.6 }, rotate: { duration: 26, repeat: Infinity, ease: 'linear' } }}
      />
      <motion.div
        style={{
          position: 'absolute',
          inset: -34,
          borderRadius: '50%',
          border: `1px solid rgba(212,168,75,0.07)`,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1, rotate: [0, -360] } : {}}
        transition={{ opacity: { delay: 1, duration: 0.6 }, rotate: { duration: 40, repeat: Infinity, ease: 'linear' } }}
      />
      <motion.div
        style={{
          aspectRatio: '1/1',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          border: `1.5px solid rgba(212,168,75,0.25)`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,75,0.08)`,
          y,
        }}
        initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
        animate={inView ? { clipPath: 'circle(75% at 50% 50%)', opacity: 1 } : {}}
        transition={{ duration: 1.25, delay: 0.15, ease: [0.33, 0, 0.1, 1] }}
      >
        <Img
          src="/max.jpg"
          alt="Flynn Maxwel D"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackIcon={User}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top,${C.bg}66 0%,transparent 55%)`,
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};

/* ----- ABOUT TEXT with metallic gold quote ----- */
const AboutText = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduced = usePrefersReducedMotion();
  const paragraphs = [
    "I don't see computers as machines — I see them as complex systems shaped by structure and intent. What started as curiosity about what lies beneath the screen became a focus on building things that are deliberate, stable, and well thought out.",
    "During periods of isolation, working with logic and machines helped me regain clarity. That foundation led me into system-level automation and UI/UX design, where I focus on balancing raw performance with human-centered experience.",
  ];

  return (
    <div
      ref={ref}
      style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.4rem,4vw,2.2rem)' }}
    >
      <motion.div
        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        initial={{ opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.55 }}
      >
        <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '-0.02em', color: C.muted }}>
          [01]
        </span>
        <div style={{ height: 1.5, width: 40, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          Identity
        </span>
      </motion.div>

      {paragraphs.map((text, idx) => (
        <motion.p
          key={idx}
          style={{
            fontFamily: F.body,
            fontWeight: 400,
            fontSize: 'clamp(0.95rem,2.2vw,1.12rem)',
            color: C.text,
            lineHeight: 1.82,
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.14 + idx * 0.13, ease: [0.16, 1, 0.3, 1] }}
        >
          {text}
        </motion.p>
      ))}

      <motion.blockquote
        style={{
          position: 'relative',
          paddingLeft: 'clamp(1.1rem,3.5vw,1.8rem)',
          margin: 0,
        }}
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.75, delay: 0.42 }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2.5,
            borderRadius: 9999,
            background: `linear-gradient(to bottom,${C.gold},transparent)`,
          }}
        />
        <motion.p
          style={{
            fontFamily: F.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.05rem,2.8vw,1.4rem)',
            lineHeight: 1.6,
            // Metallic gold gradient
            backgroundImage: 'linear-gradient(135deg, #b8860b 0%, #d4a84b 30%, #f9e076 50%, #d4a84b 70%, #b8860b 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent', // fallback
            // Text shadows for depth and shine
            textShadow: `
              0 1px 0 rgba(255,255,255,0.3),
              0 2px 3px rgba(0,0,0,0.4),
              0 4px 8px rgba(0,0,0,0.3)
            `,
            willChange: 'background-position',
          }}
          animate={!reduced ? { backgroundPosition: ['0% 0%', '100% 100%'] } : undefined}
          transition={!reduced ? { duration: 4, repeat: Infinity, ease: 'linear', repeatType: 'mirror' } : undefined}
        >
          "Take risks only when you are prepared to face failure."
        </motion.p>
      </motion.blockquote>
    </div>
  );
};

/* ----- SKILLS ----- */
const SkillBar = ({ name, level, index, inView }: {
  name: string;
  level: number;
  index: number;
  inView: boolean;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 'clamp(10px,2vw,12px)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.text,
        }}
      >
        {name}
      </span>
      <motion.span
        style={{ fontFamily: F.mono, fontSize: 'clamp(10px,2vw,11px)', color: C.gold, fontWeight: 500 }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.09 + 0.5 }}
      >
        {level}%
      </motion.span>
    </div>
    <div style={{ height: 2, borderRadius: 9999, overflow: 'hidden', background: 'rgba(212,168,75,0.1)' }}>
      <motion.div
        style={{
          height: '100%',
          borderRadius: 9999,
          background: `linear-gradient(90deg,${C.gold},${C.goldLight})`,
        }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${level}%` } : { width: 0 }}
        transition={{ duration: 1.4, delay: index * 0.09 + 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  </div>
);

const Skills = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const extras = ['Figma', 'REST APIs', 'Firebase', 'TypeScript', 'Node.js', 'Gemini AI'];

  return (
    <section
      id="skills"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(4rem,10vw,9rem) clamp(1.25rem,6vw,6rem)',
        background: C.surface,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `linear-gradient(rgba(212,168,75,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,75,0.5) 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />
      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: 'clamp(2rem,6vw,4rem)' }}
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>[01.5]</span>
          <div style={{ height: 1.5, width: 40, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            Capabilities
          </span>
        </motion.div>

        <motion.h2
          style={{
            fontFamily: F.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2rem,6.5vw,4.5rem)',
            color: C.ivory,
            lineHeight: 1.08,
            marginBottom: 'clamp(2.5rem,7vw,6rem)',
          }}
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.1 }}
        >
          Tools of the <span style={{ color: `rgba(212,168,75,0.4)` }}>craft.</span>
        </motion.h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
            gap: 'clamp(2.5rem,6vw,4.5rem)',
          }}
        >
          {SKILLS_DATA.map((group, groupIdx) => (
            <motion.div
              key={group.cat}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: groupIdx * 0.12 + 0.18 }}
            >
              <div>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 'clamp(10px,2vw,11px)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: C.gold,
                    display: 'block',
                    marginBottom: 10,
                  }}
                >
                  {group.icon} {group.cat}
                </span>
                <div style={{ height: 1.5, background: `rgba(212,168,75,0.15)` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {group.items.map((skill, skillIdx) => {
                  const globalIdx = groupIdx * 4 + skillIdx;
                  return (
                    <SkillBar
                      key={skill.n}
                      name={skill.n}
                      level={skill.l}
                      index={globalIdx}
                      inView={inView}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{
            marginTop: 'clamp(3rem,8vw,6rem)',
            paddingTop: '2rem',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            alignItems: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 'clamp(10px,2vw,11px)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.muted,
              marginRight: 8,
            }}
          >
            Also:
          </span>
          {extras.map((item, i) => (
            <motion.span
              key={item}
              style={{
                fontFamily: F.mono,
                fontSize: 'clamp(10px,2vw,11px)',
                letterSpacing: '0.08em',
                padding: '5px 14px',
                borderRadius: 9999,
                background: C.goldDim,
                border: `1px solid ${C.border}`,
                color: C.gold,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 + i * 0.06 }}
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ----- PROJECT CARD ----- */
const ProjectCard = ({ project, index }: { project: typeof PROJECTS[number]; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const isTouch = useIsTouchDevice();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-80, 80], [4, -4]);
  const rotY = useTransform(mx, [-80, 80], [-4, 4]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.article
      style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem,2.5vw,1.5rem)' }}
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        style={{
          rotateX: isTouch ? 0 : rotX,
          rotateY: isTouch ? 0 : rotY,
          transformPerspective: 1000,
          position: 'relative',
          width: '100%',
          paddingBottom: '62%',
          borderRadius: 16,
          overflow: 'hidden',
          border: `1.5px solid ${hovered ? C.borderHov : C.border}`,
          transition: 'border-color 0.35s',
          boxShadow: hovered
            ? `0 32px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(212,168,75,0.12)`
            : `0 12px 40px rgba(0,0,0,0.4)`,
          willChange: 'transform',
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <Img
            src={`/project-${project.id}.jpg`}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: hovered ? 0.9 : 0.62,
              transform: hovered ? 'scale(1)' : 'scale(1.06)',
              transition: 'opacity 0.6s,transform 0.6s',
            }}
            fallbackIcon={project.icon}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top,${C.bg}dd 0%,${C.bg}44 55%,transparent 100%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: 'clamp(1rem,3vw,1.6rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 'clamp(8px,1.6vw,10px)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.gold,
              background: `rgba(17,19,24,0.88)`,
              padding: '6px 14px',
              borderRadius: 9999,
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {project.header}
          </span>
          {project.url && (
            <motion.a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 40,
                height: 40,
                background: C.gold,
                color: C.bg,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                boxShadow: `0 4px 16px rgba(212,168,75,0.4)`,
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5, rotate: hovered ? 0 : -45 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              aria-label={`View ${project.title} on GitHub`}
            >
              <ArrowUpRight size={18} />
            </motion.a>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'clamp(1rem,3vw,1.6rem)',
          }}
        >
          <p
            style={{
              fontFamily: F.brand,
              fontWeight: 900,
              fontSize: 'clamp(1.5rem,5.5vw,2.8rem)',
              color: 'rgba(255,255,255,0.04)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            /{project.displayId}
          </p>
          <h3
            style={{
              fontFamily: F.display,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.2rem,3.5vw,1.7rem)',
              color: C.ivory,
              lineHeight: 1.1,
            }}
          >
            {project.title}
          </h3>
          {project.subtitle && (
            <p
              style={{
                fontFamily: F.mono,
                fontSize: 'clamp(8px,1.7vw,10px)',
                letterSpacing: '0.1em',
                color: `rgba(212,168,75,0.6)`,
                marginTop: 4,
              }}
            >
              {project.subtitle}
            </p>
          )}
        </div>
      </motion.div>

      <p
        style={{
          fontFamily: F.body,
          fontWeight: 400,
          fontSize: 'clamp(0.85rem,2.1vw,0.95rem)',
          color: C.text,
          lineHeight: 1.76,
        }}
      >
        {project.desc}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {project.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: F.mono,
              fontSize: 'clamp(9px,1.8vw,10px)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: 9999,
              background: C.goldDim,
              border: `1px solid ${C.border}`,
              color: C.gold,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
};

/* ----- CONTACT ----- */
const Contact = memo(() => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        padding: 'clamp(4rem,12vw,9rem) clamp(1.25rem,6vw,6rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.2 }}
      >
        <span
          style={{
            fontFamily: F.brand,
            fontWeight: 900,
            fontSize: 'clamp(4rem,22vw,18rem)',
            lineHeight: 1,
            color: `rgba(212,168,75,0.03)`,
            letterSpacing: '-0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          CONTACT
        </span>
      </motion.div>

      <div
        className="max-w-4xl mx-auto text-center relative z-10"
        style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2rem,5.5vw,4rem)' }}
      >
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.85rem' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
        >
          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>[03]</span>
          <div style={{ height: 1.5, width: 40, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            Inquiry
          </span>
        </motion.div>

        <motion.h2
          style={{
            fontFamily: F.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.85rem,7.5vw,5rem)',
            lineHeight: 1.08,
            color: C.ivory,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.1 }}
        >
          If it's worth building,<br />
          <span style={{ color: `rgba(212,168,75,0.42)` }}>it's worth discussing.</span>
        </motion.h2>

        <motion.a
          href="mailto:flynnmaxweld@gmail.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.75rem,2vw,1.25rem)',
            textDecoration: 'none',
            fontFamily: F.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.1rem,3.5vw,2.1rem)',
            color: `rgba(212,168,75,0.75)`,
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25 }}
          whileHover={{ color: C.gold } as any}
        >
          <span style={{ borderBottom: `1px solid rgba(212,168,75,0.25)`, paddingBottom: 3 }}>
            flynnmaxweld@gmail.com
          </span>
          <motion.span animate={{ x: 0 }} whileHover={{ x: 6 }}>
            <ArrowRight size={22} style={{ color: C.gold }} />
          </motion.span>
        </motion.a>

        <motion.div
          style={{
            paddingTop: 'clamp(1.8rem,5vw,3.5rem)',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.38 }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: C.muted,
                  background: C.card,
                  border: `1.5px solid ${C.border}`,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.35)`,
                  transition: 'all 0.25s',
                  textDecoration: 'none',
                }}
                whileHover={{ scale: 1.1, color: C.gold, borderColor: C.borderHov, background: C.surface } as any}
                whileTap={{ scale: 0.92 }}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                letterSpacing: '0.45em',
                textTransform: 'uppercase',
                color: `rgba(122,117,104,0.5)`,
              }}
            >
              © 2026 Flynn Maxwel D
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: `rgba(122,117,104,0.3)`,
              }}
            >
              All rights reserved
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
Contact.displayName = 'Contact';

/* ----------------------------------------------------------------------------
   NAVBAR
---------------------------------------------------------------------------- */
const Navbar = memo(({ active }: { active: string }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const glassStyle: CSSProperties = {
    background: scrolled ? 'rgba(17,19,24,0.94)' : 'rgba(17,19,24,0.78)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: `1px solid ${C.border}`,
    boxShadow: scrolled
      ? `0 12px 48px rgba(0,0,0,0.55),inset 0 1px 0 rgba(212,168,75,0.1)`
      : `0 6px 28px rgba(0,0,0,0.4),inset 0 1px 0 rgba(212,168,75,0.07)`,
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full hidden md:flex justify-center pointer-events-none"
        style={{ zIndex: 100 }}
      >
        <motion.nav
          className="pointer-events-auto flex items-center"
          style={{
            ...glassStyle,
            borderRadius: 9999,
            height: 66,
            padding: '0 8px 0 16px',
            marginTop: scrolled ? 10 : 18,
            gap: 0,
          }}
          initial={{ y: -80, opacity: 0 }}
          animate={mounted ? { y: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 34, mass: 0.75 }}
        >
          {/* FM monogram only */}
          <motion.button
            onClick={() => scrollToId('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 16,
              padding: '0 4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go to home"
          >
            <div
              style={{
                position: 'relative',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 38% 32%,rgba(212,168,75,0.28),rgba(212,168,75,0.06))`,
                  border: `1.5px solid rgba(212,168,75,0.38)`,
                }}
              />
              <span
                style={{
                  fontFamily: F.brand,
                  fontWeight: 900,
                  fontSize: 10,
                  color: C.gold,
                  letterSpacing: '-0.02em',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                FM
              </span>
            </div>
          </motion.button>

          <div style={{ width: 1, height: 24, background: `rgba(212,168,75,0.22)`, flexShrink: 0, marginRight: 8 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 6px' }}>
            {NAV_LINKS.map((item) => {
              const isActive = active === item.toLowerCase();
              return (
                <motion.button
                  key={item}
                  onClick={() => scrollToId(item.toLowerCase())}
                  style={{
                    position: 'relative',
                    fontFamily: F.mono,
                    fontSize: 12,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    padding: '10px 18px',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    color: isActive ? C.ivory : `rgba(196,190,180,0.55)`,
                    transition: 'color 0.2s',
                    background: 'none',
                    border: 'none',
                  }}
                  whileTap={{ scale: 0.94 }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 9999,
                        background: `rgba(212,168,75,0.12)`,
                        border: `1px solid rgba(212,168,75,0.28)`,
                      }}
                      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{item}</span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 24, background: `rgba(212,168,75,0.22)`, flexShrink: 0, marginLeft: 8 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                style={{
                  width: 42,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: `rgba(196,190,180,0.65)`,
                  textDecoration: 'none',
                  border: `1px solid transparent`,
                  transition: 'all 0.2s',
                }}
                whileHover={{ scale: 1.1, color: C.gold, backgroundColor: C.goldDim, borderColor: C.border } as any}
                whileTap={{ scale: 0.88 }}
              >
                <Icon size={19} />
              </motion.a>
            ))}
          </div>
        </motion.nav>
      </div>

      <div className="md:hidden fixed top-0 left-0 w-full pointer-events-none" style={{ zIndex: 100, padding: '10px 14px' }}>
        <motion.div
          className="pointer-events-auto flex items-center justify-between w-full"
          style={{ ...glassStyle, borderRadius: 16, height: 60, padding: '0 10px 0 16px' }}
          initial={{ y: -64, opacity: 0 }}
          animate={mounted ? { y: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          {/* Mobile: FM monogram only */}
          <button
            onClick={() => scrollToId('home')}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Go to home"
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                flexShrink: 0,
                background: `rgba(212,168,75,0.12)`,
                border: `1.5px solid rgba(212,168,75,0.35)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: F.brand, fontWeight: 900, fontSize: 9, color: C.gold }}>FM</span>
            </div>
          </button>
          <motion.button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              flexShrink: 0,
              background: C.goldDim,
              border: `1.5px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.gold,
              cursor: 'pointer',
            }}
            whileTap={{ scale: 0.88 }}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 md:hidden flex flex-col items-center justify-center"
            style={{
              background: `rgba(17,19,24,0.97)`,
              backdropFilter: 'blur(24px)',
              zIndex: 99,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="absolute inset-0"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {NAV_LINKS.map((item, i) => {
                const isActive = active === item.toLowerCase();
                return (
                  <motion.button
                    key={item}
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToId(item.toLowerCase());
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: F.display,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 'clamp(2rem,8vw,3rem)',
                      padding: '8px 40px',
                      letterSpacing: '-0.01em',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isActive ? C.ivory : `rgba(122,117,104,0.55)`,
                    }}
                    initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    whileTap={{ scale: 0.96 }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="mob-dot"
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          translateY: '-50%',
                          width: 4,
                          height: 26,
                          borderRadius: 9999,
                          background: C.gold,
                        }}
                      />
                    )}
                    {item}
                  </motion.button>
                );
              })}
            </div>
            <motion.div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 56,
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.28 }}
            >
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: C.goldDim,
                    border: `1.5px solid ${C.border}`,
                    color: C.gold,
                    textDecoration: 'none',
                  }}
                  whileHover={{ scale: 1.1, background: `rgba(212,168,75,0.22)` } as any}
                  whileTap={{ scale: 0.88 }}
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
Navbar.displayName = 'Navbar';

/* ----------------------------------------------------------------------------
   PRELOADER
---------------------------------------------------------------------------- */
const Preloader = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const value = Math.min(100, Math.round((elapsed / 1800) * 100));
      setProgress(value);
      if (value < 100) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(onDone, 600);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ background: C.bg }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      {['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r', 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'].map(
        (cls, i) => (
          <motion.div
            key={i}
            className={`absolute w-8 h-8 ${cls}`}
            style={{ borderColor: C.border }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          />
        )
      )}
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${C.border}` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <span style={{ fontFamily: F.brand, fontWeight: 900, fontSize: 14, color: C.gold, letterSpacing: '-0.02em' }}>FM</span>
        </div>
        <span
          style={{
            fontFamily: F.brand,
            fontWeight: 900,
            fontSize: 'clamp(0.85rem,3vw,1.05rem)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: C.ivory,
          }}
        >
          Flynn Maxwel D
        </span>
        <div className="rounded-full overflow-hidden" style={{ width: 160, height: 2, background: 'rgba(212,168,75,0.1)' }}>
          <motion.div
            className="h-full origin-left rounded-full"
            style={{
              background: `linear-gradient(90deg,${C.gold},${C.goldLight})`,
              scaleX: progress / 100,
            }}
          />
        </div>
        <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.5em', color: C.muted }}>
          {String(progress).padStart(3, '0')}
        </span>
      </motion.div>
    </motion.div>
  );
};

/* ----------------------------------------------------------------------------
   MAIN APP
---------------------------------------------------------------------------- */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!loaded) return;
    const sectionIds = ['home', 'about', 'skills', 'projects', 'contact'];
    const threshold = window.innerWidth < 768 ? 0.18 : 0.28;
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [loaded]);

  return (
    <div
      style={{
        background: C.bg,
        color: C.ivory,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        overflowX: 'hidden',
        cursor: 'none',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@300;400&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: rgba(212,168,75,0.28); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,75,0.45); }
        ::selection { background: rgba(212,168,75,0.32); color: #f2ede4; }
        a:focus-visible, button:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${C.gold};
          outline-offset: 2px;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%' }}
        >
          <Orbs />
          <Noise />
          <Cursor />
          <ScrollProgress />
          <Navbar active={activeSection} />

          <main style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <section
              id="home"
              style={{
                position: 'relative',
                overflow: 'hidden',
                height: '100svh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Particles />
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  width: '100%',
                  padding: '0 clamp(1.25rem,5vw,3rem)',
                  maxWidth: 940,
                }}
              >
                <HeroText onScroll={() => scrollToId('about')} />
              </div>
            </section>

            <section
              id="about"
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: '90vh',
                padding: 'clamp(4rem,10vw,8rem) clamp(1.25rem,6vw,6rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: F.brand,
                  fontWeight: 900,
                  fontSize: 'clamp(5rem,26vw,20rem)',
                  lineHeight: 1,
                  color: `rgba(212,168,75,0.028)`,
                  letterSpacing: '-0.04em',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
              >
                01
              </div>
              <div
                className="max-w-6xl mx-auto w-full relative z-10"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))',
                  gap: 'clamp(3rem,7vw,6rem)',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Photo />
                </div>
                <AboutText />
              </div>
            </section>

            <Skills />

            <section
              id="projects"
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: '80vh',
                padding: 'clamp(4rem,10vw,9rem) clamp(1.25rem,6vw,6rem)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: F.brand,
                  fontWeight: 900,
                  fontSize: 'clamp(5rem,26vw,20rem)',
                  lineHeight: 1,
                  color: `rgba(212,168,75,0.028)`,
                  letterSpacing: '-0.04em',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
              >
                02
              </div>
              <div className="max-w-6xl mx-auto w-full relative z-10">
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    marginBottom: 'clamp(2rem,6vw,4rem)',
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>[02]</span>
                  <div style={{ height: 1.5, width: 40, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: 11,
                      letterSpacing: '0.5em',
                      textTransform: 'uppercase',
                      color: C.muted,
                    }}
                  >
                    Archive
                  </span>
                </motion.div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))',
                    gap: 'clamp(2.5rem,6vw,5rem)',
                  }}
                >
                  {PROJECTS.map((project, idx) => (
                    <ProjectCard key={project.id} project={project} index={idx} />
                  ))}
                </div>
              </div>
            </section>

            <Contact />
          </main>

          <BackToTop />
        </motion.div>
      )}
    </div>
  );
}
