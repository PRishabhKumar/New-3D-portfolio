import { gsap } from 'gsap';

export function animateOnScroll(element: HTMLElement | HTMLElement[], options: { 
  y?: number, 
  opacity?: number, 
  blur?: number, 
  duration?: number,
  stagger?: number,
  start?: string
} = {}) {
  const { y = 40, opacity = 0, blur = 8, duration = 0.8, stagger, start = 'top 88%' } = options;
  
  const target = Array.isArray(element) || element instanceof NodeList ? element : [element];
  
  gsap.fromTo(target,
    { y, opacity, filter: `blur(${blur}px)` },
    {
      y: 0, opacity: 1, filter: 'blur(0px)',
      duration, ease: 'power3.out',
      stagger,
      scrollTrigger: {
        trigger: (target as any)[0], // type casting to avoid TS error
        scroller: document.body, // CRITICAL for Lenis sync
        start,
        toggleActions: 'play none none none'
      }
    }
  );
}
