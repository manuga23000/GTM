'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface LoadingScreenProps {
  onLoadingComplete: () => void
  duration?: number
}

export default function LoadingScreen({
  onLoadingComplete,
  duration = 3000,
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    document.body.classList.add('loading')

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateProgress = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)

      setProgress(newProgress)

      if (currentTime < endTime) {
        requestAnimationFrame(updateProgress)
      } else {
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            document.body.classList.remove('loading')
            onLoadingComplete()
          }, 500)
        }, 200)
      }
    }

    requestAnimationFrame(updateProgress)

    return () => {
      document.body.classList.remove('loading')
    }
  }, [duration, onLoadingComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black'
        >
          <div className='flex flex-col items-center space-y-8'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: 0.2,
              }}
              className='relative'
            >
              <Image
                src='/images/header/LOGO GTM.png'
                alt='GTM Logo'
                width={200}
                height={80}
                className='object-contain'
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: 0.5,
              }}
              className='text-center'
            >
              <h2 className='text-2xl font-bold text-white mb-2 font-montserrat'>
                Cargando...
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: 0.8,
              }}
              className='w-64 h-2 bg-gray-800 rounded-full overflow-hidden'
            >
              <motion.div
                className='h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.1,
                  ease: 'linear',
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: 1.0,
              }}
              className='text-center'
            >
              <span className='text-red-500 font-bold text-lg font-montserrat'>
                {Math.round(progress)}%
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1,
                ease: 'easeOut',
                delay: 1.2,
              }}
              className='flex space-x-2'
            >
              {[0, 1, 2].map(index => (
                <motion.div
                  key={index}
                  className='w-2 h-2 bg-red-500 rounded-full'
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
