import { useBoogiepopSession } from '@boogiepop/auth-sdk/react'

/**
 * Marcador hasta definir cómo el host inyecta sesión (token, usuario, claims).
 * No añadir secretos ni flujos OAuth acoplados al remote aislado.
 */
export function AuthPlaceholder() {
  const { snapshot, isHydrating } = useBoogiepopSession()
  const hasRoles = snapshot.roles.length > 0
  const roleLabel = hasRoles ? snapshot.roles.join(', ') : 'sin roles'

  return (
    <section
      className="rounded-[0.5rem] border border-[#fcd34d] border-l-[6px] border-l-[#eab308] bg-[#fefce8] p-5 text-left"
      aria-labelledby="auth-placeholder-title"
    >
      <h3
        id="auth-placeholder-title"
        className="text-lg font-semibold text-st-body"
      >
        Autenticación
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-st-muted-text">
        Este remote prioriza el bridge del host cuando está federado (
        <span className="st-inline-code">boogiepop_host/host-auth</span>) y, si corre standalone,
        usa sesión local/mock. No impone OAuth propio.
      </p>
      <div className="mt-3 rounded-[0.5rem] border border-[#fde68a] bg-white/70 p-3 text-xs leading-relaxed text-st-muted-text">
        <p>
          <strong className="text-st-body">Origen:</strong>{' '}
          {isHydrating ? 'resolviendo…' : snapshot.source}
        </p>
        <p>
          <strong className="text-st-body">Usuario:</strong>{' '}
          {snapshot.user?.email ?? snapshot.user?.name ?? 'no autenticado'}
        </p>
        <p>
          <strong className="text-st-body">Roles:</strong> {roleLabel}
        </p>
      </div>
    </section>
  )
}
