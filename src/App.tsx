import { Nav } from './components/Nav/Nav'
import { Hero } from './components/Hero/Hero'
import { Portal } from './components/Portal/Portal'

import { About } from './components/About/About'

import { Projects } from './components/Projects/Projects'

import { Resume } from './components/Resume/Resume'

import { Skills } from './components/Skills/Skills'
import { Contact } from './components/Contact/Contact'

function App() {
  return (
    <>
      <Nav />
      <Portal />
      <section id="hero-section">
        <Hero />
      </section>
      
      <section id="about-section">
        <About />
      </section>
      
      <section id="projects-section">
        <Projects />
      </section>
      
      <section id="skills-section">
        <Skills />
      </section>
      
      <section id="resume-section">
        <Resume />
      </section>
      
      <section id="contact-section">
        <Contact />
      </section>
    </>
  )
}

export default App
