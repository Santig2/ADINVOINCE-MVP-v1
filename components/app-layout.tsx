"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { GlobalSearch } from "@/components/global-search"
import { HelpCircle } from "lucide-react"
import Link from "next/link"

export function AppLayout({ 
  children,
  mainClassName,
  mainStyle
}: { 
  children: React.ReactNode 
  mainClassName?: string
  mainStyle?: React.CSSProperties
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <div className="h-16 md:hidden w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 z-40 border-b border-border flex items-center justify-between px-4">
          <span className="font-semibold text-lg md:hidden">AddInvoices</span>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <Link 
              href="/ask-me-how" 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Desktop Help Button */}
        <Link 
          href="/ask-me-how" 
          className="hidden md:flex fixed top-6 right-6 z-50 h-10 w-10 items-center justify-center rounded-full bg-background/80 border border-primary/20 text-primary hover:bg-primary/10 hover:scale-105 transition-all shadow-md backdrop-blur-md"
          title="Ask Me How"
        >
          <HelpCircle className="h-5 w-5" />
        </Link>

        {/* Main Content */}
        <main 
          style={mainStyle}
          className={`min-h-screen w-full pt-16 pb-24 md:pb-0 md:pt-0 relative bg-cover bg-center bg-no-repeat bg-fixed ${
            mainClassName || "bg-[url('/images/bg%20phone%20dos.png')] dark:bg-[url('/images/bg%20phone%20dos%20drakmode.png')] md:bg-[url('/images/background%20app%20dos%20.png')] dark:md:bg-[url('/images/background%20app%20dos%20drakmode.png')]"
          }`}
        >
          {/* Subtle gradient overlay to enhance glassmorphism contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/10 to-primary/5 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
