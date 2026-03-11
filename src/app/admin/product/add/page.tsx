'use client';

import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ImageUploadState {
  thumbnail: File | null;
  heroImage1: File | null;
  heroImage2: File | null;
  heroImage3: File | null;
  uploading: boolean;
}

const ImageUploadField = React.memo(({
  label,
  type,
  required = false,
  onFileSelect,
  compact = false
}: {
  label: string;
  type: 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3';
  required?: boolean;
  onFileSelect: (type: any, file: File | null) => void;
  compact?: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(type, file);

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setFileName('');
    }
  }, [type, onFileSelect]);

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex flex-col space-y-2">
          {/* Preview */}
          <div className="w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1">No image</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex flex-col items-center">
            <input
              type="file"
              id={`file-${type}`}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor={`file-${type}`}
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer w-full justify-center"
            >
              Choose File
            </label>
            {fileName && (
              <span className="mt-1 text-xs text-gray-600 truncate max-w-full">
                {fileName}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original layout for non-compact mode
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-start space-x-4">
        {/* Preview */}
        <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload button and file name */}
        <div className="flex-1">
          <div className="flex items-center">
            <input
              type="file"
              id={`file-${type}-full`}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor={`file-${type}-full`}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Choose File
            </label>
            {fileName && (
              <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                {fileName}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Recommended: JPG, PNG, WebP. Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  );
});

