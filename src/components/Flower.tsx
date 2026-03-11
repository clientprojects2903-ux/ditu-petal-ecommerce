"use client"

import { useState } from "react"

interface ImageWithPlaceholderProps {
  src: string
  alt: string
  className?: string
  placeholderColor?: string
}

function ImageWithPlaceholder({
  src,
  alt,
  className = "",
  placeholderColor = "bg-stone-200",
}: ImageWithPlaceholderProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative h-full w-full overflow-hidden ${placeholderColor}`}>
      {(isLoading || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-stone-400 md:h-16 md:w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

export default function FlowerSection() {
  return (
    <section className="w-full px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6">
          
          {/* Soul Bloom - Top Left */}
          <div className="relative h-80 overflow-hidden rounded-2xl md:h-auto md:min-h-[300px]">
            <ImageWithPlaceholder
              src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/banner-34.jpg"
              alt="Soul Bloom flower arrangement with pink roses and green foliage"
              className="h-full w-full object-cover"
              placeholderColor="bg-stone-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent">
              <div className="flex h-full flex-col items-center justify-end pb-8 text-center">
                <p className="mb-2 max-w-[250px] px-4 text-xs tracking-wide text-white/90 md:text-sm">
                  Flowers Or Inflorescences Are The Partsx
                </p>
                <h3 className="font-serif text-3xl font-light italic text-white md:text-4xl">
                  Soul Bloom
                </h3>
              </div>
            </div>
          </div>

          {/* Big Sale - Center (spans 2 rows) */}
          <div className="relative h-96 overflow-hidden rounded-2xl md:row-span-2 md:h-auto md:min-h-[620px]">
            <ImageWithPlaceholder
              src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/banner-36.jpg"
              alt="Beautiful wrapped bouquet for big sale"
              className="h-full w-full object-cover"
              placeholderColor="bg-stone-400"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
              <div className="flex h-full flex-col items-center justify-end pb-12 text-center">
                <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl">Big Sale!</h2>
                <p className="mb-4 max-w-[300px] px-4 text-sm tracking-wide text-white/90">
                  Flowers Or Inflorescences Are The Parts
                </p>
                <button className="rounded-full bg-white px-8 py-3 text-sm font-medium text-stone-800 shadow-lg transition-all hover:bg-stone-100 hover:shadow-xl">
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Nourish Your - Right (spans 2 rows) */}
          <div className="relative h-96 overflow-hidden rounded-2xl md:row-span-2 md:h-auto md:min-h-[620px]">
            <ImageWithPlaceholder
              src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/banner-37.jpg"
              alt="Elegant floral arrangement in white ceramic vase"
              className="h-full w-full object-cover"
              placeholderColor="bg-amber-100"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent">
              <div className="flex h-full flex-col items-end justify-end p-6 text-right md:p-8">
                <p className="mb-2 max-w-[250px] text-xs tracking-wide text-black md:text-sm">
                  Flowers Or Inflorescences Are The Parts
                </p>
                <h3 className="font-serif text-3xl font-light italic text-black md:text-4xl">
                  Nourish Your
                </h3>
              </div>
            </div>
          </div>

          {/* Soft Petals - Bottom Left */}
          <div className="relative h-80 overflow-hidden rounded-2xl md:h-auto md:min-h-[300px]">
            <ImageWithPlaceholder
              src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/banner-35.jpg"
              alt="Soft petals arrangement with flowers in vases"
              className="h-full w-full object-cover"
              placeholderColor="bg-amber-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent">
              <div className="flex h-full flex-col items-center justify-end pb-8 text-center">
                <p className="mb-2 max-w-[250px] px-4 text-xs tracking-wide text-white/90">
                  Flowers Or Inflorescences Are The Parts
                </p>
                <h3 className="font-serif text-3xl font-light italic text-white md:text-4xl">
                  Soft Petals
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}