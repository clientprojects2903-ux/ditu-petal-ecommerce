// app/admin/categories/edit/[id]/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  created_at: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditCategoryPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  })
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const supabase = createClient()

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params
        setCategoryId(resolvedParams.id)
      } catch (error) {
        console.error('Error resolving params:', error)
        router.push('/admin/category')
      }
    }

    unwrapParams()
  }, [params, router])

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single()

        if (error) throw error

        if (data) {
          setCategory(data)
          setFormData({
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            seo_title: data.seo_title || '',
            seo_description: data.seo_description || '',
            seo_keywords: data.seo_keywords || ''
          })
        }
      } catch (error) {
        console.error('Error fetching category:', error)
        alert('Error fetching category')
        router.push('/admin/category')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, router, supabase])

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
      
      // Auto-generate slug from name if slug field hasn't been manually edited
      if (name === 'name' && prev.slug === generateSlug(prev.name)) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryId) {
      alert('Category ID not found')
      return
    }

    try {
      setSaving(true)
      
      if (!formData.name || !formData.slug) {
        alert('Name and slug are required')
        return
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: formData.seo_keywords || null
        })
        .eq('id', categoryId)

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          alert('A category with this slug already exists')
        } else {
          throw error
        }
      } else {
        alert('Category updated successfully')
        router.push('/admin/category')
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Category not found</p>
            <Link
              href="/admin/category"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Category: {category.name}</h1>
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/category"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}