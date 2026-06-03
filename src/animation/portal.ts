import { gsap } from 'gsap';

export function playPortalTransition(onComplete?: () => void) {
  window.dispatchEvent(new Event('portal:mount'));

  // Small delay to allow react to mount the canvas
  setTimeout(() => {
    const portalTL = gsap.timeline({
      onComplete: () => {
        window.dispatchEvent(new Event('portal:unmount'));
        if (onComplete) onComplete();
      }
    });

    const proxy = { progress: 0, overlayOpacity: 0 };
    
    // Phase 1: Fade in overlay
    portalTL.add(gsap.to(proxy, {
      overlayOpacity: 1, 
      duration: 0.3,
      onUpdate: () => window.dispatchEvent(new CustomEvent('portal:opacity', { detail: proxy.overlayOpacity }))
    }));

    // Phase 2: Start Particle burst
    portalTL.add(gsap.to(proxy, {
      progress: 0.3, 
      duration: 0.4, 
      ease: "power2.in",
      onUpdate: () => window.dispatchEvent(new CustomEvent('portal:progress', { detail: proxy.progress }))
    }));

    // Phase 3: Max explosion / Flash
    portalTL.add(gsap.to(proxy, {
      progress: 0.8, 
      duration: 0.2, 
      ease: "power4.out",
      onUpdate: () => window.dispatchEvent(new CustomEvent('portal:progress', { detail: proxy.progress }))
    }));

    // Phase 4: Dissipate
    portalTL.add(gsap.to(proxy, {
      progress: 1.0, 
      duration: 0.5, 
      ease: "power2.out",
      onUpdate: () => window.dispatchEvent(new CustomEvent('portal:progress', { detail: proxy.progress }))
    }));

    // Phase 5: Fade out overlay
    portalTL.add(gsap.to(proxy, {
      overlayOpacity: 0, 
      duration: 0.3,
      onUpdate: () => window.dispatchEvent(new CustomEvent('portal:opacity', { detail: proxy.overlayOpacity }))
    }));

  }, 50);
}
