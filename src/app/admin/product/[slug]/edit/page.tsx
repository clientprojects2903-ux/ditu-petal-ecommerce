'use client';

import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

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
  currentImageUrl,
  onFileSelect
}: {
  label: string;
  type: 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3';
  currentImageUrl?: string | null;
  onFileSelect: (type: any, file: File | null) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(type, file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [type, onFileSelect]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-start space-x-4">
        {/* Preview */}
        <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-100">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : currentImageUrl ? (
            <img src={currentImageUrl} alt="Current" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="flex-1">
          <input
            type="file"
            id={`file-${type}`}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor={`file-${type}`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            Choose File
          </label>
          {currentImageUrl && !preview && (
            <p className="mt-1 text-xs text-gray-500">Current image shown. Select a new file to replace it.</p>
          )}
        </div>
      </div>
    </div>
  );
});

ImageUploadField.displayName = 'ImageUploadField';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({});

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    thumbnail: null,
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
    uploading: false,
  });

  useEffect(() => {
    if (slug) {
      fetchProductBySlug();
      fetchCategories();
    }
  }, [slug]);

  const fetchProductBySlug = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/products/slug/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result = await response.json();
      setProductId(result.data.id);
      setFormData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setInitialLoading(false);
    }
  };

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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        return { ...prev, [name]: checkbox.checked };
      } else if (type === 'number') {
        return { ...prev, [name]: value === '' ? null : parseFloat(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  }, []);

  const handleFileSelect = useCallback((
    type: keyof Pick<ImageUploadState, 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3'>,
    file: File | null
  ) => {
    setImageUpload(prev => ({
      ...prev,
      [type]: file
    }));
  }, []);

  const uploadImage = async (
    file: File,
    bucket = 'product-images',
    path = ''
  ): Promise<string | null> => {
    try {
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
      setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
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
    
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      // Upload new images if selected
      setImageUpload(prev => ({ ...prev, uploading: true }));
      const uploadedImageUrls = await uploadAllImages();

      // Prepare product data
      const productData = {
        ...formData,
        ...uploadedImageUrls,
        updated_at: new Date().toISOString()
      };

      // Remove fields that shouldn't be sent
      const { categories, category_name, ...dataToSend } = productData;

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to update product';
        throw new Error(errorMessage);
      }

      // Redirect to products list on success
      router.push('/admin/product');
      router.refresh();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
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
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Image Upload Section */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
          
          <ImageUploadField
            label="Thumbnail"
            type="thumbnail"
            currentImageUrl={formData.thumbnail}
            onFileSelect={handleFileSelect}
          />

          <ImageUploadField
            label="Hero Image 1"
            type="heroImage1"
            currentImageUrl={formData.hero_image_1}
            onFileSelect={handleFileSelect}
          />

          <ImageUploadField
            label="Hero Image 2"
            type="heroImage2"
            currentImageUrl={formData.hero_image_2}
            onFileSelect={handleFileSelect}
          />

          <ImageUploadField
            label="Hero Image 3"
            type="heroImage3"
            currentImageUrl={formData.hero_image_3}
            onFileSelect={handleFileSelect}
          />
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
              value={formData.name || ''}
              onChange={handleNameChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ''}
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
                value={formData.price || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                value={formData.compare_price || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              value={formData.stock || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              id="short_description"
              name="short_description"
              rows={2}
              value={formData.short_description || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                value={formData.material || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.color || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.size || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.height_cm || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.diameter_cm || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.weight_kg || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="suitable_for" className="block text-sm font-medium text-gray-700 mb-1">
                Suitable For
              </label>
              <input
                type="text"
                id="suitable_for"
                name="suitable_for"
                value={formData.suitable_for || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status and Settings */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Status & Settings</h2>
          
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="drainage_hole"
                checked={formData.drainage_hole || false}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Drainage Hole</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured || false}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex justify-end space-x-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || imageUpload.uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading || imageUpload.uploading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}