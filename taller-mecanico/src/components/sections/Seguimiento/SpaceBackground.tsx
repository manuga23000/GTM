'use client'

const STARS_DESKTOP = [
  { x: 3, y: 7, size: 1, opacity: 0.35 },
  { x: 12, y: 4, size: 1.5, opacity: 0.5, twinkle: true, delay: 0 },
  { x: 8, y: 18, size: 1, opacity: 0.25 },
  { x: 22, y: 11, size: 1.5, opacity: 0.6 },
  { x: 31, y: 3, size: 1, opacity: 0.4 },
  { x: 27, y: 22, size: 2, opacity: 0.45, twinkle: true, delay: 2.3 },
  { x: 41, y: 8, size: 1, opacity: 0.3 },
  { x: 37, y: 29, size: 1.5, opacity: 0.55 },
  { x: 48, y: 5, size: 1, opacity: 0.35 },
  { x: 55, y: 14, size: 1.5, opacity: 0.4 },
  { x: 52, y: 31, size: 1, opacity: 0.5, twinkle: true, delay: 4.1 },
  { x: 63, y: 9, size: 2, opacity: 0.3 },
  { x: 59, y: 24, size: 1, opacity: 0.45 },
  { x: 71, y: 6, size: 1.5, opacity: 0.55 },
  { x: 68, y: 19, size: 1, opacity: 0.35, twinkle: true, delay: 1.7 },
  { x: 77, y: 12, size: 1, opacity: 0.4 },
  { x: 83, y: 3, size: 1.5, opacity: 0.5 },
  { x: 79, y: 27, size: 1, opacity: 0.3 },
  { x: 88, y: 16, size: 2, opacity: 0.45, twinkle: true, delay: 5.5 },
  { x: 92, y: 8, size: 1, opacity: 0.35 },
  { x: 95, y: 21, size: 1.5, opacity: 0.55 },
  { x: 15, y: 35, size: 1, opacity: 0.4 },
  { x: 6, y: 42, size: 1.5, opacity: 0.3, twinkle: true, delay: 3.2 },
  { x: 25, y: 47, size: 1, opacity: 0.5 },
  { x: 34, y: 39, size: 2, opacity: 0.35 },
  { x: 43, y: 52, size: 1, opacity: 0.45 },
  { x: 57, y: 44, size: 1.5, opacity: 0.3, twinkle: true, delay: 6.8 },
  { x: 66, y: 38, size: 1, opacity: 0.55 },
  { x: 74, y: 48, size: 1.5, opacity: 0.4 },
  { x: 82, y: 36, size: 1, opacity: 0.25 },
  { x: 91, y: 43, size: 2, opacity: 0.5, twinkle: true, delay: 0.9 },
  { x: 18, y: 58, size: 1, opacity: 0.35 },
  { x: 46, y: 63, size: 1.5, opacity: 0.45 },
  { x: 73, y: 56, size: 1, opacity: 0.3 },
  { x: 38, y: 71, size: 1, opacity: 0.4, twinkle: true, delay: 7.2 },
  { x: 86, y: 67, size: 1.5, opacity: 0.5 },
  { x: 10, y: 76, size: 1, opacity: 0.35 },
  { x: 61, y: 74, size: 2, opacity: 0.3 },
]

const STARS_MOBILE = [
  { x: 5, y: 6, size: 1, opacity: 0.4 },
  { x: 18, y: 12, size: 1.5, opacity: 0.5, twinkle: true, delay: 0 },
  { x: 32, y: 4, size: 1, opacity: 0.3 },
  { x: 45, y: 17, size: 1, opacity: 0.55 },
  { x: 61, y: 8, size: 1.5, opacity: 0.35, twinkle: true, delay: 2.8 },
  { x: 78, y: 14, size: 1, opacity: 0.45 },
  { x: 91, y: 6, size: 2, opacity: 0.3 },
  { x: 11, y: 28, size: 1, opacity: 0.4, twinkle: true, delay: 5.1 },
  { x: 38, y: 33, size: 1.5, opacity: 0.5 },
  { x: 55, y: 25, size: 1, opacity: 0.35 },
  { x: 72, y: 31, size: 1, opacity: 0.45 },
  { x: 88, y: 22, size: 1.5, opacity: 0.3, twinkle: true, delay: 7.4 },
  { x: 24, y: 46, size: 1, opacity: 0.4 },
  { x: 50, y: 52, size: 1.5, opacity: 0.55 },
  { x: 67, y: 44, size: 1, opacity: 0.3 },
  { x: 83, y: 50, size: 2, opacity: 0.45, twinkle: true, delay: 3.6 },
  { x: 15, y: 65, size: 1, opacity: 0.35 },
  { x: 42, y: 71, size: 1, opacity: 0.5 },
]

