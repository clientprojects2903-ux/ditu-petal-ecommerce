// app/admin/categories/add/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  })

  const supabase = createClient()

  // Generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-generate slug from name if slug field is empty or hasn't been manually edited
      if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (!formData.name || !formData.slug) {
        alert('Name and slug are required')
        return
      }

      const { error } = await supabase
        .from('categories')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: formData.seo_keywords || null
        }])

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          alert('A category with this slug already exists')
        } else {
          throw error
        }
      } else {
        alert('Category created successfully')
        router.push('/admin/category')
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error creating category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/admin/category"
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Add New Category</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Basic Information</h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="enter-category-slug"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for the category (auto-generated from name)
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category description (optional)"
                disabled={loading}
              />
            </div>
          </div>

          {/* SEO Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">SEO Settings</h2>
            
            <div className="mb-4">
              <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                id="seo_title"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SEO title (optional)"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended length: 50-60 characters
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                id="seo_description"
                name="seo_description"
                value={formData.seo_description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SEO meta description (optional)"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended length: 150-160 characters
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <input
                type="text"
                id="seo_keywords"
                name="seo_keywords"
                value={formData.seo_keywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SEO keywords (comma separated)"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/categories"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}