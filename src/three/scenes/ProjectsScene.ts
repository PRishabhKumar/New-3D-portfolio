import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OrbitalRing } from '../objects/OrbitalRing';
import { projects } from '../../data/projects';
import type { Project } from '../../data/projects';

export class ProjectsScene extends BaseScene {
  private orbitalRing!: OrbitalRing;
  private targetMouse = new THREE.Vector2(0, 0);

  // Expose hover callback for React component
  public onProjectHover: (project: Project | null, pos?: {x: number, y: number}) => void = () => {};

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    // Add bloom/smaa if needed, kept simple for projects
    
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    this.orbitalRing = new OrbitalRing(projects);
    // Pass hover event up
    this.orbitalRing.onHover = (project, pos) => this.onProjectHover(project, pos);
    
    this.scene.add(this.orbitalRing.group);

    // Tilt the ring slightly for better view
    this.orbitalRing.group.rotation.x = 0.15;

    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    // Update target mouse for raycaster
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Tilt the whole scene slightly based on mouse
    gsap.to(this.scene.rotation, {
      x: this.targetMouse.y * 0.05,
      y: this.targetMouse.x * 0.05,
      duration: 1
    });
  }

  update(delta: number, _scrollProgress: number) {
    if (this.orbitalRing) {
      this.orbitalRing.handleMouseMove(this.targetMouse, this.camera);
      this.orbitalRing.update(delta);
    }
    
    this.composer.render();
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}

// Temporary gsap import for scene tilt
import { gsap } from 'gsap';
