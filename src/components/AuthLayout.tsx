// app/components/AuthLayout.tsx
import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showLogo?: boolean;
}

export default function AuthLayout({ children, title, subtitle, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-100 blur-3xl opacity-50" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          {showLogo && (
            <div className="flex justify-center items-center gap-2 mb-4">
              <img 
                src="https://res.cloudinary.com/doficc2yl/image/upload/v1770501660/WhatsApp_Image_2026-02-08_at_3.03.20_AM-removebg-preview_zsstnt.png"
                alt="FlexFund Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  console.error('Logo failed to load');
                  // Fallback to a simple div if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">FlexFund</span>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {title}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {subtitle}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}