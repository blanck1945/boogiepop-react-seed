import type { Node, Edge } from '@xyflow/react'

export type NodeCategory = 'host' | 'seed' | 'backend' | 'lib' | 'infra' | 'aws'

export interface NodeDetail {
  id: string
  name: string
  description: string
  category: NodeCategory
  tech: string[]
  relationships: string[]
  github: string
}

export const CATEGORY_COLORS: Record<NodeCategory, { border: string; glow: string; badge: string; text: string }> = {
  host:    { border: '#ff4466', glow: 'rgba(255,68,102,0.35)', badge: '#ff4466', text: '#ff8899' },
  seed:    { border: '#3b82f6', glow: 'rgba(59,130,246,0.35)', badge: '#3b82f6', text: '#93c5fd' },
  backend: { border: '#f97316', glow: 'rgba(249,115,22,0.35)', badge: '#f97316', text: '#fdba74' },
  lib:     { border: '#a855f7', glow: 'rgba(168,85,247,0.35)', badge: '#a855f7', text: '#d8b4fe' },
  infra:   { border: '#10b981', glow: 'rgba(16,185,129,0.35)', badge: '#10b981', text: '#6ee7b7' },
  aws:     { border: '#ff9900', glow: 'rgba(255,153,0,0.35)',  badge: '#ff9900', text: '#fcd34d' },
}

export const SECTOR_COLORS = {
  ci:      '#10b981',
  fr:      '#3b82f6',
  backend: '#f97316',
  libs:    '#a855f7',
  aws:     '#ff9900',
}

