"use client";
import { useEffect, useRef, useState, CSSProperties, ReactNode } from "react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* CONTACT FORM COMPONENT */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      console.log("Submitting form data:", formData);

      const response = await fetch("https://script.google.com/macros/s/AKfycbxUN43VDzg7h2JUZuZqhqxA2_i92_y-ThsmFxmTcPVnooa9W7-U_g991T-rxSQZ8rsh/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          timestamp: new Date().toISOString(),
          source: "DituPetal Contact",
        }),
      });

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setStatus("idle"), 3000);

      console.log("Form submitted successfully!");

    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e8f0e8",
      borderRadius: 32,
      padding: "clamp(32px, 4vw, 48px) clamp(24px, 3vw, 40px)",
      boxShadow: "0 20px 40px -15px rgba(94, 130, 94, 0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 28, height: 2, background: "#7BA37B", borderRadius: 2 }} />
        <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7BA37B" }}>
          Get in Touch
        </span>
      </div>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        color: "#2C3E2C",
        marginBottom: 8,
      }}>
        We'd love to hear from you
      </h2>

      <p style={{
        color: "#5A6E5A",
        fontSize: "clamp(0.85rem, 1.5vw, 0.9rem)",
        lineHeight: 1.7,
        marginBottom: 32,
        maxWidth: 500,
      }}>
        Have questions about our planters? Need help choosing the perfect pot for your green friend? Our plant-loving team is here to help.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#5A6E5A",
              marginBottom: 8,
            }}>
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "#F9FCF9",
                border: "1px solid #DDE8DD",
                borderRadius: 16,
                color: "#2C3E2C",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              placeholder="Lily Chen"
              onFocus={(e) => e.target.style.borderColor = "#7BA37B"}
              onBlur={(e) => e.target.style.borderColor = "#DDE8DD"}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#5A6E5A",
              marginBottom: 8,
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "#F9FCF9",
                border: "1px solid #DDE8DD",
                borderRadius: 16,
                color: "#2C3E2C",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              placeholder="lily@greenhome.com"
              onFocus={(e) => e.target.style.borderColor = "#7BA37B"}
              onBlur={(e) => e.target.style.borderColor = "#DDE8DD"}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#5A6E5A",
            marginBottom: 8,
          }}>
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "#F9FCF9",
              border: "1px solid #DDE8DD",
              borderRadius: 16,
              color: "#2C3E2C",
              fontSize: "0.9rem",
              outline: "none",
              resize: "vertical",
              minHeight: 120,
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s",
            }}
            placeholder="I'm looking for a planter for my monstera..."
            onFocus={(e) => e.target.style.borderColor = "#7BA37B"}
            onBlur={(e) => e.target.style.borderColor = "#DDE8DD"}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <AuthButton
            variant="primary"
            type="submit"
            fullWidth={false}
          >
            {status === "loading" ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: "2px solid transparent",
                  borderTopColor: "currentColor",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Sending...
              </>
            ) : "Send Message"}
          </AuthButton>

          {status === "success" && (
            <div style={{
              color: "#7BA37B",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6 12L3 9" stroke="#7BA37B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Message sent successfully! We'll reply within 24 hours.
            </div>
          )}

          {status === "error" && (
            <div style={{
              color: "#C47A5D",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V8M8 12H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="#C47A5D" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Failed to send. Please try again.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

const additionalCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes sway {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(2deg); }
  }
  @keyframes bloom {
    0% { transform: scale(0.95); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

/* HOOK: scroll-reveal */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setVisible(true), delay);
          obs.unobserve(el);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return { ref, visible };
}

/* BUTTON COMPONENTS */
interface AuthButtonProps {
  children: ReactNode;
  variant: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  href?: string;
}

function AuthButton({ children, variant, onClick, fullWidth = false, type = "button", href }: AuthButtonProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 28px",
    borderRadius: 40,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
    letterSpacing: "0.02em",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1)",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    width: fullWidth ? "100%" : "auto",
    textDecoration: "none",
    boxShadow: hovered ? "0 15px 30px -10px rgba(123, 163, 123, 0.3)" : "none",
  };

  const variants = {
    primary: {
      background: "#7BA37B",
      color: "#ffffff",
    },
    secondary: {
      background: "#F0F7F0",
      color: "#2C3E2C",
    },
    outline: {
      background: "transparent",
      color: "#2C3E2C",
      border: "1.5px solid #DDE8DD",
    }
  };

  if (href) {
    return (
      <a
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...baseStyle, ...variants[variant] }}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      type={type}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
}

/* PRODUCT CARD - FLOWERPOT STYLE */
interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  badge?: string;
  potSize: string;
  material: string;
  delay: number;
}

function ProductCard({ image, name, price, originalPrice, rating, reviews, badge, potSize, material, delay }: ProductCardProps) {
  const { ref, visible } = useReveal(delay);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 32,
        padding: "20px 20px 24px",
        position: "relative",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateY(-8px)" : "translateY(0)") : "translateY(30px)",
        transition: "all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1)",
        boxShadow: hovered 
          ? "0 30px 50px -20px rgba(123,163,123,0.3), 0 0 0 1px #7BA37B20" 
          : "0 10px 30px -15px rgba(44,62,44,0.1), 0 0 0 1px #E8F0E8",
        cursor: "pointer",
      }}
    >
      {badge && (
        <div style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 2,
          background: badge === "New" ? "#7BA37B" : badge === "Best Seller" ? "#C47A5D" : "#E6B87A",
          color: "#ffffff",
          fontSize: "0.7rem",
          fontWeight: 500,
          padding: "6px 14px",
          borderRadius: 30,
          letterSpacing: "0.02em",
        }}>
          {badge}
        </div>
      )}

      <div style={{
        width: "100%",
        aspectRatio: "1/1",
        borderRadius: 28,
        overflow: "hidden",
        marginBottom: 20,
        background: "#F9FCF9",
      }}>
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        />
      </div>

      <div style={{ padding: "0 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "1.3rem",
            color: "#2C3E2C",
            margin: 0,
          }}>{name}</h3>
          <div style={{
            background: "#F0F7F0",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: "0.7rem",
            color: "#5A6E5A",
          }}>
            {potSize}
          </div>
        </div>

        <p style={{
          color: "#7BA37B",
          fontSize: "0.8rem",
          marginBottom: 12,
          fontStyle: "italic",
        }}>{material}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill={i < rating ? "#E6B87A" : "#E8F0E8"}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span style={{ color: "#5A6E5A", fontSize: "0.8rem" }}>({reviews} reviews)</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "#2C3E2C",
              fontFamily: "'Cormorant Garamond', serif",
            }}>{price}</span>
            {originalPrice && (
              <span style={{
                fontSize: "0.9rem",
                color: "#A0B8A0",
                textDecoration: "line-through",
                marginLeft: 8,
              }}>{originalPrice}</span>
            )}
          </div>
          <button style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: hovered ? "#7BA37B" : "#F0F7F0",
            border: "none",
            cursor: "pointer",
            color: hovered ? "#ffffff" : "#7BA37B",
            fontSize: "1.2rem",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* CATEGORY CARD - PLANT-INSPIRED */
