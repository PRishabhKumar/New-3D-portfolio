import React, { useEffect, useRef, useState } from 'react';
import styles from './Resume.module.css';
import { SceneManager } from '../../three/SceneManager';
import { ResumeScene } from '../../three/scenes/ResumeScene';
import { journeyEvents } from '../../data/journey';

interface NodeData {
  label: string;
  screenPos: { x: number; y: number };
}

export const Resume: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
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
        const rect = sectionRef.current?.getBoundingClientRect();
        const offsetX = rect?.left ?? 0;
        const offsetY = rect?.top ?? 0;
        setHasSceneData(true);
        setNodes(detail.map(node => ({
          label: node.label,
          screenPos: {
            x: node.screenPos.x - offsetX,
            y: node.screenPos.y - offsetY
          }
        })));
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

      {nodes.map((node, i) => (
        <div
          key={i}
          className={`glass-card ${styles.nodeLabel}`}
          style={{
            left: node.screenPos.x,
            top: node.screenPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
};
