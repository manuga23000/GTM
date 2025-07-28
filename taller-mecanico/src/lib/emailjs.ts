// src/lib/emailjs.ts
import emailjs from '@emailjs/browser'

// Configuración de EmailJS
export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
}

// Inicializar EmailJS
export const initEmailJS = () => {
  emailjs.init(emailjsConfig.publicKey)
}

// Función para enviar email
export const sendEmail = async (formData: {
  name: string
  email: string
  message: string
}) => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_name: 'GTM Taller Mecánico',
    }

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams
    )

    return {
      success: true,
      message: 'Mensaje enviado correctamente',
      response,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      message: 'Error al enviar el mensaje. Intenta nuevamente.',
      error,
    }
  }
}
