import React, { useEffect, useRef, useState } from 'react';
import styles from './Nav.module.css';
import { gsap } from 'gsap';

const SECTIONS = [
  { id: 'about-section', label: 'About Me' },
  { id: 'projects-section', label: 'My Work' },
  { id: 'skills-section', label: 'Skills' },
  { id: 'resume-section', label: 'My Journey' },
  { id: 'contact-section', label: "Let's get in touch" },
];

export const Nav: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeId, setActiveId] = useState('about-section');

  useEffect(() => {
    // 1. Setup Intersection Observer for Active State
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, {
      rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
    });

    SECTIONS.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // 2. Animate Indicator
    const activeIndex = SECTIONS.findIndex(s => s.id === activeId);
    const activeEl = itemsRef.current[activeIndex];
    const indicatorEl = indicatorRef.current;

    if (activeEl && indicatorEl) {
      const { offsetLeft, offsetWidth } = activeEl;
      gsap.to(indicatorEl, {
        left: offsetLeft,
        width: offsetWidth,
        duration: 0.35,
        ease: 'power2.inOut'
      });
    }
  }, [activeId]);

  useEffect(() => {
    // 3. Scroll Opacity via Global Lenis (Assuming we attach it to window or use scroll event if lenis isn't accessible here)
    // To keep it simple and performant, we can listen to regular window scroll since Lenis syncs with it
    const handleScroll = () => {
      if (navRef.current) {
        // max scroll ~ document.height - window.height
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = window.scrollY / (maxScroll || 1);
        const opacity = Math.min(0.6 + scrollProgress * 0.32, 0.92);
        navRef.current.style.background = `rgba(4, 4, 8, ${opacity})`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Lenis will handle the actual smooth scroll if we dispatch a regular scroll
      // or we can just use element.scrollIntoView since lenis hijacks it
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className={styles.navContainer} data-cursor="hover">
      <div ref={indicatorRef} className={styles.indicator} />
      {SECTIONS.map((sec, i) => (
        <button
          key={sec.id}
          ref={el => { itemsRef.current[i] = el; }}
          className={`${styles.navItem} ${activeId === sec.id ? styles.active : ''}`}
          onClick={() => scrollTo(sec.id)}
          data-magnetic
        >
          {sec.label}
        </button>
      ))}
    </nav>
  );
};