ImageUploadField.displayName = 'ImageUploadField';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: '',
    price: '',
    compare_price: '',
    stock: '',
    material: '',
    color: '',
    size: '',
    height_cm: '',
    diameter_cm: '',
    weight_kg: '',
    suitable_for: '',
    drainage_hole: true,
    is_active: true,
    is_featured: false,
    // SEO Fields
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    thumbnail: null,
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
    uploading: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      setCategories(result.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData(prev => {
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        return { ...prev, [name]: checkbox.checked };
      } else {
        return { ...prev, [name]: value };
      }
    });
  }, [errors]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
    
    // Clear name error if exists
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, [errors]);

  const handleFileSelect = useCallback((
    type: keyof Pick<ImageUploadState, 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3'>,
    file: File | null
  ) => {
    setImageUpload(prev => ({
      ...prev,
      [type]: file
    }));

    // Clear thumbnail error if exists
    if (type === 'thumbnail' && errors.thumbnail) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.thumbnail;
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (formData.compare_price && (isNaN(parseFloat(formData.compare_price)) || parseFloat(formData.compare_price) < 0)) {
      newErrors.compare_price = 'Compare price must be a positive number';
    }

    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'Stock must be a positive number';
    }

    if (!imageUpload.thumbnail) {
      newErrors.thumbnail = 'Thumbnail image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (
    file: File,
    bucket = 'product-images',
    path = ''
  ): Promise<string | null> => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadAllImages = async (): Promise<Record<string, string>> => {
    const imageUrls: Record<string, string> = {};

    if (imageUpload.thumbnail) {
      const url = await uploadImage(imageUpload.thumbnail, 'product-images', 'thumbnails');
      if (url) imageUrls.thumbnail = url;
    }

    if (imageUpload.heroImage1) {
      const url = await uploadImage(imageUpload.heroImage1, 'product-images', 'hero-images');
      if (url) imageUrls.hero_image_1 = url;
    }

    if (imageUpload.heroImage2) {
      const url = await uploadImage(imageUpload.heroImage2, 'product-images', 'hero-images');
      if (url) imageUrls.hero_image_2 = url;
    }

    if (imageUpload.heroImage3) {
      const url = await uploadImage(imageUpload.heroImage3, 'product-images', 'hero-images');
      if (url) imageUrls.hero_image_3 = url;
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Upload images first
      setImageUpload(prev => ({ ...prev, uploading: true }));
      
      let uploadedImageUrls: Record<string, string> = {};
      try {
        uploadedImageUrls = await uploadAllImages();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload images');
        setImageUpload(prev => ({ ...prev, uploading: false }));
        return;
      }

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        short_description: formData.short_description || null,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: formData.stock ? parseInt(formData.stock) : null,
        material: formData.material || null,
        color: formData.color || null,
        size: formData.size || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        diameter_cm: formData.diameter_cm ? parseFloat(formData.diameter_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        suitable_for: formData.suitable_for || null,
        drainage_hole: formData.drainage_hole,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        thumbnail: uploadedImageUrls.thumbnail || '',
        hero_image_1: uploadedImageUrls.hero_image_1 || null,
        hero_image_2: uploadedImageUrls.hero_image_2 || null,
        hero_image_3: uploadedImageUrls.hero_image_3 || null,
        // SEO Fields
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to create product';
        throw new Error(errorMessage);
      }

      setSuccess('Product created successfully! Redirecting...');
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      console.error('Error creating product:', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Image Upload Section - 4x1 Grid */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
          
          {errors.thumbnail && (
            <p className="mb-2 text-sm text-red-600">{errors.thumbnail}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Thumbnail <span className="text-red-500">*</span></p>
              <ImageUploadField
                label=""
                type="thumbnail"
                required
                onFileSelect={handleFileSelect}
                compact={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Hero Image 1</p>
              <ImageUploadField
                label=""
                type="heroImage1"
                onFileSelect={handleFileSelect}
                compact={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Hero Image 2</p>
              <ImageUploadField
                label=""
                type="heroImage2"
                onFileSelect={handleFileSelect}
                compact={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Hero Image 3</p>
              <ImageUploadField
                label=""
                type="heroImage3"
                onFileSelect={handleFileSelect}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Ceramic Planter Pot"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., ceramic-planter-pot"
              required
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Auto-generated from name, but you can customize it
            </p>
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="compare_price" className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price (₹)
              </label>
              <input
                type="number"
                id="compare_price"
                name="compare_price"
                step="0.01"
                min="0"
                value={formData.compare_price}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.compare_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.compare_price && (
                <p className="mt-1 text-sm text-red-600">{errors.compare_price}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* SEO Information - New Section */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seo_title"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Buy Ceramic Planter Pot Online | Your Store Name"
                maxLength={60}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Title for browser tab and search results (recommended: 50-60 characters)
                </p>
                <span className={`text-xs ${formData.seo_title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.seo_title.length}/60
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="seo_description"
                name="seo_description"
                rows={3}
                value={formData.seo_description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description for search engines (recommended: 150-160 characters)"
                maxLength={160}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  This may appear in search results below the title
                </p>
                <span className={`text-xs ${formData.seo_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.seo_description.length}/160
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                id="seo_keywords"
                name="seo_keywords"
                value={formData.seo_keywords}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="planter, ceramic pot, indoor plants, gardening (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma-separated keywords for search engines
              </p>
            </div>
          </div>

          {/* SEO Preview */}
          {(formData.seo_title || formData.seo_description) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <p className="text-xs text-gray-600">yourstore.com/products/{formData.slug}</p>
              <p className="text-blue-600 text-sm font-medium mt-1">
                {formData.seo_title || formData.name}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                {formData.seo_description || formData.short_description || 'No description available'}
              </p>
            </div>
          )}
        </div>

        {/* Descriptions */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Descriptions</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                id="short_description"
                name="short_description"
                rows={2}
                value={formData.short_description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description for product listings"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Physical Attributes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ceramic, Terracotta"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Red, Blue, Green"
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Small, Medium, Large"
              />
            </div>

            <div>
              <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                id="height_cm"
                name="height_cm"
                step="0.1"
                min="0"
                value={formData.height_cm}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label htmlFor="diameter_cm" className="block text-sm font-medium text-gray-700 mb-1">
                Diameter (cm)
              </label>
              <input
                type="number"
                id="diameter_cm"
                name="diameter_cm"
                step="0.1"
                min="0"
                value={formData.diameter_cm}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight_kg"
                name="weight_kg"
                step="0.1"
                min="0"
                value={formData.weight_kg}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="suitable_for" className="block text-sm font-medium text-gray-700 mb-1">
                Suitable For
              </label>
              <input
                type="text"
                id="suitable_for"
                name="suitable_for"
                value={formData.suitable_for}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Indoor plants, Outdoor plants, Succulents"
              />
            </div>
          </div>
        </div>

        {/* Status and Settings */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Status & Settings</h2>
          
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="drainage_hole"
                checked={formData.drainage_hole}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Drainage Hole</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active (Visible in store)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex justify-end space-x-3">
          <Link
            href="/admin/products"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || imageUpload.uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {(loading || imageUpload.uploading) && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading || imageUpload.uploading ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}