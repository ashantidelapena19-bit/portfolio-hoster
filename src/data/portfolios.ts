import type { SocialLinks } from '../components/SocialLinksBar';

export type Discipline =
  | 'All'
  | 'Full-Stack'
  | 'Systems & CLI'
  | 'UI / Design'
  | 'AI & Data'
  | 'Mobile & WebGL';

export interface StudentPortfolio {
  id: string;
  rollNumber: string;
  studentName: string;
  username?: string;
  bio?: string;
  firstName: string;
  lastName: string;
  folderName: string;
  portfolioUrl: string;
  discipline: Exclude<Discipline, 'All'>;
  roleTitle: string;
  projectTitle: string;
  projectSummary: string;
  thumbnail: string;
  fallbackGradient: string;
  avatarColor: string;
  avatarUrl?: string;
  initials: string;
  skills: string[];
  likes: number;
  views: number;
  year: string;
  highlights: string[];
  githubHandle: string;
  socialLinks?: SocialLinks;
  isPublishedCommunity?: boolean;
  publishedAt?: string;
}

export const DISCIPLINES: Discipline[] = [
  'All',
  'Full-Stack',
  'Systems & CLI',
  'UI / Design',
  'AI & Data',
  'Mobile & WebGL',
];

export const CLASS_TECH_STACK: { name: string; count: number; category: string }[] = [
  { name: 'TypeScript', count: 7, category: 'Language' },
  { name: 'React', count: 5, category: 'Frontend' },
  { name: 'Rust', count: 3, category: 'Systems' },
  { name: 'Go', count: 3, category: 'Backend' },
  { name: 'Python', count: 3, category: 'AI & Data' },
  { name: 'PostgreSQL', count: 4, category: 'Database' },
  { name: 'WebAssembly', count: 2, category: 'Runtime' },
  { name: 'WebGL / GLSL', count: 2, category: 'Graphics' },
  { name: 'Docker', count: 4, category: 'Infrastructure' },
  { name: 'Tailwind CSS', count: 5, category: 'Styling' },
];

