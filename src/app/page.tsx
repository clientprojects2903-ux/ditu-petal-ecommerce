"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import FlowerSection from "@/components/Flower"

interface Slide {
  id: number
  backgroundColor: string
  image: string
  description: string
  heading: string[]
  sideText: string
  verticalText: string
}

const slides: Slide[] = [
  {
    id: 1,
    backgroundColor: "#3d4a5c",
    image: "/images/flower-arrangement-1.jpg",
    description:
      "It Is Necessary To Have A Reliable Source Of Fresh Flowers: From Wholesale Flower Markets, From Local Farms, Or Import If The Flowers Are Special....",
    heading: ["PURE FRESHNESS IN", "EVERY PETAL"],
    sideText: "SOPHISTICATION IN EVERY PETAL",
    verticalText: "FRESH FLOWER",
  },
  {
    id: 2,
    backgroundColor: "#6b6b3d",
    image: "/images/flower-arrangement-2.jpg",
    description:
      "I'm Very Happy With My Purchase And Will Definitely Return For Future Occasions.\" I'm Very Happy With My Purchase And Will Definitely Return For Future Occasions.\"",
    heading: ["THE ART OF FRESH", "BLOOMS"],
    sideText: "ROMANCE BLOSSOMS WITH FRESH BLOOMS",
    verticalText: "FRESH FLOWER",
  },
  {
    id: 3,
    backgroundColor: "#4a5d4a",
    image: "/images/flower-arrangement-3.jpg",
    description:
      "Every Bouquet Tells A Story Of Love And Care. Our Expert Florists Create Stunning Arrangements That Capture The Essence Of Nature's Beauty....",
    heading: ["NATURE'S FINEST", "SELECTIONS"],
    sideText: "ELEGANCE IN EVERY ARRANGEMENT",
    verticalText: "FRESH FLOWER",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), 700)
    },
    [isTransitioning]
  )

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }, [currentSlide, goToSlide])

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const slide = slides[currentSlide]

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 lg:px-16">
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

      {/* Hero Section */}
      <section
        className="relative min-h-screen w-full overflow-hidden transition-colors duration-700 pt-24 lg:pt-28"
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
                <Image
                  src={slide.image}
                  alt="Beautiful flower arrangement"
                  fill
                  className="object-cover transition-transform duration-700"
                  priority
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
      <main className="min-h-screen bg-background">
      
      <FlowerSection />
    </main>
    </>
  )
}