// components/sidebar.tsx
'use client'

import { Home, TrendingUp, Calendar, Briefcase, Settings, MessageSquare, Users, UserPlus, Notebook, User2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { FaProductHunt } from 'react-icons/fa'
import { TbCategory } from 'react-icons/tb'

type UserRole = 'influencer' | 'brand' | 'admin' | null

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  roles: UserRole[]
  matchExact?: boolean
  parentId?: string
}

export function Sidebar() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const dashboardRoutes = {
    admin: {
      tasks: '/dashboard/admin/task',
      invites: '/dashboard/admin/invite',
    },
    brand: {
      tasks: '/dashboard/brand/task',
      invites: '/dashboard/brand/invite',
    },
    influencer: {
      tasks: '/dashboard/influencer/task',
      invites: '/dashboard/influencer/invite',
    }
  }

  useEffect(() => {
    fetchUserRole()
  }, [])

  async function fetchUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        const role = user.user_metadata?.role as UserRole
        setUserRole(role || null)
      } else {
        setUserRole(userData?.role as UserRole)
      }
    } catch {
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  // Define navItems as a function that depends on userRole
  const getNavItems = (): NavItem[] => [
    {
  id: 'dashboard',
  label: 'Dashboard',
  icon: <Home size={20} />,
  href: '/admin',
  roles: ['admin'],
  matchExact: true
},
    {
      id: 'product',
      label: 'Products',
      icon: <FaProductHunt size={20} />,
      href: '/admin/product',
      roles: ['admin'],
    },
   {
  id: 'user',
  label: 'Users',
  icon: <User2Icon size={20} />,
  href: '/admin/user',
  roles: ['admin']
},
    {
  id: 'category',
  label: 'Category',
  icon: <TbCategory size={20} />,
  href: userRole === 'admin'
    ? '/admin/category'
    : '/unauthorized',
  roles: ['admin'],
},
    
    {
      id: 'Panel',
      label: 'Panel',
      icon: <TrendingUp size={20} />,
      href: '/admin/panel',
      roles: ['admin']
    },
  ]

  const navItems = getNavItems()

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(userRole as any)
  )

  // Improved function to check if a nav item is active
  const isItemActive = (item: NavItem): boolean => {
    // For exact match items, only return true if paths are exactly equal
    if (item.matchExact) {
      return pathname === item.href
    }

    // For items with parentId, check exact match
    if (item.parentId) {
      return pathname === item.href
    }

    // For dashboard, be more specific to avoid false matches
    if (item.id === 'dashboard') {
      // Check if we're on a dashboard route but not on any specific section
      const dashboardPattern = new RegExp(`^/dashboard/${userRole}$`)
      return dashboardPattern.test(pathname)
    }

    // For other items, check if the path starts with the item's href
    // but ensure we're not on a different section
    return pathname.startsWith(item.href) &&
      !pathname.replace(item.href, '').includes('/')
  }

  // If loading, return null to avoid showing anything
  if (loading) {
    return null
  }

  // Only render sidebar for admin users
  if (userRole !== 'admin') {
    return null
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <img
              src="https://wuwjfagcfhowbwqwujka.supabase.co/storage/v1/object/public/website-assets/Black%20White%20Minimalist%20Beauty%20Typography%20Logo_20260302_154544_0000.png"
              alt="DituPetal Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">DituPetal</h2>
            <p className="text-sm text-gray-500 capitalize">
              {userRole ? `${userRole} Dashboard` : 'Dashboard'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => {
          const isActive = isItemActive(item)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg 
                transition-all duration-200 ease-in-out group
                ${isActive
                  ? 'bg-[#87599a] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#87599a]/10 hover:text-[#87599a] hover:scale-[1.02] hover:shadow-sm'
                }
                ${item.parentId ? 'ml-4 text-sm' : ''}
              `}
            >
              <span className={`
                transition-transform duration-200 ease-in-out
                ${!isActive && 'group-hover:scale-110'}
              `}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="
            w-full flex items-center justify-center space-x-2 px-4 py-3 
            text-gray-700 hover:bg-[#87599a]/10 hover:text-[#87599a] 
            rounded-lg transition-all duration-200 ease-in-out
            hover:scale-[1.02] hover:shadow-sm group
          "
        >
          <Settings size={20} className="transition-transform duration-200 group-hover:rotate-45" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}