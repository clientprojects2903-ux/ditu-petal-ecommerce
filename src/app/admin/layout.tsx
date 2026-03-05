"use client"

import { Sidebar } from "@/components/sidebar"
import AppHeader from "@/components/dashboard-header"

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Header + Content */}
      <div className="flex flex-col flex-1">
        <AppHeader />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