export default function SpaceBackground() {
  return (
    <div
      className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'
      aria-hidden='true'
      style={{
        background: 'linear-gradient(145deg, #05030a 0%, #0d0618 60%, #05030a 100%)',
      }}
    >
      {/* Corner tint */}
      <div
        className='absolute top-0 right-0 w-[60%] h-[50%]'
        style={{
          background: 'radial-gradient(ellipse at 85% 15%, #1a0b2e 0%, transparent 65%)',
          opacity: 0.5,
        }}
      />

      {/* Nebula 1 — large violet, top-left area */}
      <div
        className='absolute motion-reduce:!animate-none'
        style={{
          left: '10%',
          top: '15%',
          width: '45vw',
          height: '40vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, #6d28d9 0%, transparent 70%)',
          filter: 'blur(120px)',
          opacity: 0.14,
          animation: 'nebulaDrift1 55s ease-in-out infinite',
        }}
      />

      {/* Nebula 2 — indigo, center-right */}
      <div
        className='absolute motion-reduce:!animate-none'
        style={{
          right: '5%',
          top: '40%',
          width: '40vw',
          height: '35vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, #4338ca 0%, transparent 70%)',
          filter: 'blur(130px)',
          opacity: 0.12,
          animation: 'nebulaDrift2 48s ease-in-out infinite',
        }}
      />

      {/* Nebula 3 — desktop only, small violet accent bottom */}
      <div
        className='absolute hidden sm:block motion-reduce:!animate-none'
        style={{
          left: '35%',
          bottom: '10%',
          width: '35vw',
          height: '30vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, #6d28d9 0%, transparent 70%)',
          filter: 'blur(140px)',
          opacity: 0.10,
          animation: 'nebulaDrift3 60s ease-in-out infinite',
        }}
      />

      {/* Light sweep — diagonal pass */}
      <div
        className='absolute inset-0 motion-reduce:!hidden'
        style={{ overflow: 'hidden' }}
      >
        <div
          className='absolute motion-reduce:!animate-none'
          style={{
            width: '120%',
            height: '200px',
            top: '30%',
            left: '-20%',
            background: 'linear-gradient(90deg, transparent 0%, #c4b5fd 40%, #c4b5fd 60%, transparent 100%)',
            filter: 'blur(80px)',
            opacity: 0.08,
            transform: 'rotate(-25deg) translateX(-100%)',
            animation: 'lightSweep 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* Stars — desktop */}
      <div className='hidden sm:block'>
        {STARS_DESKTOP.map((star, i) => (
          <div
            key={`sd-${i}`}
            className={star.twinkle ? 'motion-reduce:!animate-none' : undefined}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: '#e0d4f5',
              opacity: star.opacity,
              ...(star.twinkle
                ? {
                    animation: `starTwinkle ${4 + (star.delay || 0) * 0.5}s ease-in-out ${star.delay || 0}s infinite`,
                  }
                : {}),
            }}
          />
        ))}
      </div>

      {/* Stars — mobile */}
      <div className='block sm:hidden'>
        {STARS_MOBILE.map((star, i) => (
          <div
            key={`sm-${i}`}
            className={star.twinkle ? 'motion-reduce:!animate-none' : undefined}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: '#e0d4f5',
              opacity: star.opacity,
              ...(star.twinkle
                ? {
                    animation: `starTwinkle ${4 + (star.delay || 0) * 0.5}s ease-in-out ${star.delay || 0}s infinite`,
                  }
                : {}),
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className='absolute inset-0'
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, transparent 40%, #05030a 100%)',
        }}
      />
    </div>
  )
}
