'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useDropzone } from 'react-dropzone'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

// Dynamically import CKEditor with no SSR
const CKEditorComponent = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading editor...</div>
        </div>
      </div>
    )
  }
)

// Rich Text Editor Wrapper Component to handle type issues
function RichTextEditor({ 
  data, 
  onChange, 
  config 
}: { 
  data: string; 
  onChange: (data: string) => void; 
  config: any;
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <CKEditorComponent
      editor={ClassicEditor as any}
      data={data}
      config={config}
      onChange={(event: any, editor: any) => {
        const editorData = editor.getData()
        onChange(editorData)
      }}
      onReady={(editor: any) => {
        console.log('Editor is ready to use!', editor)
      }}
    />
  )
}

interface Banner {
  id: string
  name: string
  background_color: string | null
  image: string | null
  description: string | null
  heading: string | null
  side_text: string | null
  vertical_text: string | null
  created_at: string | null
  updated_at: string | null
}

interface BannerFormData {
  name: string
  background_color: string
  image: File | string | null
  description: string
  heading: string
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

const mapBannerToFormData = (banner: Banner): BannerFormData => ({
  name: banner.name,
  background_color: banner.background_color || '#ffffff',
  image: banner.image,
  description: banner.description || '',
  heading: banner.heading || '',
  side_text: banner.side_text || '',
  vertical_text: banner.vertical_text || '',
})

export default function EditBannerPage() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<BannerFormData | null>(null)
  
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchBanner()
  }, [id])

  const fetchBanner = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setBanner(data)
      setFormData(mapBannerToFormData(data))
    } catch (error) {
      console.error('Error fetching banner:', error)
      alert('Error fetching banner')
      router.push('/admin/banners')
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

  const handleHeadingChange = (value: string) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      heading: value
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
    if (!banner || !formData) return

    setSaving(true)

    try {
      const updates: Partial<Banner> = {
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
        const url = await uploadImage(formData.image, 'banner-images')
        if (url) updates.image = url
      } else if (typeof formData.image === 'string') {
        updates.image = formData.image
      } else {
        updates.image = null
      }

      const { error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', banner.id)

      if (error) throw error

      alert('Banner updated successfully!')
      router.push(`/admin/panel/${id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating banner:', error)
      alert('Error updating banner')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (banner) {
      setFormData(mapBannerToFormData(banner))
    }
  }

  // CKEditor configuration
  const editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'outdent',
        'indent',
        '|',
        'link',
        'blockQuote',
        'insertTable',
        '|',
        'undo',
        'redo',
        '|',
        'removeFormat'
      ],
      shouldNotGroupWhenFull: false
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
      ]
    },
    fontSize: {
      options: ['tiny', 'small', 'default', 'big', 'huge']
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Times New Roman, Times, serif'
      ]
    },
    fontColor: {
      colors: [
        { color: 'hsl(0, 0%, 0%)', label: 'Black' },
        { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
        { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
        { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
        { color: 'hsl(0, 0%, 100%)', label: 'White' },
        { color: 'hsl(0, 100%, 50%)', label: 'Red' },
        { color: 'hsl(30, 100%, 50%)', label: 'Orange' },
        { color: 'hsl(60, 100%, 50%)', label: 'Yellow' },
        { color: 'hsl(120, 100%, 50%)', label: 'Green' },
        { color: 'hsl(180, 100%, 50%)', label: 'Cyan' },
        { color: 'hsl(240, 100%, 50%)', label: 'Blue' },
        { color: 'hsl(300, 100%, 50%)', label: 'Magenta' }
      ]
    },
    fontBackgroundColor: {
      colors: [
        { color: 'hsl(0, 0%, 0%)', label: 'Black' },
        { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
        { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
        { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
        { color: 'hsl(0, 0%, 100%)', label: 'White' },
        { color: 'hsl(0, 100%, 50%)', label: 'Red' },
        { color: 'hsl(30, 100%, 50%)', label: 'Orange' },
        { color: 'hsl(60, 100%, 50%)', label: 'Yellow' },
        { color: 'hsl(120, 100%, 50%)', label: 'Green' },
        { color: 'hsl(180, 100%, 50%)', label: 'Cyan' },
        { color: 'hsl(240, 100%, 50%)', label: 'Blue' },
        { color: 'hsl(300, 100%, 50%)', label: 'Magenta' }
      ]
    },
    alignment: {
      options: ['left', 'center', 'right', 'justify']
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
    },
    placeholder: 'Enter heading text with full rich text formatting...',
    language: 'en',
  }

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banner...</p>
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
                href={`/admin/panel/${id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
                <p className="text-sm text-gray-600 mt-1">{banner?.name}</p>
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
                  Banner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter banner name"
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
              label="Banner Main Image"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended size: 1920x1080px. Max size: 5MB
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Banner Eyebrow</h2>
            
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter banner eyebrow..."
            />
          </div>

          {/* Main Heading with CKEditor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Main Heading (Rich Text Editor)</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading Content
              </label>
              
              <div className="ckeditor-container">
                <RichTextEditor
                  data={formData.heading}
                  onChange={handleHeadingChange}
                  config={editorConfig}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>💡 Features: Text formatting, colors, lists, tables, links, and more!</span>
                <span className="font-mono">HTML formatting preserved</span>
              </div>
              
              {/* Character Count (without HTML tags) */}
              {formData.heading && (
                <div className="text-right text-xs text-gray-400 mt-2">
                  Character count: {formData.heading.replace(/<[^>]*>/g, '').length}
                </div>
              )}
            </div>
          </div>

          {/* Side Text and Vertical Text */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Background Overlay Text</h2>
            
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
              href={`/admin/panel/${id}`}
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

      {/* Add custom styles for CKEditor */}
      <style jsx global>{`
        .ckeditor-container {
          width: 100%;
        }
        .ckeditor-container .ck-editor__editable {
          min-height: 300px;
          max-height: 500px;
        }
        .ckeditor-container .ck-content {
          font-size: 14px;
          line-height: 1.6;
        }
        .ckeditor-container .ck-content h1 {
          font-size: 2em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content h2 {
          font-size: 1.5em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content h3 {
          font-size: 1.17em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content h4 {
          font-size: 1em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content h5 {
          font-size: 0.83em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content h6 {
          font-size: 0.67em;
          font-weight: bold;
        }
        .ckeditor-container .ck-content p {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  )
}