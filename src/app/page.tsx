"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import FlowerSection from "@/components/Flower"

import { createClient } from "@/lib/supabase/client" 
// Types for website data from database
interface WebsiteData {
  id: string
  name: string
  background_color: string | null
  image: string | null
  description: string | null
  heading: string[] | null
  side_text: string | null
  vertical_text: string | null
  created_at: string | null
  updated_at: string | null
}

// Additional flowers data for a new section
const additionalFlowers = [
  {
    id: 1,
    name: "8 Lily's",
    description: "Lily's flower",
    originalPrice: 1000000,
    salePrice: 830000,
    image: "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 2,
    name: "Sweet Promise",
    description: "A gentle promise of love",
    originalPrice: 250000,
    salePrice: 200000,
    image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 3,
    name: "31 Red Holland Roses",
    description: "Red Holland Roses",
    originalPrice: 500000,
    salePrice: 430000,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 4,
    name: "Pink Serenity",
    description: "The combination of Lily and roses makes it more romantic",
    originalPrice: 520000,
    salePrice: 470000,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 5,
    name: "White Elegance",
    description: "Pure white roses for special moments",
    originalPrice: 450000,
    salePrice: 380000,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 6,
    name: "Garden Mix",
    description: "A beautiful mix of garden flowers",
    originalPrice: 350000,
    salePrice: 290000,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 7,
    name: "Red Passion",
    description: "Express your deepest feelings",
    originalPrice: 600000,
    salePrice: 520000,
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=500&fit=crop",
    promo: true,
  },
  {
    id: 8,
    name: "Tropical Bliss",
    description: "Exotic tropical arrangement",
    originalPrice: 480000,
    salePrice: 410000,
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=500&fit=crop",
    promo: true,
  },
];

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function FlowerCard({
  flower,
}: {
  flower: (typeof additionalFlowers)[0];
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden group">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={flower.image}
          alt={flower.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {flower.promo && (
          <span className="absolute top-3 left-3 bg-[#4a7c59] text-white text-xs font-medium px-3 py-1 rounded">
            PROMO
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-gray-900 text-base">{flower.name}</h3>
          <div className="text-right flex-shrink-0">
            <p className="text-gray-400 text-sm line-through">
              {formatPrice(flower.originalPrice)}
            </p>
            <p className="text-[#c4a47c] font-medium">
              {formatPrice(flower.salePrice)}
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {flower.description}
        </p>

        <div className="flex items-center gap-2">
          <button className="flex-1 border border-[#c4a47c] text-[#c4a47c] py-2 px-4 rounded-full text-sm font-medium hover:bg-[#c4a47c] hover:text-white transition-colors">
            See Details
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-[#c4a47c] hover:text-white transition-colors">
            <CartIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdditionalFlowerSection() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              slug
            )
          `)
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8)

        if (error) {
          console.error('Error fetching featured products:', error)
          return
        }

        setFeaturedProducts(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [supabase])

  // Function to format price
  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  // Function to get the primary image (thumbnail or first hero image)
  const getProductImage = (product: any) => {
    return product.thumbnail || product.hero_image_1 || '/images/placeholder-flower.jpg'
  }

  // Check if product has promo (has compare_price)
  const hasPromo = (product: any) => {
    return product.compare_price && product.compare_price > product.price
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f9f7f4]">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-[#c4a47c] tracking-widest text-sm font-medium mb-3">
              SPECIAL COLLECTION
            </p>
            <h1 className="text-4xl md:text-5xl mb-4">
              <span className="text-gray-900 font-serif">Premium</span>{" "}
              <span className="text-[#c9928e] font-serif italic">Bouquets</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our handcrafted premium bouquets, perfect for every special moment in your life.
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#f9f7f4]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-[#c4a47c] tracking-widest text-sm font-medium mb-3">
            SPECIAL COLLECTION
          </p>
          <h1 className="text-4xl md:text-5xl mb-4">
            <span className="text-gray-900 font-serif">Premium</span>{" "}
            <span className="text-[#c9928e] font-serif italic">Bouquets</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our handcrafted premium bouquets, perfect for every special moment in your life.
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback image if the image fails to load
                      e.currentTarget.src = '/images/placeholder-flower.jpg'
                    }}
                  />
                  {hasPromo(product) && (
                    <span className="absolute top-3 left-3 bg-[#4a7c59] text-white text-xs font-medium px-3 py-1 rounded">
                      PROMO
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-base">{product.name}</h3>
                    <div className="text-right flex-shrink-0">
                      {product.compare_price && (
                        <p className="text-gray-400 text-sm line-through">
                          {formatPrice(product.compare_price)}
                        </p>
                      )}
                      <p className="text-[#c4a47c] font-medium">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {product.short_description || product.description || 'No description available'}
                  </p>

                  {/* Display product attributes if available */}
                  {(product.material || product.color || product.size) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.material && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.material}
                        </span>
                      )}
                      {product.color && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.color}
                        </span>
                      )}
                      {product.size && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.size}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/product/${product.slug}`}
                      className="flex-1 border border-[#c4a47c] text-[#c4a47c] py-2 px-4 rounded-full text-sm font-medium hover:bg-[#c4a47c] hover:text-white transition-colors text-center"
                    >
                      See Details
                    </Link>
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-[#c4a47c] hover:text-white transition-colors"
                      aria-label="Add to cart"
                    >
                      <CartIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/bouquets"
              className="inline-flex items-center gap-2 border-2 border-[#c4a47c] text-[#c4a47c] px-8 py-3 rounded-full font-medium hover:bg-[#c4a47c] hover:text-white transition-colors"
            >
              View All Bouquets
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function CustomBouquetSection() {
  const steps = [
    {
      number: 1,
      title: "Share Your Vision",
      description: "Tell us about the occasion, preferences, and budget",
    },
    {
      number: 2,
      title: "We Design",
      description: "Our florists craft a unique arrangement just for you",
    },
    {
      number: 3,
      title: "Delivered With Love",
      description: "Same-day delivery across Bali available",
    },
  ]

  return (
    <section className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 lg:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Side - Image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/images/pink-roses-bouquet.jpg"
              alt="Beautiful pink roses custom bouquet"
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Custom Badge */}
          <div className="absolute bottom-6 right-6 bg-[#c9b896] text-white px-4 py-3 rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                <path d="M10 2c1 .5 2 2 2 5" />
              </svg>
              <span className="text-sm font-medium">Custom</span>
              <span className="text-xs opacity-90">Made for You</span>
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="space-y-6">
          <p className="text-[#d4736c] text-sm font-semibold tracking-widest uppercase">
            Bespoke Service
          </p>

          <h1 className="text-4xl lg:text-5xl font-serif text-gray-900">
            Order Your{" "}
            <span className="text-[#e8a0b4]">Custom Bouquet</span>
          </h1>

          <p className="text-gray-600 leading-relaxed">
            {"Can't find exactly what you're looking for? Let our expert florists create a one-of-a-kind arrangement tailored to your vision, occasion, and budget. Every petal placed with purpose, every stem selected with care."}
          </p>

          {/* Steps */}
          <div className="space-y-4 pt-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-white/50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#c9b896] text-[#c9b896] flex items-center justify-center text-sm font-medium">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button className="mt-6 inline-flex items-center gap-2 bg-[#c9b896] hover:bg-[#b8a785] text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Start Your Custom Order
          </button>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="#"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label="Contact via WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="min-h-screen bg-[#faf8f6] py-16 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Content */}
        <div className="space-y-8">
          {/* About Us Label */}
          <div className="flex items-center gap-2 text-[#9b8579]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-sm font-medium tracking-wider uppercase">About Us</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl lg:text-5xl font-serif text-[#3d3d3d]">
            Where Poetry Meets <span className="text-[#c4a07a] italic">Petals</span>
          </h1>

          {/* Description */}
          <div className="space-y-6 text-[#5a5a5a] leading-relaxed">
            <p>
              At DituPetal, we believe flowers are more than just botanical beauty—
              they're messengers of the heart, carriers of emotion, and vessels of memory.
              Each arrangement we create is a poem written in petals.
            </p>
            <p>
              Founded in the heart of Bali, our boutique draws inspiration from the island's
              natural splendor—the lush tropical gardens, the vibrant sunsets over rice
              terraces, and the warm spirit of its people. We bring this essence to every
              bouquet we craft.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {/* Crafted with Love */}
            <div className="bg-[#fdf5f3] rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c4a07a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-[#c4a07a] font-medium text-sm mb-2">Crafted with Love</h3>
              <p className="text-[#7a7a7a] text-xs leading-relaxed">
                Every stem placed with intention
              </p>
            </div>

            {/* Sustainably Sourced */}
            <div className="bg-[#f5f9f7] rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7a9b8a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
              </div>
              <h3 className="text-[#7a9b8a] font-medium text-sm mb-2">Sustainably Sourced</h3>
              <p className="text-[#7a7a7a] text-xs leading-relaxed">
                Local farms, ethical practices
              </p>
            </div>

            {/* Artisan Quality */}
            <div className="bg-[#fdf8f3] rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c9a86c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-[#c9a86c] font-medium text-sm mb-2">Artisan Quality</h3>
              <p className="text-[#7a7a7a] text-xs leading-relaxed">
                Expert florists, premium blooms
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-6 px-8 py-3 bg-[#fdf5f3] text-[#c4a07a] rounded-full font-medium hover:bg-[#fbeee9] transition-colors">
            Discover Our Story
          </button>
        </div>

        {/* Right Content - Image Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {/* Top Left - Large Image */}
            <div className="row-span-2">
              <img
                src="/bouquet-1.jpg"
                alt="Pink roses and gerbera bouquet"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Top Right Image */}
            <div>
              <img
                src="/bouquet-2.jpg"
                alt="Colorful mixed flower bouquet"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>

            {/* Bottom Right Image */}
            <div className="relative">
              <img
                src="/bouquet-4.jpg"
                alt="Red roses bouquet"
                className="w-full h-64 object-cover rounded-2xl"
              />
            </div>

            {/* Bottom Left Image */}
            <div className="col-span-1 -mt-20">
              <img
                src="/bouquet-3.jpg"
                alt="White roses bouquet"
                className="w-full h-72 object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="absolute bottom-8 right-0 bg-[#4a3f3a] rounded-xl px-8 py-4 flex items-center gap-6">
            <div className="text-center pr-6 border-r border-[#6a5f5a]">
              <div className="text-[#c9a86c] text-xl font-semibold">
                5<sup className="text-xs">+</sup>
              </div>
              <div className="text-white text-xs">Years</div>
            </div>
            <div className="text-center pr-6 border-r border-[#6a5f5a]">
              <div className="text-white text-xl font-semibold">5000+</div>
              <div className="text-white text-xs">
                Happy<br />Clients
              </div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl font-semibold">100%</div>
              <div className="text-white text-xs">
                Fresh<br />Daily
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section className="min-h-screen bg-[#fdf9f6] py-16 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <p className="text-[#b4838a] text-sm tracking-[0.2em] uppercase mb-3">Get In Touch</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mb-4">
          Let's Talk <span className="text-[#c4727e]">Flowers</span>
        </h1>
        <p className="text-[#6b6b6b] max-w-2xl mx-auto leading-relaxed">
          Come find us right in the heart of Bali! Our doors at DituPetal are always open,
          <br className="hidden md:block" />
          ready to welcome you with beautiful, fresh flowers.
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left Column - Contact Info & Map */}
        <div className="space-y-6">
          {/* Contact Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Visit Our Boutique */}
            <div className="bg-[#faf6f2] rounded-xl p-5">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <LocationIcon className="w-5 h-5 text-[#b4838a]" />
              </div>
              <h3 className="font-serif text-[#2d4a6b] font-medium mb-1">Visit Our Boutique</h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                Jalan Teuku Umar No.43
                <br />
                Denpasar Barat
              </p>
            </div>

            {/* Email Us */}
            <div className="bg-[#faf6f2] rounded-xl p-5">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <EmailIcon className="w-5 h-5 text-[#4a7c9b]" />
              </div>
              <h3 className="font-serif text-[#2d4a6b] font-medium mb-1">Email Us</h3>
              <p className="text-[#6b6b6b] text-sm">ditupetal26@gmail.com</p>
            </div>

            {/* Call or WhatsApp */}
            <div className="bg-[#faf6f2] rounded-xl p-5">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <PhoneIcon className="w-5 h-5 text-[#7ba67b]" />
              </div>
              <h3 className="font-serif text-[#2d4a6b] font-medium mb-1">Call or WhatsApp</h3>
              <p className="text-[#6b6b6b] text-sm">+62 878 2583 0959</p>
            </div>

            {/* Opening Hours */}
            <div className="bg-[#faf6f2] rounded-xl p-5">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <ClockIcon className="w-5 h-5 text-[#c4a35a]" />
              </div>
              <h3 className="font-serif text-[#2d4a6b] font-medium mb-1">Opening Hours</h3>
              <p className="text-[#6b6b6b] text-sm">
                Open 24/7
                <br />
                Always ready to serve you
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-[#e8e4e0] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-4">
              <LocationIcon className="w-6 h-6 text-[#b4838a]" />
            </div>
            <p className="text-[#4a4a4a] font-medium mb-2">Interactive Map</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b4838a] text-sm hover:underline flex items-center gap-1"
            >
              Open in Google Maps <span>→</span>
            </a>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="font-serif text-xl text-[#2d2d2d] mb-2">Send Us a Message</h2>
          <p className="text-[#6b6b6b] text-sm mb-6">
            Fill out the form below and we'll get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[#2d2d2d] text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-[#e5e5e5] bg-[#fdfbf9] text-[#2d2d2d] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#b4838a] transition-colors"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[#2d2d2d] text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-[#e5e5e5] bg-[#fdfbf9] text-[#2d2d2d] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#b4838a] transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[#2d2d2d] text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 878 2583 0959"
                className="w-full px-4 py-3 rounded-lg border border-[#e5e5e5] bg-[#fdfbf9] text-[#2d2d2d] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#b4838a] transition-colors"
              />
            </div>

            {/* Your Message */}
            <div>
              <label className="block text-[#2d2d2d] text-sm font-medium mb-2">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your flower needs..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-[#e5e5e5] bg-[#fdfbf9] text-[#2d2d2d] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#b4838a] transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#a67c7c] hover:bg-[#957070] text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <SendIcon className="w-4 h-4" />
              Send Message
            </button>
          </form>

          {/* WhatsApp Alternative */}
          <div className="mt-6 text-center">
            <p className="text-[#6b6b6b] text-sm mb-3">Or contact us directly via WhatsApp</p>
            <a
              href="https://wa.me/6287825830959"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 border border-[#e5e5e5] rounded-lg text-[#6b6b6b] hover:border-[#b4838a] hover:text-[#b4838a] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#3d2a2a] text-[#d4c4b5]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#d4c4b5] flex items-center justify-center">
                <span className="text-[#d4c4b5] font-serif text-lg">D</span>
              </div>
              <div>
                <h2 className="text-white font-medium text-lg">DituPetal</h2>
                <p className="text-[#a89585] text-xs tracking-widest uppercase">
                  Boutique
                </p>
              </div>
            </div>
            <p className="text-[#a89585] text-sm leading-relaxed">
              From the heart of the city, we pour passion into every petal,
              crafting beautiful floral stories for every occasion. Your
              cherished local flower shop, dedicated to delivering fresh beauty
              and joy, around the clock.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#5a4545] flex items-center justify-center hover:bg-[#6a5555] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[#d4c4b5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#5a4545] flex items-center justify-center hover:bg-[#6a5555] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[#d4c4b5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    strokeWidth={1.5}
                  />
                  <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                  <circle cx="18" cy="6" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#5a4545] flex items-center justify-center hover:bg-[#6a5555] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[#d4c4b5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-medium text-lg mb-6">Shop</h3>
            <ul className="space-y-3">
              {[
                "All Bouquets",
                "Artificial Bouquets",
                "Roses Collection",
                "Mixed Bouquets",
                "Premium Collection",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[#a89585] hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-medium text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                "Our Services",
                "Custom Bouquet",
                "Delivery Service",
                "Event Decoration",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[#a89585] hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-medium text-lg mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#a89585] mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-[#a89585] text-sm">
                  Jalan Teuku Umar No.43,
                  <br />
                  Denpasar Barat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#a89585] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:ditupetal26@gmail.com"
                  className="text-[#a89585] text-sm hover:text-white transition-colors"
                >
                  ditupetal26@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#a89585] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+6287825830959"
                  className="text-[#a89585] text-sm hover:text-white transition-colors"
                >
                  +62 878 2583 0959
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#5a4545]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#a89585] text-sm">
            © 2026 DituPetal. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-[#a89585] text-sm hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#a89585] text-sm hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Icon Components
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

// Define the slide interface
interface Slide {
  id: string
  backgroundColor: string
  image: string
  description: string
  heading: string[]
  sideText: string
  verticalText: string
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [navbarHeight, setNavbarHeight] = useState(80)
  const navbarRef = useRef<HTMLElement>(null)

  // Measure navbar height
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
    }

    const handleResize = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch slides from Supabase
  useEffect(() => {
    async function fetchSlides() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          // Transform the data to match the Slide interface
          const transformedSlides: Slide[] = data.map((item: WebsiteData) => ({
            id: item.id,
            backgroundColor: item.background_color || '#3d4a5c', // Default color if null
            image: item.image || '/images/flower-arrangement-1.jpg', // Default image if null
            description: item.description || 'Beautiful flower arrangements for every occasion.',
            heading: item.heading || ['PURE FRESHNESS IN', 'EVERY PETAL'],
            sideText: item.side_text || 'SOPHISTICATION IN EVERY PETAL',
            verticalText: item.vertical_text || 'FRESH FLOWER'
          }))
          
          setSlides(transformedSlides)
        } else {
          // If no data, use default slides
          setSlides(defaultSlides)
        }
      } catch (err) {
        console.error('Error fetching slides:', err)
        setError('Failed to load slides')
        // Fallback to default slides
        setSlides(defaultSlides)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || slides.length === 0) return
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), 700)
    },
    [isTransitioning, slides.length]
  )

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, goToSlide, slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }, [currentSlide, goToSlide, slides.length])

  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, slides.length])

  // Default slides as fallback
  const defaultSlides: Slide[] = [
    {
      id: "1",
      backgroundColor: "#3d4a5c",
      image: "/images/flower-arrangement-1.jpg",
      description:
        "It Is Necessary To Have A Reliable Source Of Fresh Flowers: From Wholesale Flower Markets, From Local Farms, Or Import If The Flowers Are Special....",
      heading: ["PURE FRESHNESS IN", "EVERY PETAL"],
      sideText: "SOPHISTICATION IN EVERY PETAL",
      verticalText: "FRESH FLOWER",
    },
    {
      id: "2",
      backgroundColor: "#6b6b3d",
      image: "/images/flower-arrangement-2.jpg",
      description:
        "I'm Very Happy With My Purchase And Will Definitely Return For Future Occasions.\" I'm Very Happy With My Purchase And Will Definitely Return For Future Occasions.\"",
      heading: ["THE ART OF FRESH", "BLOOMS"],
      sideText: "ROMANCE BLOSSOMS WITH FRESH BLOOMS",
      verticalText: "FRESH FLOWER",
    },
    {
      id: "3",
      backgroundColor: "#4a5d4a",
      image: "/images/flower-arrangement-3.jpg",
      description:
        "Every Bouquet Tells A Story Of Love And Care. Our Expert Florists Create Stunning Arrangements That Capture The Essence Of Nature's Beauty....",
      heading: ["NATURE'S FINEST", "SELECTIONS"],
      sideText: "ELEGANCE IN EVERY ARRANGEMENT",
      verticalText: "FRESH FLOWER",
    },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c4a47c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beautiful flowers...</p>
        </div>
      </div>
    )
  }

  // Show error state but still render with default slides
  if (error || slides.length === 0) {
    console.warn('Using default slides due to:', error)
  }

  const slide = slides[currentSlide] || defaultSlides[0]

  return (
    <>
      {/* Fixed Navigation Bar with ref */}
      <nav 
        ref={navbarRef}
        className="fixed top-0 left-0 right-0 z-50 px-8 py-6 lg:px-16"
      >
        {/* Blur background overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-md -z-10 transition-colors duration-700"
          style={{ backgroundColor: `${slide.backgroundColor}80` }} // 50% opacity background
        />
        
        <div className="relative mx-auto flex max-w-[1800px] items-center justify-between">
          {/* Logo - Updated to DituPetal */}
          <Link href="/" className="text-2xl font-light tracking-widest text-white">
            DITU<span className="font-serif text-[#c9a227]">PETAL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-12 lg:flex">
            <Link href="/" className="text-sm tracking-wide text-white/90 transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/bouquets" className="text-sm tracking-wide text-white/90 transition-colors hover:text-white">
              Bouquets
            </Link>
            <Link href="/hampers" className="text-sm tracking-wide text-white/90 transition-colors hover:text-white">
              Hampers
            </Link>
            <Link href="/about" className="text-sm tracking-wide text-white/90 transition-colors hover:text-white">
              About
            </Link>
            <Link href="/contact" className="text-sm tracking-wide text-white/90 transition-colors hover:text-white">
              Contact
            </Link>
          </div>

          {/* Right Icons */}
          <div className="hidden items-center space-x-6 lg:flex">
            <button className="text-white/90 transition-colors hover:text-white" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button className="text-white/90 transition-colors hover:text-white" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button className="text-white/90 transition-colors hover:text-white" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center space-y-1.5 lg:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 transform bg-white transition-all duration-300 ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 transform bg-white transition-all duration-300 ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center backdrop-blur-md transition-transform duration-500 lg:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: `${slide.backgroundColor}CC` }}
        >
          <div className="flex flex-col items-center space-y-8">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl tracking-wide text-white/90 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl tracking-wide text-white/90 transition-colors hover:text-white"
            >
              Shop
            </Link>
            <Link
              href="/collections"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl tracking-wide text-white/90 transition-colors hover:text-white"
            >
              Collections
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl tracking-wide text-white/90 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl tracking-wide text-white/90 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer div to push content below fixed navbar */}
      <div style={{ height: navbarHeight }} />

      {/* Hero Section */}
      <section
        className="relative min-h-screen w-full overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: slide.backgroundColor }}
      >
        {/* Background floral pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 1920 1080" fill="none">
            <g opacity="0.3">
              {[...Array(20)].map((_, i) => (
                <g key={i} transform={`translate(${(i % 5) * 400}, ${Math.floor(i / 5) * 300})`}>
                  <path
                    d="M50 20 Q60 10 70 20 Q80 30 70 40 Q60 50 50 40 Q40 30 50 20"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                    className="text-white/20"
                  />
                  <path
                    d="M80 60 L90 80 M75 70 L95 70"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-white/20"
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-[1800px] items-center px-8 lg:px-16">
          {/* Left navigation arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-white/40 transition-all duration-300 hover:border-white/70 hover:bg-white/10 lg:left-8"
            aria-label="Previous slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Main content */}
          <div className="flex w-full items-center justify-between gap-8">
            {/* Left content */}
            <div className="z-10 max-w-xl pl-8 lg:pl-16">
              <p
                className="mb-8 max-w-sm text-sm leading-relaxed tracking-wide text-white/80 transition-opacity duration-500"
                style={{ opacity: isTransitioning ? 0 : 1 }}
              >
                {slide.description}
              </p>

              <h1
                className="mb-10 font-serif text-4xl leading-tight tracking-wide text-white transition-opacity duration-500 md:text-5xl lg:text-6xl"
                style={{ opacity: isTransitioning ? 0 : 1 }}
              >
                {slide.heading.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              <button className="group flex items-center gap-0 overflow-hidden rounded-full bg-white/90 pr-1 transition-all duration-300 hover:bg-white">
                <span className="px-6 py-3 text-sm font-medium tracking-wide text-gray-800">Shop Now</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a227] transition-transform duration-300 group-hover:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Center image */}
            <div className="relative flex flex-1 items-center justify-center">
              <div
                className="relative h-[500px] w-[350px] overflow-hidden rounded-[175px] border-4 border-white/20 transition-all duration-500 md:h-[550px] md:w-[380px] lg:h-[600px] lg:w-[420px]"
                style={{
                  opacity: isTransitioning ? 0.5 : 1,
                  transform: isTransitioning ? "scale(0.95)" : "scale(1)",
                }}
              >
                <img
                  src={slide.image}
                  alt="Beautiful flower arrangement"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                />
              </div>

              {/* Decorative flowers outside frame */}
              <div className="absolute -right-4 -top-8 h-24 w-24 opacity-80">
                <svg viewBox="0 0 100 100" className="h-full w-full text-yellow-400/60">
                  <circle cx="50" cy="30" r="6" fill="currentColor" />
                  <circle cx="35" cy="45" r="5" fill="currentColor" />
                  <circle cx="65" cy="50" r="4" fill="currentColor" />
                  <path d="M50 30 L50 80 M35 45 L35 85 M65 50 L65 90" stroke="#5a7a5a" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Right side vertical text */}
            <div className="hidden items-center gap-8 lg:flex">
              <p
                className="text-xs uppercase tracking-[0.3em] text-white/60"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                {slide.sideText}
              </p>

              <h2
                className="font-serif text-8xl font-light tracking-wider text-white/10 xl:text-9xl"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                {slide.verticalText}
              </h2>
            </div>
          </div>

          {/* Right navigation arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-white/40 transition-all duration-300 hover:border-white/70 hover:bg-white/10 lg:right-8"
            aria-label="Next slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* First Flower Section (imported) */}
      <FlowerSection />
      
      {/* Second Flower Section (additional) */}
      <AdditionalFlowerSection />

      {/* Custom Bouquet Section */}
      <CustomBouquetSection />

      {/* About Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </>
  )
}