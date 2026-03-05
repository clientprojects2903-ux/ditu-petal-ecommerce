'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Types based on your DB schema
type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

type Address = {
  id?: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  country: string
  pincode: string
  is_default: boolean
}

export default function ProfileSetup() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // User details (matches users table exactly)
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    mobile_number: '',
    avatar_url: '',
  })

  // Address details (matches address table exactly)
  const [addressDetails, setAddressDetails] = useState<Address>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    is_default: true,
  })
  
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user as User)
      
      // Check if user already exists in users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      if (userError) {
        console.error('Error fetching user:', userError)
      }
      
      if (existingUser) {
        setUserDetails({
          name: existingUser.name || user.user_metadata?.full_name || '',
          email: existingUser.email || user.email || '',
          mobile_number: existingUser.mobile_number || '',
          avatar_url: existingUser.avatar_url || '',
        })
        
        if (existingUser.avatar_url) {
          setImagePreview(existingUser.avatar_url)
        }
        
        // Fetch user's default address
        const { data: addresses } = await supabase
          .from('address')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle()
        
        if (addresses) {
          setAddressDetails({
            full_name: addresses.full_name,
            phone: addresses.phone,
            address_line1: addresses.address_line1,
            address_line2: addresses.address_line2,
            city: addresses.city,
            state: addresses.state,
            country: addresses.country || 'India',
            pincode: addresses.pincode,
            is_default: addresses.is_default,
          })
        }
      } else {
        setUserDetails(prev => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.full_name || ''
        }))
        
        setAddressDetails(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || ''
        }))
      }
    } catch (err) {
      console.error('Error in checkUser:', err)
      setError('Failed to load user data')
    }
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
    setSuccess(null)
  }

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddressDetails(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
    setSuccess(null)
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!user) {
        throw new Error("User not found")
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB")
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    setError(null)
    try {
      const imageUrl = await uploadImageToSupabase(file)
      if (imageUrl) {
        setUserDetails(prev => ({
          ...prev,
          avatar_url: imageUrl,
        }))
        setSuccess("Profile image uploaded successfully")
      }
    } catch (error) {
      console.error('Error handling image upload:', error)
      setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user) {
        throw new Error('No user found')
      }

      if (!userDetails.name.trim()) {
        throw new Error('Full name is required')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userDetails.email)) {
        throw new Error('Please enter a valid email address')
      }

      // First, let's test if we can query the users table
      const { data: testQuery, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('Database connection test failed:', testError)
        throw new Error(`Database connection error: ${testError.message}`)
      }

      // Prepare user data
      const userData = {
        id: user.id,
        name: userDetails.name,
        email: userDetails.email,
        updated_at: new Date().toISOString()
      }

      // Only add optional fields if they have values
      if (userDetails.mobile_number) {
        Object.assign(userData, { mobile_number: userDetails.mobile_number })
      }
      
      if (userDetails.avatar_url) {
        Object.assign(userData, { avatar_url: userDetails.avatar_url })
      }

      console.log('Attempting to upsert user with data:', userData)

      // Try insert first (simpler operation)
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData)

      if (insertError) {
        // If insert fails because user exists, try update
        if (insertError.code === '23505') { // Unique violation
          console.log('User exists, attempting update...')
          
          const { error: updateError } = await supabase
            .from('users')
            .update(userData)
            .eq('id', user.id)

          if (updateError) {
            console.error('Update error:', updateError)
            throw new Error(`Update failed: ${updateError.message}`)
          }
        } else {
          console.error('Insert error:', insertError)
          throw new Error(`Insert failed: ${insertError.message}`)
        }
      }

      // Handle address
      if (addressDetails.address_line1 && addressDetails.city && addressDetails.pincode) {
        
        const addressData = {
          user_id: user.id,
          full_name: addressDetails.full_name || userDetails.name,
          phone: addressDetails.phone || userDetails.mobile_number,
          address_line1: addressDetails.address_line1,
          address_line2: addressDetails.address_line2 || null,
          city: addressDetails.city,
          state: addressDetails.state,
          country: addressDetails.country,
          pincode: addressDetails.pincode,
          is_default: true,
          updated_at: new Date().toISOString()
        }

        // Check if address exists
        const { data: existingAddress } = await supabase
          .from('address')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle()

        if (existingAddress) {
          // Update existing address
          const { error: addressError } = await supabase
            .from('address')
            .update(addressData)
            .eq('id', existingAddress.id)

          if (addressError) {
            console.error('Address update error:', addressError)
            throw new Error(`Address update failed: ${addressError.message}`)
          }
        } else {
          // Insert new address
          const { error: addressError } = await supabase
            .from('address')
            .insert(addressData)

          if (addressError) {
            console.error('Address insert error:', addressError)
            throw new Error(`Address insert failed: ${addressError.message}`)
          }
        }
      }

      setSuccess("Profile saved successfully!")
      
      setTimeout(() => {
        router.push('/')
      }, 1500)
      
    } catch (err) {
      console.error('Submit error details:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Set up your profile and default shipping address
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                {imagePreview || userDetails.avatar_url ? (
                  <img 
                    src={imagePreview || userDetails.avatar_url || ''} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Click to upload profile photo<br />
              <span className="text-xs">Max 5MB (JPEG, PNG, GIF, WebP)</span>
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={userDetails.name}
                onChange={handleUserInputChange}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={userDetails.email}
                onChange={handleUserInputChange}
                required
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                placeholder="+91 9876543210"
                value={userDetails.mobile_number}
                onChange={handleUserInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Default Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Default Shipping Address
            </h3>
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Full name for shipping"
                value={addressDetails.full_name}
                onChange={handleAddressInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (for shipping)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={addressDetails.phone}
                onChange={handleAddressInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                id="address_line1"
                name="address_line1"
                type="text"
                placeholder="123 Main St"
                value={addressDetails.address_line1}
                onChange={handleAddressInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="address_line2"
                name="address_line2"
                type="text"
                placeholder="Apt 4B"
                value={addressDetails.address_line2 || ''}
                onChange={handleAddressInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Mumbai"
                  value={addressDetails.city}
                  onChange={handleAddressInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Maharashtra"
                  value={addressDetails.state}
                  onChange={handleAddressInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="400001"
                  value={addressDetails.pincode}
                  onChange={handleAddressInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="India"
                  value={addressDetails.country}
                  onChange={handleAddressInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}