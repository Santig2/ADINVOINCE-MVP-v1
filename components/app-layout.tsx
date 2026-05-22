"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { GlobalSearch } from "@/components/global-search"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <div className="h-16 md:hidden w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 z-40 border-b border-border flex items-center justify-between px-4">
          <span className="font-semibold text-lg md:hidden">AddInvoices</span>
          <GlobalSearch />
        </div>

        {/* Main Content - Add top padding for mobile to account for fixed header */}
        <main className="min-h-screen w-full pt-16 pb-24 md:pb-0 md:pt-0 bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/bg%20phone%20dos.png')] dark:bg-[url('/images/bg%20phone%20dos%20drakmode.png')] md:bg-[url('/images/background%20app%20dos%20.png')] dark:md:bg-[url('/images/background%20app%20dos%20drakmode.png')]">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