export const nodeDetails: Record<string, NodeDetail> = {
  host: {
    id: 'host',
    name: 'boogiepop-host',
    description: 'Shell central de la plataforma. Orquesta la autenticación, el catálogo de apps y el montaje de todos los remotes. Expone el módulo host-auth a los remotes React via Module Federation.',
    category: 'host',
    tech: ['React 19', 'Vite', 'Module Federation', 'React Router', 'Tailwind v4'],
    relationships: [
      'Monta react-seed via loadRemote() — Module Federation',
      'Embebe next-seed y streamlit-seed via iframe',
      'POST /api/auth/login → boogiepop-backend',
      'GET /api/applications/manifest → catálogo filtrado por roles',
      'Docker build → ECR → ECS (puerto 8080)',
    ],
    github: 'https://github.com/blanck1945/boogiepop-host',
  },
  'react-seed': {
    id: 'react-seed',
    name: 'boogiepop-react-seed',
    description: 'Remote React cargado por el host via Module Federation. Expone ./Shell como módulo MF. SPA standalone con React Router, Tailwind y auth via SDK.',
    category: 'seed',
    tech: ['Vite 8', 'React 19', 'TypeScript', 'Module Federation', 'React Router v7'],
    relationships: [
      'Expone boogiepopRemote/Shell al host',
      'useBoogiepopSession() ← boogiepop-auth-sdk',
      'Componentes bp-* ← boogiepop-ui',
      'Docker build → nginx:alpine → ECR → ECS (puerto 8080)',
    ],
    github: 'https://github.com/blanck1945/boogiepop-react-seed',
  },
  'next-seed': {
    id: 'next-seed',
    name: 'boogiepop-next-seed',
    description: 'Seed fullstack Next.js con App Router y Route Handlers. UI + API en un solo repo. Se embebe en el host via iframe.',
    category: 'seed',
    tech: ['Next.js 15', 'React 19', 'TypeScript', 'App Router', 'AWS SDK'],
    relationships: [
      'Embebido en el host via iframeUrl (manifest)',
      'useBoogiepopSession() + resolveBoogiepopSession() ← auth-sdk',
      'AWS SDK solo en Route Handlers (server)',
      'Docker build → Node standalone → ECR → ECS (puerto 8080)',
    ],
    github: 'https://github.com/blanck1945/boogiepop-next-seed',
  },
  'streamlit-seed': {
    id: 'streamlit-seed',
    name: 'boogiepop-streamlit-seed',
    description: 'Seed Python + Streamlit multipágina. Se embebe en el host via iframe. Auth via boogiepop_auth_sdk.py incluido en el repo.',
    category: 'seed',
    tech: ['Python 3.12', 'Streamlit 1.57', 'Docker', 'pre-commit', 'ruff'],
    relationships: [
      'Embebido en el host via iframeUrl (manifest)',
      'resolve_boogiepop_session() ← boogiepop_auth_sdk.py',
      'Docker build → ECR → ECS (puerto 8501)',
      'Healthcheck: /_stcore/health',
    ],
    github: 'https://github.com/blanck1945/boogiepop-streamlit-seed',
  },
  backend: {
    id: 'backend',
    name: 'boogiepop-backend',
    description: 'API REST con Nest.js. Fuente de verdad para autenticación JWT y catálogo de apps. El login vive aquí — los remotes solo consumen /api/auth/me.',
    category: 'backend',
    tech: ['Nest.js', 'TypeScript', 'JWT', 'PostgreSQL', 'Docker', 'ECS'],
    relationships: [
      'POST /api/auth/login — emite JWT (solo host)',
      'GET /api/auth/me — consumido por remotes via auth-sdk',
      'GET /api/applications/manifest — catálogo filtrado por roles',
      'Docker build → ECR → ECS',
    ],
    github: 'https://github.com/blanck1945/boogiepop-backend',
  },
  'auth-sdk': {
    id: 'auth-sdk',
    name: 'boogiepop-auth-sdk',
    description: 'SDK npm para consumir identidad y roles sin acoplar login al remote. Expone hooks React y funciones server-side.',
    category: 'lib',
    tech: ['TypeScript', 'npm package', 'React hooks'],
    relationships: [
      'useBoogiepopSession() — hook React para remotes client',
      'resolveBoogiepopSession() — server-side (Next.js)',
      'hasRole() / hasAnyRole() — helpers de autorización',
      'Llama GET /api/auth/me → boogiepop-backend',
    ],
    github: 'https://github.com/blanck1945/boogiepop-auth-sdk',
  },
  ui: {
    id: 'ui',
    name: 'boogiepop-ui',
    description: 'Librería de componentes React compartidos. Tokens --bp-* con tema inspirado en Streamlit claro.',
    category: 'lib',
    tech: ['React', 'TypeScript', 'Tailwind v4', 'CSS custom properties'],
    relationships: [
      'Button, Card, Input, Select, Text — componentes bp-*',
      'Tokens --bp-* (colores, tipografía, espaciado)',
      'Consumida por: host, react-seed, next-seed',
    ],
    github: 'https://github.com/blanck1945/boogiepop-ui',
  },
  guards: {
    id: 'guards',
    name: 'boogiepop-platform-guards',
    description: 'Guards de CI centralizados en GitHub Actions. Reusable workflow que bloquea merges sobre AGENTS.md y .github/workflows/ sin aprobación del Owner.',
    category: 'infra',
    tech: ['GitHub Actions', 'Reusable Workflow', 'bash', 'gh CLI', 'Branch Protection'],
    relationships: [
      'Reusable workflow incluido por todos los seeds vía uses:',
      'Detecta cambios en AGENTS.md y .github/workflows/',
      'Verifica aprobación del Owner via GitHub API',
      'dismiss_stale_reviews + enforce_admins: bloqueo total',
    ],
    github: 'https://github.com/blanck1945/boogiepop-platform-guards',
  },
  cli: {
    id: 'cli',
    name: 'boogiepop-cli',
    description: 'CLI para gestionar versiones y updates de seeds. Distribuido como npm package y binario standalone (sin Node — ideal para Streamlit devs).',
    category: 'infra',
    tech: ['TypeScript', 'Commander', 'Inquirer', 'pkg (standalone)', 'Node.js'],
    relationships: [
      'boogiepop version — versión actual del seed',
      'boogiepop versions — lista versiones (git tags)',
      'boogiepop update — selector interactivo + detecta conflictos',
      'boogiepop abort — aborta update en progreso',
    ],
    github: 'https://github.com/blanck1945/boogiepop-cli',
  },
  ecr: {
    id: 'ecr',
    name: 'Amazon ECR',
    description: 'Registro de imágenes Docker privado. Cada app tiene su propio repositorio ECR. Push desde GitHub Actions / GitLab CI con autenticación OIDC (sin credenciales hardcodeadas).',
    category: 'aws',
    tech: ['Amazon ECR', 'Docker', 'OIDC Auth', 'GitHub Actions'],
    relationships: [
      'Recibe imágenes de: host, react-seed, next-seed, streamlit-seed, backend',
      'Autenticación via OIDC — sin credenciales hardcodeadas',
      'Alimenta las task definitions de ECS',
    ],
    github: 'https://github.com/blanck1945',
  },
  ecs: {
    id: 'ecs',
    name: 'Amazon ECS',
    description: 'Orquestador de contenedores Fargate. Cada app corre como servicio independiente. Deploy con force-new-deployment tras push a ECR.',
    category: 'aws',
    tech: ['Amazon ECS', 'Fargate', 'ALB', 'Task Definitions', 'IAM roles'],
    relationships: [
      'Corre: host (8080), react-seed (nginx/8080), next-seed (8080)',
      'Corre: streamlit-seed (8501), backend',
      'Healthcheck: /health o /_stcore/health según app',
      'Deploy: force-new-deployment tras push a ECR',
    ],
    github: 'https://github.com/blanck1945',
  },
}

