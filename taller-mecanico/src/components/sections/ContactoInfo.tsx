import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

export default function ContactoInfo() {
  return (
    <div className='w-full bg-transparent flex flex-col items-center pt-12 pb-8'>
      <div className='flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center'>
        {/* Teléfono */}
        <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
          <FaPhone className='text-red-600 text-3xl mb-2' />
          <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
            TELÉFONO
          </h3>
          <span className='text-base font-medium'>+54 9 3364 69-4921</span>
        </div>
        {/* Email */}
        <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
          <FaEnvelope className='text-red-600 text-3xl mb-2' />
          <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
            EMAIL
          </h3>
          <span className='text-base font-medium break-words text-center'>
            contacto@mecanicagrandoli.com
          </span>
        </div>
        {/* Dirección */}
        <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
          <FaMapMarkerAlt className='text-red-600 text-3xl mb-2' />
          <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
            DIRECCIÓN
          </h3>
          <span className='text-base font-medium text-center'>
            Luis Viale 291,
            <br />
            B2900 San Nicolás de Los Arroyos,
            <br />
            Provincia de Buenos Aires.
          </span>
        </div>
      </div>
    </div>
  )
}
