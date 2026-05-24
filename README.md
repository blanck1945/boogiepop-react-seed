# Boogiepop · React Remote Seed (Vite + Module Federation)

Seed para equipos que quieren partir de una **SPA React con Vite** empaquetada como **remote** de **Module Federation** y desplegarla como **sitio estático en Docker** → **Amazon ECR** → **Amazon ECS**.

Para **convenciones, agentes y flujo spec-driven-lite** usá **[AGENTS.md](AGENTS.md)** y **[spec-kit/README.md](spec-kit/README.md)** (metodología alineada con el seed Streamlit hermano, sin CLI de GitHub spec-kit). Para **fullscreen edge-to-edge** cuando el hub monta el remote, revisá la sección *Layout fullscreen* en AGENTS.md y **`docs/LLM-hub-embed-layout.md`** en el repo `boogiepop-host`.

Incluye **React Router**, **Tailwind CSS v4** y un marcador para **autenticación** que se definirá cuando el host inyecte sesión (pendiente).

## Qué hay en el proyecto

| Incluye | Detalle breve |
|--------|----------------|
| **Vite 8 + React 19 + TypeScript** | Desarrollo y build estándar. |
| **Module Federation (`@module-federation/vite`)** | Remote `boogiepopRemote` → expone `./Shell` (`mf-manifest.json` + `remoteEntry.js`). |
| **Tailwind CSS v4** | Plugin `@tailwindcss/vite`; tema **inspirado en Streamlit claro** (IBM Plex Sans/Mono, fondo `#fff`, `#F0F2F6`, texto `#31333F`, primario `#FF4B4B`). |
| **React Router v7** | Ruta única `/` en una página (intro + checklist + deploy + auth). Sin navbar propia; en el hub el shell usa **`Routes`** descendientes bajo **`/hub/react-remote/*`** (RR v6+ no permite anidar otro `Router` dentro del host). |
| **Auth** | `AuthPlaceholder` en la página principal (sin OAuth acoplado al remote solo). |

**Favicon:** [`public/favicon.svg`](public/favicon.svg) — brote como **SVG vectorial** (fondo `#f0f2f6`); paralelo conceptual al **`page_icon` 🌱** del Streamlit en `configure_page`.

**`<title>` (pestaña):** `Inicio · Boogiepop React Remote Seed`, igual patrón que Streamlit **`{página} · {PLATFORM_APP_TITLE}`** (`Inicio · Boogiepop Streamlit Seed` en `app/Home.py` + `PLATFORM_APP_TITLE` en `seed_main.py`).

### Paths para registrar el remote en el host

Sustituí **`BASE`** por la URL donde se sirve el seed (ej. desarrollo local `http://localhost:8008`, producción tu ALB/CDN terminado en `/` si aplica).

| Uso | URL / valor |
|-----|----------------|
| **Nombre del remote** | `boogiepopRemote` |
| **Expose (módulo)** | `./Shell` |
| **`loadRemote` / import similar** | típico **`boogiepopRemote/Shell`** (según sintaxis que use tu runtime MF versión `@module-federation/*`) |
| **Manifest MF (recomendado)** | `BASE` + **`mf-manifest.json`** → ejemplo `http://localhost:8008/mf-manifest.json` |
| **Remote entry JS** | `BASE` + **`remoteEntry.js`** → ejemplo `http://localhost:8008/remoteEntry.js` |

En el **`remotes`** del host (pseudo-config), suele bastar **`entry`** al manifest absoluto si tu stack lo admite **`type: 'module'`**; si no, usá **`remoteEntry.js`** y seguí la doc de vuestra versión de Module Federation para `registerRemotes` / webpack `remotes`.

### Integración desde el host (resumen)

