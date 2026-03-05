'use client'

import { Users } from 'lucide-react'
import { useState } from 'react'

interface BrandImageProps {
  src: string | null
  alt: string
}

export default function BrandImage({ src, alt }: BrandImageProps) {
  const [imageError, setImageError] = useState(false)
  const [showFallback, setShowFallback] = useState(!src)

  if (showFallback || imageError || !src) {
    return (
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="w-10 h-10 text-blue-600" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={80}
      height={80}
      className="rounded-full object-cover"
      style={{ width: '80px', height: '80px' }}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  )
}