// ─── Layout constants ──────────────────────────────────────────────────────────
const PAD     = 20
const MAIN_W  = 620   // width of main (FR + Backend) column
const LIBS_X  = 660   // left edge of Libs column
const LIBS_W  = 220   // width of Libs column
const FULL_W  = LIBS_X + LIBS_W + PAD  // total width for full-span sectors (CI + AWS)

// Row Y positions
const CI_Y      = 0
const FR_Y      = 200
const BACKEND_Y = 710
const AWS_Y     = 940

// Row heights
const CI_H      = 160
const FR_H      = 470
const BACKEND_H = 180
const AWS_H     = 160

// Libs column spans FR + Backend
const LIBS_H = FR_H + 40 + BACKEND_H   // 470 + 40 + 180 = 690

// ─── Nodes ────────────────────────────────────────────────────────────────────
export const initialNodes: Node[] = [
  // ── Sector backgrounds ───────────────────────────────────────────────────────
  {
    id: 'sector-ci',
    type: 'sector',
    position: { x: -PAD, y: CI_Y - PAD },
    style: { width: FULL_W, height: CI_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'CI / GitHub', sublabel: 'platform-guards · boogiepop-cli · branch protection', color: SECTOR_COLORS.ci },
    selectable: false, draggable: false,
  },
  {
    id: 'sector-fr',
    type: 'sector',
    position: { x: -PAD, y: FR_Y - PAD },
    style: { width: MAIN_W + PAD * 2, height: FR_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Frontend Remotes', sublabel: 'Host · React seed · Next.js seed · Streamlit seed', color: SECTOR_COLORS.fr },
    selectable: false, draggable: false,
  },
  {
    id: 'sector-backend',
    type: 'sector',
    position: { x: -PAD, y: BACKEND_Y - PAD },
    style: { width: MAIN_W + PAD * 2, height: BACKEND_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Backend', sublabel: 'API REST · JWT · PostgreSQL', color: SECTOR_COLORS.backend },
    selectable: false, draggable: false,
  },
  {
    id: 'sector-libs',
    type: 'sector',
    position: { x: LIBS_X, y: FR_Y - PAD },
    style: { width: LIBS_W + PAD * 2, height: LIBS_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Libs', sublabel: 'auth-sdk · boogiepop-ui', color: SECTOR_COLORS.libs },
    selectable: false, draggable: false,
  },
  {
    id: 'sector-aws',
    type: 'sector',
    position: { x: -PAD, y: AWS_Y - PAD },
    style: { width: FULL_W, height: AWS_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'AWS Infrastructure', sublabel: 'ECR (registry) → ECS Fargate (runtime) · OIDC auth', color: SECTOR_COLORS.aws },
    selectable: false, draggable: false,
  },

  // ── CI sector ────────────────────────────────────────────────────────────────
  { id: 'cli',    type: 'platform', position: { x: 50,  y: CI_Y + 60 }, data: { detail: nodeDetails['cli'] } },
  { id: 'guards', type: 'platform', position: { x: 390, y: CI_Y + 60 }, data: { detail: nodeDetails['guards'] } },

  // ── FR sector ────────────────────────────────────────────────────────────────
  { id: 'host',           type: 'platform', position: { x: 220, y: FR_Y + 40  }, data: { detail: nodeDetails['host'] } },
  { id: 'react-seed',     type: 'platform', position: { x: 20,  y: FR_Y + 250 }, data: { detail: nodeDetails['react-seed'] } },
  { id: 'next-seed',      type: 'platform', position: { x: 215, y: FR_Y + 250 }, data: { detail: nodeDetails['next-seed'] } },
  { id: 'streamlit-seed', type: 'platform', position: { x: 415, y: FR_Y + 250 }, data: { detail: nodeDetails['streamlit-seed'] } },

  // ── Backend sector ───────────────────────────────────────────────────────────
  { id: 'backend', type: 'platform', position: { x: 210, y: BACKEND_Y + 55 }, data: { detail: nodeDetails['backend'] } },

  // ── Libs sector (right column) ───────────────────────────────────────────────
  { id: 'auth-sdk', type: 'platform', position: { x: LIBS_X + 20, y: FR_Y + 120 }, data: { detail: nodeDetails['auth-sdk'] } },
  { id: 'ui',       type: 'platform', position: { x: LIBS_X + 20, y: FR_Y + 350 }, data: { detail: nodeDetails['ui'] } },

  // ── AWS sector ───────────────────────────────────────────────────────────────
  { id: 'ecr', type: 'platform', position: { x: 190, y: AWS_Y + 50 }, data: { detail: nodeDetails['ecr'] } },
  { id: 'ecs', type: 'platform', position: { x: 500, y: AWS_Y + 50 }, data: { detail: nodeDetails['ecs'] } },
]

// ─── Edges ────────────────────────────────────────────────────────────────────
const edgeBase = {
  type: 'smoothstep' as const,
  labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' },
  labelBgStyle: { fill: '#0a0f1e', fillOpacity: 0.85 },
}

export const initialEdges: Edge[] = [
  // Host → Seeds
  { ...edgeBase, id: 'h-rs', source: 'host', target: 'react-seed',     label: 'Module Federation', animated: true,  style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { ...edgeBase, id: 'h-ns', source: 'host', target: 'next-seed',      label: 'iframe embed', style: { stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '6 3' } },
  { ...edgeBase, id: 'h-ss', source: 'host', target: 'streamlit-seed', label: 'iframe embed', style: { stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '6 3' } },

  // Host → Backend
  { ...edgeBase, id: 'h-be', source: 'host', target: 'backend', label: 'REST API', style: { stroke: '#f97316', strokeWidth: 2 } },

  // Libs ← FR (npm imports)
  { ...edgeBase, id: 'h-ui',  source: 'host',       target: 'ui',       label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'rs-as', source: 'react-seed', target: 'auth-sdk', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ns-as', source: 'next-seed',  target: 'auth-sdk', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'rs-ui', source: 'react-seed', target: 'ui',       label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ns-ui', source: 'next-seed',  target: 'ui',       label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },

  // Auth SDK → Backend
  { ...edgeBase, id: 'as-be', source: 'auth-sdk', target: 'backend', label: 'GET /api/auth/me', style: { stroke: '#f97316', strokeWidth: 1.5 } },

  // CI Guard
  { ...edgeBase, id: 'g-h',  source: 'guards', target: 'host',           label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-rs', source: 'guards', target: 'react-seed',     label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-ns', source: 'guards', target: 'next-seed',      label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-ss', source: 'guards', target: 'streamlit-seed', label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },

  // CLI → Seeds
  { ...edgeBase, id: 'c-rs', source: 'cli', target: 'react-seed',     label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'c-ns', source: 'cli', target: 'next-seed',      label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'c-ss', source: 'cli', target: 'streamlit-seed', label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },

  // Docker → ECR
  { ...edgeBase, id: 'h-ecr',  source: 'host',           target: 'ecr', label: 'docker push', style: { stroke: '#ff9900', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'rs-ecr', source: 'react-seed',     target: 'ecr', label: 'docker push', style: { stroke: '#ff9900', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ns-ecr', source: 'next-seed',      target: 'ecr', label: 'docker push', style: { stroke: '#ff9900', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ss-ecr', source: 'streamlit-seed', target: 'ecr', label: 'docker push', style: { stroke: '#ff9900', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'be-ecr', source: 'backend',        target: 'ecr', label: 'docker push', style: { stroke: '#ff9900', strokeWidth: 1.5 } },

  // ECR → ECS
  { ...edgeBase, id: 'ecr-ecs', source: 'ecr', target: 'ecs', label: 'force-new-deployment', animated: true, style: { stroke: '#ff9900', strokeWidth: 2 } },
]
