import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class AboutScene extends BaseScene {
  private ring1!: THREE.Mesh;
  private ring2!: THREE.Mesh;
  private electron1!: THREE.Mesh;
  private electron2!: THREE.Mesh;
  private ring1Angle = 0;
  private ring2Angle = 0;
  private torusRadius = 3;

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0);
    this.composer.addPass(bloomPass);

    this.camera.position.set(0, 0, 10);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6C47FF, transparent: true, opacity: 0.3, wireframe: true });
    
    this.ring1 = new THREE.Mesh(new THREE.TorusGeometry(this.torusRadius, 0.05, 8, 64), ringMat);
    this.ring1.rotation.x = 1.0;
    
    this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(this.torusRadius, 0.05, 8, 64), ringMat);
    this.ring2.rotation.z = 0.8;
    
    this.scene.add(this.ring1);
    this.scene.add(this.ring2);

    const electronMat = new THREE.MeshBasicMaterial({ color: 0x22D3EE });
    this.electron1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), electronMat);
    this.electron2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), electronMat);
    
    this.scene.add(this.electron1);
    this.scene.add(this.electron2);
  }

  update(delta: number, _scrollProgress: number) {
    this.ring1.rotation.y += 0.008 * delta * 60;
    this.ring2.rotation.y -= 0.005 * delta * 60;

    this.ring1Angle += 0.04 * delta * 60;
    this.ring2Angle += 0.03 * delta * 60;

    const pos1 = new THREE.Vector3(Math.cos(this.ring1Angle) * this.torusRadius, Math.sin(this.ring1Angle) * this.torusRadius, 0);
    pos1.applyEuler(this.ring1.rotation);
    this.electron1.position.copy(pos1);

    const pos2 = new THREE.Vector3(Math.cos(this.ring2Angle) * this.torusRadius, Math.sin(this.ring2Angle) * this.torusRadius, 0);
    pos2.applyEuler(this.ring2.rotation);
    this.electron2.position.copy(pos2);

    this.composer.render();
  }
}
