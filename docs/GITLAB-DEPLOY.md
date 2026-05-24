# GitLab CI/CD — Remote React (`boogiepop-react-seed`)

**Mismo modelo que el host:** [`boogiepop-host/.gitlab-ci.yml`](../../boogiepop-host/.gitlab-ci.yml) y [`boogiepop-host/docs/GLAB-CI.md`](../../boogiepop-host/docs/GLAB-CI.md).

Contrato AWS / manifest: [`boogiepop-host/docs/DEPLOY-REMOTES.md`](../../boogiepop-host/docs/DEPLOY-REMOTES.md).

Archivo fuente: **`.gitlab-ci.yml`**.

## Qué corre siempre

- **`lint`** y **`vite-build`** en: merge requests, **`develop`**, **`main`** y tags.
- Artefacto **`dist/`** (7 días) — validación de build; la imagen Docker vuelve a compilar en el job manual.

Sin bloque **`workflow:`** especial (comportamiento estándar GitLab, igual que el host).

## Qué es opcional (manual)

En **push a `develop`** (con **`ECR_REGISTRY`** en variables del proyecto):

| Job | Acción |
|-----|--------|
| **`docker-publish-remote`** | Build **linux/arm64** → ECR repo **`boogiepop-remote`** (`:SHA` + `:develop`) |
| **`deploy-remote-ecs`** | `aws ecs update-service` → **`boogiepop-api-fe-remote-svc`** |

Ejecutalos cuando quieras publicar / rollout. **No fallan la pipeline si no los tocás** (igual que `docker-publish-front` / `deploy-front-ecs` en el host).

Orden habitual: **Play en Docker** → esperar push ECR → **Play en ECS**.

## Variables en GitLab (Settings → CI/CD → Variables)

Usá **las mismas credenciales AWS** que el host si compartís cuenta:

| Variable | Uso |
|----------|-----|
| **`ECR_REGISTRY`** | Obligatoria para Docker manual (`653876198281.dkr.ecr.us-east-1.amazonaws.com` sin `/repo`). |
| **`AWS_ACCESS_KEY_ID`** / **`AWS_SECRET_ACCESS_KEY`** | ECR + ECS (mismo usuario/rol que el host). |
| **`ECS_CLUSTER_NAME`** | Default YAML: `boogiepop-api-cluster` (igual host). |
| **`ECS_FRONT_REMOTE_SERVICE_NAME`** | Default YAML: `boogiepop-api-fe-remote-svc`. |
| **`VITE_REMOTE_BASE`** | Build-arg Docker (URL pública del MF, terminada en `/`, ej. `https://mf.tudominio.com/`). |

**Protected:** si AWS está *Protected*, el pipeline debe correr en rama protegida (`develop`) o la variable llega vacía.

## Diferencias con el host (solo nombres)

| Host | Remote (este repo) |
|------|-------------------|
| `HOST_ECR_REPOSITORY` → `boogiepop-host` | `REMOTE_ECR_REPOSITORY` → `boogiepop-remote` |
| `ECS_FRONT_HOST_SERVICE_NAME` | `ECS_FRONT_REMOTE_SERVICE_NAME` |
| `docker-publish-front` | `docker-publish-remote` |
| `deploy-front-ecs` | `deploy-remote-ecs` |

## Ramas

- Trabajo en **`develop`** → push → lint/build automático; deploy manual cuando quieras.
- **`main`**: lint/build (sin jobs Docker en push a main — igual criterio que host: deploy desde develop).
- Tras deploy remote: actualizar manifest / `remoteEntry` en el **host** si cambió la URL (ver DEPLOY-REMOTES).
