"use client";

// app/products/page.tsx
// Client-side products listing with Supabase and real-time updates

import Link from 'next/link';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { createClient } from '@supabase/supabase-js';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  price: number;
  compare_price: number | null;
  stock: number | null;
  material: string | null;
  color: string | null;
  size: string | null;
  height_cm: number | null;
  diameter_cm: number | null;
  drainage_hole: boolean | null;
  suitable_for: string | null;
  weight_kg: number | null;
  thumbnail: string;
  hero_image_1: string | null;
  hero_image_2: string | null;
  hero_image_3: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  sub_category_id: string | null;
  child_category_id: string | null;
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function Footer() {
  return (
    <footer className="bg-[#3d2a2a] text-[#d4c4b5]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {/* Brand Section */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-[#d4c4b5] flex items-center justify-center">
                <span className="text-[#d4c4b5] font-serif text-base lg:text-lg">D</span>
              </div>
              <div>
                <h2 className="text-white font-medium text-base lg:text-lg">DituPetal</h2>
                <p className="text-[#a89585] text-[10px] lg:text-xs tracking-widest uppercase">
                  Boutique
                </p>
              </div>
            </div>
            <p className="text-[#a89585] text-xs lg:text-sm leading-relaxed">
              From the heart of the city, we pour passion into every petal,
              crafting beautiful floral stories for every occasion. Your
              cherished local flower shop, dedicated to delivering fresh beauty
              and joy, around the clock.
            </p>
            <div className="flex gap-2 lg:gap-3">
              {[
                { href: "#", icon: "comment" },
                { href: "#", icon: "instagram" },
                { href: "#", icon: "location" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#5a4545] flex items-center justify-center hover:bg-[#6a5555] transition-colors"
                >
                  {social.icon === "comment" && (
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-[#d4c4b5]"
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
                  )}
                  {social.icon === "instagram" && (
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-[#d4c4b5]"
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
                  )}
                  {social.icon === "location" && (
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-[#d4c4b5]"
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
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-medium text-base lg:text-lg mb-4 lg:mb-6">Shop</h3>
            <ul className="space-y-2 lg:space-y-3">
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
                    className="text-[#a89585] hover:text-white transition-colors text-xs lg:text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-medium text-base lg:text-lg mb-4 lg:mb-6">Services</h3>
            <ul className="space-y-2 lg:space-y-3">
              {[
                "Our Services",
                "Custom Bouquet",
                "Delivery Service",
                "Event Decoration",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[#a89585] hover:text-white transition-colors text-xs lg:text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-medium text-base lg:text-lg mb-4 lg:mb-6">Contact</h3>
            <ul className="space-y-3 lg:space-y-4">
              <li className="flex items-start gap-2 lg:gap-3">
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 text-[#a89585] mt-0.5 flex-shrink-0"
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
                <span className="text-[#a89585] text-xs lg:text-sm">
                  Jalan Teuku Umar No.43,
                  <br />
                  Denpasar Barat
                </span>
              </li>
              <li className="flex items-center gap-2 lg:gap-3">
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 text-[#a89585] flex-shrink-0"
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
                  className="text-[#a89585] text-xs lg:text-sm hover:text-white transition-colors break-all"
                >
                  ditupetal26@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 lg:gap-3">
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 text-[#a89585] flex-shrink-0"
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
                  className="text-[#a89585] text-xs lg:text-sm hover:text-white transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-5 flex flex-col md:flex-row justify-between items-center gap-3 lg:gap-4">
          <p className="text-[#a89585] text-xs lg:text-sm text-center md:text-left">
            © 2026 DituPetal. All rights reserved.
          </p>
          <div className="flex gap-4 lg:gap-8">
            <a
              href="#"
              className="text-[#a89585] text-xs lg:text-sm hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#a89585] text-xs lg:text-sm hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Navbar component with forwardRef to accept ref
const Navbar = forwardRef<HTMLElement>((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [slideBackgroundColor, setSlideBackgroundColor] = useState("#3d4a5c")

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('background_color')
          .order('created_at', { ascending: true })
          .limit(1)

        if (!error && data && data.length > 0 && data[0].background_color) {
          setSlideBackgroundColor(data[0].background_color)
        }
      } catch (err) {
        console.error('Error fetching background color:', err)
      }
    }

    fetchColors()
  }, [])

  return (
    <nav
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 lg:px-8 lg:py-6"
    >
      {/* Blur background overlay */}
      <div
        className="absolute inset-0 backdrop-blur-md -z-10 transition-colors duration-700"
        style={{ backgroundColor: `${slideBackgroundColor}80` }}
      />

      <div className="relative mx-auto flex max-w-[1800px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/Black_White_Minimalist_Beauty_Typography_Logo_20260302_154544_0000-removebg-preview.png"
            alt="DituPetal Logo"
            className="h-20 lg:h-15 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 lg:flex">
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
          <a
            href="/search"
            className="text-white/90 transition-colors hover:text-white"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </a>

          <a
            href="/login"
            className="text-white/90 transition-colors hover:text-white"
            aria-label="Account"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </a>

          <a
            href="/cart"
            className="text-white/90 transition-colors hover:text-white"
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-50 flex h-8 w-8 lg:hidden flex-col items-center justify-center space-y-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 transform bg-white transition-all duration-300 ${isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`block h-0.5 w-6 transform bg-white transition-all duration-300 ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center backdrop-blur-md transition-transform duration-500 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ backgroundColor: `${slideBackgroundColor}CC` }}
      >
        <div className="flex flex-col items-center space-y-6">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-xl tracking-wide text-white/90 transition-colors hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/bouquets"
            onClick={() => setIsMenuOpen(false)}
            className="text-xl tracking-wide text-white/90 transition-colors hover:text-white"
          >
            Bouquets
          </Link>
          <Link
            href="/hampers"
            onClick={() => setIsMenuOpen(false)}
            className="text-xl tracking-wide text-white/90 transition-colors hover:text-white"
          >
            Hampers
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="text-xl tracking-wide text-white/90 transition-colors hover:text-white"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="text-xl tracking-wide text-white/90 transition-colors hover:text-white"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
});

Navbar.displayName = 'Navbar';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const navbarRef = useRef<HTMLElement>(null);

  // Measure navbar height
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products from Supabase
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        setProducts(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Optional: Set up real-time subscription for product updates
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Product changed:', payload);
          // Refetch products when changes occur
          fetchProducts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const activeProducts = products.filter((product) => product.is_active !== false);

  // Format price in INR
  const formatINR = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <Navbar ref={navbarRef} />
        <div style={{ height: navbarHeight }} />
        <div className="container">
          <h1 className="title">Our Products</h1>
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading products...</p>
          </div>
          <style jsx>{`
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem 1rem;
            }
            .title {
              font-size: 2.5rem;
              font-weight: 700;
              color: #1a2a3a;
              text-align: center;
              margin-bottom: 0.5rem;
            }
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 3rem;
              text-align: center;
            }
            .loader {
              width: 50px;
              height: 50px;
              border: 3px solid #e2e8f0;
              border-top-color: #2c5f2d;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin-bottom: 1rem;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .loading-container p {
              color: #5a6e7c;
              font-size: 1rem;
            }
          `}</style>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar ref={navbarRef} />
        <div style={{ height: navbarHeight }} />
        <div className="container">
          <h1 className="title">Our Products</h1>
          <div className="error-container">
            <p className="error-message">⚠️ Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
          <style jsx>{`
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem 1rem;
            }
            .title {
              font-size: 2.5rem;
              font-weight: 700;
              color: #1a2a3a;
              text-align: center;
              margin-bottom: 0.5rem;
            }
            .error-container {
              text-align: center;
              padding: 3rem;
            }
            .error-message {
              color: #e53e3e;
              margin-bottom: 1rem;
              font-size: 1rem;
            }
            .retry-button {
              padding: 0.5rem 1.5rem;
              background: #2c5f2d;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 0.875rem;
              font-weight: 500;
              transition: background 0.2s ease;
            }
            .retry-button:hover {
              background: #1f4520;
            }
          `}</style>
        </div>
        <Footer />
      </>
    );
  }

  if (!activeProducts.length) {
    return (
      <>
        <Navbar ref={navbarRef} />
        <div style={{ height: navbarHeight }} />
        <div className="container">
          <h1 className="title">Our Products</h1>
          <p className="no-products">No products available at the moment. Please check back soon!</p>
          <style jsx>{`
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem 1rem;
            }
            .title {
              font-size: 2.5rem;
              font-weight: 700;
              color: #1a2a3a;
              text-align: center;
              margin-bottom: 0.5rem;
            }
            .no-products {
              text-align: center;
              color: #5a6e7c;
              padding: 3rem;
              font-size: 1.1rem;
            }
          `}</style>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar ref={navbarRef} />
      <div style={{ height: navbarHeight }} />
      <div className="container">
        <h1 className="title">Our Products</h1>
        <p className="subtitle">Discover our beautiful collection of planters and pots</p>
        
        <div className="grid">
          {activeProducts.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="card-link">
              <div className="card">
                <div className="image-wrapper">
                  <img src={product.thumbnail} alt={product.name} className="product-image" loading="lazy" />
                  {product.is_featured && <span className="featured-badge">Featured</span>}
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="sale-badge">Sale</span>
                  )}
                </div>
                
                <div className="card-content">
                  <h2 className="product-name">{product.name}</h2>
                  {product.short_description && (
                    <p className="short-description">{product.short_description}</p>
                  )}
                  
                  <div className="price-section">
                    <span className="current-price">
                      {formatINR(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="compare-price">
                        {formatINR(typeof product.compare_price === 'string' ? parseFloat(product.compare_price) : product.compare_price)}
                      </span>
                    )}
                  </div>
                  
                  <div className="product-details">
                    {product.material && <span className="detail-badge">{product.material}</span>}
                    {product.color && <span className="detail-badge">{product.color}</span>}
                    {product.height_cm && <span className="detail-badge">{product.height_cm}cm</span>}
                    {product.drainage_hole && <span className="detail-badge">Drainage Hole</span>}
                  </div>
                  
                  <div className="stock-info">
                    {product.stock !== null && product.stock > 0 ? (
                      <span className="in-stock">✓ In Stock ({product.stock})</span>
                    ) : (
                      <span className="out-of-stock">✗ Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="view-button">View Product →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          }
          .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a2a3a;
            text-align: center;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            text-align: center;
            color: #5a6e7c;
            margin-bottom: 2.5rem;
            font-size: 1.1rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
          .card-link {
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .card-link:hover {
            transform: translateY(-4px);
          }
          .card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: box-shadow 0.2s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .card-link:hover .card {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }
          .image-wrapper {
            position: relative;
            padding-top: 100%;
            overflow: hidden;
            background: #f5f5f5;
          }
          .product-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          .card-link:hover .product-image {
            transform: scale(1.05);
          }
          .featured-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: #ff6b35;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            z-index: 1;
          }
          .sale-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            background: #e53e3e;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            z-index: 1;
          }
          .card-content {
            padding: 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .product-name {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a2a3a;
            margin: 0 0 0.5rem 0;
            line-height: 1.3;
          }
          .short-description {
            font-size: 0.875rem;
            color: #5a6e7c;
            margin: 0 0 0.75rem 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .price-section {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }
          .current-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2c5f2d;
          }
          .compare-price {
            font-size: 1rem;
            color: #a0aec0;
            text-decoration: line-through;
          }
          .product-details {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }
          .detail-badge {
            background: #edf2f7;
            color: #2d3748;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 500;
          }
          .stock-info {
            margin-bottom: 1rem;
            font-size: 0.75rem;
          }
          .in-stock {
            color: #2c7a4b;
            font-weight: 500;
          }
          .out-of-stock {
            color: #c53030;
            font-weight: 500;
          }
          .view-button {
            margin-top: auto;
            text-align: center;
            padding: 0.625rem;
            background: #f7fafc;
            color: #2c5f2d;
            font-weight: 600;
            border-radius: 8px;
            transition: background 0.2s ease;
            font-size: 0.875rem;
          }
          .card-link:hover .view-button {
            background: #2c5f2d;
            color: white;
          }
          @media (max-width: 640px) {
            .container {
              padding: 1rem;
            }
            .title {
              font-size: 1.75rem;
            }
            .grid {
              gap: 1rem;
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            }
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}