interface CategoryCardProps {
  title: string;
  image: string;
  count: string;
  color: string;
  delay: number;
}

function CategoryCard({ title, image, count, color, delay }: CategoryCardProps) {
  const { ref, visible } = useReveal(delay);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 32,
        padding: "32px 24px",
        position: "relative",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(30px)",
        transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1)",
        boxShadow: hovered 
          ? `0 25px 40px -15px ${color}40` 
          : "0 10px 30px -15px rgba(44,62,44,0.08), 0 0 0 1px #E8F0E8",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      <div style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        margin: "0 auto 20px",
        overflow: "hidden",
        background: "#F9FCF9",
        border: `3px solid ${color}`,
        transition: "transform 0.4s, box-shadow 0.4s",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        boxShadow: hovered ? `0 10px 25px -5px ${color}` : "none",
      }}>
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: "1.4rem",
        marginBottom: 6,
        color: "#2C3E2C",
      }}>{title}</h3>
      
      <p style={{
        color: color,
        fontSize: "0.9rem",
        fontWeight: 500,
      }}>{count} planters</p>
    </div>
  );
}

/* HERO CAROUSEL - GARDEN INSPIRED */
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBannerImages() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('websites')
          .select('hero_banner1, hero_banner2, hero_banner3, hero_banner4, hero_banner5')
          .limit(1)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const images = [
            data.hero_banner1,
            data.hero_banner2,
            data.hero_banner3,
            data.hero_banner4,
            data.hero_banner5
          ].filter((image): image is string => image !== null && image !== '');
          
          if (images.length > 0) {
            setBannerImages(images);
          } else {
            // Botanical garden-inspired fallback images
            setBannerImages([
              "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200", // Lush greenery
              "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200", // Terracotta pots
              "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200", // Succulent arrangement
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching banner images:', err);
        setError('Failed to load banner images');
        setBannerImages([
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200",
          "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200",
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200",
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchBannerImages();
  }, []);

  useEffect(() => {
    if (!autoplay || bannerImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, bannerImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  if (loading) {
    return (
      <div style={{
        width: "100%",
        height: "min(650px, 85vh)",
        borderRadius: 32,
        background: "#F9FCF9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5A6E5A",
      }}>
        Loading garden inspirations...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: "100%",
        height: "min(650px, 85vh)",
        borderRadius: 32,
        background: "#F9FCF9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#C47A5D",
      }}>
        {error}
      </div>
    );
  }

  if (bannerImages.length === 0) {
    return (
      <div style={{
        width: "100%",
        height: "min(650px, 85vh)",
        borderRadius: 32,
        background: "#F9FCF9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5A6E5A",
      }}>
        No garden images available
      </div>
    );
  }

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "min(650px, 85vh)",
      overflow: "hidden",
      borderRadius: 32,
      boxShadow: "0 30px 60px -20px rgba(44,62,44,0.2)",
    }}>
      {bannerImages.map((image, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: index === currentSlide ? 1 : 0,
            transition: "opacity 0.8s cubic-bezier(0.2, 0.9, 0.4, 1)",
            pointerEvents: index === currentSlide ? "auto" : "none",
          }}
        >
          <img
            src={image}
            alt={`Garden inspiration ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ))}

      {bannerImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={{
              position: "absolute",
              left: 24,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#ffffff",
              border: "none",
              borderRadius: "50%",
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#2C3E2C",
              fontSize: 24,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 10,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#7BA37B";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#2C3E2C";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            ←
          </button>
          
          <button
            onClick={nextSlide}
            style={{
              position: "absolute",
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#ffffff",
              border: "none",
              borderRadius: "50%",
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#2C3E2C",
              fontSize: 24,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 10,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#7BA37B";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#2C3E2C";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            →
          </button>
        </>
      )}

      {bannerImages.length > 1 && (
        <div style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          zIndex: 10,
        }}>
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentSlide ? 40 : 12,
                height: 12,
                borderRadius: 20,
                background: index === currentSlide ? "#7BA37B" : "#DDE8DD",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* FEATURE CARD - PLANT CARE THEMED */
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const { ref, visible } = useReveal(delay);

  return (
    <div
      ref={ref}
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: "28px 20px",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ${delay}ms cubic-bezier(0.2, 0.9, 0.4, 1), transform 0.6s ${delay}ms cubic-bezier(0.2, 0.9, 0.4, 1)`,
        boxShadow: "0 10px 30px -15px rgba(44,62,44,0.08), 0 0 0 1px #E8F0E8",
      }}
    >
      <div style={{
        width: 70,
        height: 70,
        borderRadius: "50%",
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        fontSize: "2rem",
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: "1.2rem",
        marginBottom: 8,
        color: "#2C3E2C",
      }}>{title}</h3>
      <p style={{
        color: "#5A6E5A",
        fontSize: "0.85rem",
        lineHeight: 1.6,
        margin: 0,
      }}>{description}</p>
    </div>
  );
}