export const STUDENT_PORTFOLIOS: StudentPortfolio[] = [
  {
    id: 'bond',
    rollNumber: 'SE-A-01',
    studentName: 'Julian Bond',
    firstName: 'Julian',
    lastName: 'Bond',
    folderName: 'Bond Portfolio',
    portfolioUrl: '/student-portfolios/Bond%20Portfolio/index.html',
    discipline: 'Full-Stack',
    roleTitle: 'Distributed Systems Engineer',
    projectTitle: 'Kestrel Distributed KV & Cluster Map',
    projectSummary:
      'Raft-consensus key-value engine in Go paired with a real-time WebSocket cluster topology inspector.',
    thumbnail: '/src/assets/images/shot_bond_kestrel_1795057299395.jpg',
    fallbackGradient: 'from-slate-800 via-slate-900 to-zinc-900',
    avatarColor: '#1E293B',
    initials: 'JB',
    skills: ['Go', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    likes: 184,
    views: 4280,
    year: 'Class of 2026',
    highlights: ['Capstone Honors', '99.98% Cluster Fault Recovery'],
    githubHandle: 'jbond-se',
  },
  {
    id: 'smith',
    rollNumber: 'SE-A-02',
    studentName: 'Elena Smith',
    firstName: 'Elena',
    lastName: 'Smith',
    folderName: 'Smith Portfolio',
    portfolioUrl: '/student-portfolios/Smith%20Portfolio/index.html',
    discipline: 'UI / Design',
    roleTitle: 'Design Systems Architect',
    projectTitle: 'Chroma Tokens & Contrast Studio',
    projectSummary:
      'WCAG-verified design token compiler and interactive component specimen workbench for multi-brand React apps.',
    thumbnail: '/src/assets/images/shot_smith_chroma_1795057297767.jpg',
    fallbackGradient: 'from-stone-200 via-neutral-100 to-stone-300',
    avatarColor: '#EA4C89',
    initials: 'ES',
    skills: ['TypeScript', 'React', 'Tailwind CSS', 'CSS Architecture'],
    likes: 246,
    views: 6150,
    year: 'Class of 2026',
    highlights: ['Best UI Craft Award', '42 Reusable Accessible Primitives'],
    githubHandle: 'esmith-ui',
  },
  {
    id: 'vance',
    rollNumber: 'SE-A-03',
    studentName: 'Marcus Vance',
    firstName: 'Marcus',
    lastName: 'Vance',
    folderName: 'Vance Portfolio',
    portfolioUrl: '/student-portfolios/Vance%20Portfolio/index.html',
    discipline: 'Systems & CLI',
    roleTitle: 'Systems & Runtime Engineer',
    projectTitle: 'Vortex WebAssembly Profiler',
    projectSummary:
      'Zero-overhead Wasm bytecode stepper and interactive heap flamegraph visualizer built with Rust.',
    thumbnail: '/src/assets/images/shot_vance_vortex_1795057297631.jpg',
    fallbackGradient: 'from-zinc-800 via-neutral-900 to-slate-900',
    avatarColor: '#B45309',
    initials: 'MV',
    skills: ['Rust', 'WebAssembly', 'TypeScript', 'LLVM'],
    likes: 162,
    views: 3890,
    year: 'Class of 2026',
    highlights: ['Open Source Contributor', 'Sub-millisecond Trace Sampling'],
    githubHandle: 'mvance-sys',
  },
  {
    id: 'takahashi',
    rollNumber: 'SE-A-04',
    studentName: 'Sora Takahashi',
    firstName: 'Sora',
    lastName: 'Takahashi',
    folderName: 'Takahashi Portfolio',
    portfolioUrl: '/student-portfolios/Takahashi%20Portfolio/index.html',
    discipline: 'AI & Data',
    roleTitle: 'Computer Vision Engineer',
    projectTitle: 'Lumina Biomechanical Gait Lab',
    projectSummary:
      'On-device skeletal pose estimation and joint-angle telemetry dashboard for physical therapy recovery.',
    thumbnail: '/src/assets/images/shot_takahashi_lumina_1795057297864.jpg',
    fallbackGradient: 'from-blue-50 via-slate-100 to-indigo-100',
    avatarColor: '#2563EB',
    initials: 'ST',
    skills: ['Python', 'TypeScript', 'WebGL / GLSL', 'TensorFlow.js'],
    likes: 215,
    views: 5410,
    year: 'Class of 2026',
    highlights: ['Dean’s Research Grant', '60fps Client-Side Inference'],
    githubHandle: 'stakahashi-cv',
  },
  {
    id: 'okafor',
    rollNumber: 'SE-A-05',
    studentName: 'Amara Okafor',
    firstName: 'Amara',
    lastName: 'Okafor',
    folderName: 'Okafor Portfolio',
    portfolioUrl: '/student-portfolios/Okafor%20Portfolio/index.html',
    discipline: 'Systems & CLI',
    roleTitle: 'Cloud Infrastructure Engineer',
    projectTitle: 'Harbor Canary Rollout Orchestrator',
    projectSummary:
      'Multi-region container deployment pipeline with automated health-check rollbacks and live traffic shifting.',
    thumbnail: '/src/assets/images/shot_okafor_harbor_1795057298339.jpg',
    fallbackGradient: 'from-slate-200 via-gray-100 to-slate-300',
    avatarColor: '#0F766E',
    initials: 'AO',
    skills: ['Go', 'Docker', 'PostgreSQL', 'TypeScript'],
    likes: 139,
    views: 3120,
    year: 'Class of 2026',
    highlights: ['Cloud Track Lead', 'Zero-Downtime Blue/Green CLI'],
    githubHandle: 'aokafor-cloud',
  },
  {
    id: 'chen',
    rollNumber: 'SE-A-06',
    studentName: 'Liam Chen',
    firstName: 'Liam',
    lastName: 'Chen',
    folderName: 'Chen Portfolio',
    portfolioUrl: '/student-portfolios/Chen%20Portfolio/index.html',
    discipline: 'Mobile & WebGL',
    roleTitle: 'Mobile Systems Developer',
    projectTitle: 'PulseTransit Offline Router',
    projectSummary:
      'Offline-first commuter route planner compressing city GTFS schedules into a 1.8 MB local index.',
    thumbnail: '/src/assets/images/shot_chen_pulse_1795057297465.jpg',
    fallbackGradient: 'from-stone-200 via-zinc-200 to-stone-300',
    avatarColor: '#0284C7',
    initials: 'LC',
    skills: ['TypeScript', 'React', 'SQLite', 'Tailwind CSS'],
    likes: 198,
    views: 4920,
    year: 'Class of 2026',
    highlights: ['Civic Hackathon Winner', 'Works 100% Offline'],
    githubHandle: 'lchen-mobile',
  },
  {
    id: 'almansoor',
    rollNumber: 'SE-A-07',
    studentName: 'Nadia Al-Mansoor',
    firstName: 'Nadia',
    lastName: 'Al-Mansoor',
    folderName: 'Al-Mansoor Portfolio',
    portfolioUrl: '/student-portfolios/Al-Mansoor%20Portfolio/index.html',
    discipline: 'Full-Stack',
    roleTitle: 'Application Security Engineer',
    projectTitle: 'VaultZero Passkey Keyring',
    projectSummary:
      'End-to-end encrypted secrets vault utilizing WebAuthn hardware passkeys and verifiable audit logs.',
    thumbnail: '/src/assets/images/shot_almansoor_vault_1795057298398.jpg',
    fallbackGradient: 'from-neutral-800 via-zinc-900 to-black',
    avatarColor: '#334155',
    initials: 'NA',
    skills: ['Rust', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    likes: 173,
    views: 4050,
    year: 'Class of 2026',
    highlights: ['CTF Security Captain', 'Zero-Knowledge Client Crypto'],
    githubHandle: 'nalmansoor-sec',
  },
  {
    id: 'rivera',
    rollNumber: 'SE-A-08',
    studentName: 'Mateo Rivera',
    firstName: 'Mateo',
    lastName: 'Rivera',
    folderName: 'Rivera Portfolio',
    portfolioUrl: '/student-portfolios/Rivera%20Portfolio/index.html',
    discipline: 'AI & Data',
    roleTitle: 'Data Platform Engineer',
    projectTitle: 'Strata Columnar SQL Notebook',
    projectSummary:
      'Browser-native analytical SQL workbook powered by WebAssembly Parquet scans and instant Vega charts.',
    thumbnail: '/src/assets/images/shot_rivera_strata_1795057298044.jpg',
    fallbackGradient: 'from-amber-50 via-stone-100 to-slate-200',
    avatarColor: '#1E3A8A',
    initials: 'MR',
    skills: ['Python', 'WebAssembly', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    likes: 154,
    views: 3640,
    year: 'Class of 2026',
    highlights: ['1.2M Rows Queried in 0.8s', 'Data Track Mentor'],
    githubHandle: 'mrivera-data',
  },
  {
    id: 'dubois',
    rollNumber: 'SE-A-09',
    studentName: 'Chloe Dubois',
    firstName: 'Chloe',
    lastName: 'Dubois',
    folderName: 'Dubois Portfolio',
    portfolioUrl: '/student-portfolios/Dubois%20Portfolio/index.html',
    discipline: 'Mobile & WebGL',
    roleTitle: 'Graphics & Creative Technologist',
    projectTitle: 'Atelier GLSL Shader Workbench',
    projectSummary:
      'Real-time fragment shader playground with uniform sliders, topographic mesh presets, and 60fps export.',
    thumbnail: '/src/assets/images/shot_dubois_atelier_1795057298220.jpg',
    fallbackGradient: 'from-zinc-700 via-stone-800 to-neutral-900',
    avatarColor: '#7C3AED',
    initials: 'CD',
    skills: ['WebGL / GLSL', 'TypeScript', 'React', 'Tailwind CSS'],
    likes: 229,
    views: 5890,
    year: 'Class of 2026',
    highlights: ['Interactive Art Exhibition', 'Custom Raymarching Engine'],
    githubHandle: 'cdubois-glsl',
  },
];
