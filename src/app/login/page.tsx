'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check for error in URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }
      
      // Redirect to role page
      if (authData.user) {
        router.replace('/role');
      }
      
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before logging in.');
      } else if (err.message.includes('rate limit')) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Clear any existing auth state
      await supabase.auth.signOut();
      
      // Sign in with Google OAuth
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
      
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to sign in with Google.';
      
      // Specific error handling
      if (err.message.includes('code challenge') || err.message.includes('code_verifier')) {
        errorMessage = 'Authentication session expired. Please try again.';
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your dashboard."
    >
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Login failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className={`w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-sm mb-6 ${
          isGoogleLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        type="button"
      >
        {isGoogleLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
            Signing in with Google...
          </>
        ) : (
          <>
            <Chrome className="w-5 h-5" />
            Sign in with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#87599a] focus:ring-2 focus:ring-[#87599a]/20 outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#87599a] focus:ring-2 focus:ring-[#87599a]/20 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link 
            href="/forgot-password" 
            className="text-sm text-[#87599a] font-medium hover:underline"
            onClick={(e) => (isLoading || isGoogleLoading) && e.preventDefault()}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          disabled={isLoading || isGoogleLoading}
          type="submit"
          className={`w-full bg-[#87599a] hover:bg-[#764a8a] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-[#87599a]/20 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link 
          href="/signup" 
          className="text-[#87599a] font-semibold hover:underline"
          onClick={(e) => (isLoading || isGoogleLoading) && e.preventDefault()}
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}