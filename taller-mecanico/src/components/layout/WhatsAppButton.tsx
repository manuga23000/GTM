interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppButton({
  phoneNumber = '5491234567890',
  message = '',
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <a
        href={whatsappUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center'
        aria-label='Contactar por WhatsApp'
      >
        <FaWhatsapp className='text-3xl' />
      </a>
    </div>
  )
}
