import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import portalVertexShader from '../../shaders/portal/vertex.glsl';
import portalFragmentShader from '../../shaders/portal/fragment.glsl';

export class PortalScene extends BaseScene {
  private particles!: THREE.Points;
  public uniforms!: any;

  init() {
    this.camera.position.set(0, 0, 10);

    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2.0 + 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color(0x2FD9F4) } // Plasma Cyan
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    window.addEventListener('portal:progress', this.onProgress as EventListener);
  }

  private onProgress = (e: CustomEvent<number>) => {
    this.uniforms.uProgress.value = e.detail;
  }

  update(delta: number, _scrollProgress: number) {
    this.uniforms.uTime.value += delta;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    super.dispose();
    window.removeEventListener('portal:progress', this.onProgress as EventListener);
  }
}
