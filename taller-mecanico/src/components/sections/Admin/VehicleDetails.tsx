import { motion, AnimatePresence } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'
import React, { useState } from 'react'
import { updateVehicle } from '@/actions/admin'

interface VehicleDetailsProps {
  vehicle: VehicleInTracking
  onClose: () => void
  onEdit: () => void
  onDeleteVehicle?: () => void
  onAddStep: () => void
  onEditStep: (step: any) => void
  onDeleteStep: (id: string) => void
  setVehiclesInTracking: any
}

export default function VehicleDetails({
  vehicle,
  onClose,
  onEdit,
  onDeleteVehicle,
  onAddStep,
  onEditStep,
  onDeleteStep,
  setVehiclesInTracking,
}: VehicleDetailsProps) {
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-xl p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">
            {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-400">Cliente:</span>{' '}
              <span className="text-white ml-2">{vehicle.clientName}</span>
            </div>
            <div>
              <span className="text-gray-400">Teléfono:</span>{' '}
              <span className="text-white ml-2">{vehicle.clientPhone}</span>
            </div>
            <div>
              <span className="text-gray-400">Servicio:</span>{' '}
              <span className="text-white ml-2">{vehicle.serviceType}</span>
            </div>
            <div>
              <span className="text-gray-400">Costo:</span>{' '}
              <span className="text-white ml-2">${vehicle.totalCost?.toLocaleString()}</span>
            </div>
          </div>

          {/* Edición inline de trabajos realizados, próximo paso y fecha estimada */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-4">
            <div>
              <label className="block text-gray-300 text-xs mb-1">
                Trabajos realizados / Notas
              </label>
              <textarea
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white resize-none"
                rows={2}
                value={vehicle.notes || ''}
                onChange={e =>
                  setVehiclesInTracking((prev: VehicleInTracking[]) =>
                    prev.map(v =>
                      v.id === vehicle.id ? { ...v, notes: e.target.value } : v
                    )
                  )
                }
                placeholder="Detalle de trabajos realizados o notas generales..."
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-300 text-xs mb-1">
                  Próximo paso
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  value={vehicle.nextStep || ''}
                  onChange={e =>
                    setVehiclesInTracking((prev: VehicleInTracking[]) =>
                      prev.map(v =>
                        v.id === vehicle.id ? { ...v, nextStep: e.target.value } : v
                      )
                    )
                  }
                  placeholder="Ej: Esperar repuesto, Llamar cliente, etc."
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 text-xs mb-1">
                  Fecha estimada de finalización
                </label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  value={vehicle.estimatedCompletionDate ? new Date(vehicle.estimatedCompletionDate).toISOString().substring(0, 10) : ''}
                  onChange={e =>
                    setVehiclesInTracking((prev: VehicleInTracking[]) =>
                      prev.map(v =>
                        v.id === vehicle.id
                          ? {
                              ...v,
                              estimatedCompletionDate: e.target.value ? new Date(e.target.value) : undefined,
                            }
                          : v
                      )
                    )
                  }
                />
              </div>
            </div>
            <button
              className="self-end mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={async () => {
                setSaving(true);
                setSaveMsg('');
                try {
                  const response = await updateVehicle(vehicle.plateNumber, {
                    notes: vehicle.notes,
                    nextStep: vehicle.nextStep,
                    estimatedCompletionDate: vehicle.estimatedCompletionDate || undefined,
                  });
                  if (response.success) {
                    setSaveMsg('Guardado exitosamente');
                    setTimeout(() => setSaveMsg(''), 2000);
                  } else {
                    setSaveMsg(response.message || 'Error al guardar');
                  }
                } catch (err) {
                  setSaveMsg('Error de conexión');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {saveMsg && <span className="text-xs text-green-300 mt-1">{saveMsg}</span>}
              <div className="flex-1">
                <label className="block text-gray-300 text-xs mb-1">
                  Próximo paso
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  value={vehicle.nextStep || ''}
                  onChange={e =>
                    setVehiclesInTracking((prev: VehicleInTracking[]) =>
                      prev.map(v =>
                        v.id === vehicle.id ? { ...v, nextStep: e.target.value } : v
                      )
                    )
                  }
                  placeholder="Ej: Esperar repuesto, Llamar cliente, etc."
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 text-xs mb-1">
                  Fecha estimada de finalización
                </label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  value={vehicle.estimatedCompletionDate ? new Date(vehicle.estimatedCompletionDate).toISOString().substring(0, 10) : ''}
                  onChange={e =>
                    setVehiclesInTracking((prev: VehicleInTracking[]) =>
                      prev.map(v =>
                        v.id === vehicle.id
                          ? {
                              ...v,
                              estimatedCompletionDate: e.target.value ? new Date(e.target.value) : undefined,
                            }
                          : v
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
          >
            ✎ Editar
          </button>
          {onDeleteVehicle && (
            <button
              onClick={onDeleteVehicle}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      {/* Timeline de pasos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-white">Progreso del Trabajo</h4>
          <button
            onClick={onAddStep}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            ➕ Agregar Paso
          </button>
        </div>
        {vehicle.steps.map((step, index) => (
          <div key={step.id} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'in-progress'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              />
              {index < vehicle.steps.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-600 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-white">{step.title}</h5>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditStep(step)}
                    className="text-yellow-400 hover:text-yellow-300 text-lg"
                    title="Editar paso"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDeleteStep(step.id)}
                    className="text-red-500 hover:text-red-400 text-lg"
                    title="Eliminar paso"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-2">{step.description}</p>
              {step.notes && <p className="text-gray-400 text-xs">{step.notes}</p>}
              {step.startDate && (
                <p className="text-gray-500 text-xs mt-1">{new Date(step.startDate).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
    </>
  )
}
