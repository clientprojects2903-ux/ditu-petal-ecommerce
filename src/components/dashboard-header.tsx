"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Menu,
  User,
  ChevronDown,
  LogOut,
  TrendingUp,
  Briefcase,
  Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  profile_image_url: string | null;
  role: 'influencer' | 'brand' | 'admin';
  about?: string | null;
  instagram_url?: string | null;
  x_url?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
};

const AppHeader: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      // Fetch from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !userData) {
        console.error('Error fetching from users table:', error);
        
        // Try to create user record if it doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
              profile_image_url: authUser.user_metadata?.profile_image_url || 
                                authUser.user_metadata?.avatar_url,
              role: authUser.user_metadata?.role || 'influencer'
            }
          ])
          .select()
          .single();
        
        if (newUser && !createError) {
          setUserProfile({
            id: newUser.id,
            username: newUser.email?.split('@')[0] || 'user',
            email: newUser.email,
            full_name: newUser.full_name || newUser.email?.split('@')[0] || 'User',
            profile_image_url: newUser.profile_image_url,
            role: newUser.role as 'influencer' | 'brand' | 'admin'
          });
        } else {
          // Fallback to auth user metadata
          setUserProfile({
            id: authUser.id,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            profile_image_url: authUser.user_metadata?.profile_image_url || 
                              authUser.user_metadata?.avatar_url || 
                              null,
            role: (authUser.user_metadata?.role || 'influencer') as 'influencer' | 'brand' | 'admin'
          });
        }
      } else {
        // Map the user data to UserProfile type
        setUserProfile({
          id: userData.id,
          username: userData.email?.split('@')[0] || 'user',
          email: userData.email,
          full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
          profile_image_url: userData.profile_image_url,
          role: userData.role as 'influencer' | 'brand' | 'admin',
          about: userData.about,
          instagram_url: userData.instagram_url,
          x_url: userData.x_url,
          city: userData.city,
          state: userData.state,
          pincode: userData.pincode,
          country: userData.country
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get role-specific dashboard URL
  const getDashboardUrl = () => {
    if (!userProfile?.role) return '/dashboard';
    // Map 'influencer' to 'creator' in the URL if needed
    const urlRole = userProfile.role === 'influencer' ? 'influencer' : userProfile.role;
    return `/dashboard/${urlRole}`;
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userProfile?.role) {
      case 'influencer': return 'Influencer';
      case 'brand': return 'Brand';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (userProfile?.role) {
      case 'influencer': return <TrendingUp className="w-4 h-4" />;
      case 'brand': return <Briefcase className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userProfile?.full_name) return 'U';
    return userProfile.full_name.charAt(0).toUpperCase();
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format username for display (remove @ if present)
  const getDisplayUsername = () => {
    if (!userProfile?.username) return '';
    return userProfile.username.startsWith('@') 
      ? userProfile.username 
      : `@${userProfile.username}`;
  };

  // Get the appropriate description based on role
  const getRoleDescription = () => {
    switch (userProfile?.role) {
      case 'influencer': return 'content';
      case 'brand': return 'campaigns';
      case 'admin': return 'platform';
      default: return 'account';
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Welcome text with role info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {userProfile?.full_name || 'User'}!
            </h1>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
              {getRoleIcon()}
              <span>{getRoleDisplayName()}</span>
            </div>
          </div>
          <p className="text-gray-600">
            Here's what's happening with your {getRoleDescription()} today.
          </p>
        </div>

        {/* Right side - User profile only */}
        <div className="flex items-center">
          {/* User profile */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={toggleUserDropdown}
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={userProfile.profile_image_url} 
                    alt={userProfile.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 z-50 w-56 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      {userProfile?.profile_image_url ? (
                        <img 
                          src={userProfile.profile_image_url} 
                          alt={userProfile.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userProfile?.full_name}
                      </p>
                      <div className="flex items-center gap-1">
                        {getRoleIcon()}
                        <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {getDisplayUsername() || userProfile?.email}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push(`${getDashboardUrl()}/profile`);
                      setIsUserDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </button>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button (hidden on desktop) */}
          <button
            className="lg:hidden ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={handleToggle}
            aria-label="Toggle Menu"
          >
            {isMobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;