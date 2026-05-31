import React, { useEffect, useRef, useState } from 'react';
import styles from './Projects.module.css';
import { SceneManager } from '../../three/SceneManager';
import { ProjectsScene } from '../../three/scenes/ProjectsScene';
import type { Project } from '../../data/projects';

export const Projects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredProject, setHoveredProject] = useState<{data: Project, x: number, y: number} | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      SceneManager.getInstance().register('projects-section', canvasRef.current, ProjectsScene);
      
      // Wait for initialization to attach callback (hacky but works for demo)
      setTimeout(() => {
        const sceneData = (SceneManager.getInstance() as any).scenes.get('projects-section');
        if (sceneData && sceneData.instance) {
          (sceneData.instance as ProjectsScene).onProjectHover = (project, pos) => {
            if (project && pos) {
              setHoveredProject({ data: project, x: pos.x, y: pos.y });
            } else {
              setHoveredProject(null);
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
            left: hoveredProject.x + 100, // offset from center
            top: hoveredProject.y
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
          <button className={styles.viewBtn} data-magnetic>View Project</button>
        </div>
      )}
    </div>
  );
};
