# GitLab CI/CD — Remote React (`boogiepop-react-seed`)

Guía rápida alineada con el hub y AWS descritos en **`boogiepop-host/docs/DEPLOY-REMOTES.md`**.

## Ramas (`Settings` → `Repository` → branching)

Recomendado:

| Rama | Propósito | Imagen ECR |
|------|-----------|------------|
| **`main`** | Producción (Escenario B) | `:latest` + `:«short-sha»` |
| **`develop`** | Integración / staging | `:develop` + `:«short-sha»` |
| **`feature/*`**, **`fix/*`** | Trabajo diario → MR contra `develop` | No publica imagen hasta merge |
| **Tags `vX.Y.Z`** | Releases semver | etiqueta `:vX.Y.Z` (+ SHA) |

Pasos típicos en GitLab después del primer push:

1. **`Settings` → `Repository` → Protected branches**: proteger `main` y `develop` (merge vía MR, approvals opcionales).
2. **`Settings` → `Merge requests`**: “Delete source branch”, squash opcional por convención de equipo.

## Pipeline (`.gitlab-ci.yml`)

### Etapas

1. **`lint`** — `npm run lint` en MR y pushes de rama.
2. **`docker_publish`** — build **Docker linux/arm64** (nodos ECS **t4g**), push a **ECR** `ECR_REPOSITORY` (por defecto `boogiepop-remote`).
3. **`deploy_ecs`** — **manual**, `aws ecs update-service --force-new-deployment` si configurás cluster/servicio.

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

3. Política del rol: mínimo `ecr:GetAuthorizationToken` + permisos push al repo `boogiepop-remote`; si usás **`deploy_ecs`**, sumá `ecs:UpdateService`, `ecs:DescribeServices`, etc., sobre tu cluster/servicio.

### Runner

Los jobs Docker usan **`docker:24-cli` + servicio `docker:24-dind`**. Si usás ejecutores propios, suele hacer falta modo **privileged** o executor compatible con DinD.

GitLab SaaS runners compartidos suelen ejecutar estos jobs sin configuración extra; si ves fallos de conexión al daemon, revisá [documentación DinD GitLab](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html).

## Troubleshooting — “Definí AWS_ROLE_ARN…” / caída antes del `docker push`

Ese fallo aparece cuando **GitLab no pudo obtener credenciales AWS** válidas (`before_script`). No es Docker: es login AWS/ECR.

| Síntoma | Qué revisar |
|--------|--------------|
| Nunca cargaste **`AWS_ROLE_ARN`** ni claves IAM | **Settings → CI/CD → Variables:** agregá `AWS_ROLE_ARN` (OIDC) **o** `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`. |
| Cargaste `AWS_ROLE_ARN` pero el JWT llega vacío | Trust policy del rol en IAM (issuer GitLab `https://gitlab.com`, `aud` coincide con **`https://gitlab.com`**), proyecto/ruta/`sub` permitidos. |
| Las variables están **Protected** pero el job corre en rama/tag **sin proteger** | GitLab **no inyecta** variables Protected. Desmarcá *Protected*, o marcá **`main`** / **`develop`** como ramas protegidas y lanzá pipeline ahí. |
| Error `XML_SetAllocTrackerActivationThreshold` / pyexpat al correr `aws` | Era el **apk aws-cli sobre Alpine**. Solución aplicada en repo: job en **Ubuntu 22.04 + instalador oficial** AWS CLI v2. Actualizá el repo si seguís en imagen antigua `docker:*-cli`. |

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
