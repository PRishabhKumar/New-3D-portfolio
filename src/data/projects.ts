export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: 'web' | 'mobile' | '3d';
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  accentColor: string;
}

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Neon Nexus',
    description: 'A cyberpunk-themed e-commerce platform.',
    tags: ['React', 'Three.js', 'Node.js'],
    category: '3d',
    imageUrl: 'https://via.placeholder.com/600x400/22D3EE/12121e?text=Neon+Nexus',
    accentColor: '#22D3EE'
  },
  {
    id: 'p2',
    title: 'Void Mail',
    description: 'Encrypted communication utility.',
    tags: ['React', 'TypeScript', 'WebCrypto'],
    category: 'web',
    imageUrl: 'https://via.placeholder.com/600x400/6C47FF/12121e?text=Void+Mail',
    accentColor: '#6C47FF'
  },
  {
    id: 'p3',
    title: 'Astro Tracker',
    description: 'Real-time satellite tracking mobile app.',
    tags: ['React Native', 'WebGL'],
    category: 'mobile',
    imageUrl: 'https://via.placeholder.com/600x400/A855F7/12121e?text=Astro+Tracker',
    accentColor: '#A855F7'
  },
  {
    id: 'p4',
    title: 'Quantum Ledger',
    description: 'Decentralized finance dashboard.',
    tags: ['Vue', 'Solidity', 'Ethers.js'],
    category: 'web',
    imageUrl: 'https://via.placeholder.com/600x400/FFB4AB/12121e?text=Quantum+Ledger',
    accentColor: '#FFB4AB'
  },
  {
    id: 'p5',
    title: 'Holo View',
    description: 'Augmented reality data visualization.',
    tags: ['Three.js', 'WebXR'],
    category: '3d',
    imageUrl: 'https://via.placeholder.com/600x400/22D3EE/12121e?text=Holo+View',
    accentColor: '#22D3EE'
  },
  {
    id: 'p6',
    title: 'Hyper Drive UI',
    description: 'Component library for spatial interfaces.',
    tags: ['React', 'CSS Modules', 'Framer Motion'],
    category: 'web',
    imageUrl: 'https://via.placeholder.com/600x400/6C47FF/12121e?text=Hyper+Drive+UI',
    accentColor: '#6C47FF'
  }
];
