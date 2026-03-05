'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useDropzone } from 'react-dropzone'

// Types
interface Website {
  id: string
  name: string
  hero_banner1: string | null
  hero_banner2: string | null
  hero_banner3: string | null
  hero_banner4: string | null
  hero_banner5: string | null
  created_at: string | null
  updated_at: string | null
}

interface WebsiteFormData {
  name: string
  hero_banner1: File | string | null
  hero_banner2: File | string | null
  hero_banner3: File | string | null
  hero_banner4: File | string | null
  hero_banner5: File | string | null
}

// Image Upload Component
interface ImageUploadProps {
  currentImage: string | null
  onImageChange: (file: File | null) => void
  label: string
}

function ImageUpload({ currentImage, onImageChange, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage)

  useEffect(() => {
    setPreview(currentImage)
  }, [currentImage])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      onImageChange(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [onImageChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {preview ? (
        <div className="relative">
          <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}
    </div>
  )
}

// Main Page Component
export default function WebsitesPage() {
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<WebsiteFormData>({
    name: '',
    hero_banner1: null,
    hero_banner2: null,
    hero_banner3: null,
    hero_banner4: null,
    hero_banner5: null,
  })

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch website on mount
  useEffect(() => {
    fetchMainWebsite()
  }, [])

  const fetchMainWebsite = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No website found
          setWebsite(null)
        } else {
          throw error
        }
      } else {
        setWebsite(data)
        setFormData({
          name: data.name,
          hero_banner1: data.hero_banner1,
          hero_banner2: data.hero_banner2,
          hero_banner3: data.hero_banner3,
          hero_banner4: data.hero_banner4,
          hero_banner5: data.hero_banner5,
        })
      }
    } catch (error) {
      console.error('Error fetching website:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (field: keyof WebsiteFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${path}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('website-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('website-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!website) return

    setSaving(true)
    try {
      const updates: Partial<Website> = {
        name: formData.name,
        updated_at: new Date().toISOString(),
      }

      // Handle image uploads for all 5 banners
      for (let i = 1; i <= 5; i++) {
        const field = `hero_banner${i}` as keyof WebsiteFormData
        const value = formData[field]
        
        if (value instanceof File) {
          const publicUrl = await uploadImage(value, 'hero_banners')
          if (publicUrl) {
            updates[field] = publicUrl
          }
        } else if (typeof value === 'string') {
          updates[field] = value
        } else {
          updates[field] = null
        }
      }

      const { error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', website.id)

      if (error) throw error

      await fetchMainWebsite()
      alert('Website updated successfully!')
    } catch (error) {
      console.error('Error updating website:', error)
      alert('Error updating website. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (website) {
      setFormData({
        name: website.name,
        hero_banner1: website.hero_banner1,
        hero_banner2: website.hero_banner2,
        hero_banner3: website.hero_banner3,
        hero_banner4: website.hero_banner4,
        hero_banner5: website.hero_banner5,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">No Website Found</h2>
          <p className="text-yellow-600 mb-6">Please add a website in the database to get started.</p>
          <button
            onClick={() => {/* Add functionality to create a new website */}}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Website
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Website Configuration</h1>
          <p className="text-gray-600 mt-1">Manage your main website content and banners</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Website Name Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Hero Banners Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hero Banners</h2>
              <p className="text-gray-600 text-sm mt-1">Upload up to 5 hero banners for your website's homepage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ImageUpload
                currentImage={typeof formData.hero_banner1 === 'string' ? formData.hero_banner1 : null}
                onImageChange={(file) => handleImageChange('hero_banner1', file)}
                label="Hero Banner 1"
              />
              <ImageUpload
                currentImage={typeof formData.hero_banner2 === 'string' ? formData.hero_banner2 : null}
                onImageChange={(file) => handleImageChange('hero_banner2', file)}
                label="Hero Banner 2"
              />
              <ImageUpload
                currentImage={typeof formData.hero_banner3 === 'string' ? formData.hero_banner3 : null}
                onImageChange={(file) => handleImageChange('hero_banner3', file)}
                label="Hero Banner 3"
              />
              <ImageUpload
                currentImage={typeof formData.hero_banner4 === 'string' ? formData.hero_banner4 : null}
                onImageChange={(file) => handleImageChange('hero_banner4', file)}
                label="Hero Banner 4"
              />
              <ImageUpload
                currentImage={typeof formData.hero_banner5 === 'string' ? formData.hero_banner5 : null}
                onImageChange={(file) => handleImageChange('hero_banner5', file)}
                label="Hero Banner 5"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}