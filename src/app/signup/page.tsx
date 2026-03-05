// app/register/page.tsx
'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // 2. Create user record in your public.users table
      // mobile_number will be null initially (can be added later in profile)
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            // mobile_number is omitted, will be NULL by default
          },
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Handle unique constraint violations
        if (dbError.code === '23505') {
          if (dbError.message?.includes('email')) {
            throw new Error('Email already exists');
          }
        }
        throw dbError;
      }

      // 3. Success - show message and redirect
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login?message=Please check your email to confirm your account');
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('already registered') || err.message?.includes('Email already exists')) {
        setError('This email is already registered. Please try logging in.');
      } else if (err.message?.includes('invalid email')) {
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('password')) {
        setError('Password should be at least 6 characters long.');
      } else if (err.status === 422) {
        setError('Invalid email or password format.');
      } else if (err.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join us to start your journey."
    >
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Registration successful!</p>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Please check your email to confirm your account.
          </p>
          <p className="text-sm text-green-600 mt-1">
            Redirecting to login page...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-red-700 font-medium">Registration failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading || googleLoading || success}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {googleLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span>Connecting with Google...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name - matches DB column */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#87599a] focus:ring-2 focus:ring-[#87599a]/20 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading || success}
            />
          </div>
        </div>

        {/* Email - matches DB column */}
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
              disabled={isLoading || success}
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
              minLength={6}
              placeholder="•••••••• (min. 6 characters)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#87599a] focus:ring-2 focus:ring-[#87599a]/20 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading || success}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>At least 6 characters</span>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="text-sm text-gray-500 pt-2">
          By creating an account, you agree to our{' '}
          <Link 
            href="/terms" 
            className="text-[#87599a] font-medium hover:underline"
            onClick={(e) => (isLoading || success) && e.preventDefault()}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link 
            href="/privacy" 
            className="text-[#87599a] font-medium hover:underline"
            onClick={(e) => (isLoading || success) && e.preventDefault()}
          >
            Privacy Policy
          </Link>
        </div>

        {/* Submit Button */}
        <button
          disabled={isLoading || success}
          type="submit"
          className={`w-full bg-[#87599a] hover:bg-[#764a8a] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-[#87599a]/20 ${
            (isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Success! Redirecting...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="text-[#87599a] font-semibold hover:underline"
          onClick={(e) => (isLoading || success) && e.preventDefault()}
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}