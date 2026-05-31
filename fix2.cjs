const fs = require('fs');

const replaceInFile = (file, replacer) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = replacer(content);
    fs.writeFileSync(file, content);
  }
};

// Nav
replaceInFile('src/components/Nav/Nav.tsx', c => c.replace(/import Lenis.*?\n/, ''));

// OrbitalRing
replaceInFile('src/three/objects/OrbitalRing.ts', c => c.replace(/private rotationSpeed/, 'private isHovered = false;\n  private rotationSpeed'));

// ProjectsScene
replaceInFile('src/three/scenes/ProjectsScene.ts', c => c.replace(/import \{ Project \} from '\.\.\/\.\.\/data\/projects';/, "import type { Project } from '../../data/projects';").replace(/_delta/g, 'delta'));

// AboutScene
replaceInFile('src/three/scenes/AboutScene.ts', c => 
  c.replace(/_delta/g, 'delta')
   .replace(/new UnrealBloomPass\([^)]+\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0)')
);

// HeroScene
replaceInFile('src/three/scenes/HeroScene.ts', c => 
  c.replace(/_delta/g, 'delta')
   .replace(/new UnrealBloomPass\([^)]+\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4, 0.8, 0.2)')
   .replace(/new SMAAPass\([^)]+\)/, 'new SMAAPass(window.innerWidth, window.innerHeight)')
);
// Actually, let's just comment out SMAAPass to be safe
replaceInFile('src/three/scenes/HeroScene.ts', c => c.replace(/this\.composer\.addPass\(smaaPass\);/g, '// this.composer.addPass(smaaPass);').replace(/const smaaPass.*/g, ''));

// ResumeScene
replaceInFile('src/three/scenes/ResumeScene.ts', c => 
  c.replace(/_delta/g, 'delta')
   .replace(/new UnrealBloomPass\([^)]+\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.1)')
);

// SkillsScene
replaceInFile('src/three/scenes/SkillsScene.ts', c => 
  c.replace(/new UnrealBloomPass\([^)]+\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0)')
);

console.log('Fixed');
