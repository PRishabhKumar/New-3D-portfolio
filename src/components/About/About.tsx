import React, { useEffect, useRef } from 'react';
import styles from './About.module.css';
import { SceneManager } from '../../three/SceneManager';
import { AboutScene } from '../../three/scenes/AboutScene';

export const About: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('about-section', canvasRef.current, AboutScene);
    }
  }, []);

  return (
    <div className={styles.aboutSection}>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className="canvas-container" style={{ position: 'absolute', height: '100%' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
        <div className={styles.rightCol}>
          <h2 className="headline-md">System.Biography_</h2>
          <p className="body-lg">
            I am a Creative Technologist navigating the void between design and engineering. 
            My mission is to construct hyper-immersive, spatial digital experiences that blur the line between web and native.
          </p>
          <div className={styles.stats}>
            <div className={`glass-card ${styles.statCard}`}>
              <div className={styles.statNumber}>5+</div>
              <div className={`label-mono ${styles.statLabel}`}>Years Experience</div>
            </div>
            <div className={`glass-card ${styles.statCard}`}>
              <div className={styles.statNumber}>50+</div>
              <div className={`label-mono ${styles.statLabel}`}>Projects Deployed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
