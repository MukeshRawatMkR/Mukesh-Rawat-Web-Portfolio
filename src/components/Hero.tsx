import { useEffect, useState } from 'react';
import { ChevronDown, Github, Linkedin, Mail } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="min-h-screen hero-section relative overflow-hidden flex items-center justify-center"
    >
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <h1 className="text-primary-foreground mb-6">
            Hi, I'm <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent dark:from-gray-700 dark:to-black">Mukesh Rawat</span>
          </h1>
          <h2 className="text-2xl md:text-4xl text-primary-foreground/80 mb-8 font-light">
            Full Stack Developer
          </h2>
          <p className="text-xl text-primary-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            I create beautiful, responsive web applications with modern technologies. 
            Passionate about clean code, user experience (UX), and bringing ideas to life.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={scrollToProjects}
              className="btn-hero"
            >
              View My Projects
            </button>
            <button 
              onClick={scrollToContact}
              className="btn-outline-hero"
            >
              Contact Me
            </button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-16">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300 hover:scale-110 transform"
            >
              <Github size={28} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300 hover:scale-110 transform"
            >
              <Linkedin size={28} />
            </a>
            <a 
              href="mailto:alex@example.com"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300 hover:scale-110 transform"
            >
              <Mail size={28} />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-primary-foreground/60" size={32} />
      </div>
    </section>
  );
};

export default Hero;