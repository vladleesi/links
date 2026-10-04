export type Service = 'website' | 'github' | 'linkedin' | 'x' | 'email';

export interface Link {
  service: Service;
  title: string;
  description: string;
  url: string;
  hostname: string;
  label: string;
}

export const profile = {
  name: 'Vladislav Kochetov',
  handle: 'vladleesi',
  title: 'Mobile Software Engineer',
  tagline: 'Mobile architectures that scale. Details that matter.',
  description: 'Vladislav Kochetov (@vladleesi) is a Mobile Software Engineer focused on Android, Kotlin, and Kotlin Multiplatform. Explore his work, code, and writing.',
  website: 'https://vladleesi.dev',
  email: 'hello@vladleesi.dev',
  avatar: '/images/avatar.webp',
  avatarSrcSet: '/images/avatar-192.webp 192w, /images/avatar.webp 320w',
  avatarSizes: '(max-width: 600px) 116px, (max-height: 500px) 118px, (max-width: 900px) 132px, 154px',
  avatarSource: 'https://avatars.githubusercontent.com/u/30999008?v=4',
  specialties: ['Android', 'Kotlin', 'Multiplatform'],
  links: [
    { service: 'website', title: 'Personal website', description: 'My work, my approach, and things I learn along the way.', url: 'https://vladleesi.dev', hostname: 'vladleesi.dev', label: 'WORK & WRITING' },
    { service: 'github', title: 'GitHub', description: 'Open-source libraries. Side projects. Ideas in code.', url: 'https://github.com/vladleesi', hostname: 'github.com/vladleesi', label: 'BUILDING IN THE OPEN' },
    { service: 'linkedin', title: 'LinkedIn', description: 'The professional side. Experience, teams, and connections.', url: 'https://www.linkedin.com/in/vladkochetov', hostname: 'linkedin.com/in/vladkochetov', label: 'EXPERIENCE & CONNECTIONS' },
    { service: 'x', title: 'X / Twitter', description: 'Small thoughts on code, mobile, and everything between.', url: 'https://x.com/vladleesi', hostname: 'x.com/vladleesi', label: 'THOUGHTS & CONVERSATIONS' },
    { service: 'email', title: 'Let’s talk', description: 'Have something in mind? My inbox is open.', url: 'mailto:hello@vladleesi.dev', hostname: 'hello@vladleesi.dev', label: 'A DIRECT LINE' },
  ] satisfies Link[],
};

export const socials = profile.links.filter(link => ['github', 'linkedin', 'x'].includes(link.service));
