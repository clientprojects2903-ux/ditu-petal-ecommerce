'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

interface Product {
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
  categories?: {
    name: string;
  } | null;
  category_name?: string;
}

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug();
    }
  }, [slug]);

  // Update document title when product is loaded
  useEffect(() => {
    if (product) {
      // Set the page title using the seo_title or fallback to product name
      document.title = product.seo_title || `${product.name} - Admin Panel`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', product.seo_description || product.short_description || product.name || 'Product details');
      
      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', product.seo_keywords || `${product.name}, ${product.category_name || 'product'}`);
      
      // Update meta robots (index/follow for active products, noindex for inactive)
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', product.is_active ? 'index, follow' : 'noindex, nofollow');
      
      // Update Open Graph tags for social sharing
      updateOpenGraphTags(product);
      
      // Update canonical URL
      updateCanonicalUrl(product);
    }
  }, [product]);

  const updateOpenGraphTags = (product: Product) => {
    // Facebook/Open Graph
    const ogTags = [
      { property: 'og:title', content: product.seo_title || product.name },
      { property: 'og:description', content: product.seo_description || product.short_description || product.name },
      { property: 'og:url', content: `${window.location.origin}/admin/products/${product.slug}` },
      { property: 'og:type', content: 'product' },
      { property: 'og:image', content: product.hero_image_1 || product.thumbnail },
      { property: 'product:price:amount', content: product.price.toString() },
      { property: 'product:price:currency', content: 'INR' },
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: product.seo_title || product.name },
      { name: 'twitter:description', content: product.seo_description || product.short_description || product.name },
      { name: 'twitter:image', content: product.hero_image_1 || product.thumbnail },
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  };

  const updateCanonicalUrl = (product: Product) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/admin/products/${product.slug}`);
  };

  const fetchProductBySlug = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching product with slug:', slug); // Debug log
      
      const response = await fetch(`/api/products/slug/${slug}`);
      
      // Log the response status for debugging
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('Response data:', result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch product');
      }

      // Add category name
      const productWithCategory = {
        ...result.data,
        category_name: result.data.categories?.name || 'N/A'
      };
      
      setProduct(productWithCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Set loading page title
    document.title = 'Loading Product... - Admin Panel';
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    // Set error page title
    document.title = 'Product Not Found - Admin Panel';
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Product not found'}
        </div>
        <div className="mt-4">
          <Link
            href="/admin/product"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Additional Head content can be added here if needed */}
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/product"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">Product Details</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/admin/products/${product.slug}/edit`}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Edit Product
            </Link>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Thumbnail</p>
              <img src={product.thumbnail} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
            </div>
            {product.hero_image_1 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Hero Image 1</p>
                <img src={product.hero_image_1} alt="Hero 1" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
            {product.hero_image_2 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Hero Image 2</p>
                <img src={product.hero_image_2} alt="Hero 2" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
            {product.hero_image_3 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Hero Image 3</p>
                <img src={product.hero_image_3} alt="Hero 3" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 text-lg">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Slug</p>
              <p className="mt-1">{product.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="mt-1">{product.category_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="mt-1 text-lg font-semibold">₹{product.price}</p>
              {product.compare_price && (
                <p className="text-sm text-gray-500 line-through">₹{product.compare_price}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock</p>
              <p className="mt-1">{product.stock || 0} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {product.is_featured ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Current Page Title</p>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-900 font-medium">{document.title}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">SEO Title (Browser Tab)</p>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 font-medium">{product.seo_title || product.name}</p>
                {!product.seo_title && (
                  <p className="text-xs text-gray-400 mt-1">Using product name as fallback</p>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Meta Description</p>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{product.seo_description || product.short_description || 'No meta description available'}</p>
                {!product.seo_description && product.short_description && (
                  <p className="text-xs text-gray-400 mt-1">Using short description as fallback</p>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Meta Keywords</p>
              <div className="mt-1">
                {product.seo_keywords ? (
                  <div className="flex flex-wrap gap-2">
                    {product.seo_keywords.split(',').map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No keywords specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Descriptions</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Short Description</p>
              <p className="text-gray-700">{product.short_description || 'No short description'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Full Description</p>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description || 'No description'}</p>
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Physical Attributes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Material</p>
              <p className="mt-1">{product.material || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Color</p>
              <p className="mt-1">{product.color || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="mt-1">{product.size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Height</p>
              <p className="mt-1">{product.height_cm ? `${product.height_cm} cm` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Diameter</p>
              <p className="mt-1">{product.diameter_cm ? `${product.diameter_cm} cm` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="mt-1">{product.weight_kg ? `${product.weight_kg} kg` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Drainage Hole</p>
              <p className="mt-1">{product.drainage_hole ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suitable For</p>
              <p className="mt-1">{product.suitable_for || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Created: {product.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p>Last Updated: {product.updated_at ? new Date(product.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}