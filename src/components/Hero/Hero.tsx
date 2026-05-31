import React, { useEffect, useRef } from 'react';
import styles from './Hero.module.css';
import { HeroText } from './HeroText';
import { playIntro } from '../../animation/intro';
import { SceneManager } from '../../three/SceneManager';
import { HeroScene } from '../../three/scenes/HeroScene';

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('hero-section', canvasRef.current, HeroScene);
    }
    
    // Play intro animation on mount
    playIntro();
  }, []);

  const handleScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <HeroText />
          <div ref={ctaGroupRef} className={`${styles.ctaGroup} hero-cta`}>
            <button 
              className={`${styles.heroCta}`} 
              data-magnetic
              onClick={() => handleScrollTo('projects-section')}
            >
              Explore Projects
            </button>
            <button 
              className={`${styles.heroCta}`} 
              data-magnetic
              onClick={() => handleScrollTo('contact-section')}
            >
              Contact Me
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

