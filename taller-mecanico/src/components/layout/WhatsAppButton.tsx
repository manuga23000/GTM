interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

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
        className='bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group'
        aria-label='Contactar por WhatsApp'
      >
        <span className='text-2xl'>💬</span>
        <span className='hidden sm:inline font-semibold group-hover:animate-pulse'>
          WhatsApp
        </span>
      </a>
    </div>
  )
}
