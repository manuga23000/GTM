import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminResponse } from './types/types'

const COLLECTION_NAME = 'lavados'
const DIAS_VALIDEZ = 10
const LARGO_CODIGO = 8
// Sin 0, O, 1, I, L para que no se confundan al leerlos de una foto
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'

export type EstadoLavado = 'emitido' | 'usado' | 'pagado' | 'anulado'
export type EstadoLavadoEfectivo = EstadoLavado | 'vencido'

export interface Lavado {
  codigo: string
  patente: string
  clienteNombre: string
  clienteTelefono: string
  marca: string
  modelo: string
  anio?: number
  servicioOrigen: string
  estado: EstadoLavado
  creadoAt: Date
  venceAt: Date
  usadoAt?: Date
  pagadoAt?: Date
  anuladoAt?: Date
  montoPagado?: number
  notas?: string
}

export interface LavadoInput {
  patente: string
  clienteNombre: string
  clienteTelefono?: string
  marca?: string
  modelo?: string
  anio?: number
  servicioOrigen?: string
  notas?: string
}

export interface LavadoResponse extends AdminResponse {
  lavado?: Lavado
}

interface FirestoreLavadoData extends DocumentData {
  codigo: string
  patente: string
  clienteNombre: string
  clienteTelefono: string
  marca: string
  modelo: string
  anio?: number
  servicioOrigen: string
  estado: EstadoLavado
  creadoAt: Timestamp
  venceAt: Timestamp
  usadoAt?: Timestamp
  pagadoAt?: Timestamp
  anuladoAt?: Timestamp
  montoPagado?: number
  notas?: string
}

const toLavado = (data: FirestoreLavadoData): Lavado => ({
  codigo: data.codigo,
  patente: data.patente,
  clienteNombre: data.clienteNombre,
  clienteTelefono: data.clienteTelefono || '',
  marca: data.marca || '',
  modelo: data.modelo || '',
  anio: typeof data.anio === 'number' ? data.anio : undefined,
  servicioOrigen: data.servicioOrigen || '',
  estado: data.estado,
  creadoAt: data.creadoAt.toDate(),
  venceAt: data.venceAt.toDate(),
  usadoAt: data.usadoAt?.toDate(),
  pagadoAt: data.pagadoAt?.toDate(),
  anuladoAt: data.anuladoAt?.toDate(),
  montoPagado: data.montoPagado,
  notas: data.notas,
})

/**
 * Código de 8 caracteres al azar (sin caracteres confusos)
 */
export function generarCodigo(): string {
  const valores = new Uint32Array(LARGO_CODIGO)
  crypto.getRandomValues(valores)
  return Array.from(valores, v => ALFABETO[v % ALFABETO.length]).join('')
}

/**
 * Acepta el código con o sin guion, en mayúsculas o minúsculas
 */
export function normalizarCodigo(codigo: string): string {
  return codigo.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * XXXXXXXX -> XXXX-XXXX
 */
export function formatearCodigo(codigo: string): string {
  const limpio = normalizarCodigo(codigo)
  return limpio.length === LARGO_CODIGO
    ? `${limpio.slice(0, 4)}-${limpio.slice(4)}`
    : limpio
}

/**
 * "Marca Modelo Año" (vacío si no hay datos)
 */
export function descripcionVehiculo(lavado: Lavado): string {
  return [lavado.marca, lavado.modelo, lavado.anio ? String(lavado.anio) : '']
    .filter(Boolean)
    .join(' ')
}

export function esCodigoValido(codigo: string): boolean {
  const limpio = normalizarCodigo(codigo)
  return (
    limpio.length === LARGO_CODIGO &&
    [...limpio].every(c => ALFABETO.includes(c))
  )
}

/**
 * "Vencido" no se guarda: se calcula
 */
export function estadoEfectivo(
  lavado: Lavado,
  ahora: Date = new Date()
): EstadoLavadoEfectivo {
  if (lavado.estado === 'emitido' && ahora.getTime() > lavado.venceAt.getTime())
    return 'vencido'
  return lavado.estado
}

/**
 * dd/mm/aaaa en hora de Argentina
 */
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-AR', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * dd/mm/aaaa hh:mm:ss en hora de Argentina
 */
export function formatearFechaHora(fecha: Date): string {
  const partes = new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(fecha)
  const p = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find(x => x.type === tipo)?.value ?? ''
  return `${p('day')}/${p('month')}/${p('year')} ${p('hour')}:${p('minute')}:${p('second')}`
}

/**
 * Motivo por el que un lavado no se puede usar (null si se puede)
 */
export function motivoNoValido(
  lavado: Lavado,
  ahora: Date = new Date()
): string | null {
  const estado = estadoEfectivo(lavado, ahora)
  if (estado === 'usado' || estado === 'pagado') {
    return lavado.usadoAt
      ? `Ya usado el ${formatearFecha(lavado.usadoAt)}`
      : 'Ya usado'
  }
  if (estado === 'anulado') {
    return lavado.anuladoAt
      ? `Anulado el ${formatearFecha(lavado.anuladoAt)}`
      : 'Anulado'
  }
  if (estado === 'vencido') return `Vencido el ${formatearFecha(lavado.venceAt)}`
  return null
}

/**
 * Teléfono en formato wa.me argentino (549 + característica + número)
 */
export function telefonoWhatsApp(telefono?: string): string | null {
  if (!telefono) return null
  let digitos = telefono.replace(/\D/g, '')
  if (digitos.startsWith('00')) digitos = digitos.slice(2)
  if (digitos.startsWith('549')) digitos = digitos.slice(3)
  else if (digitos.startsWith('54')) digitos = digitos.slice(2)
  if (digitos.startsWith('0')) digitos = digitos.slice(1)
  // Sacar el 15 que va después de la característica (ej: 336 15 4694921)
  if (digitos.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (digitos.slice(largoArea, largoArea + 2) === '15') {
        digitos = digitos.slice(0, largoArea) + digitos.slice(largoArea + 2)
        break
      }
    }
  }
  return digitos.length === 10 ? `549${digitos}` : null
}

