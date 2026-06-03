import { BaseScene } from './BaseScene';

type SceneInstance = {
  instance: BaseScene | null;
  SceneClass: new (canvas: HTMLCanvasElement) => BaseScene;
  canvas: HTMLCanvasElement;
  rafId: number;
  isFar: boolean;
};

export class SceneManager {
  private static instance: SceneManager;
  private scenes: Map<string, SceneInstance> = new Map();
  private initListeners: Map<string, Array<(scene: BaseScene) => void>> = new Map();
  private observer!: IntersectionObserver;
  private cleanupObserver!: IntersectionObserver;

  private constructor() {
    this.setupObservers();
    window.addEventListener('resize', this.onResize);
  }

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  private setupObservers() {
    // Active Observer: >= 10% visible to init, >0% to run loop
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const sceneData = this.scenes.get(id);
        if (!sceneData) return;

        if (entry.isIntersecting) {
          // It's visible, init if needed and start loop
          if (!sceneData.instance) {
            sceneData.instance = new sceneData.SceneClass(sceneData.canvas);
            sceneData.instance.setupRenderer();
            sceneData.instance.init();
            sceneData.instance.isInitialized = true;
            this.notifyInit(id, sceneData.instance);
          }
          sceneData.instance.isActive = true;
          this.startRenderLoop(id);
        } else {
          // Exited viewport, pause loop
          if (sceneData.instance) {
            sceneData.instance.isActive = false;
          }
          this.pauseRenderLoop(id);
        }
      });
    }, { threshold: 0.1 });

    // Cleanup Observer: dispose when far away (rootMargin 200%)
    this.cleanupObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const sceneData = this.scenes.get(id);
        if (!sceneData) return;

        if (!entry.isIntersecting) {
          sceneData.isFar = true;
          this.dispose(id); // Dispose it to save memory
        } else {
          sceneData.isFar = false;
        }
      });
    }, { rootMargin: '200% 0px 200% 0px' });
  }

  public register(id: string, canvas: HTMLCanvasElement, SceneClass: new (c: HTMLCanvasElement) => BaseScene): void {
    this.scenes.set(id, {
      instance: null,
      SceneClass,
      canvas,
      rafId: 0,
      isFar: false
    });
    
    // We expect the section to have this ID
    const section = document.getElementById(id);
    if (section) {
      this.observer.observe(section);
      this.cleanupObserver.observe(section);
    } else {
      // In React, the element might not be in DOM yet when register is called.
      // So we wait for a moment or the component can call register when mounted.
      setTimeout(() => {
        const sectionEl = document.getElementById(id);
        if (sectionEl) {
          this.observer.observe(sectionEl);
          this.cleanupObserver.observe(sectionEl);
        }
      }, 100);
    }
  }

  public onInit(id: string, callback: (scene: BaseScene) => void): void {
    const listeners = this.initListeners.get(id) ?? [];
    listeners.push(callback);
    this.initListeners.set(id, listeners);

    const sceneData = this.scenes.get(id);
    if (sceneData?.instance) {
      callback(sceneData.instance);
    }
  }

  private notifyInit(id: string, instance: BaseScene): void {
    const listeners = this.initListeners.get(id);
    if (!listeners || listeners.length === 0) return;
    listeners.forEach(listener => listener(instance));
  }

  private startRenderLoop(id: string) {
    const sceneData = this.scenes.get(id);
    if (!sceneData || !sceneData.instance) return;
    
    // Prevent multiple loops
    if (sceneData.rafId) return;

    const loop = () => {
      if (!sceneData.instance?.isActive) {
        sceneData.rafId = 0;
        return;
      }
      
      const delta = sceneData.instance.getDelta();
      sceneData.instance.update(delta, 0); 
      
      sceneData.rafId = requestAnimationFrame(loop);
    };
    
    // Start loop
    sceneData.instance.getDelta(); // reset delta
    sceneData.rafId = requestAnimationFrame(loop);
  }

  private pauseRenderLoop(id: string) {
    const sceneData = this.scenes.get(id);
    if (sceneData && sceneData.rafId) {
      cancelAnimationFrame(sceneData.rafId);
      sceneData.rafId = 0;
    }
  }

  private onResize = () => {
    this.scenes.forEach(sceneData => {
      if (sceneData.instance?.isActive) {
        sceneData.instance.resize();
      }
    });
  };

  public dispose(id: string) {
    const sceneData = this.scenes.get(id);
    if (sceneData && sceneData.instance) {
      this.pauseRenderLoop(id);
      sceneData.instance.dispose();
      sceneData.instance = null;
    }
  }

  public disposeAll() {
    this.scenes.forEach((_, id) => this.dispose(id));
  }
}
