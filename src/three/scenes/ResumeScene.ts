import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { journeyEvents } from '../../data/journey';

export class ResumeScene extends BaseScene {
  private group!: THREE.Group;
  private targetMouse = new THREE.Vector2(0, 0);
  private lastEmit = 0;
  private cameraPath!: THREE.LineCurve3;
  
  public nodes: { mesh: THREE.Mesh, label: string, worldPos: THREE.Vector3, screenPos: {x: number, y: number} }[] = [];
  public onNodesUpdate: (nodes: typeof this.nodes) => void = () => {};

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.1);
    this.composer.addPass(bloomPass);

    const height = 16;

    this.cameraPath = new THREE.LineCurve3(
      new THREE.Vector3(0, height / 2 + 2, 8),
      new THREE.Vector3(0, -height / 2, 8)
    );

    this.camera.position.set(0, height / 2 + 2, 8);
    this.camera.lookAt(0, height / 2, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Simple central glowing line
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6C47FF, transparent: true, opacity: 0.5 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(this.cameraPath.getPoints(50));
    const line = new THREE.Line(lineGeo, lineMat);
    line.position.z = -2;
    this.group.add(line);

    const timelineEvents = journeyEvents;
    const numNodes = timelineEvents.length;

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x22D3EE,
      emissiveIntensity: 0.8
    });
    const nodeGeo = new THREE.SphereGeometry(0.4, 16, 16);

    for (let i = 0; i < numNodes; i++) {
      const t = i / Math.max(1, (numNodes - 1)); // 0 to 1
      const y = (0.5 - t) * height;

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.sin(t * Math.PI * 4) * 2, y, -2);
      this.group.add(nodeMesh);
      
      this.nodes.push({
        mesh: nodeMesh,
        label: timelineEvents[i].year,
        worldPos: new THREE.Vector3(),
        screenPos: { x: 0, y: 0 }
      });
    }

    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  update(_delta: number, scrollProgress: number) {
    this.group.rotation.x += (this.targetMouse.y * 0.1 - this.group.rotation.x) * 0.05;
    this.group.rotation.y += (this.targetMouse.x * 0.1 - this.group.rotation.y) * 0.05;

    const t = scrollProgress;
    const targetPos = this.cameraPath.getPoint(t);
    this.camera.position.lerp(targetPos, 0.08);

    this.camera.lookAt(0, this.camera.position.y - 2, 0);

    // Update HTML label positions
    this.nodes.forEach(node => {
      node.mesh.getWorldPosition(node.worldPos);
      const proj = node.worldPos.clone().project(this.camera);
      node.screenPos.x = (proj.x * 0.5 + 0.5) * window.innerWidth;
      node.screenPos.y = (proj.y * -0.5 + 0.5) * window.innerHeight;
    });

    this.onNodesUpdate([...this.nodes]);

    const now = this.getElapsedTime();
    if (now - this.lastEmit > 0.1) {
      this.lastEmit = now;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resume:nodes', {
          detail: this.nodes.map((node, i) => ({
            label: node.label,
            year: journeyEvents[i]?.year ?? node.label,
            title: journeyEvents[i]?.title ?? '',
            screenPos: { ...node.screenPos },
            depth: node.worldPos.clone().project(this.camera).z
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
