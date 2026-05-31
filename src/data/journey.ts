export interface JourneyEvent {
  year: string;
  title: string;
  description: string;
}

export const journeyEvents: JourneyEvent[] = [
  {
    year: '2019',
    title: 'Started building on the web',
    description: 'First prototypes with HTML, CSS, and JavaScript.'
  },
  {
    year: '2020',
    title: 'Front-end specialization',
    description: 'Focused on React and component-driven UI systems.'
  },
  {
    year: '2021',
    title: '3D explorations',
    description: 'Experimented with WebGL and Three.js experiences.'
  },
  {
    year: '2022',
    title: 'Product collaborations',
    description: 'Shipped interactive product sites with cross-functional teams.'
  },
  {
    year: '2023',
    title: 'Immersive interfaces',
    description: 'Built spatial UI and animation-heavy storytelling projects.'
  },
  {
    year: '2024',
    title: 'Real-time experiences',
    description: 'Leveraged TypeScript and tooling for scalable experiences.'
  }
];
