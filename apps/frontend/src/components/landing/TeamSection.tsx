import { Twitter, Linkedin, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import muadhPic from '@/assets/team/muad-pic.jpeg';
import clementPic from '@/assets/team/clement-pics.jpeg';
import anthonyPic from '@/assets/team/tony-pics.jpeg';
import rabbitPic from '@/assets/team/rabbit-pics.jpeg';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  stack: string[];
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: 'Edeh Chinedu Daniel',
    role: 'Smart Contract Developer / Software Engineer',
    bio: 'Full-stack engineer and Cairo developer building secure, gas-efficient DeFi primitives on Starknet. Passionate about making decentralized financial tools accessible to everyone.',
    image: rabbitPic,
    stack: ['Cairo', 'TypeScript', 'Starknet', 'Solidity', 'Node.js'],
    socials: {
      twitter: 'https://x.com/EdehChinedu20',
      linkedin: 'https://www.linkedin.com/in/edehchinedu20',
      github: 'https://github.com/RabbitDaCoder',
    },
  },
  {
    name: 'Muadh Ibrahim Adeleke',
    role: 'Graphic Designer',
    bio: 'Creative graphic designer with an eye for bold, modern visuals. Crafts brand identities and marketing assets that resonate with the Web3 community.',
    image: muadhPic,
    stack: ['Photoshop', 'Illustrator', 'Brand Design', 'Visual Identity'],
    socials: {
      twitter: 'https://x.com/0xMuadh',
    },
  },
  {
    name: 'Ojile Clement',
    role: 'UI/UX Designer',
    bio: 'UI/UX designer passionate about translating complex on-chain interactions into intuitive user journeys. Believes great design is the bridge between DeFi and mass adoption.',
    image: clementPic,
    stack: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    socials: {
      twitter: 'https://x.com/OjileC90873',
    },
  },
  {
    name: 'Ezedimbu Anthony Maduabuchukwu',
    role: 'Graphic Designer',
    bio: 'Graphic designer specializing in digital-first brand experiences. Creates compelling visual stories that bring blockchain products to life.',
    image: anthonyPic,
    stack: ['Photoshop', 'CorelDRAW', 'Brand Design', 'Print & Digital'],
    socials: {
      twitter: 'https://x.com/AnthonyEzedimbu',
    },
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange mb-3">
            Team
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Meet the Builders
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A focused team of engineers and designers shipping the future of automated DeFi
            investing on Starknet.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group glass rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand-orange/5 dark:hover:shadow-brand-orange/10 hover:-translate-y-1"
            >
              {/* Avatar */}
              <div className="relative w-20 h-20 mx-auto mb-5 rounded-2xl overflow-hidden bg-muted border-2 border-border/50 group-hover:border-brand-orange/30 transition-colors">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image doesn't exist
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.classList.add('flex', 'items-center', 'justify-center');
                      const span = document.createElement('span');
                      span.className = 'text-2xl font-heading font-bold text-muted-foreground';
                      span.textContent = member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('');
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="font-heading font-semibold text-base text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-brand-orange font-medium mt-0.5">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-3">{member.bio}</p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                  {member.stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground border border-border/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                      aria-label={`${member.name} on Twitter`}
                    >
                      <Twitter className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                      aria-label={`${member.name} on GitHub`}
                    >
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
