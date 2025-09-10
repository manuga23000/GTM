'use client'
import React from 'react'

interface TestSectionsProps {
  showModal1: boolean
  setShowModal1: (show: boolean) => void
  showModal2: boolean
  setShowModal2: (show: boolean) => void
  showModal3: boolean
  setShowModal3: (show: boolean) => void
}

export default function TestSections({
  showModal1,
  setShowModal1,
  showModal2,
  setShowModal2,
  showModal3,
  setShowModal3,
}: TestSectionsProps) {
  const loremText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`

  const sections = [
    {
      id: 1,
      title: 'SECCIÓN 1 - ARRIBA',
      color: 'bg-blue-900',
      modal: showModal1,
      setModal: setShowModal1,
    },
    {
      id: 2,
      title: 'SECCIÓN 2 - MEDIO',
      color: 'bg-green-900',
      modal: showModal2,
      setModal: setShowModal2,
    },
    {
      id: 3,
      title: 'SECCIÓN 3 - ABAJO',
      color: 'bg-purple-900',
      modal: showModal3,
      setModal: setShowModal3,
    },
  ]

  return (
    <>
      {sections.map(section => (
        <section
          key={section.id}
          className={`${section.color} text-white p-8 min-h-screen flex flex-col justify-center`}
        >
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-4xl font-bold mb-6 text-center'>
              {section.title}
            </h2>

            <div className='text-center mb-8'>
              <button
                onClick={() => section.setModal(true)}
                className='bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors shadow-lg'
              >
                🚀 ABRIR MODAL {section.id}
              </button>
              <p className='text-gray-300 mt-2 text-sm'>
                ⚠️ El modal debe aparecer centrado en la pantalla visible, no en
                el medio de toda la página
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-2xl font-semibold mb-4'>Párrafo 1</h3>
                <p className='text-gray-300 leading-relaxed mb-4'>
                  {loremText}
                </p>
                <p className='text-gray-300 leading-relaxed'>{loremText}</p>
              </div>
              <div>
                <h3 className='text-2xl font-semibold mb-4'>Párrafo 2</h3>
                <p className='text-gray-300 leading-relaxed mb-4'>
                  {loremText}
                </p>
                <p className='text-gray-300 leading-relaxed'>{loremText}</p>
              </div>
            </div>

            <div className='mt-8'>
              <h3 className='text-2xl font-semibold mb-4'>Más Contenido</h3>
              <div className='grid md:grid-cols-3 gap-4'>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num} className='bg-black/30 p-4 rounded-lg'>
                    <h4 className='font-semibold mb-2'>Card {num}</h4>
                    <p className='text-gray-400 text-sm'>
                      {loremText.substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='text-center mt-8 p-4 bg-black/40 rounded-lg'>
              <p className='text-yellow-400 font-bold'>
                📍 ESTÁS EN LA {section.title}
              </p>
              <p className='text-gray-400 text-sm mt-2'>
                Cuando abras el modal desde aquí, debe aparecer centrado en TU
                pantalla visible, no en el medio de toda la página web.
              </p>
            </div>
          </div>
        </section>
      ))}

      <section className='bg-gray-800 text-white p-8 min-h-screen flex items-center justify-center'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold mb-6'>
            🧪 INSTRUCCIONES DE TESTEO
          </h2>

          <div className='bg-gray-900 p-6 rounded-lg mb-6'>
            <h3 className='text-2xl font-semibold mb-4 text-yellow-400'>
              Cómo testear:
            </h3>
            <ol className='text-left space-y-3 text-lg'>
              <li>
                <strong>1.</strong> Hacé scroll hacia arriba y abajo por toda la
                página
              </li>
              <li>
                <strong>2.</strong> Pará en cualquier sección (arriba, medio, o
                abajo)
              </li>
              <li>
                <strong>3.</strong> Tocá el botón &quot;ABRIR MODAL&quot;
              </li>
              <li>
                <strong>4.</strong> El modal DEBE aparecer centrado en tu
                pantalla visible
              </li>
              <li>
                <strong>5.</strong> NO debe poder scrollear la página de atrás
              </li>
            </ol>
          </div>

          <div className='bg-red-900/30 p-6 rounded-lg'>
            <h3 className='text-2xl font-semibold mb-4 text-red-400'>
              ❌ Si el modal falla:
            </h3>
            <ul className='text-left space-y-2 text-lg'>
              <li>
                • Modal aparece en el medio de toda la página (no centrado en
                viewport)
              </li>
              <li>• Podés scrollear la página de atrás</li>
              <li>• Modal no responde correctamente</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
