import React, { useEffect, useRef } from 'react';
import styles from './Contact.module.css';
import { SceneManager } from '../../three/SceneManager';
import { ContactScene } from '../../three/scenes/ContactScene';

export const Contact: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('contact-section', canvasRef.current, ContactScene);
    }
  }, []);

  return (
    <div className={styles.contactSection}>
      <div className="canvas-container" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.content}>
        <h2 className="display-lg">ENTER THE VOID</h2>
        <p className="body-lg">Ready to build something extraordinary?</p>
        <button className={styles.contactBtn} data-magnetic>
          Let's get in touch
        </button>
      </div>
    </div>
  );
};
