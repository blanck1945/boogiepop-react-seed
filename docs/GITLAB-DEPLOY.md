# GitLab CI/CD — Remote React (`boogiepop-react-seed`)

Guía rápida alineada con el hub y AWS descritos en **`boogiepop-host/docs/DEPLOY-REMOTES.md`**.

## Ramas (`Settings` → `Repository` → branching)

Recomendado:

| Rama | Propósito | Imagen ECR |
|------|-----------|------------|
| **`main`** | Producción (Escenario B) | `:latest` + `:«short-sha»` |
| **`develop`** | Push `git push origin develop` | `lint` + build ECR **`:develop`** + **`:SHA`** |
| **Merge MR → `main`** (botón en GitLab) | Commit con `See merge request !` o `Merge branch … into 'main'` | `lint` + **retag** `:SHA` → **`:latest`** + `deploy_ecs` manual (opcional, no bloquea) |
| **Push directo a `main`** (mismo SHA que develop, sin merge) | Sync accidental / `git push --all` | **No corre pipeline** en main |
| **Hotfix en `main`** | Variable **`RUN_MAIN_PIPELINE=true`** en el push | Pipeline completa de main |

> Si ves **dos pipelines** (develop + main) con el **mismo SHA**, casi siempre se hizo **push a las dos ramas** (`git push --all` o push main+develop). Para día a día: **`git push origin develop`** solamente.

Pasos típicos en GitLab después del primer push:

1. **`Settings` → `Repository` → Protected branches**: proteger `main` y `develop` (merge vía MR, approvals opcionales).
2. **`Settings` → `Merge requests`**: “Delete source branch”, squash opcional por convención de equipo.

## Pipeline (`.gitlab-ci.yml`)

### Etapas

1. **`lint`** — push a `develop`, merge a `main`, o tag release.
2. **`docker_publish`** — **solo `develop`** (y tags): build ARM64 → ECR.
3. **`ecr_promote_latest`** — **solo merge a `main`**: copia manifest `:SHA` → `:latest` (sin rebuild).
4. **`deploy_ecs`** — manual en main/tags; **`allow_failure: true`** (pipeline **Passed**, deploy opcional).

### Variables CI/CD (`Settings` → `CI/CD` → `Variables`)

| Variable | Obligatorio | Notas |
|----------|-------------|--------|
| `AWS_ROLE_ARN` | Recomendado | Rol IAM para **OIDC** GitLab→AWS (`sts:AssumeRoleWithWebIdentity`). Alternativa: `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`. |
| `AWS_REGION` | No | Por defecto `us-east-1`. |
| `ECR_REPOSITORY` | No | Por defecto `boogiepop-remote` (nombre alineado a Terraform/DEPLOY-REMOTES). |
| **`VITE_REMOTE_BASE`** | Sí en prod | URL pública del remote **terminada en `/`**, ej. `https://mf.tudominio.com/`. Si falla mal, los chunks MF dan 404. |
| `ECS_CLUSTER` | Para deploy_ecs | Ej. `boogiepop-api-cluster`. |
| `ECS_SERVICE` | Para deploy_ecs | Ej. `boogiepop-api-fe-remote-svc`. |

Opcionalmente usá variables **marcadas Protected** por entorno (p. ej. `VITE_REMOTE_BASE` distinto en `develop` vs `main` mediante entornos o variables por reglas en GitLab 15.7+).

### OIDC AWS ↔ GitLab

1. IAM → **Identity provider** Web identity: issuer `https://gitlab.com`, audiencia (`aud`) `https://gitlab.com`.
2. IAM → Rol con **Trust relationship** al proveedor anterior; condition `StringEquals` con el path del proyecto, por ejemplo:
   - `"gitlab.com/sub": "project_path:boogiepop-phatom/boogiepop-react-seed:ref_type:branch:ref:*"`
   (ajustá namespace y proyecto; revisá política oficial GitLab/AWS).

3. Política del rol/usuario IAM: **`ecr:GetAuthorizationToken`**; escritura sobre el repos **`ECR_REPOSITORY`** (`BatchCheckLayerAvailability`, `PutImage`, `InitiateLayerUpload`, `UploadLayerPart`, `CompleteLayerUpload`). Para que **el job cree el repos la primera vez** (sin hacerlo antes en Terraform/consola), añadí **`ecr:DescribeRepositories`** y **`ecr:CreateRepository`**.

### Runner

Los jobs Docker usan **Ubuntu 22.04** como cliente (**awscliv2** + **`docker.io`**) y servicio **`docker:29-dind`**. Si usás ejecutores propios, suele hacer falta modo **privileged** o executor compatible con DinD.

GitLab SaaS runners compartidos suelen ejecutar estos jobs sin configuración extra; si ves fallos de conexión al daemon, revisá [documentación DinD GitLab](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html).

## Troubleshooting — “Definí AWS_ROLE_ARN…” / caída antes del `docker push`

Ese fallo aparece cuando **GitLab no pudo obtener credenciales AWS** válidas (`before_script`). No es Docker: es login AWS/ECR.

| Síntoma | Qué revisar |
|--------|--------------|
| Nunca cargaste **`AWS_ROLE_ARN`** ni claves IAM | **Settings → CI/CD → Variables:** agregá `AWS_ROLE_ARN` (OIDC) **o** `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`. |
| Cargaste `AWS_ROLE_ARN` pero el JWT llega vacío | Trust policy del rol en IAM (issuer GitLab `https://gitlab.com`, `aud` coincide con **`https://gitlab.com`**), proyecto/ruta/`sub` permitidos. |
| **`RepositoryNotFoundException`** (`boogiepop-remote`…) | Creá el repo en **AWS ECR** (misma cuenta/región) o poné **`ECR_REPOSITORY`** al nombre real (Terraform/GitOps). Si el usuario/rol tiene **`ecr:CreateRepository`**, el pipeline creará el repo la primera vez. |
| `XML_SetAllocTrackerActivationThreshold` / pyexpat al correr `aws` | **`apk add aws-cli` en Alpine** (musl/expat); usá `.gitlab-ci.yml` actual (**Ubuntu + instalador oficial** awscliv2). |
| `AWS_ROLE_ARN: unbound variable` tras `docker info` | **`set -u`** heredaba del script de bootstrap en el mismo `before_script`; si no definís OIDC **`AWS_ROLE_ARN`**, falla antes del `elif` de claves. Versión pipeline: sólo **`set -e`** en el instalador + tests con **`${AWS_ROLE_ARN:-}`**. |
| `docker info` API `client … too new` / `Maximum supported API version is …` | **Cliente Docker (ubuntu `docker.io`) más nuevo que el servicio `docker:*-dind`.** Mantener **misma generación mayor** en `.gitlab-ci.yml` (`docker:NN-dind` vs cliente) o usar **`DOCKER_API_VERSION`** sólo como apaño puntual. |

Cuando algo de OIDC IAM no cuadra, podés usar **usuario IAM con claves** (solo entorno POC) sólo hasta dejar bien el rol OIDC.

## Orden recomendado (copiado del doc hub)

```text
1. Terraform / ECR «remote» + ECS (Escenario B)
2. Pipeline `docker_publish` (main/develop/tag)
3. Job manual `deploy_ecs` (o rollout externo / GitOps)
4. Verificar remoteEntry.js (200)
5. Actualizar manifest / `VITE_*` del host y redeploy host
```

Referencias cruzadas: [README § CI](../README.md), [ECS task ejemplo](../ecs/task-definition.sample.json) (adaptá **`runtimePlatform.cpuArchitecture`** a **ARM64** si el servicio Fargate usa t4g).
