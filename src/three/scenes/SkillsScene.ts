import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { skills } from '../../data/skills';
import { gsap } from 'gsap';

function createTextTexture(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#12121e';
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.strokeStyle = '#6C47FF';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 256, 256);
  
  ctx.font = 'bold 40px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
  ctx.shadowBlur = 18;
  ctx.fillText(text, 128, 128);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

type PrismData = {
  mesh: THREE.Mesh;
  label: string;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  textTexture: THREE.CanvasTexture;
  isHovered: boolean;
  hoverState?: {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    vel: THREE.Vector3;
    rotVel: THREE.Vector3;
    scale: THREE.Vector3;
  };
};

export class SkillsScene extends BaseScene {
  private prisms: PrismData[] = [];
  private prismGroup!: THREE.Group;
  private targetMouse = new THREE.Vector2(0, 0);
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-9999, -9999);
  private hoveredPrism: PrismData | null = null;
  private originalEmissive = new THREE.Color(0x000000);
  private hoverLift = 2;
  private hoverScale = 1.25;
  private pauseParticles = false;

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0));

    this.camera.position.set(0, 0, 15);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    this.scene.add(ambientLight, dirLight);

    this.prismGroup = new THREE.Group();
    this.scene.add(this.prismGroup);

    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 6);
    geometry.rotateX(Math.PI / 2); // Face the camera

    skills.forEach(label => {
      const texture = createTextTexture(label);
      const material = new THREE.MeshStandardMaterial({
        color: 0x6c47ff,
        transparent: true,
        opacity: 0.85,
        roughness: 0.3,
        metalness: 0.4,
        emissive: new THREE.Color(0x000000)
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 4
      );

      this.prismGroup.add(mesh);

      this.prisms.push({
        mesh,
        label,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
        rotVel: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
        textTexture: texture,
        isHovered: false
      });
    });

    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!isInside) {
      this.mouse.set(-9999, -9999);
      this.targetMouse.set(0, 0);
      // Reset hover and resume particles when cursor leaves the canvas
      if (this.hoveredPrism) {
        this.clearHover();
      }
      return;
    }

    this.targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.x = this.targetMouse.x;
    this.mouse.y = this.targetMouse.y;
  }

  update(_delta: number, _scrollProgress: number) {
    const limitX = 10;
    const limitY = 6;
    // Camera is at z=15. Keep particles between z=-10 and z=8 (away from camera)
    const maxZ = 8;   
    const minZ = -10;

    for (let i = 0; i < this.prisms.length; i++) {
      const prism = this.prisms[i];
      // Only move if NOT paused and NOT hovered
      if (!this.pauseParticles && !prism.isHovered) {
        prism.mesh.position.add(prism.vel);
        prism.mesh.rotation.x += prism.rotVel.x;
        prism.mesh.rotation.y += prism.rotVel.y;
        prism.mesh.rotation.z += prism.rotVel.z;

        if (Math.abs(prism.mesh.position.x) > limitX) prism.vel.x *= -1;
        if (Math.abs(prism.mesh.position.y) > limitY) prism.vel.y *= -1;

        // Enforce Z bounds
        if (prism.mesh.position.z > maxZ) {
          prism.mesh.position.z = maxZ;
          prism.vel.z *= -1;
        }
        if (prism.mesh.position.z < minZ) {
          prism.mesh.position.z = minZ;
          prism.vel.z *= -1;
        }
      }
    }

    // Only perform raycast to initiate hover when no prism is already hovered.
    if (!this.hoveredPrism) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.prismGroup.children);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const prismData = this.prisms.find(p => p.mesh === intersectedMesh);
        if (prismData) {
          this.applyHover(prismData);
        }
      }
    }

    if (this.hoveredPrism) {
      this.hoveredPrism.mesh.lookAt(this.camera.position);
    }

    this.scene.rotation.y += 0.002;
    this.scene.rotation.x += 0.0005;

    this.composer.render();
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private applyHover(prismData: PrismData) {
    if (this.hoveredPrism) {
      this.clearHover();
    }

    // Pause background particle motion when any prism is hovered
    this.pauseParticles = true;

    prismData.isHovered = true;
    prismData.hoverState = {
      position: prismData.mesh.position.clone(),
      rotation: prismData.mesh.rotation.clone(),
      vel: prismData.vel.clone(),
      rotVel: prismData.rotVel.clone(),
      scale: prismData.mesh.scale.clone()
    };
    prismData.vel.set(0, 0, 0);
    prismData.rotVel.set(0, 0, 0);

    const material = prismData.mesh.material as THREE.MeshStandardMaterial;
    material.map = prismData.textTexture;
    material.emissive.setHex(0xA855F7);
    material.emissiveIntensity = 1.1;
    material.opacity = 1;
    material.needsUpdate = true;

    const toCamera = new THREE.Vector3().subVectors(this.camera.position, prismData.mesh.position).normalize();
    const targetPos = prismData.mesh.position.clone().add(toCamera.multiplyScalar(this.hoverLift));
    gsap.to(prismData.mesh.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.35,
      ease: 'power2.out'
    });
    gsap.to(prismData.mesh.scale, {
      x: this.hoverScale,
      y: this.hoverScale,
      z: this.hoverScale,
      duration: 0.35,
      ease: 'power2.out'
    });

    this.hoveredPrism = prismData;
  }

  private clearHover() {
    if (!this.hoveredPrism) return;

    const prismData = this.hoveredPrism;
    const material = prismData.mesh.material as THREE.MeshStandardMaterial;
    material.map = null;
    material.emissive.copy(this.originalEmissive);
    material.emissiveIntensity = 0;
    material.opacity = 0.85;
    material.needsUpdate = true;

    if (prismData.hoverState) {
      const { position, rotation, vel, rotVel, scale } = prismData.hoverState;
      gsap.to(prismData.mesh.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: 0.35,
        ease: 'power2.out'
      });
      gsap.to(prismData.mesh.scale, {
        x: scale.x,
        y: scale.y,
        z: scale.z,
        duration: 0.35,
        ease: 'power2.out'
      });
      prismData.mesh.rotation.copy(rotation);
      prismData.vel.copy(vel);
      prismData.rotVel.copy(rotVel);
      prismData.hoverState = undefined;
    }

    prismData.isHovered = false;
    this.hoveredPrism = null;
    // Resume particle motion
    this.pauseParticles = false;
  }
}
