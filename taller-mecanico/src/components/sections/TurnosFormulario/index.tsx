'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import { animations } from '@/lib/animations'
import { createTurno, checkAvailability } from '@/actions/turnos'
import { TurnoInput, ServiceConfig } from '../../../actions/types/types'
import { useRouter } from 'next/navigation'
import FormFields from './FormFields'
import MobileInputStyles from './MobileInputStyles'
import SuccessModal from './SuccessModal'
import DatePickerStyles from './DatePickerStyles'
import { getAllServiceConfigs } from '@/actions/serviceconfig' // Nueva importación

export default function TurnosFormulario() {
  const router = useRouter()
  const [formData, setFormData] = useState<TurnoInput>({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: '',
    subService: '',
    date: null,
    time: '',
    message: '',
    cancelToken: '',
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
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]) // Nueva state

  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  // Cargar configuraciones de servicios
  const loadServiceConfigs = async () => {
    try {
      console.log(
        '🔥 Firebase Status Check - Intentando conectar a Firebase para cargar configuraciones de servicios...'
      )
      const configs = await getAllServiceConfigs()
      setServiceConfigs(configs)
      console.log(
        '✅ Firebase Status Check - Firebase funcionando correctamente. Configuraciones cargadas:',
        configs.length
      )
    } catch (error) {
      console.error(
        '❌ Firebase Status Check - Error conectando a Firebase:',
        error
      )
      console.error(
        '❌ Firebase Status Check - Firebase NO está funcionando correctamente'
      )
    }
  }

  // Obtener configuración de un servicio específico
  const getServiceConfig = (serviceName: string): ServiceConfig | null => {
    return (
      serviceConfigs.find(config => config.serviceName === serviceName) || null
    )
  }

  // Función para generar fecha local consistente (evita problemas de zona horaria)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función para cargar disponibilidad
  const loadAvailability = useCallback(async (specificService?: string) => {
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

      // Solo verificar días laborables (lunes a viernes por defecto, pero cada servicio puede tener sus propios días)
      const day = date.getDay()
      if (day >= 1 && day <= 5) {
        const dateString = getLocalDateString(date) // Usar función local consistente
        datesToCheck.push(dateString)
      }
    }

    try {
      console.log(
        '🔥 Firebase Status Check - Verificando disponibilidad en Firebase...'
      )
      const availabilityPromises: Promise<{
        dateString: string
        service: string
        available: boolean
      }>[] = []

      // Si se especifica un servicio específico, solo cargar ese
      if (specificService) {
        datesToCheck.forEach(dateString => {
          availabilityPromises.push(
            checkAvailability(dateString, specificService)
              .then(result => {
                return {
                  dateString,
                  service: specificService,
                  available: result.available,
                }
              })
              .catch(error => {
                console.error(`❌ Error para ${dateString}:`, error)
                return {
                  dateString,
                  service: specificService,
                  available: false,
                }
              })
          )
        })
      } else {
        // Para cada fecha, verificar todos los servicios que requieren fecha
        datesToCheck.forEach(dateString => {
          const servicesRequiringDate = [
            'Diagnóstico',
            'Revisación técnica',
            'Otro',
          ]
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

        // Para cada fecha, verificar todos los sub-servicios de mecánica general
        datesToCheck.forEach(dateString => {
          const mecanicaGeneralSubServices = [
            'Correa de distribución',
            'Frenos',
            'Embrague',
            'Suspensión',
            'Motor',
            'Bujías / Inyectores',
            'Batería',
            'Ruidos o vibraciones',
            'Mantenimiento general',
            'Dirección',
            'Otro / No estoy seguro',
          ]
          mecanicaGeneralSubServices.forEach(service => {
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
      results.forEach(result => {
        const key = `${result.dateString}-${result.service}`
        newCache[key] = result.available
      })

      setAvailabilityCache(newCache)
      console.log(
        '✅ Firebase Status Check - Disponibilidad cargada correctamente desde Firebase'
      )
    } catch (error) {
      console.error(
        '❌ Firebase Status Check - Error cargando disponibilidad desde Firebase:',
        error
      )
      console.error(
        '❌ Firebase Status Check - Firebase NO está funcionando correctamente para disponibilidad'
      )
    } finally {
      setIsLoadingDates(false)
    }
  }, [])

  // Cargar configuraciones y disponibilidad al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      await loadServiceConfigs()
      await loadAvailability()
    }
    initializeData()
  }, [loadAvailability])

  // Recargar disponibilidad cuando cambie el servicio principal
  useEffect(() => {
    if (formData.service === 'Diagnóstico') {
      loadAvailability('Diagnóstico')
    } else if (formData.service === 'Revisación técnica') {
      loadAvailability('Revisación técnica')
    } else if (formData.service === 'Otro') {
      loadAvailability('Otro')
    } else if (
      (formData.service === 'Caja automática' ||
        formData.service === 'Mecánica general') &&
      formData.subService
    ) {
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

    // Si se cambia el servicio, limpiar sub-servicio si no es caja automática o mecánica general
    if (
      name === 'service' &&
      value !== 'Caja automática' &&
      value !== 'Mecánica general'
    ) {
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

    console.log(
      '🔥 Firebase Status Check - Intentando crear turno en Firebase...'
    )
    try {
      // Validación básica - Solo servicio obligatorio para testing
      if (!formData.service) {
        setStatus({
          type: 'error',
          message: 'Por favor, selecciona un servicio.',
        })
        setIsLoading(false)
        return
      }

      if (formData.service === 'Programación de módulos') {
        setStatus({
          type: 'success',
          message:
            'Gracias por tu interés. Te recomendamos contactarnos por WhatsApp para coordinar este servicio de manera más eficiente.',
        })
        setIsLoading(false)
        return
      }

      const servicesRequiringDate = [
        'Diagnóstico',
        'Revisación técnica',
        'Otro',
        'Overhaul completo',
        'Reparaciones mayores',
        'Cambio de embrague',
        'Reparación de motor',
      ]
      const serviceToCheck =
        (formData.service === 'Caja automática' ||
          formData.service === 'Mecánica general') &&
        formData.subService
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

      if (formData.service === 'Caja automática' && !formData.subService) {
        setStatus({
          type: 'error',
          message:
            'Para el servicio de Caja automática debes seleccionar el tipo de servicio.',
        })
        setIsLoading(false)
        return
      }

      if (formData.service === 'Mecánica general' && !formData.subService) {
        setStatus({
          type: 'error',
          message:
            'Para el servicio de Mecánica general debes seleccionar el tipo de servicio.',
        })
        setIsLoading(false)
        return
      }

      try {
        const result = await createTurno(formData)
        console.log(
          '✅ Firebase Status Check - Turno creado exitosamente en Firebase'
        )

        if (result.success) {
          setShowSuccessModal(true)
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
            cancelToken: '',
          })
          setAvailabilityCache({})
        } else {
          setStatus({
            type: 'error',
            message: result.message,
          })
        }
      } catch (error) {
        console.error(
          '❌ Firebase Status Check - Error creando turno en Firebase:',
          error
        )
        setStatus({
          type: 'error',
          message:
            'Error al enviar el turno. Por favor, intenta nuevamente o contacta por teléfono.',
        })
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ Error general en handleSubmit:', error)
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
      {/* Formulario Section */}
      <section className='py-20 bg-gray-900 overflow-x-hidden'>
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
              <MobileInputStyles />
              <FormFields
                formData={formData}
                availabilityCache={availabilityCache}
                isLoadingDates={isLoadingDates}
                onFieldChange={handleChange}
                onDateChange={handleDateChange}
                getServiceConfig={getServiceConfig} // Pasar función para obtener configuración
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
        //  onNewTurno={handleNewTurno}
      />
    </>
  )
}