- Nombre MF: **`boogiepopRemote`**
- Expuesto para el host: **`./Shell`** → string de consumo habitual **`boogiepopRemote/Shell`** (archivo fuente `./src/mf-remote/RemoteShell.tsx`)
- Compartición de dependencias (**singleton`): `react`, `react-dom`, `react-router-dom`  
  Alineá versiones entre host y este remote para evitar conflictos.

Documentación oficial del plugin Vite:

- https://github.com/module-federation/vite

## Requisitos

- **Node.js** ≥ 22 (ver `.nvmrc`)
- **npm** para instalar desde `package-lock.json`
- Opcional: **Docker** para imagen nginx + estáticos
- AWS **ECR/ECS/OIDC** sólo si usás el workflow de despliegue

## Scripts

```bash
npm ci
npm run dev      # desarrollo Module Federation / HMR (puerto por defecto 8008)
npm run build    # artefactos en dist/, incluye remote MF
npm run preview  # vite preview sobre dist/
npm run lint
```

### Variables de build (`VITE_*`)

| Variable | Cuándo | Descripción |
|----------|--------|-------------|
| `VITE_REMOTE_BASE` | Build (local, Docker, CI) | **`base`** de Vite (`/` detrás del ALB en raíz, o una URL/base con barra final si servís desde un CDN u origen público conocido — ver documentación MF para URLs absolutas). |
| `PORT` / `VITE_DEV_PORT` | Solo dev local | Cambia el puerto del dev server (`8008` por defecto si no lo definís). |
| `VITE_DEV_SERVER_ORIGIN` | Solo dev local | Origin público esperado (`http://localhost:<puerto>` por defecto, alineado al puerto de `vite.config`). Sobrescribí si exponés tras un proxy HTTPS. |

> **MF en producción:** los chunks tienen que resolverse contra el **origen público correcto**. Si ves 404 en assets, revisá `VITE_REMOTE_BASE` y cómo nginx/CloudFront exponen esa ruta.

## Congelación de dependencias

- Las versiones están **fijas** en `package.json` (sin `^`/`~`) para builds reproducibles.
- El archivo **`package-lock.json`** debe commitearse.  
  Actualizar dependencias: PR que modifique ambos y ejecute CI/lint/local build.

## Desarrollo del remote

- App standalone (`BrowserRouter`): `src/App.tsx`
- Rutas (`/` única): `src/router/AppRoutes.tsx`
- Contenido de la página: `src/pages/SeedLandingPage.tsx`
- Shell montable en host (mismo `<Routes>` sin `Router` propio): `src/mf-remote/RemoteShell.tsx`
- **Specs / agentes:** [spec-kit/README.md](spec-kit/README.md) y [specs/README.md](specs/README.md)

Rutas remotas por defecto: sólo **`/`** (equivalente a la porción bajo **`/hub/react-remote/*`** en el host cuando el hub declara ruta terminada en `*`).

Imagen multi-stage Node (build) → **nginx:alpine** escuchando en **8080** (ajustado a muchos SG de ECS/ALB). Healthcheck opcional contra `/health`.

```bash
docker build \
  --build-arg VITE_REMOTE_BASE=/ \
  --build-arg VITE_DEV_SERVER_ORIGIN=http://localhost:5173 \
  -t boogiepop-react-seed:local .

docker run --rm -p 8080:8080 boogiepop-react-seed:local
```

Luego probá:

- SPA: http://localhost:8080/
- Manifest MF: http://localhost:8080/mf-manifest.json

## CI: ECR + (opcional) ECS

### GitHub Actions

Workflow: [`.github/workflows/docker-ecr-ecs.yml`](.github/workflows/docker-ecr-ecs.yml)

**Guía hub ↔ remote (manifest, orden de deploy, Escenario ALB vs dominio):** [`../boogiepop-host/docs/DEPLOY-REMOTES.md`](../boogiepop-host/docs/DEPLOY-REMOTES.md)

- Gatillo inicial: **`workflow_dispatch`** para no hacer fallar forks sin OIDC en AWS (podés volver a añadir `push` cuando tengáis cuenta y roles).
- **Secret recomendado:** `AWS_ROLE_ARN` — rol IAM de GitHub Actions vía OIDC (“OpenID Connect”) con permisos mínimos a ECR (+ ECS opcional).

**Vars de ejemplo (GitHub → Settings → Secrets and variables → Actions → Variables)**

| Variable | Uso |
|----------|-----|
| `AWS_REGION` | Región AWS (fallback `us-east-1`). |
| `ECR_REPOSITORY` | Nombre del repo ECR (`boogiepop-react-seed` en el YAML si vacío). Para alinear Terraform/DEPLOY-REMOTES usá **`boogiepop-remote`**. |
| `VITE_REMOTE_BASE` | `base` público durante el build de la imagen (por defecto `/`). |
| `ECS_CLUSTER` | Si está definido **no vacío**, el job intenta **`update-service ... --force-new-deployment`**. |
| `ECS_SERVICE` | Idem anterior. |

### GitLab CI

Mismo patrón que **`boogiepop-host`**, con **deploy automático al mergear a `main`**: [`docs/GITLAB-DEPLOY.md`](docs/GITLAB-DEPLOY.md). En **`develop`**, Docker/ECS siguen **manuales**; en **`main`** (post-merge MR), **`docker-publish-remote-prod`** + **`deploy-remote-ecs-prod`** corren solos si tenés **`ECR_REGISTRY`** y AWS configurados.

> En **GitHub Actions** o **GitLab CI**, si la task ECS apunta a `:latest`, `:develop` o al SHA del pipeline, alcanza con **`force-new-deployment`** tras el push a ECR; con **sólo tags inmutables**, registrá una nueva revisión de task con la etiqueta de imagen nueva.

### ECS: definición de tarea ejemplo

Hay un esqueleto en [`ecs/task-definition.sample.json`](ecs/task-definition.sample.json). Copiadlo, reemplazá `ACCOUNT_ID`, roles ARNs de ejecución/tarea y el URI de imagen con el propio antes de usarlo como plantilla oficial.

Ejemplo rápido (tras push a ECR) para refrescar tasks que apunten la imagen nueva vía mismo tag `:latest`:

```bash
aws ecs update-service \
  --cluster TU_CLUSTER \
  --service TU_SERVICIO \
  --region TU_REGION \
  --force-new-deployment
```

### CORS / CORP

Este seed añade `Cross-Origin-Resource-Policy: cross-origin` en nginx para cargar artefactos entre orígenes; según seguridad corporativa puede que necesités **afinar cabeceras** o servir desde el mismo sitio/reverse-proxy que el host.

## Lint y calidad

```bash
npm run lint
```

## Pendiente (fuera del alcance inicial)

- Contrato exacto entre **host** y remote para pasar usuario, token u otro contexto de autenticación (añadir cuando defináis el bridge en el host).
- Repo o carpeta ejemplo de **host** consumiendo `boogiepopRemote`.

## Licencia

Uso interno seed — añadí la licencia que corresponda a vuestro producto antes de distribuir públicamente.
