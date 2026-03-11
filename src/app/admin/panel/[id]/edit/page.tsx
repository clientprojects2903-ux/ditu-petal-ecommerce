'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useDropzone } from 'react-dropzone'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Website {
  id: string
  name: string
  background_color: string | null
  image: string | null
  description: string | null
  heading: string[] | null
  side_text: string | null
  vertical_text: string | null
  created_at: string | null
  updated_at: string | null
}

interface WebsiteFormData {
  name: string
  background_color: string
  image: File | string | null
  description: string
  heading: string[]
  side_text: string
  vertical_text: string
}

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
            <img src={preview} alt={label} className="w-full h-full object-cover"/>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            ✕
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
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}

const mapWebsiteToFormData = (website: Website): WebsiteFormData => ({
  name: website.name,
  background_color: website.background_color || '#ffffff',
  image: website.image,
  description: website.description || '',
  heading: website.heading || ['', '', ''],
  side_text: website.side_text || '',
  vertical_text: website.vertical_text || '',
})

export default function EditWebsitePage() {
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<WebsiteFormData | null>(null)
  
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchWebsite()
  }, [id])

  const fetchWebsite = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setWebsite(data)
      setFormData(mapWebsiteToFormData(data))
    } catch (error) {
      console.error('Error fetching website:', error)
      alert('Error fetching website')
      router.push('/admin/websites')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev!,
      [name]: value
    }))
  }

  const handleHeadingChange = (index: number, value: string) => {
    if (!formData) return
    const newHeadings = [...formData.heading]
    newHeadings[index] = value
    setFormData(prev => ({
      ...prev!,
      heading: newHeadings
    }))
  }

  const handleImageChange = (file: File | null) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      image: file
    }))
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
    if (!website || !formData) return

    setSaving(true)

    try {
      const updates: Partial<Website> = {
        name: formData.name,
        background_color: formData.background_color,
        description: formData.description,
        heading: formData.heading,
        side_text: formData.side_text,
        vertical_text: formData.vertical_text,
        updated_at: new Date().toISOString()
      }

      // Handle image upload
      if (formData.image instanceof File) {
        const url = await uploadImage(formData.image, 'website-images')
        if (url) updates.image = url
      } else if (typeof formData.image === 'string') {
        updates.image = formData.image
      } else {
        updates.image = null
      }

      const { error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', website.id)

      if (error) throw error

      alert('Website updated successfully!')
      router.push(`/admin/websites/${id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating website:', error)
      alert('Error updating website')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (website) {
      setFormData(mapWebsiteToFormData(website))
    }
  }

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading website...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/websites/${id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Website</h1>
                <p className="text-sm text-gray-600 mt-1">{website?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter website name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Main Image</h2>
            
            <ImageUpload
              currentImage={typeof formData.image === 'string' ? formData.image : null}
              onImageChange={handleImageChange}
              label="Website Main Image"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended size: 1920x1080px. Max size: 5MB
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter website description..."
            />
          </div>

          {/* Headings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Headings</h2>
            
            <div className="space-y-4">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heading {index + 1}
                  </label>
                  <input
                    type="text"
                    value={formData.heading[index] || ''}
                    onChange={(e) => handleHeadingChange(index, e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter heading ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Side Text and Vertical Text */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Text</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Side Text
                </label>
                <textarea
                  name="side_text"
                  value={formData.side_text}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter side text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vertical Text
                </label>
                <textarea
                  name="vertical_text"
                  value={formData.vertical_text}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter vertical text..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Changes
            </button>
            <Link
              href={`/admin/websites/${id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed min-w-[120px]"
            >
              {saving ? (
                <span className="flex items-center justify-center">
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