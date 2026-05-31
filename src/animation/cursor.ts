export class CustomCursor {
  private root: HTMLElement;
  private orbs: HTMLElement[] = [];
  private mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  private positions: { x: number, y: number }[] = [];
  private factors = [1.0, 0.18, 0.14, 0.10, 0.07, 0.05, 0.035];
  private sizes = [16, 12, 9, 7, 5, 4, 3];
  private opacities = [0.75, 0.55, 0.4, 0.28, 0.2, 0.12, 0.06];

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'cursor-root';
    document.body.appendChild(this.root);

    const style = document.createElement('style');
    style.textContent = `
      #cursor-root {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
      }
      .cursor-orb {
        position: absolute;
        border-radius: 50%;
        background: rgba(108, 71, 255, 0.25);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .cursor-orb:nth-child(1) {
        background: radial-gradient(circle, rgba(108, 71, 255, 0.35) 0%, rgba(108, 71, 255, 0.18) 55%, rgba(108, 71, 255, 0) 75%);
        border: 1px solid rgba(108, 71, 255, 0.6);
        box-shadow: 0 0 24px rgba(108, 71, 255, 0.4);
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s;
      }
      #cursor-root.is-hovering .cursor-orb:nth-child(1) {
        transform: translate(-50%, -50%) scale(2.4);
        background: radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, rgba(34, 211, 238, 0.18) 55%, rgba(34, 211, 238, 0) 75%);
        border-color: rgba(34, 211, 238, 0.75);
        box-shadow: 0 0 28px rgba(34, 211, 238, 0.45);
      }
      .sonar-pulse {
        position: absolute;
        border-radius: 50%;
        background: var(--color-primary, #6C47FF);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0.6;
        pointer-events: none;
      }
      @keyframes pulseAnim {
        to {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
      
      /* Hide native cursor globally if using custom cursor */
      @media (min-width: 768px) {
        body {
          cursor: none;
        }
        a, button, [data-cursor="hover"], [data-magnetic] {
          cursor: none;
        }
      }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 7; i++) {
      const orb = document.createElement('div');
      orb.className = 'cursor-orb';
      orb.style.width = `${this.sizes[i]}px`;
      orb.style.height = `${this.sizes[i]}px`;
      orb.style.opacity = `${this.opacities[i]}`;
      this.root.appendChild(orb);
      this.orbs.push(orb);
      this.positions.push({ x: this.mouse.x, y: this.mouse.y });
    }

    // Only enable on non-mobile
    if (window.innerWidth >= 768) {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mousedown', this.onClick);
      this.setupMagneticHover();
      this.render();
    } else {
      this.root.style.display = 'none';
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  private onClick = () => {
    const pulse = document.createElement('div');
    pulse.className = 'sonar-pulse';
    pulse.style.width = '16px';
    pulse.style.height = '16px';
    pulse.style.left = `${this.positions[0].x}px`;
    pulse.style.top = `${this.positions[0].y}px`;
    pulse.style.animation = 'pulseAnim 0.6s ease-out forwards';
    this.root.appendChild(pulse);
    
    pulse.addEventListener('animationend', () => {
      pulse.remove();
    });
  };

  private setupMagneticHover() {
    document.addEventListener('mousemove', (e) => {
      const target = e.target as HTMLElement;
      
      const hoverable = target.closest('[data-cursor="hover"], button, a');
      if (hoverable) {
        this.root.classList.add('is-hovering');
      } else {
        this.root.classList.remove('is-hovering');
      }

      const magnetic = target.closest('[data-magnetic]') as HTMLElement;
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        // Calculate distance
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 60) {
          magnetic.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px)`;
          magnetic.style.transition = 'none';
        } else {
          magnetic.style.transform = '';
          magnetic.style.transition = 'transform 0.4s ease';
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      const magnetic = target.closest('[data-magnetic]') as HTMLElement;
      if (magnetic) {
        magnetic.style.transform = '';
        magnetic.style.transition = 'transform 0.4s ease';
      }
    });
  }

  private render = () => {
    this.positions[0].x = this.mouse.x;
    this.positions[0].y = this.mouse.y;

    for (let i = 1; i < 7; i++) {
      this.positions[i].x += (this.positions[i - 1].x - this.positions[i].x) * this.factors[i];
      this.positions[i].y += (this.positions[i - 1].y - this.positions[i].y) * this.factors[i];
    }

    for (let i = 0; i < 7; i++) {
      this.orbs[i].style.left = `${this.positions[i].x}px`;
      this.orbs[i].style.top = `${this.positions[i].y}px`;
    }

    requestAnimationFrame(this.render);
  };
}