/* MAIN PAGE - DITUPETAL */
export default function DituPetal() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const featuredProducts = [
    {
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
      name: "Terracotta Heritage",
      price: "$45",
      originalPrice: "$65",
      rating: 5,
      reviews: 128,
      badge: "Best Seller",
      potSize: "8\"",
      material: "Hand-thrown terracotta",
      delay: 0,
    },
    {
      image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400",
      name: "Ceramic Glaze",
      price: "$58",
      rating: 4,
      reviews: 89,
      badge: "New",
      potSize: "6\"",
      material: "Glazed ceramic",
      delay: 150,
    },
    {
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      name: "Hanging Planter",
      price: "$38",
      originalPrice: "$48",
      rating: 5,
      reviews: 67,
      badge: "Sale",
      potSize: "5\"",
      material: "Macramé + ceramic",
      delay: 300,
    },
    {
      image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400",
      name: "Minimal Concrete",
      price: "$52",
      rating: 4,
      reviews: 42,
      potSize: "7\"",
      material: "Aged concrete",
      delay: 450,
    },
  ];

  const categories = [
    { title: "Terracotta", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200", count: "24", color: "#C47A5D", delay: 0 },
    { title: "Ceramic", image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=200", count: "36", color: "#7BA37B", delay: 100 },
    { title: "Hanging", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200", count: "18", color: "#E6B87A", delay: 200 },
    { title: "Concrete", image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=200", count: "12", color: "#8A9A8A", delay: 300 },
  ];

  const features = [
    { icon: "🌱", title: "Plant Care Tips", description: "Expert advice for happy plants", color: "#7BA37B", delay: 0 },
    { icon: "🚚", title: "Eco Packaging", description: "100% biodegradable materials", color: "#E6B87A", delay: 150 },
    { icon: "💚", title: "Plant Matching", description: "Find your perfect planter match", color: "#C47A5D", delay: 300 },
    { icon: "🔄", title: "30-Day Growth", description: "Happiness guarantee", color: "#8A9A8A", delay: 450 },
  ];

  const LOGIN_URL = "/login";
  const SIGNUP_URL = "/signup";
  const CART_URL = "/cart";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; }
        body { background: #F9FCF9; }
        ${additionalCSS}
      `}</style>

      <div style={{
        background: "#F9FCF9", 
        color: "#2C3E2C", 
        minHeight: "100vh",
        overflowX: "hidden", 
        fontFamily: "'Inter', sans-serif",
      }}>

        <nav style={{
          position: "sticky", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 100,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "16px 32px",
          background: "#ffffff",
          borderBottom: "1px solid #E8F0E8",
          boxShadow: "0 4px 20px rgba(44,62,44,0.03)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "2.2rem",
              color: "#2C3E2C",
              margin: 0,
              letterSpacing: "-0.02em",
            }}>
              Ditu<span style={{ color: "#7BA37B" }}>Petal</span>
            </h1>

            <div style={{ display: "flex", gap: 24, display: "none", "@media (min-width: 768px)": { display: "flex" } } as any}>
              {["Garden", "Planters", "Collections", "Care Guide", "Our Story"].map(item => (
                <a key={item} href="#" style={{
                  color: "#5A6E5A",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 400,
                }}>{item}</a>
              ))}
            </div>
          </div>
          
          <div style={{
            flex: 1,
            maxWidth: 400,
            margin: "0 24px",
            display: "none",
            "@media (min-width: 768px)": { display: "block" }
          } as any}>
            <div style={{
              display: "flex",
              background: "#F9FCF9",
              border: "1px solid #DDE8DD",
              borderRadius: 40,
              overflow: "hidden",
            }}>
              <input
                type="text"
                placeholder="Search for planters..."
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  color: "#2C3E2C",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <button style={{
                padding: "12px 24px",
                background: "transparent",
                border: "none",
                color: "#7BA37B",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}>
                🌱
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AuthButton variant="secondary" href={CART_URL}>
              🪴 Cart (0)
            </AuthButton>
            <div style={{ display: "flex", gap: 8 }}>
              <AuthButton variant="outline" href={LOGIN_URL}>Log In</AuthButton>
              <AuthButton variant="primary" href={SIGNUP_URL}>Sign Up</AuthButton>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{
          padding: "32px 32px 24px",
          maxWidth: 1400,
          margin: "0 auto",
        }}>
          <HeroCarousel />
        </section>

        {/* Features Bar */}
        <section style={{
          padding: "24px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section style={{
          padding: "40px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 20,
          }}>
            <div>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7BA37B",
                marginBottom: 8,
                display: "block",
              }}>
                Planter Collections
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                color: "#2C3E2C",
                margin: 0,
              }}>
                Find your perfect pot
              </h2>
            </div>
            <AuthButton variant="outline" href="/categories">
              Explore All
              <span style={{ fontSize: "1.2rem" }}>→</span>
            </AuthButton>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
          }}>
            {categories.map((cat, index) => (
              <CategoryCard key={index} {...cat} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={{
          padding: "40px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 20,
          }}>
            <div>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7BA37B",
                marginBottom: 8,
                display: "block",
              }}>
                Hand-picked for you
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                color: "#2C3E2C",
                margin: 0,
              }}>
                Popular planters
              </h2>
            </div>
            <AuthButton variant="outline" href="/shop">
              View All
              <span style={{ fontSize: "1.2rem" }}>→</span>
            </AuthButton>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {featuredProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </section>

        {/* Garden Inspiration Banner */}
        <section style={{
          padding: "40px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #2C3E2C 0%, #7BA37B 100%)",
            borderRadius: 32,
            padding: "60px 40px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 30px 50px -20px rgba(44,62,44,0.4)",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 400,
              height: 400,
              background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
            }} />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(-30%, 30%)",
            }} />
            
            <div style={{ position: "relative", zIndex: 2, maxWidth: 600 }}>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#E6B87A",
                marginBottom: 16,
                display: "block",
              }}>
                Spring Collection
              </span>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                color: "#ffffff",
                marginBottom: 16,
              }}>
                Bring nature home
              </h3>
              <p style={{
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.9)",
                marginBottom: 30,
                fontStyle: "italic",
              }}>
                Discover our new collection of handcrafted planters, made for plant lovers by plant lovers.
              </p>
              <AuthButton variant="primary" href="/spring-collection">
                Explore Collection
                <span style={{ fontSize: "1.2rem" }}>→</span>
              </AuthButton>
            </div>
          </div>
        </section>

        {/* Plant Care Tips */}
        <section style={{
          padding: "40px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 32,
            padding: "40px",
            border: "1px solid #E8F0E8",
          }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7BA37B",
                marginBottom: 8,
                display: "block",
              }}>
                Plant Parent Tips
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                color: "#2C3E2C",
                margin: 0,
              }}>
                Happy plants, happy home
              </h2>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 30,
            }}>
              {[
                { icon: "💧", title: "Water Wisdom", tip: "Check soil moisture before watering - your plant will thank you" },
                { icon: "☀️", title: "Light Love", tip: "Most plants thrive in bright, indirect light" },
                { icon: "🪴", title: "Pot Size Matters", tip: "Choose a pot 2 inches larger than the root ball" },
                { icon: "🌿", title: "Seasonal Care", tip: "Adjust watering frequency with the seasons" },
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    fontSize: "2rem",
                    background: "#F0F7F0",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {tip.icon}
                  </div>
                  <div>
                    <h4 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      marginBottom: 4,
                      color: "#2C3E2C",
                    }}>{tip.title}</h4>
                    <p style={{ color: "#5A6E5A", fontSize: "0.9rem" }}>{tip.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section style={{
          padding: "40px 32px 60px",
          maxWidth: 1000,
          margin: "0 auto",
        }}>
          <ContactForm />
        </section>

        {/* Footer */}
        <footer style={{
          background: "#ffffff",
          borderTop: "1px solid #E8F0E8",
          padding: "60px 32px 30px",
        }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
          }}>
            <div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "2rem",
                color: "#2C3E2C",
                marginBottom: 16,
              }}>
                Ditu<span style={{ color: "#7BA37B" }}>Petal</span>
              </h3>
              <p style={{ color: "#5A6E5A", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
                Bringing beauty to your green spaces with handcrafted planters made for plant lovers.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {["📷", "📘", "🌿", "🎵"].map(social => (
                  <a key={social} href="#" style={{
                    width: 40,
                    height: 40,
                    background: "#F0F7F0",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7BA37B",
                    textDecoration: "none",
                    fontSize: "1.2rem",
                  }}>{social}</a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ color: "#2C3E2C", marginBottom: 20, fontSize: "1rem", fontWeight: 600 }}>Shop</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["All Planters", "New Arrivals", "Best Sellers", "Sale", "Gift Cards"].map(item => (
                  <li key={item} style={{ marginBottom: 12 }}>
                    <a href="#" style={{ color: "#5A6E5A", textDecoration: "none", fontSize: "0.9rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: "#2C3E2C", marginBottom: 20, fontSize: "1rem", fontWeight: 600 }}>Learn</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Plant Care Guide", "Pot Size Guide", "Material Guide", "Blog", "FAQs"].map(item => (
                  <li key={item} style={{ marginBottom: 12 }}>
                    <a href="#" style={{ color: "#5A6E5A", textDecoration: "none", fontSize: "0.9rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: "#2C3E2C", marginBottom: 20, fontSize: "1rem", fontWeight: 600 }}>Newsletter</h4>
              <p style={{ color: "#5A6E5A", fontSize: "0.9rem", marginBottom: 16 }}>
                Get plant care tips and new arrivals
              </p>
              <div style={{
                display: "flex",
                background: "#F9FCF9",
                border: "1px solid #DDE8DD",
                borderRadius: 40,
                overflow: "hidden",
              }}>
                <input
                  type="email"
                  placeholder="Your email"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "transparent",
                    border: "none",
                    color: "#2C3E2C",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button style={{
                  padding: "12px 24px",
                  background: "#7BA37B",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 500,
                }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div style={{
            maxWidth: 1200,
            margin: "40px auto 0",
            paddingTop: 30,
            borderTop: "1px solid #E8F0E8",
            textAlign: "center",
            color: "#8A9A8A",
            fontSize: "0.85rem",
          }}>
            <p>© 2026 DituPetal. Made with 🌱 for plant lovers everywhere.</p>
          </div>
        </footer>
      </div>
    </>
  );
}