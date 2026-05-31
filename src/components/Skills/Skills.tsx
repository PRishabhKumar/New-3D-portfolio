import React, { useEffect, useRef } from 'react';
import styles from './Skills.module.css';
import { SceneManager } from '../../three/SceneManager';
import { SkillsScene } from '../../three/scenes/SkillsScene';
import { skills } from '../../data/skills';

export const Skills: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('skills-section', canvasRef.current, SkillsScene);
    }
  }, []);

  return (
    <div className={styles.skillsSection}>
      <div className="canvas-container" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.header}>
        <h2 className="headline-md">Skills</h2>
      </div>
      <div className={styles.skillsGrid}>
        {skills.map((skill) => (
          <div key={skill} className={`glass-card ${styles.skillChip}`}>
            <span className="label-mono">{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
