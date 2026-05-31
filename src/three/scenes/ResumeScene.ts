import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { journeyEvents } from '../../data/journey';

export class ResumeScene extends BaseScene {
  private dnaGroup!: THREE.Group;
  private targetMouse = new THREE.Vector2(0, 0);
  private lastEmit = 0;
  
  // To expose HTML label positions
  public nodes: { mesh: THREE.Mesh, label: string, worldPos: THREE.Vector3, screenPos: {x: number, y: number} }[] = [];
  public onNodesUpdate: (nodes: typeof this.nodes) => void = () => {};

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.1);
    this.composer.addPass(bloomPass);

    this.camera.position.set(0, 0, 15);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 10, 8);
    this.scene.add(ambientLight, keyLight);

    this.dnaGroup = new THREE.Group();
    this.scene.add(this.dnaGroup);

    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    const numTurns = 3;
    const numPoints = 60;
    const height = 16;
    const radius = 2;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 2 * numTurns;
      const y = (t - 0.5) * height;

      points1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      points2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }

    const curve1 = new THREE.CatmullRomCurve3(points1);
    const curve2 = new THREE.CatmullRomCurve3(points2);

    const tubeGeo1 = new THREE.TubeGeometry(curve1, 100, 0.15, 8, false);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 100, 0.15, 8, false);

    const strandMat = new THREE.MeshStandardMaterial({
      color: 0x6C47FF,
      roughness: 0.35,
      metalness: 0.25,
      emissive: 0x2d134f,
      emissiveIntensity: 0.6
    });
    
    this.dnaGroup.add(new THREE.Mesh(tubeGeo1, strandMat));
    this.dnaGroup.add(new THREE.Mesh(tubeGeo2, strandMat));

    // Rungs
    const rungMat = new THREE.MeshStandardMaterial({
      color: 0x22D3EE,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x0b2730,
      emissiveIntensity: 0.6
    });
    const timelineEvents = journeyEvents.map(event => event.year);
    let eventIndex = 0;

    for (let i = 0; i < numPoints; i += 4) {
      const p1 = points1[i];
      const p2 = points2[i];
      const distance = p1.distanceTo(p2);
      const center = p1.clone().lerp(p2, 0.5);

      const rungGeo = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
      const rungMesh = new THREE.Mesh(rungGeo, rungMat);
      
      rungMesh.position.copy(center);
      rungMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      
      this.dnaGroup.add(rungMesh);

      // Add node for HTML labels
        if (i % 8 === 0 && eventIndex < timelineEvents.length) {
          const nodeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1,
            emissive: 0x6c47ff,
            emissiveIntensity: 0.6
          });
          const nodeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), nodeMat);
        nodeMesh.position.copy(center);
        this.dnaGroup.add(nodeMesh);
        
        this.nodes.push({
          mesh: nodeMesh,
          label: timelineEvents[eventIndex],
          worldPos: new THREE.Vector3(),
          screenPos: { x: 0, y: 0 }
        });
        eventIndex++;
      }
    }

    this.dnaGroup.rotation.z = 0.2; // Slight tilt
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  update(delta: number, _scrollProgress: number) {
    this.dnaGroup.rotation.y += delta * 0.3;
    
    // Mouse interaction
    this.dnaGroup.rotation.x += (this.targetMouse.y * 0.2 - this.dnaGroup.rotation.x) * 0.05;
    this.dnaGroup.rotation.z += (-this.targetMouse.x * 0.2 + 0.2 - this.dnaGroup.rotation.z) * 0.05;

    // Update HTML label positions
    this.nodes.forEach(node => {
      node.mesh.getWorldPosition(node.worldPos);
      const proj = node.worldPos.clone().project(this.camera);
      node.screenPos.x = (proj.x * 0.5 + 0.5) * window.innerWidth;
      node.screenPos.y = (proj.y * -0.5 + 0.5) * window.innerHeight;
    });

    this.onNodesUpdate([...this.nodes]);

    const now = this.clock.elapsedTime;
    if (now - this.lastEmit > 0.1) {
      this.lastEmit = now;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resume:nodes', {
          detail: this.nodes.map(node => ({
            label: node.label,
            screenPos: { x: node.screenPos.x, y: node.screenPos.y }
          }))
        }));
      }
    }

    this.composer.render();
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
