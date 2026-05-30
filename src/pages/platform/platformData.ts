import type { Node, Edge } from '@xyflow/react'

export type NodeCategory = 'host' | 'seed' | 'backend' | 'lib' | 'infra'

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
  backend: { border: '#f97316', glow: 'rgba(249,115,22,0.35)',  badge: '#f97316', text: '#fdba74' },
  lib:     { border: '#a855f7', glow: 'rgba(168,85,247,0.35)',  badge: '#a855f7', text: '#d8b4fe' },
  infra:   { border: '#10b981', glow: 'rgba(16,185,129,0.35)',  badge: '#10b981', text: '#6ee7b7' },
}

// ─── Sector colors ────────────────────────────────────────────────────────────
export const SECTOR_COLORS = {
  infra:   '#10b981',
  fr:      '#3b82f6',
  backend: '#f97316',
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
      'Expone host-auth para que los remotes lean sesión',
    ],
    github: 'https://github.com/blanck1945/boogiepop-host',
  },
  'react-seed': {
    id: 'react-seed',
    name: 'boogiepop-react-seed',
    description: 'Remote React cargado por el host via Module Federation. Expone ./Shell como módulo MF. SPA standalone con React Router, Tailwind y auth via SDK.',
    category: 'seed',
    tech: ['Vite 8', 'React 19', 'TypeScript', 'Module Federation', 'React Router v7', 'Tailwind v4'],
    relationships: [
      'Expone boogiepopRemote/Shell al host',
      'useBoogiepopSession() ← boogiepop-auth-sdk',
      'Componentes bp-* ← boogiepop-ui',
      'Protegido por boogiepop-platform-guards',
      'Versionado via boogiepop-cli',
    ],
    github: 'https://github.com/blanck1945/boogiepop-react-seed',
  },
  'next-seed': {
    id: 'next-seed',
    name: 'boogiepop-next-seed',
    description: 'Seed fullstack Next.js con App Router y Route Handlers. UI + API en un solo repo. AWS SDK solo en servidor. Se embebe en el host via iframe.',
    category: 'seed',
    tech: ['Next.js 15', 'React 19', 'TypeScript', 'App Router', 'AWS SDK', 'Tailwind v4'],
    relationships: [
      'Embebido en el host via iframeUrl (manifest)',
      'useBoogiepopSession() + resolveBoogiepopSession() ← auth-sdk',
      'Componentes bp-* ← boogiepop-ui',
      'AWS SDK solo en Route Handlers (server)',
      'Protegido por boogiepop-platform-guards',
    ],
    github: 'https://github.com/blanck1945/boogiepop-next-seed',
  },
  'streamlit-seed': {
    id: 'streamlit-seed',
    name: 'boogiepop-streamlit-seed',
    description: 'Seed Python + Streamlit multipágina con dependencias congeladas. Se embebe en el host via iframe. Auth via boogiepop_auth_sdk.py incluido en el repo.',
    category: 'seed',
    tech: ['Python 3.12', 'Streamlit 1.57', 'Docker', 'pre-commit', 'ruff'],
    relationships: [
      'Embebido en el host via iframeUrl (manifest)',
      'resolve_boogiepop_session() ← boogiepop_auth_sdk.py (incluido)',
      'GET /api/auth/me → boogiepop-backend',
      'Hooks locales via pre-commit (ruff, check_protected_paths)',
      'CLI via binario standalone (sin Node.js)',
    ],
    github: 'https://github.com/blanck1945/boogiepop-streamlit-seed',
  },
  backend: {
    id: 'backend',
    name: 'boogiepop-backend',
    description: 'API REST construida con Nest.js. Fuente de verdad para autenticación JWT y catálogo de aplicaciones. El login vive aquí — los remotes solo consumen /api/auth/me.',
    category: 'backend',
    tech: ['Nest.js', 'TypeScript', 'JWT', 'PostgreSQL', 'Docker', 'ECS'],
    relationships: [
      'POST /api/auth/login — emite JWT (solo host)',
      'GET /api/auth/me — consumido por todos los remotes via auth-sdk',
      'GET /api/applications/manifest — catálogo filtrado por roles',
    ],
    github: 'https://github.com/blanck1945/boogiepop-backend',
  },
  'auth-sdk': {
    id: 'auth-sdk',
    name: 'boogiepop-auth-sdk',
    description: 'SDK npm para consumir identidad y roles sin acoplar login al remote. Expone hooks React y funciones server-side. El login siempre vive en el host.',
    category: 'lib',
    tech: ['TypeScript', 'npm package', 'React hooks'],
    relationships: [
      'useBoogiepopSession() — hook React para remotes client',
      'resolveBoogiepopSession() — server-side (Next.js Route Handlers)',
      'hasRole() / hasAnyRole() — helpers de autorización',
      'Llama GET /api/auth/me → boogiepop-backend',
    ],
    github: 'https://github.com/blanck1945/boogiepop-auth-sdk',
  },
  ui: {
    id: 'ui',
    name: 'boogiepop-ui',
    description: 'Librería de componentes React compartidos. Tokens de diseño --bp-* con tema inspirado en Streamlit claro. Consumida por host y todos los seeds React/Next.',
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
    description: 'Guards de CI centralizados. Reusable workflow de GitHub Actions que bloquea merges sobre AGENTS.md y .github/workflows/ si el Owner no aprobó.',
    category: 'infra',
    tech: ['GitHub Actions', 'Reusable Workflow', 'bash', 'gh CLI', 'Branch Protection'],
    relationships: [
      'Reusable workflow incluido por todos los seeds',
      'Detecta cambios en AGENTS.md y .github/workflows/',
      'Verifica aprobación del Owner via GitHub API',
      'dismiss_stale_reviews + enforce_admins: bloqueo total',
      'Detecta add+revert en el mismo PR (edge case)',
    ],
    github: 'https://github.com/blanck1945/boogiepop-platform-guards',
  },
  cli: {
    id: 'cli',
    name: 'boogiepop-cli',
    description: 'CLI para gestionar versiones y updates de seeds en proyectos downstream. Distribuido como npm package y binario standalone.',
    category: 'infra',
    tech: ['TypeScript', 'Commander', 'Inquirer', 'pkg (standalone binary)', 'Node.js'],
    relationships: [
      'boogiepop version — muestra versión actual del seed',
      'boogiepop versions — lista versiones del template (git tags)',
      'boogiepop update — selector interactivo + detecta conflictos',
      'boogiepop abort — aborta update en progreso',
      'Lee seed-manifest.json para mandatory/security overrides',
    ],
    github: 'https://github.com/blanck1945/boogiepop-cli',
  },
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const W = 860   // sector width
const PAD = 20  // padding inside sector

