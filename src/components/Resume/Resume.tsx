import React, { useEffect, useRef, useState } from 'react';
import styles from './Resume.module.css';
import { SceneManager } from '../../three/SceneManager';
import { ResumeScene } from '../../three/scenes/ResumeScene';
import { journeyEvents } from '../../data/journey';

interface NodeData {
  label: string;
  year?: string;
  title?: string;
  screenPos: { x: number; y: number };
  depth: number;
}

export const Resume: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [labelNodes, setLabelNodes] = useState<NodeData[]>([]);
  const [hasSceneData, setHasSceneData] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const manager = SceneManager.getInstance();
      manager.register('resume-section', canvasRef.current, ResumeScene);
      let isMounted = true;

      const handleNodes = (event: Event) => {
        if (!isMounted) return;
        const detail = (event as CustomEvent<NodeData[]>).detail;
        if (!detail || detail.length === 0) return;
        setHasSceneData(true);
        setLabelNodes(detail);
      };

      window.addEventListener('resume:nodes', handleNodes as EventListener);

      return () => {
        isMounted = false;
        window.removeEventListener('resume:nodes', handleNodes as EventListener);
      };
    }
  }, []);

  return (
    <div ref={sectionRef} className={styles.resumeSection}>
      <div className="canvas-container" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
      <div
        id="resume-labels-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {labelNodes.map((node) => (
          <div
            key={node.label}
            style={{
              position: 'absolute',
              left: node.screenPos.x,
              top: node.screenPos.y,
              transform: 'translate(-50%, -50%)',
              opacity: node.depth < 0.98 ? 1 : 0,
              transition: 'opacity 0.3s ease',
              background: 'rgba(10, 10, 26, 0.60)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(201, 148, 26, 0.5)',
              padding: '10px 18px',
              borderRadius: '8px',
              color: '#E8B840',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            <strong style={{ display: 'block', color: '#F2E8D0' }}>
              {node.year ?? node.label}
            </strong>
            {node.title && (
              <span style={{ color: '#9A8868', fontSize: '11px' }}>
                {node.title}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.header}>
        <h2 className="headline-md">My Journey</h2>
      </div>

      {!hasSceneData && (
        <div className={styles.fallbackList}>
          {journeyEvents.map((event) => (
            <div key={event.year} className={`glass-card ${styles.fallbackCard}`}>
              <div className={`label-mono ${styles.fallbackYear}`}>{event.year}</div>
              <div className={styles.fallbackTitle}>{event.title}</div>
              <p className="body-md">{event.description}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
