import { AnimatePresence, motion } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'
import React from 'react'

interface VehicleModalProps {
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: any
  setNewVehicle: (v: any) => void
  handleAddVehicle: () => void
  showEditVehicleModal: boolean
  setShowEditVehicleModal: (show: boolean) => void
  editVehicle: VehicleInTracking | null
  setEditVehicle: (v: VehicleInTracking | null | ((v: VehicleInTracking | null) => VehicleInTracking | null)) => void
  handleSaveVehicleEdit: () => void
  showStepModal: boolean
  setShowStepModal: (show: boolean) => void
  editStep: any
  setEditStep: (s: any) => void
  handleSaveStep: () => void
  handleDeleteStep: (id: string) => void
}

export default function VehicleModal({
  showAddForm,
  setShowAddForm,
  newVehicle,
  setNewVehicle,
  handleAddVehicle,
  showEditVehicleModal,
  setShowEditVehicleModal,
  editVehicle,
  setEditVehicle,
  handleSaveVehicleEdit,
  showStepModal,
  setShowStepModal,
  editStep,
  setEditStep,
  handleSaveStep,
  handleDeleteStep,
}: VehicleModalProps) {
  return (
    <>
      {/* Modal alta */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Nuevo Vehículo</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Patente *"
                  value={newVehicle.plateNumber}
                  onChange={e =>
                    setNewVehicle((prev: any) => ({
                      ...prev,
                      plateNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Marca"
                    value={newVehicle.brand}
                    onChange={e =>
                      setNewVehicle((prev: any) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Modelo"
                    value={newVehicle.model}
                    onChange={e =>
                      setNewVehicle((prev: any) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cliente *"
                  value={newVehicle.clientName}
                  onChange={e =>
                    setNewVehicle((prev: any) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={newVehicle.clientPhone}
                  onChange={e =>
                    setNewVehicle((prev: any) => ({
                      ...prev,
                      clientPhone: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Tipo de servicio"
                  value={newVehicle.serviceType}
                  onChange={e =>
                    setNewVehicle((prev: any) => ({
                      ...prev,
                      serviceType: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal edición */}
      <AnimatePresence>
        {showEditVehicleModal && editVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Editar Vehículo</h3>
                <button
                  onClick={() => setShowEditVehicleModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Patente *"
                  value={editVehicle.plateNumber}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, plateNumber: e.target.value.toUpperCase() } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Marca"
                    value={editVehicle.brand}
                    onChange={e =>
                      setEditVehicle((v: any) =>
                        v ? { ...v, brand: e.target.value } : v
                      )
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Modelo"
                    value={editVehicle.model}
                    onChange={e =>
                      setEditVehicle((v: any) =>
                        v ? { ...v, model: e.target.value } : v
                      )
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cliente *"
                  value={editVehicle.clientName}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, clientName: e.target.value } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={editVehicle.clientPhone}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, clientPhone: e.target.value } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Tipo de servicio"
                  value={editVehicle.serviceType}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, serviceType: e.target.value } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Año"
                  value={editVehicle.year}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v
                        ? {
                            ...v,
                            year: parseInt(e.target.value) || new Date().getFullYear(),
                          }
                        : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Costo total"
                  value={editVehicle.totalCost || ''}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, totalCost: parseInt(e.target.value) || undefined } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <textarea
                  placeholder="Notas"
                  value={editVehicle.notes}
                  onChange={e =>
                    setEditVehicle((v: any) =>
                      v ? { ...v, notes: e.target.value } : v
                    )
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEditVehicleModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVehicleEdit}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal agregar/editar paso */}
      <AnimatePresence>
        {showStepModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editStep.step ? 'Editar Paso' : 'Agregar Paso'}
                </h3>
                <button
                  onClick={() => setShowStepModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título *"
                  value={editStep.step?.title || ''}
                  onChange={e =>
                    setEditStep((s: any) => ({
                      ...s,
                      step: {
                        ...s.step,
                        title: e.target.value,
                        id: s.step?.id || '',
                        status: s.step?.status || 'pending',
                        description: s.step?.description || '',
                        notes: s.step?.notes || '',
                      },
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <textarea
                  placeholder="Descripción"
                  value={editStep.step?.description || ''}
                  onChange={e =>
                    setEditStep((s: any) => ({
                      ...s,
                      step: {
                        ...s.step,
                        description: e.target.value,
                        id: s.step?.id || '',
                        status: s.step?.status || 'pending',
                        title: s.step?.title || '',
                        notes: s.step?.notes || '',
                      },
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20"
                />
                <textarea
                  placeholder="Notas"
                  value={editStep.step?.notes || ''}
                  onChange={e =>
                    setEditStep((s: any) => ({
                      ...s,
                      step: {
                        ...s.step,
                        notes: e.target.value,
                        id: s.step?.id || '',
                        status: s.step?.status || 'pending',
                        title: s.step?.title || '',
                        description: s.step?.description || '',
                      },
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-16"
                />
                <select
                  value={editStep.step?.status || 'pending'}
                  onChange={e =>
                    setEditStep((s: any) => ({
                      ...s,
                      step: {
                        ...s.step,
                        status: e.target.value,
                        id: s.step?.id || '',
                        title: s.step?.title || '',
                        description: s.step?.description || '',
                        notes: s.step?.notes || '',
                      },
                    }))
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En proceso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowStepModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveStep}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
