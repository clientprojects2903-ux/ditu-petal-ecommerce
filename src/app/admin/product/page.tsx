'use client';

import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';



// Types based on DB schema
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
  categories?: {
    name: string;
  } | null;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Image upload state interface
interface ImageUploadState {
  thumbnail: File | null;
  heroImage1: File | null;
  heroImage2: File | null;
  heroImage3: File | null;
  uploading: boolean;
  uploadProgress: {
    thumbnail: number;
    heroImage1: number;
    heroImage2: number;
    heroImage3: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [addFormData, setAddFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    stock: 0,
    is_active: true,
    is_featured: false,
    drainage_hole: true,
    thumbnail: '',
    hero_image_1: '',
    hero_image_2: '',
    hero_image_3: '',
  });
  const [apiError, setApiError] = useState<string | null>(null);

  // Image upload states
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    thumbnail: null,
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
    uploading: false,
    uploadProgress: {
      thumbnail: 0,
      heroImage1: 0,
      heroImage2: 0,
      heroImage3: 0,
    }
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const result: ApiResponse<Product[]> = await response.json();
      
      const productsWithCategory = result.data.map(product => ({
        ...product,
        category_name: product.categories?.name || 'N/A'
      }));
      
      setProducts(productsWithCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result: ApiResponse<Category[]> = await response.json();
      setCategories(result.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Image upload function - Updated bucket name to 'product-images'
  const uploadImage = async (file: File, bucket: string = 'product-images', path: string = ''): Promise<string | null> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setApiError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((
    type: keyof Pick<ImageUploadState, 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3'>, 
    file: File | null
  ) => {
    setImageUpload(prev => ({
      ...prev,
      [type]: file
    }));
  }, []);

  // Upload all images for add product - Updated bucket path
  const uploadAllImages = async (): Promise<Partial<Product>> => {
    const imageUrls: Partial<Product> = {};
    
    // Upload thumbnail
    if (imageUpload.thumbnail) {
      const url = await uploadImage(imageUpload.thumbnail, 'product-images', 'thumbnails');
      if (url) imageUrls.thumbnail = url;
    }

    // Upload hero images
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

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = products.map(product => ({
      'Product Name': product.name,
      'Slug': product.slug,
      'Category': product.category_name || 'N/A',
      'Price': `$${product.price}`,
      'Compare Price': product.compare_price ? `$${product.compare_price}` : 'N/A',
      'Stock': product.stock || 0,
      'Material': product.material || 'N/A',
      'Color': product.color || 'N/A',
      'Size': product.size || 'N/A',
      'Height (cm)': product.height_cm || 'N/A',
      'Diameter (cm)': product.diameter_cm || 'N/A',
      'Drainage Hole': product.drainage_hole ? 'Yes' : 'No',
      'Suitable For': product.suitable_for || 'N/A',
      'Weight (kg)': product.weight_kg || 'N/A',
      'Status': product.is_active ? 'Active' : 'Inactive',
      'Featured': product.is_featured ? 'Yes' : 'No',
      'Created At': product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle Edit - Fixed to prevent re-rendering issues
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData(product);
    setIsEditModalOpen(true);
    setApiError(null);
  };

  // Fixed edit form handlers to prevent re-rendering issues
  const handleEditInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setEditFormData(prev => {
      // Handle different input types
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        return { ...prev, [name]: checkbox.checked };
      } else if (type === 'number') {
        return { ...prev, [name]: value === '' ? '' : parseFloat(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  }, []);

  // Handle name change with slug generation
  const handleEditNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setEditFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  }, []);

  const handleEditSubmit = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      setApiError(null);
      
      // Upload new images if selected
      const uploadedImageUrls = await uploadAllImages();
      
      // Merge uploaded image URLs with existing form data
      const updatedFormData = {
        ...editFormData,
        ...uploadedImageUrls
      };
      
      const { category_name, categories, ...updateData } = updatedFormData;
      
      const dataToSend = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating product with data:', dataToSend);
      
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
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

      console.log('Update successful:', responseData);
      
      // Reset image upload state
      setImageUpload({
        thumbnail: null,
        heroImage1: null,
        heroImage2: null,
        heroImage3: null,
        uploading: false,
        uploadProgress: {
          thumbnail: 0,
          heroImage1: 0,
          heroImage2: 0,
          heroImage3: 0,
        }
      });
      
      await fetchProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditFormData({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setApiError(errorMessage);
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      setApiError(null);
      
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to delete product';
        throw new Error(errorMessage);
      }

      await fetchProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setApiError(errorMessage);
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add form changes
  const handleAddInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setAddFormData(prev => {
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        return { ...prev, [name]: checkbox.checked };
      } else if (type === 'number') {
        return { ...prev, [name]: value === '' ? '' : parseFloat(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  }, []);

  const handleAddNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setAddFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  }, []);

  // Handle Add
  const handleAddSubmit = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Validate required fields
      if (!addFormData.name || !addFormData.slug || !addFormData.price) {
        throw new Error('Name, slug, and price are required fields');
      }

      // Upload images first
      setImageUpload(prev => ({ ...prev, uploading: true }));
      const uploadedImageUrls = await uploadAllImages();
      
      // Merge form data with uploaded image URLs
      const productData = {
        ...addFormData,
        ...uploadedImageUrls
      };
      
      const { category_name, categories, ...dataToSend } = productData;

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to create product';
        throw new Error(errorMessage);
      }

      // Reset form and image upload state
      setImageUpload({
        thumbnail: null,
        heroImage1: null,
        heroImage2: null,
        heroImage3: null,
        uploading: false,
        uploadProgress: {
          thumbnail: 0,
          heroImage1: 0,
          heroImage2: 0,
          heroImage3: 0,
        }
      });
      
      await fetchProducts();
      setIsAddModalOpen(false);
      setAddFormData({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        price: 0,
        stock: 0,
        is_active: true,
        is_featured: false,
        drainage_hole: true,
        thumbnail: '',
        hero_image_1: '',
        hero_image_2: '',
        hero_image_3: '',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setApiError(errorMessage);
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Image Upload Component - Memoized to prevent unnecessary re-renders
  const ImageUploadField = React.memo(({ 
    label, 
    type, 
    currentImageUrl,
    onFileSelect 
  }: { 
    label: string; 
    type: keyof Pick<ImageUploadState, 'thumbnail' | 'heroImage1' | 'heroImage2' | 'heroImage3'>;
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
          </div>
        </div>
      </div>
    );
  });

  ImageUploadField.displayName = 'ImageUploadField';

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                <button 
                  onClick={onClose} 
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full object-cover" src={product.thumbnail} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                    {product.compare_price && (
                      <div className="text-sm text-gray-500 line-through">${product.compare_price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"/></svg>
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredProducts.length)}</span>{' '}
                of <span className="font-medium">{filteredProducts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Product Details">
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Images */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <img src={selectedProduct.thumbnail} alt={selectedProduct.name} className="w-full h-32 object-cover rounded-lg" />
              {selectedProduct.hero_image_1 && (
                <img src={selectedProduct.hero_image_1} alt="Hero 1" className="w-full h-32 object-cover rounded-lg" />
              )}
              {selectedProduct.hero_image_2 && (
                <img src={selectedProduct.hero_image_2} alt="Hero 2" className="w-full h-32 object-cover rounded-lg" />
              )}
              {selectedProduct.hero_image_3 && (
                <img src={selectedProduct.hero_image_3} alt="Hero 3" className="w-full h-32 object-cover rounded-lg" />
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{selectedProduct.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                <p className="mt-1">{selectedProduct.slug}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1">{selectedProduct.category_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="mt-1">${selectedProduct.price}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Compare Price</h3>
                <p className="mt-1">{selectedProduct.compare_price ? `$${selectedProduct.compare_price}` : 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                <p className="mt-1">{selectedProduct.stock || 0}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{selectedProduct.description || 'No description'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Short Description</h3>
              <p className="mt-1">{selectedProduct.short_description || 'No short description'}</p>
            </div>

            {/* Physical Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Material</h3>
                <p className="mt-1">{selectedProduct.material || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Color</h3>
                <p className="mt-1">{selectedProduct.color || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Size</h3>
                <p className="mt-1">{selectedProduct.size || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Height (cm)</h3>
                <p className="mt-1">{selectedProduct.height_cm || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Diameter (cm)</h3>
                <p className="mt-1">{selectedProduct.diameter_cm || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Weight (kg)</h3>
                <p className="mt-1">{selectedProduct.weight_kg || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Drainage Hole</h3>
                <p className="mt-1">{selectedProduct.drainage_hole ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Suitable For</h3>
                <p className="mt-1">{selectedProduct.suitable_for || 'N/A'}</p>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedProduct.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Featured</h3>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedProduct.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedProduct.is_featured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>Created: {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleString() : 'N/A'}</div>
              <div>Updated: {selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal - Fixed with proper input handling */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product">
        {selectedProduct && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                <strong>Error:</strong> {apiError}
              </div>
            )}

            {/* Image Upload Fields */}
            <div className="border-b pb-4 mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Product Images</h4>
              
              <ImageUploadField
                label="Thumbnail"
                type="thumbnail"
                currentImageUrl={editFormData.thumbnail}
                onFileSelect={handleFileSelect}
              />
              
              <ImageUploadField
                label="Hero Image 1"
                type="heroImage1"
                currentImageUrl={editFormData.hero_image_1}
                onFileSelect={handleFileSelect}
              />
              
              <ImageUploadField
                label="Hero Image 2"
                type="heroImage2"
                currentImageUrl={editFormData.hero_image_2}
                onFileSelect={handleFileSelect}
              />
              
              <ImageUploadField
                label="Hero Image 3"
                type="heroImage3"
                currentImageUrl={editFormData.hero_image_3}
                onFileSelect={handleFileSelect}
              />
            </div>

            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={editFormData.name || ''}
                onChange={handleEditNameChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                id="edit-slug"
                name="slug"
                value={editFormData.slug || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="edit-category"
                name="category_id"
                value={editFormData.category_id || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  step="0.01"
                  value={editFormData.price || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-compare_price" className="block text-sm font-medium text-gray-700">Compare Price</label>
                <input
                  type="number"
                  id="edit-compare_price"
                  name="compare_price"
                  step="0.01"
                  value={editFormData.compare_price || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-stock" className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                id="edit-stock"
                name="stock"
                value={editFormData.stock || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="edit-description"
                name="description"
                rows={3}
                value={editFormData.description || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-short_description" className="block text-sm font-medium text-gray-700">Short Description</label>
              <textarea
                id="edit-short_description"
                name="short_description"
                rows={2}
                value={editFormData.short_description || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-material" className="block text-sm font-medium text-gray-700">Material</label>
                <input
                  type="text"
                  id="edit-material"
                  name="material"
                  value={editFormData.material || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="text"
                  id="edit-color"
                  name="color"
                  value={editFormData.color || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-size" className="block text-sm font-medium text-gray-700">Size</label>
                <input
                  type="text"
                  id="edit-size"
                  name="size"
                  value={editFormData.size || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-height_cm" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  id="edit-height_cm"
                  name="height_cm"
                  step="0.1"
                  value={editFormData.height_cm || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-diameter_cm" className="block text-sm font-medium text-gray-700">Diameter (cm)</label>
                <input
                  type="number"
                  id="edit-diameter_cm"
                  name="diameter_cm"
                  step="0.1"
                  value={editFormData.diameter_cm || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-weight_kg" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  id="edit-weight_kg"
                  name="weight_kg"
                  step="0.1"
                  value={editFormData.weight_kg || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-suitable_for" className="block text-sm font-medium text-gray-700">Suitable For</label>
              <input
                type="text"
                id="edit-suitable_for"
                name="suitable_for"
                value={editFormData.suitable_for || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="drainage_hole"
                  checked={editFormData.drainage_hole || false}
                  onChange={handleEditInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Drainage Hole</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editFormData.is_active || false}
                  onChange={handleEditInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={editFormData.is_featured || false}
                  onChange={handleEditInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Product Modal - Fixed with proper input handling */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <strong>Error:</strong> {apiError}
            </div>
          )}

          {/* Image Upload Fields for Add */}
          <div className="border-b pb-4 mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Product Images</h4>
            
            <ImageUploadField
              label="Thumbnail *"
              type="thumbnail"
              onFileSelect={handleFileSelect}
            />
            
            <ImageUploadField
              label="Hero Image 1"
              type="heroImage1"
              onFileSelect={handleFileSelect}
            />
            
            <ImageUploadField
              label="Hero Image 2"
              type="heroImage2"
              onFileSelect={handleFileSelect}
            />
            
            <ImageUploadField
              label="Hero Image 3"
              type="heroImage3"
              onFileSelect={handleFileSelect}
            />
          </div>

          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              id="add-name"
              name="name"
              value={addFormData.name || ''}
              onChange={handleAddNameChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="add-slug" className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              type="text"
              id="add-slug"
              name="slug"
              value={addFormData.slug || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="add-category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="add-category"
              name="category_id"
              value={addFormData.category_id || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-price" className="block text-sm font-medium text-gray-700">Price *</label>
              <input
                type="number"
                id="add-price"
                name="price"
                step="0.01"
                value={addFormData.price || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="add-compare_price" className="block text-sm font-medium text-gray-700">Compare Price</label>
              <input
                type="number"
                id="add-compare_price"
                name="compare_price"
                step="0.01"
                value={addFormData.compare_price || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="add-stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              id="add-stock"
              name="stock"
              value={addFormData.stock || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="add-description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="add-description"
              name="description"
              rows={3}
              value={addFormData.description || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="add-short_description" className="block text-sm font-medium text-gray-700">Short Description</label>
            <textarea
              id="add-short_description"
              name="short_description"
              rows={2}
              value={addFormData.short_description || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-material" className="block text-sm font-medium text-gray-700">Material</label>
              <input
                type="text"
                id="add-material"
                name="material"
                value={addFormData.material || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="add-color" className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                id="add-color"
                name="color"
                value={addFormData.color || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-size" className="block text-sm font-medium text-gray-700">Size</label>
              <input
                type="text"
                id="add-size"
                name="size"
                value={addFormData.size || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="add-height_cm" className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                id="add-height_cm"
                name="height_cm"
                step="0.1"
                value={addFormData.height_cm || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-diameter_cm" className="block text-sm font-medium text-gray-700">Diameter (cm)</label>
              <input
                type="number"
                id="add-diameter_cm"
                name="diameter_cm"
                step="0.1"
                value={addFormData.diameter_cm || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="add-weight_kg" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                id="add-weight_kg"
                name="weight_kg"
                step="0.1"
                value={addFormData.weight_kg || ''}
                onChange={handleAddInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="add-suitable_for" className="block text-sm font-medium text-gray-700">Suitable For</label>
            <input
              type="text"
              id="add-suitable_for"
              name="suitable_for"
              value={addFormData.suitable_for || ''}
              onChange={handleAddInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="drainage_hole"
                checked={addFormData.drainage_hole || false}
                onChange={handleAddInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Drainage Hole</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={addFormData.is_active || false}
                onChange={handleAddInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={addFormData.is_featured || false}
                onChange={handleAddInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubmit}
              disabled={loading || imageUpload.uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || imageUpload.uploading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <strong>Error:</strong> {apiError}
            </div>
          )}
          
          <p className="text-gray-700">
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}