export const LAVADERO = {
  telefono: '3364583613',
  telefonoVisible: '336 458-3613',
  direccion: 'Pasaje Gorbarán 384',
  referencia: 'Cortada del Fortín',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Pasaje Gorbarán 384, San Nicolás de los Arroyos'),
}

export function mensajeWhatsAppLavado(nombre: string, link: string): string {
  const nombrePila = nombre.trim().split(/\s+/)[0] || ''
  return `¡Hola ${nombrePila}! Gracias por confiar en GTM. Te regalamos un lavado. Mostrá este link en el lavadero dentro de los próximos ${DIAS_VALIDEZ} días: ${link}

📍 ${LAVADERO.direccion} (${LAVADERO.referencia})
📞 ${LAVADERO.telefono}`
}

export async function crearLavado(input: LavadoInput): Promise<LavadoResponse> {
  try {
    if (!input.patente || !input.clienteNombre) {
      return {
        success: false,
        message: 'Faltan campos obligatorios (patente y cliente)',
        error: 'MISSING_REQUIRED_FIELDS',
      }
    }

    const creadoAt = new Date()
    const venceAt = new Date(
      creadoAt.getTime() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000
    )

    for (let intento = 0; intento < 5; intento++) {
      const codigo = generarCodigo()
      const docRef = doc(db, COLLECTION_NAME, codigo)

      const datos: FirestoreLavadoData = {
        codigo,
        patente: input.patente.replace(/\s+/g, '').toUpperCase(),
        clienteNombre: input.clienteNombre.trim(),
        clienteTelefono: input.clienteTelefono?.trim() || '',
        marca: input.marca?.trim() || '',
        modelo: input.modelo?.trim() || '',
        ...(input.anio ? { anio: input.anio } : {}),
        servicioOrigen: input.servicioOrigen?.trim() || '',
        estado: 'emitido',
        creadoAt: Timestamp.fromDate(creadoAt),
        venceAt: Timestamp.fromDate(venceAt),
        ...(input.notas?.trim() ? { notas: input.notas.trim() } : {}),
      }

      const creado = await runTransaction(db, async transaction => {
        const existente = await transaction.get(docRef)
        if (existente.exists()) return false
        transaction.set(docRef, datos)
        return true
      })

      if (creado) {
        return {
          success: true,
          message: 'Link de lavado creado',
          lavado: toLavado(datos),
        }
      }
    }

    return {
      success: false,
      message: 'No se pudo generar un código único, probá de nuevo',
      error: 'DUPLICATE_CODE',
    }
  } catch (error) {
    console.error('Error creando lavado:', error)
    return {
      success: false,
      message: 'Error al crear el link de lavado',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function obtenerLavado(codigo: string): Promise<Lavado | null> {
  try {
    const limpio = normalizarCodigo(codigo)
    if (!limpio) return null
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, limpio))
    if (!docSnap.exists()) return null
    return toLavado(docSnap.data() as FirestoreLavadoData)
  } catch (error) {
    console.error('Error obteniendo lavado:', error)
    return null
  }
}

/**
 * Escucha un lavado en tiempo real (null si no existe)
 */
export function escucharLavado(
  codigo: string,
  onCambio: (lavado: Lavado | null) => void,
  onError?: (error: Error) => void
): () => void {
  const limpio = normalizarCodigo(codigo)
  if (!limpio) {
    onCambio(null)
    return () => {}
  }
  return onSnapshot(
    doc(db, COLLECTION_NAME, limpio),
    snap =>
      onCambio(
        snap.exists() ? toLavado(snap.data() as FirestoreLavadoData) : null
      ),
    error => onError?.(error)
  )
}

export async function listarLavados(): Promise<Lavado[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('creadoAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => toLavado(d.data() as FirestoreLavadoData))
  } catch (error) {
    console.error('Error listando lavados:', error)
    return []
  }
}

export async function marcarLavadoUsado(
  codigo: string
): Promise<LavadoResponse> {
  try {
    const limpio = normalizarCodigo(codigo)
    if (!limpio) {
      return { success: false, message: 'Código vacío', error: 'NOT_FOUND' }
    }
    const docRef = doc(db, COLLECTION_NAME, limpio)

    return await runTransaction(db, async transaction => {
      const snap = await transaction.get(docRef)
      if (!snap.exists()) {
        return {
          success: false,
          message: 'El link no existe',
          error: 'NOT_FOUND',
        }
      }

      const lavado = toLavado(snap.data() as FirestoreLavadoData)
      const ahora = new Date()
      const motivo = motivoNoValido(lavado, ahora)
      if (motivo) {
        return {
          success: false,
          message: motivo,
          error: 'NOT_VALID',
          lavado,
        }
      }

      transaction.update(docRef, {
        estado: 'usado',
        usadoAt: Timestamp.fromDate(ahora),
      })

      return {
        success: true,
        message: `Lavado ${formatearCodigo(limpio)} marcado como usado`,
        lavado: { ...lavado, estado: 'usado', usadoAt: ahora },
      }
    })
  } catch (error) {
    console.error('Error marcando lavado como usado:', error)
    return {
      success: false,
      message: 'Error al marcar el lavado como usado',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function marcarLavadoPagado(
  codigo: string,
  montoPagado?: number
): Promise<LavadoResponse> {
  try {
    const limpio = normalizarCodigo(codigo)
    const docRef = doc(db, COLLECTION_NAME, limpio)

    return await runTransaction(db, async transaction => {
      const snap = await transaction.get(docRef)
      if (!snap.exists()) {
        return {
          success: false,
          message: 'El link no existe',
          error: 'NOT_FOUND',
        }
      }

      const lavado = toLavado(snap.data() as FirestoreLavadoData)
      if (lavado.estado !== 'usado') {
        return {
          success: false,
          message:
            lavado.estado === 'pagado'
              ? 'Ya estaba marcado como pagado'
              : 'Solo se puede pagar un lavado usado',
          error: 'NOT_VALID',
          lavado,
        }
      }

      const pagadoAt = new Date()
      const tieneMonto =
        montoPagado !== undefined && Number.isFinite(montoPagado)
      transaction.update(docRef, {
        estado: 'pagado',
        pagadoAt: Timestamp.fromDate(pagadoAt),
        ...(tieneMonto && { montoPagado }),
      })

      return {
        success: true,
        message: `Lavado ${formatearCodigo(limpio)} marcado como pagado`,
        lavado: {
          ...lavado,
          estado: 'pagado',
          pagadoAt,
          ...(tieneMonto && { montoPagado }),
        },
      }
    })
  } catch (error) {
    console.error('Error marcando lavado como pagado:', error)
    return {
      success: false,
      message: 'Error al marcar el lavado como pagado',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function marcarLavadosPagados(
  codigos: string[],
  montoPorLavado?: number
): Promise<AdminResponse> {
  let pagados = 0
  const errores: string[] = []

  for (const codigo of codigos) {
    const resultado = await marcarLavadoPagado(codigo, montoPorLavado)
    if (resultado.success) pagados++
    else errores.push(`${formatearCodigo(codigo)}: ${resultado.message}`)
  }

  return {
    success: errores.length === 0,
    message:
      errores.length === 0
        ? `${pagados} lavado${pagados !== 1 ? 's' : ''} marcado${pagados !== 1 ? 's' : ''} como pagado${pagados !== 1 ? 's' : ''}`
        : `${pagados} pagado${pagados !== 1 ? 's' : ''}, ${errores.length} con error`,
    ...(errores.length > 0 && { error: errores.join(' · ') }),
  }
}

/**
 * Anula (desactiva) un link activo: queda en el registro como "anulado"
 * y la página muestra "ANULADO"
 */
export async function anularLavado(codigo: string): Promise<AdminResponse> {
  try {
    const limpio = normalizarCodigo(codigo)
    const docRef = doc(db, COLLECTION_NAME, limpio)

    return await runTransaction(db, async transaction => {
      const snap = await transaction.get(docRef)
      if (!snap.exists()) {
        return {
          success: false,
          message: 'El link no existe',
          error: 'NOT_FOUND',
        }
      }
      const lavado = toLavado(snap.data() as FirestoreLavadoData)
      if (lavado.estado !== 'emitido') {
        return {
          success: false,
          message: 'Solo se puede anular un link que no fue usado',
          error: 'NOT_VALID',
        }
      }
      transaction.update(docRef, {
        estado: 'anulado',
        anuladoAt: Timestamp.now(),
      })
      return {
        success: true,
        message: `Link ${formatearCodigo(limpio)} anulado`,
      }
    })
  } catch (error) {
    console.error('Error anulando lavado:', error)
    return {
      success: false,
      message: 'Error al anular el link',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
