import React, { useEffect, useRef, useState } from 'react';
import styles from './Portal.module.css';
import { SceneManager } from '../../three/SceneManager';
import { PortalScene } from '../../three/scenes/PortalScene';

export const Portal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMount = () => setMounted(true);
    const handleUnmount = () => setMounted(false);
    const handleOpacity = (e: CustomEvent<number>) => setOpacity(e.detail);

    window.addEventListener('portal:mount', handleMount);
    window.addEventListener('portal:unmount', handleUnmount);
    window.addEventListener('portal:opacity', handleOpacity as EventListener);

    return () => {
      window.removeEventListener('portal:mount', handleMount);
      window.removeEventListener('portal:unmount', handleUnmount);
      window.removeEventListener('portal:opacity', handleOpacity as EventListener);
    };
  }, []);

  useEffect(() => {
    if (mounted && canvasRef.current) {
      SceneManager.getInstance().register('portal-overlay', canvasRef.current, PortalScene);
    } else if (!mounted) {
      // It's safe to just let it be, but if we have unregister we should call it.
      // SceneManager might not have unregister, so we just let it be.
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div 
      id="portal-overlay"
      className={styles.portalOverlay} 
      style={{ backgroundColor: `rgba(4, 4, 8, ${opacity * 0.9})` }}
    >
      <div className="canvas-container" style={{ position: 'absolute', inset: 0 }}>
        <canvas ref={canvasRef} style={{ opacity }} />
      </div>
    </div>
  );
};