// Sector Y positions
const INFRA_Y   = 0
const FR_Y      = 200
const BACKEND_Y = 730

// Sector heights
const INFRA_H   = 160
const FR_H      = 490
const BACKEND_H = 170

// ─── Nodes ────────────────────────────────────────────────────────────────────
export const initialNodes: Node[] = [
  // ── Sector backgrounds (rendered behind everything) ─────────────────────────
  {
    id: 'sector-infra',
    type: 'sector',
    position: { x: -PAD, y: INFRA_Y - PAD },
    style: { width: W, height: INFRA_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Platform Infra', sublabel: 'CI guards · version management', color: SECTOR_COLORS.infra },
    selectable: false,
    draggable: false,
  },
  {
    id: 'sector-fr',
    type: 'sector',
    position: { x: -PAD, y: FR_Y - PAD },
    style: { width: W, height: FR_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Frontend Remotes', sublabel: 'Host · React seed · Next.js seed · Streamlit seed', color: SECTOR_COLORS.fr },
    selectable: false,
    draggable: false,
  },
  {
    id: 'sector-backend',
    type: 'sector',
    position: { x: -PAD, y: BACKEND_Y - PAD },
    style: { width: W, height: BACKEND_H, zIndex: -10, pointerEvents: 'none' },
    data: { label: 'Backend & Libs', sublabel: 'API · Auth SDK · UI components', color: SECTOR_COLORS.backend },
    selectable: false,
    draggable: false,
  },

  // ── Infra sector nodes ───────────────────────────────────────────────────────
  { id: 'cli',    type: 'platform', position: { x: 50,  y: INFRA_Y + 60 }, data: { detail: nodeDetails['cli'] } },
  { id: 'guards', type: 'platform', position: { x: 610, y: INFRA_Y + 60 }, data: { detail: nodeDetails['guards'] } },

  // ── FR sector nodes ──────────────────────────────────────────────────────────
  { id: 'host',           type: 'platform', position: { x: 330, y: FR_Y + 50  }, data: { detail: nodeDetails['host'] } },
  { id: 'react-seed',     type: 'platform', position: { x: 30,  y: FR_Y + 270 }, data: { detail: nodeDetails['react-seed'] } },
  { id: 'next-seed',      type: 'platform', position: { x: 310, y: FR_Y + 270 }, data: { detail: nodeDetails['next-seed'] } },
  { id: 'streamlit-seed', type: 'platform', position: { x: 590, y: FR_Y + 270 }, data: { detail: nodeDetails['streamlit-seed'] } },

  // ── Backend sector nodes ─────────────────────────────────────────────────────
  { id: 'backend',  type: 'platform', position: { x: 80,  y: BACKEND_Y + 50 }, data: { detail: nodeDetails['backend'] } },
  { id: 'auth-sdk', type: 'platform', position: { x: 340, y: BACKEND_Y + 50 }, data: { detail: nodeDetails['auth-sdk'] } },
  { id: 'ui',       type: 'platform', position: { x: 600, y: BACKEND_Y + 50 }, data: { detail: nodeDetails['ui'] } },
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
  { ...edgeBase, id: 'h-ns', source: 'host', target: 'next-seed',      label: 'iframe embed',      animated: false, style: { stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '6 3' } },
  { ...edgeBase, id: 'h-ss', source: 'host', target: 'streamlit-seed', label: 'iframe embed',      animated: false, style: { stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '6 3' } },
  // Host → Backend
  { ...edgeBase, id: 'h-be', source: 'host', target: 'backend',  label: 'REST API',   style: { stroke: '#f97316', strokeWidth: 2 } },
  // Host → UI
  { ...edgeBase, id: 'h-ui', source: 'host', target: 'ui',       label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  // Seeds → Auth SDK
  { ...edgeBase, id: 'rs-as', source: 'react-seed', target: 'auth-sdk', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ns-as', source: 'next-seed',  target: 'auth-sdk', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  // Seeds → UI
  { ...edgeBase, id: 'rs-ui', source: 'react-seed', target: 'ui', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'ns-ui', source: 'next-seed',  target: 'ui', label: 'npm import', style: { stroke: '#a855f7', strokeWidth: 1.5 } },
  // Auth SDK → Backend
  { ...edgeBase, id: 'as-be', source: 'auth-sdk', target: 'backend', label: 'GET /api/auth/me', style: { stroke: '#f97316', strokeWidth: 2 } },
  // Guards → all repos
  { ...edgeBase, id: 'g-h',  source: 'guards', target: 'host',           label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-rs', source: 'guards', target: 'react-seed',     label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-ns', source: 'guards', target: 'next-seed',      label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  { ...edgeBase, id: 'g-ss', source: 'guards', target: 'streamlit-seed', label: 'CI guard', style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' } },
  // CLI → Seeds
  { ...edgeBase, id: 'c-rs', source: 'cli', target: 'react-seed',     label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'c-ns', source: 'cli', target: 'next-seed',      label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
  { ...edgeBase, id: 'c-ss', source: 'cli', target: 'streamlit-seed', label: 'bp update', style: { stroke: '#06b6d4', strokeWidth: 1.5 } },
]
