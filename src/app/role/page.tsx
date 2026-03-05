'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function RolePage() {
  const router = useRouter();

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch user role from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      // Redirect to profile setup or handle error
      router.push('/profile/setup');
      return;
    }

    // Redirect based on role
    if (userData.role === 'brand') {
  router.push('/dashboard/brand');
} else if (userData.role === 'influencer') {
  router.push('/dashboard/influencer');
} else if (userData.role === 'admin') {
  router.push('/dashboard/admin');   // <-- NEW ROUTE FOR ADMIN
} else {
  // Default redirect or error handling
  router.push('/dashboard');
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Redirecting to your dashboard...</h2>
        <p className="text-gray-500 mt-2">Please wait a moment</p>
      </div>
    </div>
  );
}