/**
 * RN16 — Referência Temporal do Servidor:
 * Retorna a data de referência do sistema obtida no servidor no formato puro YYYY-MM-DD,
 * sem depender do relógio ou fuso do dispositivo do cliente.
 */
export function obterDataReferenciaServidor(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
