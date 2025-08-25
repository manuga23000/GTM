import { useEffect } from 'react'

interface ScrollLock {
  id: string
  priority: number
}

class ScrollManager {
  private locks: ScrollLock[] = []
  private originalScrollY = 0
  private originalStyles = {
    bodyOverflow: '',
    bodyPosition: '',
    bodyTop: '',
    bodyWidth: '',
    bodyPaddingRight: '',
    htmlOverflow: '',
  }

  addLock(id: string, priority: number = 0) {
    // Remover lock existente del mismo ID
    this.removeLock(id)

    // Agregar nuevo lock
    this.locks.push({ id, priority })
    this.locks.sort((a, b) => b.priority - a.priority)

    if (this.locks.length === 1) {
      this.enableScrollLock()
    }
  }

  removeLock(id: string) {
    const index = this.locks.findIndex(lock => lock.id === id)
    if (index > -1) {
      this.locks.splice(index, 1)

      if (this.locks.length === 0) {
        this.disableScrollLock()
      }
    }
  }

  private enableScrollLock() {
    // Guardar posición actual
    this.originalScrollY = window.scrollY

    // Guardar estilos originales
    const bodyStyle = window.getComputedStyle(document.body)
    const htmlStyle = window.getComputedStyle(document.documentElement)

    this.originalStyles = {
      bodyOverflow: bodyStyle.overflow,
      bodyPosition: bodyStyle.position,
      bodyTop: bodyStyle.top,
      bodyWidth: bodyStyle.width,
      bodyPaddingRight: bodyStyle.paddingRight,
      htmlOverflow: htmlStyle.overflow,
    }

    // Calcular ancho del scrollbar
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth

    // Aplicar lock
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollBarWidth}px`
    document.documentElement.style.overflow = 'hidden'

    // Remover clases conflictivas
    document.body.classList.remove('loading')

 
  }

  private disableScrollLock() {
    // Restaurar estilos
    document.body.style.overflow = this.originalStyles.bodyOverflow
    document.body.style.paddingRight = this.originalStyles.bodyPaddingRight
    document.documentElement.style.overflow = this.originalStyles.htmlOverflow


  }

  hasLocks(): boolean {
    return this.locks.length > 0
  }

  getLocks(): ScrollLock[] {
    return [...this.locks]
  }

  // Método para debug
  getStatus() {
    return {
      hasLocks: this.hasLocks(),
      locks: this.getLocks(),
      activeCount: this.locks.length,
    }
  }
}

// Singleton global
const scrollManager = new ScrollManager()

// Hook principal para usar en componentes
export const useScrollLock = (
  id: string,
  isActive: boolean,
  priority: number = 0
) => {
  useEffect(() => {
    if (isActive) {
      scrollManager.addLock(id, priority)
    } else {
      scrollManager.removeLock(id)
    }

    return () => {
      scrollManager.removeLock(id)
    }
  }, [id, isActive, priority])
}

// Hook para debug (opcional)
export const useScrollManagerDebug = () => {
  return scrollManager.getStatus()
}

export default scrollManager
