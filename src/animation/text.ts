import { gsap } from 'gsap';

export function splitTextToSpans(element: HTMLElement) {
  const text = element.innerText;
  element.innerHTML = '';
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.innerText = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    element.appendChild(span);
  });
  return element.querySelectorAll('span');
}

export function animateLetters(spans: NodeListOf<HTMLSpanElement> | HTMLElement[]) {
  gsap.fromTo(spans, 
    { y: 80, opacity: 0, filter: 'blur(8px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.04, ease: 'power3.out' }
  );
}

export class CharScramble {
  private element: HTMLElement;
  private targetText: string;
  private chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  private frameRequest: number = 0;
  private frameCount: number = 0;
  private scrambleCount: number;
  private onComplete?: () => void;

  constructor(element: HTMLElement, text: string, onComplete?: () => void) {
    this.element = element;
    this.targetText = text;
    this.scrambleCount = text.length;
    this.onComplete = onComplete;
  }

  public start() {
    this.frameCount = 0;
    this.scrambleCount = this.targetText.length;
    
    // Add blinking cursor style if not exists globally
    if (!document.getElementById('scramble-cursor-style')) {
      const style = document.createElement('style');
      style.id = 'scramble-cursor-style';
      style.textContent = `
        .scramble-cursor { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    this.tick();
  }

  private tick = () => {
    this.frameCount++;
    
    // Replace ~3 characters per frame (we increment every other frame for smoothness)
    if (this.frameCount % 2 === 0) {
      this.scrambleCount = Math.max(0, this.scrambleCount - 1);
    }
    
    let currentText = '';
    for (let i = 0; i < this.targetText.length; i++) {
      if (i < this.targetText.length - this.scrambleCount) {
        currentText += this.targetText[i]; // Revealed
      } else {
        currentText += this.chars[Math.floor(Math.random() * this.chars.length)]; // Scrambled
      }
    }
    
    this.element.innerHTML = currentText + '<span class="scramble-cursor">_</span>';
    
    if (this.scrambleCount > 0) {
      this.frameRequest = requestAnimationFrame(this.tick);
    } else {
      if (this.onComplete) this.onComplete();
    }
  };

  public stop() {
    cancelAnimationFrame(this.frameRequest);
  }
}
