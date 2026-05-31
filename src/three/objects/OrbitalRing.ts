import * as THREE from 'three';
import type { Project } from '../../data/projects';
import { gsap } from 'gsap';

export class OrbitalRing {
  public group: THREE.Group;
  private cards: THREE.Mesh[] = [];
  private ringRadius = 5;
  private rotationSpeed = 0.003;
  private hoveredCard: THREE.Mesh | null = null;
  private raycaster = new THREE.Raycaster();
  
  // HTML Overlay callback
  public onHover: (project: Project | null, screenPos?: {x: number, y: number}) => void = () => {};

  constructor(projects: Project[]) {
    this.group = new THREE.Group();
    this.createCards(projects);
  }

  private createRoundedRectShape(width: number, height: number, radius: number) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);
    return shape;
  }

  private createCards(projects: Project[]) {
    const totalCards = projects.length;
    const textureLoader = new THREE.TextureLoader();

    const shape = this.createRoundedRectShape(3, 2, 0.1);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });

    projects.forEach((project, i) => {
      const angle = (i / totalCards) * Math.PI * 2;
      
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });

      // Load texture
      textureLoader.load(project.imageUrl, (texture) => {
        // Simple mapping, might need UV adjustment for ExtrudeGeometry
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      });

      const card = new THREE.Mesh(geometry, [
        material, // front
        new THREE.MeshBasicMaterial({ color: 0x0a0a1a }) // side/back
      ]);

      card.position.x = Math.sin(angle) * this.ringRadius;
      card.position.z = Math.cos(angle) * this.ringRadius;
      
      // Face inward
      card.rotation.y = angle + Math.PI;

      card.userData = { 
        project, 
        basePosition: card.position.clone(),
        baseAngle: angle,
        index: i
      };

      this.cards.push(card);
      this.group.add(card);
    });
  }

  public handleMouseMove(mouse: THREE.Vector2, camera: THREE.Camera) {
    this.raycaster.setFromCamera(mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.cards);

    if (intersects.length > 0) {
      const card = intersects[0].object as THREE.Mesh;
      if (this.hoveredCard !== card) {
        if (this.hoveredCard) this.unhoverCard(this.hoveredCard);
        this.hoverCard(card, camera);
      }
    } else {
      if (this.hoveredCard) {
        this.unhoverCard(this.hoveredCard);
        this.hoveredCard = null;
        this.onHover(null);
      }
    }
  }

  private hoverCard(card: THREE.Mesh, camera: THREE.Camera) {
    this.hoveredCard = card;

    // Tween rotation speed
    gsap.to(this, { rotationSpeed: 0, duration: 0.5 });

    // Calculate local Z forward direction based on card rotation
    const forward = new THREE.Vector3(0, 0, 1).applyEuler(card.rotation).normalize();
    const targetPos = card.userData.basePosition.clone().add(forward.multiplyScalar(1.2));
    
    gsap.to(card.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    gsap.to(card.scale, {
      x: 1.06, y: 1.06, z: 1.06,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Fade others
    this.cards.forEach(c => {
      if (c !== card) {
        if (Array.isArray(c.material)) {
          gsap.to(c.material[0], { opacity: 0.4, duration: 0.4 });
        } else {
          gsap.to(c.material, { opacity: 0.4, duration: 0.4 });
        }
      }
    });

    // Determine screen position for HTML overlay
    const worldPos = new THREE.Vector3();
    card.getWorldPosition(worldPos);
    worldPos.project(camera);
    
    const x = (worldPos.x * .5 + .5) * window.innerWidth;
    const y = (worldPos.y * -.5 + .5) * window.innerHeight;
    
    this.onHover(card.userData.project, { x, y });
  }

  private unhoverCard(card: THREE.Mesh) {
    gsap.to(this, { rotationSpeed: 0.003, duration: 0.5 });

    gsap.to(card.position, {
      x: card.userData.basePosition.x,
      y: card.userData.basePosition.y,
      z: card.userData.basePosition.z,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    gsap.to(card.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'power2.out'
    });

    this.cards.forEach(c => {
      if (c !== card) {
        if (Array.isArray(c.material)) {
          gsap.to(c.material[0], { opacity: 0.8, duration: 0.4 });
        } else {
          gsap.to(c.material, { opacity: 0.8, duration: 0.4 });
        }
      }
    });
  }

  public update(delta: number) {
    // Auto-rotation
    this.group.rotation.y += this.rotationSpeed * delta * 60;

    // Z-depth perspective scaling for all cards not hovered
    this.cards.forEach(card => {
      if (card !== this.hoveredCard) {
        const worldPos = new THREE.Vector3();
        card.getWorldPosition(worldPos);
        // Cards closer to camera (larger Z) scale up
        const scale = THREE.MathUtils.mapLinear(worldPos.z, -this.ringRadius, this.ringRadius, 0.75, 1.0);
        card.scale.setScalar(scale);
      }
    });
  }
}
