import Button from './Button'

interface ServiceCardProps {
  icon: string
  title: string
  items: string[]
  onViewDetails?: () => void
}

export default function ServiceCard({
  icon,
  title,
  items,
  onViewDetails,
}: ServiceCardProps) {
  return (
    <div className='bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-red-500 transition-all duration-300 group cursor-pointer'>
      <div className='text-center mb-6'>
        <div className='text-4xl mb-4'>{icon}</div>
        <h3 className='text-2xl font-bold text-white group-hover:text-red-500 transition-colors'>
          {title}
        </h3>
      </div>

      <ul className='space-y-3 text-gray-300 mb-6'>
        {items.map((item, index) => (
          <li key={index} className='flex items-center space-x-3'>
            <div className='w-2 h-2 bg-red-500 rounded-full flex-shrink-0'></div>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        variant='primary'
        size='md'
        className='w-full'
        onClick={onViewDetails}
      >
        VER DETALLES
      </Button>
    </div>
  )
}
