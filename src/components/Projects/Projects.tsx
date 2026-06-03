import React, { useEffect, useRef, useState } from 'react';
import styles from './Projects.module.css';
import { SceneManager } from '../../three/SceneManager';
import { ProjectsScene } from '../../three/scenes/ProjectsScene';
import { playPortalTransition } from '../../animation/portal';
import type { Project } from '../../data/projects';

export const Projects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredProject, setHoveredProject] = useState<{data: Project, x: number, y: number} | null>(null);

  const overlayHoveredRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayOffset = 48;

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('projects-section', canvasRef.current, ProjectsScene);
      
      setTimeout(() => {
        const sceneData = (SceneManager.getInstance() as any).scenes.get('projects-section');
        if (sceneData && sceneData.instance) {
          (sceneData.instance as ProjectsScene).onProjectHover = (project, pos) => {
            if (project && pos) {
              if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
              setHoveredProject({ data: project, x: pos.x, y: pos.y });
            } else {
              hideTimeoutRef.current = setTimeout(() => {
                if (!overlayHoveredRef.current) {
                  setHoveredProject(null);
                }
              }, 400); // Allow enough time to move from card to overlay
            }
          };
        }
      }, 500);
    }
  }, []);

  return (
    <div className={styles.projectsSection}>
      <div className="canvas-container" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
      
      <div className={styles.header}>
          <h2 className="headline-md">My Work</h2>
      </div>

      {hoveredProject && (
        <div 
          className={`glass-card ${styles.projectOverlay}`}
          style={{
            left: hoveredProject.x + overlayOffset,
            top: hoveredProject.y
          }}
          onMouseEnter={() => { overlayHoveredRef.current = true; }}
          onMouseLeave={() => { 
            overlayHoveredRef.current = false;
            setHoveredProject(null);
          }}
        >
          <h3 className="headline-md" style={{ color: hoveredProject.data.accentColor }}>
            {hoveredProject.data.title}
          </h3>
          <p className="body-md">{hoveredProject.data.description}</p>
          <div className={styles.tags}>
            {hoveredProject.data.tags.map(tag => (
              <span key={tag} className={`label-mono ${styles.tag}`}>{tag}</span>
            ))}
          </div>
          <button 
            className={styles.viewBtn} 
            data-magnetic
            onClick={() => playPortalTransition()}
          >
            View Project
          </button>
        </div>
      )}
    </div>
  );
};
