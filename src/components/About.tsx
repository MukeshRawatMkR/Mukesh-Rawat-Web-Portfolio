import { useEffect, useRef, useState } from 'react';
import { 
  Code2, 
  Database, 
  Globe, 
  Palette, 
  Smartphone, 
  Server,
  GitBranch,
  Zap,
  Users,
  Coffee
} from 'lucide-react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const skills = [
    { icon: Code2, name: 'Frontend Development', description: 'React, TypeScript, Tailwind CSS' },
    { icon: Server, name: 'Backend Development', description: 'Node.js, Express, RESTful APIs' },
    { icon: Database, name: 'Database Management', description: 'MongoDB, PostgreSQL, Supabase' },
    { icon: Globe, name: 'Web Technologies', description: 'HTML5, CSS3, JavaScript ES6+' },
    { icon: Smartphone, name: 'Responsive Design', description: 'Mobile-first, Cross-browser compatibility' },
    { icon: Palette, name: 'UI/UX Design', description: 'Figma, Adobe Creative Suite' },
    { icon: GitBranch, name: 'Version Control', description: 'Git, GitHub, Collaborative workflows' },
    { icon: Zap, name: 'Performance Optimization', description: 'Bundle optimization, SEO best practices' },
  ];

  const stats = [
    { icon: Coffee, number: '500+', label: 'Cups of Coffee' },
    { icon: Code2, number: '50+', label: 'Projects Completed' },
    { icon: Users, number: '20+', label: 'Happy Clients' },
    { icon: Zap, number: '3+', label: 'Years Experience' },
  ];

  return (
    <section ref={sectionRef} id="about" className="section-container bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <h2 className="section-title">About Me</h2>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Bio Section */}
            <div className={`slide-in-left ${isVisible ? 'visible' : ''}`}>
              <h3 className="mb-6 text-primary">Passionate Developer & Designer</h3>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  With over 3 years of experience in web development, I specialize in creating 
                  modern, responsive applications that deliver exceptional user experiences. 
                  My journey began with a curiosity about how websites work, and it has evolved 
                  into a passion for crafting digital solutions that make a difference.
                </p>
                <p>
                  I believe in writing clean, maintainable code and staying up-to-date with 
                  the latest technologies and best practices. When I'm not coding, you can 
                  find me exploring new design trends, contributing to open-source projects, 
                  or mentoring aspiring developers.
                </p>
                <p>
                  My approach combines technical expertise with creative problem-solving to 
                  deliver solutions that not only function flawlessly but also provide 
                  intuitive and engaging user experiences.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className={`slide-in-right ${isVisible ? 'visible' : ''}`}>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="portfolio-card text-center">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className={`fade-in ${isVisible ? 'visible' : ''}`}>
            <h3 className="text-center mb-12 text-primary">Skills & Expertise</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="skill-card group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <skill.icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold mb-2 text-sm">{skill.name}</h4>
                  <p className="text-xs opacity-90">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;