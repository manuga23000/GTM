export const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  },

  hoverScale: {
    scale: 1.05,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },

  hoverLift: {
    y: -8,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },

  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },

  buttonTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },

  textGlow: {
    textShadow: '0px 0px 12px rgb(239, 68, 68)',
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },

  float: {
    y: [-4, 4, -4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },

  gentleRotate: {
    rotate: [-2, 2, -2],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },

  listItemVariants: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  cardVariants: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  },

  inViewOptions: {
    once: true,
    margin: '-100px',
    amount: 0.3,
  },
}

export const createStaggerAnimation = (
  staggerDelay = 0.3,
  baseDelay = 0.2
) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: baseDelay,
    },
  },
})

export const createFadeInAnimation = (direction = 'up', duration = 0.8) => {
  const baseAnimation: {
    hidden: { opacity: number; y?: number; x?: number }
    visible: {
      opacity: number
      y?: number
      x?: number
      transition: { duration: number; ease: string }
    }
  } = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration, ease: 'easeOut' as const },
    },
  }

  switch (direction) {
    case 'up':
      baseAnimation.hidden.y = 40
      baseAnimation.visible.y = 0
      break
    case 'down':
      baseAnimation.hidden.y = -40
      baseAnimation.visible.y = 0
      break
    case 'left':
      baseAnimation.hidden.x = -40
      baseAnimation.visible.x = 0
      break
    case 'right':
      baseAnimation.hidden.x = 40
      baseAnimation.visible.x = 0
      break
  }

  return baseAnimation
}
