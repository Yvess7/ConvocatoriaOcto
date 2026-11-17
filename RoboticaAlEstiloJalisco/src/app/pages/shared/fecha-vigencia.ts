/**
 * Convierte una cadena ISO o YYYY-MM-DD a milisegundos epoch.
 * Cuando se indica solo fecha (YYYY-MM-DD), se interpreta en horario de Jalisco (-06:00).
 */
export function parseFechaConfig(valor: string | undefined, borde: 'inicio' | 'fin'): number | null {
  if (!valor) return null;
  const limpio = valor.trim();
  if (!limpio) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpio)) {
    const sufijo = borde === 'inicio' ? 'T00:00:00-06:00' : 'T23:59:59.999-06:00';
    const ms = Date.parse(`${limpio}${sufijo}`);
    return Number.isFinite(ms) ? ms : null;
  }

  const ms = Date.parse(limpio);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Evalúa si un elemento programado está vigente en el instante indicado.
 */
export function estaVigente(
  ahoraMs: number,
  publicarDesde?: string,
  bajaEn?: string,
  visible?: boolean
): boolean {
  if (visible === false) return false;

  const desdeMs = parseFechaConfig(publicarDesde, 'inicio');
  const hastaMs = parseFechaConfig(bajaEn, 'fin');

  if (desdeMs !== null && ahoraMs < desdeMs) return false;
  if (hastaMs !== null && ahoraMs > hastaMs) return false;

  return true;
}

