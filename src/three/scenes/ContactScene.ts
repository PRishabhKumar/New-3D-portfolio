import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import wormholeVertexShader from '../../shaders/wormhole/vertex.glsl';
import wormholeFragmentShader from '../../shaders/wormhole/fragment.glsl';

export class ContactScene extends BaseScene {
  private plane!: THREE.Mesh;
  private uniforms!: any;
  private targetMouse = new THREE.Vector2(0, 0);

  init() {
    this.camera.position.set(0, 0, 1);
    
    this.uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: wormholeVertexShader,
      fragmentShader: wormholeFragmentShader,
      uniforms: this.uniforms,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.plane = new THREE.Mesh(geometry, material);
    this.scene.add(this.plane);

    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.targetMouse.x = e.clientX;
    this.targetMouse.y = e.clientY;
  }

  resize() {
    super.resize();
    if (this.uniforms) {
      this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  }

  update(_delta: number, _scrollProgress: number) {
    this.uniforms.uTime.value = this.clock.getElapsedTime();
    this.uniforms.uMouse.value.lerp(this.targetMouse, 0.05);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
