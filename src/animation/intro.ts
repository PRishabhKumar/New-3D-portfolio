import { gsap } from 'gsap';

export function playIntro(onComplete?: () => void) {
  if (sessionStorage.getItem('introPlayed')) {
    if (onComplete) onComplete();
    return;
  }
  
  sessionStorage.setItem('introPlayed', 'true');
  
  document.body.style.overflow = 'hidden';
  
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = '#040408'; // Void Black
  overlay.style.zIndex = '9998';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  
  const circle = document.createElement('div');
  circle.style.width = '20px';
  circle.style.height = '20px';
  circle.style.backgroundColor = '#ffffff';
  circle.style.borderRadius = '50%';
  circle.style.transform = 'scale(0)';
  
  overlay.appendChild(circle);
  document.body.appendChild(overlay);
  
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      document.body.style.overflow = '';
      overlay.remove();
      if (onComplete) onComplete();
    }
  });
  
  tl.to(circle, { scale: 1, duration: 0.15 }, 0.20)
    .to(circle, { scale: 80, opacity: 0, duration: 0.5, ease: 'expo.out' }, 0.35)
    // Three.js animations will be triggered via custom events
    .call(() => window.dispatchEvent(new Event('intro-stars-fade-in')), undefined, 0.85)
    .call(() => window.dispatchEvent(new Event('intro-icosahedron-assemble')), undefined, 1.00)
    // The rest will be handled by components listening to the timeline or events
    .call(() => window.dispatchEvent(new Event('intro-text-reveal')), undefined, 1.30)
    .call(() => window.dispatchEvent(new Event('intro-subtitle-reveal')), undefined, 1.70)
    // Nav and CTA buttons
    .fromTo('nav', { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.90)
    .fromTo('.hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1.90);
}
