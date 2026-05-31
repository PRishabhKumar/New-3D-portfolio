import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { skills } from '../../data/skills';

export class SkillsScene extends BaseScene {
  private nodes: { pos: THREE.Vector3, vel: THREE.Vector3, label: string }[] = [];
  private points!: THREE.Points;
  private lines!: THREE.LineSegments;
  private maxDistance = 4;
  private targetMouse = new THREE.Vector2(0, 0);

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0));

    this.camera.position.set(0, 0, 15);

    skills.forEach(label => {
      this.nodes.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05),
        label
      });
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.nodes.length * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const pMaterial = new THREE.PointsMaterial({ color: 0xA855F7, size: 0.3 });
    this.points = new THREE.Points(geometry, pMaterial);
    this.scene.add(this.points);

    const lineGeometry = new THREE.BufferGeometry();
    const maxLines = (this.nodes.length * (this.nodes.length - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lMaterial = new THREE.LineBasicMaterial({ color: 0x6C47FF, transparent: true, opacity: 0.2 });
    this.lines = new THREE.LineSegments(lineGeometry, lMaterial);
    this.scene.add(this.lines);

    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  update(_delta: number, _scrollProgress: number) {
    const posAttribute = this.points.geometry.attributes.position as THREE.BufferAttribute;
    const lineAttribute = this.lines.geometry.attributes.position as THREE.BufferAttribute;
    let lineIdx = 0;

    const limit = 10;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.pos.add(node.vel);

      if (Math.abs(node.pos.x) > limit) node.vel.x *= -1;
      if (Math.abs(node.pos.y) > limit) node.vel.y *= -1;
      if (Math.abs(node.pos.z) > 5) node.vel.z *= -1;

      posAttribute.setXYZ(i, node.pos.x, node.pos.y, node.pos.z);

      for (let j = i + 1; j < this.nodes.length; j++) {
        const node2 = this.nodes[j];
        const dist = node.pos.distanceTo(node2.pos);
        
        if (dist < this.maxDistance) {
          lineAttribute.setXYZ(lineIdx++, node.pos.x, node.pos.y, node.pos.z);
          lineAttribute.setXYZ(lineIdx++, node2.pos.x, node2.pos.y, node2.pos.z);
        }
      }
    }

    for (let i = lineIdx; i < lineAttribute.count; i++) {
      lineAttribute.setXYZ(i, 0, 0, 0);
    }

    posAttribute.needsUpdate = true;
    lineAttribute.needsUpdate = true;
    
    this.scene.rotation.y += (this.targetMouse.x * 0.5 - this.scene.rotation.y) * 0.05;
    this.scene.rotation.x += (this.targetMouse.y * 0.5 - this.scene.rotation.x) * 0.05;

    this.composer.render();
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
