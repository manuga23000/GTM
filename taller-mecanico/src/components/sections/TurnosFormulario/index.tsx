'use client'
import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import { animations } from '@/lib/animations'
import { createTurno, checkAvailability } from '@/actions/turnos'
import { TurnoInput } from '../../../actions/types/types'
import { useRouter } from 'next/navigation'
import FormFields from './FormFields'
import SuccessModal from './SuccessModal'
import DatePickerStyles from './DatePickerStyles'

interface FormData extends TurnoInput {}

export default function TurnosFormulario() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: '',
    subService: '',
    date: null,
    time: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [availabilityCache, setAvailabilityCache] = useState<
    Record<string, boolean>
  >({})

  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  // Función para cargar disponibilidad
  const loadAvailability = async (specificService?: string) => {
    setIsLoadingDates(true)
    const newCache: Record<string, boolean> = { ...availabilityCache }

    // Generar fechas para los próximos 15 días laborables
    const datesToCheck: string[] = []
    const now = new Date()
    const today8AM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      8,
      10,
      0
    )

    // Determinar desde qué día empezar
    let startDay = 0 // Empezar desde hoy
    if (now >= today8AM) {
      startDay = 1 // Empezar desde mañana
    }

    for (let i = startDay; i < 15; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)

      // Solo verificar días laborables
      const day = date.getDay()
      if (day >= 1 && day <= 5) {
        // Lunes a viernes
        const dateString = date.toISOString().split('T')[0]
        datesToCheck.push(dateString)
      }
    }

    try {
      const availabilityPromises: Promise<{
        dateString: string
        service: string
        available: boolean
      }>[] = []

      // Si se especifica un servicio específico, solo cargar ese
      if (specificService) {
        // Verificar cada fecha individualmente
        datesToCheck.forEach(dateString => {
          availabilityPromises.push(
            checkAvailability(dateString, specificService)
              .then(result => ({
                dateString,
                service: specificService,
                available: result.available,
              }))
              .catch(() => ({
                dateString,
                service: specificService,
                available: false,
              }))
          )
        })
      } else {
        // Para cada fecha, verificar todos los servicios que requieren fecha
        datesToCheck.forEach(dateString => {
          const servicesRequiringDate = ['Diagnóstico']
          servicesRequiringDate.forEach(service => {
            availabilityPromises.push(
              checkAvailability(dateString, service)
                .then(result => ({
                  dateString,
                  service,
                  available: result.available,
                }))
                .catch(() => ({ dateString, service, available: false }))
            )
          })
        })

        // Para cada fecha, verificar todos los sub-servicios de caja automática
        datesToCheck.forEach(dateString => {
          const cajaAutomaticaSubServices = [
            'Service de mantenimiento',
            'Diagnóstico de caja',
            'Reparación de fugas',
            'Cambio de solenoides',
            'Overhaul completo',
            'Reparaciones mayores',
          ]
          cajaAutomaticaSubServices.forEach(service => {
            availabilityPromises.push(
              checkAvailability(dateString, service)
                .then(result => ({
                  dateString,
                  service,
                  available: result.available,
                }))
                .catch(() => ({ dateString, service, available: false }))
            )
          })
        })
      }

      const results = await Promise.all(availabilityPromises)

      // Guardar resultados en cache usando una clave compuesta
      results.forEach(({ dateString, service, available }) => {
        const cacheKey = `${dateString}-${service}`
        newCache[cacheKey] = available
      })
    } catch (error) {
      console.error('Error loading availability:', error)
    }

    setAvailabilityCache(newCache)
    setIsLoadingDates(false)
  }

  // Precargar disponibilidad cuando se monta el componente
  useEffect(() => {
    loadAvailability()
  }, []) // Se ejecuta solo al montar el componente

  // Recargar disponibilidad cuando cambie el servicio principal
  useEffect(() => {
    if (formData.service === 'Diagnóstico') {
      loadAvailability('Diagnóstico')
    } else if (formData.service === 'Caja automática' && formData.subService) {
      loadAvailability(formData.subService)
    } else {
      // Para otros servicios, limpiar cache
      setAvailabilityCache({})
    }
  }, [formData.service, formData.subService])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Si se cambia el servicio, limpiar sub-servicio si no es caja automática
    if (name === 'service' && value !== 'Caja automática') {
      setFormData(prev => ({
        ...prev,
        subService: '',
      }))
    }
  }

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      date: date,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: '' })

    // Validación básica
    if (
      !formData.name ||
      !formData.phone ||
      !formData.vehicle ||
      !formData.service
    ) {
      setStatus({
        type: 'error',
        message: 'Por favor, completa los campos obligatorios.',
      })
      setIsLoading(false)
      return
    }

    // Validación específica para servicios que requieren fecha
    const servicesRequiringDate = [
      'Diagnóstico',
      'Overhaul completo',
      'Reparaciones mayores',
    ]
    const serviceToCheck =
      formData.service === 'Caja automática' && formData.subService
        ? formData.subService
        : formData.service

    if (servicesRequiringDate.includes(serviceToCheck) && !formData.date) {
      setStatus({
        type: 'error',
        message: `Para el servicio de ${serviceToCheck} debes seleccionar una fecha.`,
      })
      setIsLoading(false)
      return
    }

    // Validación específica para caja automática
    if (formData.service === 'Caja automática' && !formData.subService) {
      setStatus({
        type: 'error',
        message:
          'Para el servicio de Caja automática debes seleccionar el tipo de servicio.',
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await createTurno(formData)

      if (result.success) {
        setShowSuccessModal(true)
        // Limpiar el formulario
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicle: '',
          service: '',
          subService: '',
          date: null,
          time: '',
          message: '',
        })
        // Limpiar cache de disponibilidad
        setAvailabilityCache({})
      } else {
        setStatus({
          type: 'error',
          message: result.message,
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error al enviar la solicitud. Intenta nuevamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleNewTurno = () => {
    setShowSuccessModal(false)
    setStatus({ type: null, message: '' })
  }

  return (
    <>
      <section className='py-20 bg-gray-900'>
        <motion.div
          ref={sectionRef}
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isSectionInView ? 'visible' : 'hidden'}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
        >
          <motion.div
            variants={animations.fadeInUp}
            className='text-center mb-12'
          >
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              Solicita tu <span className='text-red-600'>Turno</span>
            </h2>
            <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
              Completa el formulario y nos pondremos en contacto contigo para
              confirmar tu cita.
            </p>
          </motion.div>

          <motion.div
            variants={animations.fadeInUp}
            className='bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700'
          >
            <form onSubmit={handleSubmit} className='space-y-6'>
              <FormFields
                formData={formData}
                availabilityCache={availabilityCache}
                isLoadingDates={isLoadingDates}
                onFieldChange={handleChange}
                onDateChange={handleDateChange}
              />

              {/* Mensaje adicional */}
              <div>
                <label
                  htmlFor='message'
                  className='block text-sm font-medium text-gray-300 mb-2'
                >
                  Mensaje adicional
                </label>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  placeholder='Describe el problema o servicio específico que necesitas...'
                />
              </div>

              {/* Estado del formulario */}
              {status.type && (
                <div
                  className={`p-4 rounded-lg ${
                    status.type === 'success'
                      ? 'bg-green-900 border border-green-700 text-green-300'
                      : 'bg-red-900 border border-red-700 text-red-300'
                  }`}
                >
                  {status.message}
                </div>
              )}

              {/* Botón de envío */}
              <div className='text-center'>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Enviando...' : 'Solicitar Turno'}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Información adicional */}
          <motion.div
            variants={animations.fadeInUp}
            className='mt-8 text-center space-y-4'
          >
            <p className='text-gray-400 text-sm'>
              Horarios de atención: Lunes a Viernes de 8:00 a 16:00
            </p>
          </motion.div>
        </motion.div>

        <DatePickerStyles />
      </section>

      <SuccessModal
        isOpen={showSuccessModal}
        onGoHome={handleGoHome}
        onNewTurno={handleNewTurno}
      />
    </>
  )
}
