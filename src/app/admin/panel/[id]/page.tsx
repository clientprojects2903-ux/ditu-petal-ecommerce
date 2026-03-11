'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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

export default function ViewWebsitePage() {
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
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
    } catch (error) {
      console.error('Error fetching website:', error)
      alert('Error fetching website')
      router.push('/admin/websites')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading website...</p>
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Website not found</p>
          <Link href="/admin/websites" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Websites
          </Link>
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
                href="/admin/websites"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
                <p className="text-sm text-gray-600 mt-1">View website configuration</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/websites/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Website
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="h-64 relative"
              style={{ backgroundColor: website.background_color || '#f3f4f6' }}
            >
              {website.image ? (
                <img
                  src={website.image}
                  alt={website.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image uploaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Website Name</label>
                  <p className="font-medium">{website.name}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: website.background_color || '#ffffff' }}
                    />
                    <p className="font-medium">{website.background_color || '#ffffff'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="font-medium whitespace-pre-wrap">{website.description || 'No description provided'}</p>
                </div>
              </div>
            </div>

            {/* Headings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Headings
              </h2>
              
              <div className="space-y-4">
                {website.heading && website.heading.length > 0 ? (
                  website.heading.map((heading, index) => (
                    <div key={index}>
                      <label className="text-sm text-gray-500">Heading {index + 1}</label>
                      <p className="font-medium">{heading || '(empty)'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No headings provided</p>
                )}
              </div>
            </div>

            {/* Additional Text */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Additional Text
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Side Text</label>
                  <p className="font-medium whitespace-pre-wrap">{website.side_text || 'No side text provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Vertical Text</label>
                  <p className="font-medium whitespace-pre-wrap">{website.vertical_text || 'No vertical text provided'}</p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Metadata
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Created At</label>
                  <p className="font-medium">
                    {website.created_at ? new Date(website.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <p className="font-medium">
                    {website.updated_at ? new Date(website.updated_at).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Website ID</label>
                  <p className="font-medium text-sm text-gray-600">{website.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}