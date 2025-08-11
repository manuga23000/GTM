// src/lib/emailjs.ts
import emailjs from '@emailjs/browser'

// Configuración de EmailJS
export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  turnoTemplateId:
    process.env.NEXT_PUBLIC_EMAILJS_TURNO_CLIENTE_TEMPLATE_ID || '', // ⚠️ Esta es la que falla
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC || '',
}

// 🔍 DEBUG GLOBAL
console.log('📧 EmailJS Config Initial:', emailjsConfig)

// Inicializar EmailJS (opcional, solo si lo usás en el frontend)
export const initEmailJS = () => {
  emailjs.init(emailjsConfig.publicKey)
}

// Función para enviar email desde el formulario de contacto
export const sendEmail = async (formData: {
  name: string
  email: string
  message: string
}) => {
  try {
    // ✅ ASEGURAR INICIALIZACIÓN
    if (emailjsConfig.publicKey) {
      emailjs.init(emailjsConfig.publicKey)
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_name: 'GTM Taller Mecánico',
    }

    // Al inicio de sendTurnoConfirmationToClient, agrega:
    console.log('🔍 EmailJS Debug:', {
      serviceId: emailjsConfig.serviceId || '❌ MISSING',
      turnoTemplateId: emailjsConfig.turnoTemplateId || '❌ MISSING',
      publicKey: emailjsConfig.publicKey || '❌ MISSING',
    })

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      emailjsConfig.publicKey // ✅ PASAR PUBLIC KEY DIRECTAMENTE
    )

    return {
      success: true,
      message: 'Mensaje enviado correctamente',
      response,
    }
  } catch (error) {
    console.error('Error enviando email de contacto:', error)
    return {
      success: false,
      message: 'Error al enviar el mensaje. Intenta nuevamente.',
      error,
    }
  }
}

// Función para enviar email de confirmación de turno al cliente
export const sendTurnoConfirmationToClient = async (turnoData: {
  name: string
  email: string
  phone: string
  vehicle: string
  service: string
  subService?: string
  date: Date | null
  message: string
  cancelToken: string
}) => {
  try {
    console.log('🔍 EmailJS Variables Debug:', {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '❌ MISSING',
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '❌ MISSING',
      turnoTemplateId:
        process.env.NEXT_PUBLIC_EMAILJS_TURNO_CLIENTE_TEMPLATE_ID ||
        '❌ MISSING',
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC || '❌ MISSING',
    })

    console.log('🔍 EmailjsConfig Object:', emailjsConfig)
    // ✅ FIX: INICIALIZAR EMAILJS ANTES DE USAR
    if (!emailjsConfig.publicKey) {
      throw new Error('EmailJS public key no configurada')
    }

    emailjs.init(emailjsConfig.publicKey)

    // Formatear la fecha
    const formattedDate = turnoData.date
      ? turnoData.date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'A coordinar'

    // Formatear el servicio completo
    const servicioCompleto = turnoData.subService
      ? `${turnoData.service} - ${turnoData.subService}`
      : turnoData.service

    const cancelUrl = `https://www.mecanicagrandoli.com.ar/cancelar-turno/${turnoData.cancelToken}`

    const templateParams = {
      to_name: turnoData.name,
      to_email: turnoData.email,
      cliente_nombre: turnoData.name,
      cliente_telefono: turnoData.phone,
      vehiculo: turnoData.vehicle,
      servicio: servicioCompleto,
      fecha: formattedDate,
      mensaje_cliente: turnoData.message || 'Sin mensaje adicional',
      taller_nombre: 'GTM Taller Mecánico',
      taller_telefono: '+54 9 336 469-4921',
      taller_direccion: 'San Martín 1234, Resistencia, Chaco',
      taller_horarios: 'Lunes a Viernes de 8:00 a 16:00',
      cancel_url: cancelUrl,
    }

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.turnoTemplateId,
      templateParams,
      emailjsConfig.publicKey // ✅ PASAR PUBLIC KEY DIRECTAMENTE
    )

    return {
      success: true,
      message: 'Email de confirmación enviado al cliente',
      response,
    }
  } catch (error) {
    console.error('Error enviando email de confirmación de turno:', error)
    return {
      success: false,
      message: 'Error al enviar email de confirmación',
      error,
    }
  }
}
