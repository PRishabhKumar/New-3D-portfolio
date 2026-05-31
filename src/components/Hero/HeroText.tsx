import React, { useEffect, useRef } from 'react';
import styles from './Hero.module.css';
import { splitTextToSpans, animateLetters, CharScramble } from '../../animation/text';

export const HeroText: React.FC = () => {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scramble: CharScramble;
    const roles = ['Full Stack Developer', 'Creative Technologist', 'UI/UX Engineer', '3D Web Developer', 'Digital Craftsman'];
    let roleIndex = 0;

    const handleTextReveal = () => {
      if (nameRef.current) {
        const spans = splitTextToSpans(nameRef.current);
        animateLetters(spans);
      }
    };

    const handleSubtitleReveal = () => {
      if (roleRef.current) {
        scramble = new CharScramble(roleRef.current, roles[roleIndex], () => {
          setTimeout(rotateRole, 2500);
        });
        scramble.start();
      }
    };

    const rotateRole = () => {
      roleIndex = (roleIndex + 1) % roles.length;
      if (roleRef.current) {
        scramble = new CharScramble(roleRef.current, roles[roleIndex], () => {
          setTimeout(rotateRole, 2500);
        });
        scramble.start();
      }
    };

    window.addEventListener('intro-text-reveal', handleTextReveal);
    window.addEventListener('intro-subtitle-reveal', handleSubtitleReveal);

    return () => {
      window.removeEventListener('intro-text-reveal', handleTextReveal);
      window.removeEventListener('intro-subtitle-reveal', handleSubtitleReveal);
      if (scramble) scramble.stop();
    };
  }, []);

  return (
    <div>
      <h1 ref={nameRef} className={`display-xl ${styles.name}`}>
        P RISHABH KUMAR
      </h1>
      <div className={styles.roleContainer}>
        <span className="label-mono">I am a</span>
        <div ref={roleRef} className="headline-md"></div>
      </div>
    </div>
  );
};
