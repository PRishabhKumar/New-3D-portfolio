import * as THREE from 'three';
import { BaseScene } from '../BaseScene';
import morphVertexShader from '../../shaders/morphing/vertex.glsl';
import morphFragmentShader from '../../shaders/morphing/fragment.glsl';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
export class HeroScene extends BaseScene {
  private icosahedronGroup!: THREE.Group;
  private uniforms!: any;
  private targetMouse = new THREE.Vector2(0, 0);
  private starUniforms!: any;

  init() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4, 0.8, 0.2);
    this.composer.addPass(bloomPass);

    const filmPass = new FilmPass();
    this.composer.addPass(filmPass);

    
    // this.composer.addPass(smaaPass);

    this.camera.position.set(0, 0, 8);

    // 1. Icosahedron
    this.icosahedronGroup = new THREE.Group();
    this.scene.add(this.icosahedronGroup);

    const geometry = new THREE.IcosahedronGeometry(2.0, 4);
    const originalPosition = new Float32Array(geometry.attributes.position.array);
    geometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPosition, 3));

    this.uniforms = {
      uTime: { value: 0 },
      uMorphStrength: { value: 1.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: morphVertexShader,
      fragmentShader: morphFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.icosahedronGroup.add(mesh);

    // 2. Star Field
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    this.starUniforms = {
      uScrollVelocity: { value: 0 },
      color: { value: new THREE.Color(0xffffff) },
    };

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.0,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(starPoints);

    // Mouse tracking
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  setScrollVelocity(velocity: number) {
    if (this.starUniforms) {
      this.starUniforms.uScrollVelocity.value = velocity;
    }
  }

  update(_delta: number, _scrollProgress: number) {
    this.uniforms.uTime.value = this.clock.getElapsedTime();
    this.uniforms.uMouse.value.lerp(this.targetMouse, 0.05);

    this.icosahedronGroup.rotation.y += (this.targetMouse.x * 0.3 - this.icosahedronGroup.rotation.y) * 0.04;
    this.icosahedronGroup.rotation.x += (this.targetMouse.y * 0.15 - this.icosahedronGroup.rotation.x) * 0.04;

    this.composer.render();
  }

  dispose() {
    super.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
