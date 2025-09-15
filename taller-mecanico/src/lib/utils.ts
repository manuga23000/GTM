/**
 * Formatea un número como moneda argentina (ARS)
 * @param amount - La cantidad a formatear
 * @returns La cantidad formateada como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount))
}
