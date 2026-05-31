const fs = require('fs');

const replaceInFile = (file, replacer) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = replacer(content);
    fs.writeFileSync(file, content);
  } else {
    console.log("Missing", file);
  }
};

replaceInFile('src/App.tsx', c => c.replace(/import React from 'react'(\r?\n)/, ''));
replaceInFile('src/components/Hero/Hero.tsx', c => c.replace(/import { gsap } from 'gsap';(\r?\n)/, ''));
replaceInFile('src/components/Nav/Nav.tsx', c => c.replace(/import Lenis.*?;(\r?\n)/, '').replace(/el => itemsRef.current\[i\] = el/g, 'el => { itemsRef.current[i] = el; }'));
replaceInFile('src/components/Projects/Projects.tsx', c => c.replace(/import { Project }/, 'import type { Project }'));
replaceInFile('src/three/objects/OrbitalRing.ts', c => c.replace(/import { Project }/, 'import type { Project }').replace(/private isHovered = false;(\r?\n)/, ''));

const scenes = ['AboutScene.ts', 'ContactScene.ts', 'HeroScene.ts', 'ProjectsScene.ts', 'ResumeScene.ts', 'SkillsScene.ts'];
scenes.forEach(f => {
  replaceInFile('src/three/scenes/' + f, c => c.replace(/update\(delta: number, scrollProgress: number\)/, 'update(_delta: number, _scrollProgress: number)'));
});

// UnrealBloomPass / FilmPass fixes
replaceInFile('src/three/scenes/HeroScene.ts', c => 
  c.replace(/new UnrealBloomPass\([\s\S]*?\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4)')
   .replace(/new FilmPass\([\s\S]*?\)/, 'new FilmPass()')
);
replaceInFile('src/three/scenes/AboutScene.ts', c => 
  c.replace(/new UnrealBloomPass\([\s\S]*?\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2)')
);
replaceInFile('src/three/scenes/ResumeScene.ts', c => 
  c.replace(/new UnrealBloomPass\([\s\S]*?\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5)')
);
replaceInFile('src/three/scenes/SkillsScene.ts', c => 
  c.replace(/new UnrealBloomPass\([\s\S]*?\)/, 'new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2)')
);

console.log("Done");
