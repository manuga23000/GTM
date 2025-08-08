import { updateTurnoStatus } from '@/actions/turnos'
import { getAllTurnos } from '@/actions/turnos'



// Página principal
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Buscar el turno por token
  const turnos = await getAllTurnos()
  const turno = turnos.find(t => t.cancelToken === token)

  if (!turno) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] text-center w-full'>
        <h1 className='text-2xl font-bold mb-4'>Turno no encontrado</h1>
        <p>El enlace de cancelación es inválido o el turno ya fue cancelado.</p>
      </div>
    )
  }

  // Si ya está cancelado
  if (turno.status === 'cancelled') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] text-center w-full'>
        <h1 className='text-2xl font-bold mb-4'>Turno ya cancelado</h1>
        <p>Este turno ya fue cancelado previamente.</p>
      </div>
    )
  }

  // Cancelar el turno
  await updateTurnoStatus(turno.id!, 'cancelled')

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] text-center w-full'>
      <h1 className='text-2xl font-bold mb-4'>Turno cancelado</h1>
      <p>
        Tu turno ha sido cancelado correctamente. Si deseas volver a reservar,
        puedes hacerlo desde el sitio web.
      </p>
    </div>
  )
}
