export interface Project {
  name: string
  description: string
  status: 'shipped' | 'building'
  tech: string[]
  logo?: string
  screenshots?: string[]
  github?: string
  demo?: string
  blog?: string
}

export const projects: Project[] = [
  {
    name: 'ClawMemory',
    description:
      'A clean UI for managing OpenClaw AI agent memory files. FTS5-powered search, daily filters, and real-time indexing.',
    status: 'building',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SQLite'],
    logo: '/claw-memory-logo.png',
    screenshots: [
      '/builds/clawmemory-screenshot-1.png',
      '/builds/clawmemory-screenshot-2.png',
      '/builds/clawmemory-screenshot-3.png',
    ],
    github: 'https://github.com/aaronguostudio/clawmemory',
  },
]
