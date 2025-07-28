export default function ContactoHero() {
  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/contacto/contactos.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-4xl mx-auto text-center px-4'>
        <h1 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
          CONTACTO
        </h1>
      </div>
    </section>
  )
}
