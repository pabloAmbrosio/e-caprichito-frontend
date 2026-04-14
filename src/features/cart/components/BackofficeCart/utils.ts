/** Short date: "25/02/26" — used in cart list */
export function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'short' });
}

/** Medium date + time: "25 feb 2026 14:30" — used in cart detail */
export function fmtMediumTime(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Relative date: "Hoy", "Ayer", "Hace N días" */
export function fmtRelative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

/** Money: "$1,234.56" */
export function fmtMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}
