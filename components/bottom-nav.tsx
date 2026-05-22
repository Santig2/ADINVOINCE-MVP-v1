"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  FileCheck,
  Users,
  Settings,
  Plus,
  Mic,
  Repeat,
  LayoutDashboard,
  ClipboardList,
  PenTool,
  CalendarClock,
  CreditCard,
  Receipt,
  Package,
  Bell,
  HelpCircle,
  Menu,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useHaptic } from "@/hooks/use-haptic"

const mainNavItems = [
  { name: "Home", href: "/", icon: Home, matchMode: "dashboard" },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Estimates", href: "/quotes", icon: FileCheck },
  { name: "Clients", href: "/clients", icon: Users },
]

const moreNavItems = [
  { name: "Advances", href: "/advances", icon: ClipboardList },
  { name: "Contracts", href: "/contracts", icon: PenTool },
  { name: "Subscriptions", href: "/subscriptions", icon: CalendarClock },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Catalog", href: "/catalog", icon: Package },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Ask Me How", href: "/ask-me-how", icon: HelpCircle },
  { name: "Settings", href: "/configuration", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const { triggerHaptic } = useHaptic()

  // Determine if a path is active. Handle the root path and its modes specially.
  const isActive = (href: string, matchMode?: string) => {
    if (href === "/") {
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search)
        const mode = searchParams.get("mode")
        if (pathname === "/" && (mode === matchMode || (!mode && matchMode === "dashboard"))) {
          return true
        }
      }
      return pathname === "/" && !matchMode // Fallback if no window
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-3 md:hidden">
        <Link href="/voice-assistant" onClick={() => triggerHaptic("light")}>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-lg text-primary"
          >
            <Mic className="h-5 w-5" />
          </motion.div>
        </Link>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => triggerHaptic("medium")}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30 cursor-pointer"
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-8">
            <DrawerHeader className="text-left px-2">
              <DrawerTitle className="text-xl font-bold">Create new</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/quotes/new" onClick={() => { triggerHaptic("light"); setIsDrawerOpen(false) }}>
                <div className="flex items-center gap-4 rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-base">Estimate</span>
                </div>
              </Link>

              <Link href="/invoices/new" onClick={() => { triggerHaptic("light"); setIsDrawerOpen(false) }}>
                <div className="flex items-center gap-4 rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-base flex-1">Invoice</span>
                  <Link
                    href="/voice-assistant"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                    onClick={(e) => { e.stopPropagation(); triggerHaptic("light") }}
                  >
                    <Mic className="h-4 w-4" />
                  </Link>
                </div>
              </Link>

              <Link href="/subscriptions/new" onClick={() => { triggerHaptic("light"); setIsDrawerOpen(false) }}>
                <div className="flex items-center gap-4 rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                    <Repeat className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-base">Recurring invoice</span>
                </div>
              </Link>

              <Link href="/clients" onClick={() => { triggerHaptic("light"); setIsDrawerOpen(false) }}>
                <div className="flex items-center gap-4 rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-base">Client</span>
                </div>
              </Link>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around px-2 sm:px-4 rounded-t-3xl border-t border-border bg-background/95 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden">
        {mainNavItems.map((item) => {
          const active = isActive(item.href, item.matchMode)
          return (
            <Link
              key={item.name}
              href={item.href === "/" ? "/?mode=dashboard" : item.href}
              onClick={() => triggerHaptic("light")}
              className={cn(
                "flex flex-col items-center justify-center shrink-0 w-14 h-14 gap-1 relative",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active ? "scale-110" : ""
                )}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}

        {/* More Menu Trigger */}
        <Drawer open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
          <DrawerTrigger asChild>
            <button
              onClick={() => triggerHaptic("light")}
              className="flex flex-col items-center justify-center shrink-0 w-14 h-14 gap-1 relative text-muted-foreground hover:text-foreground outline-none"
            >
              <Menu className="h-5 w-5 transition-transform duration-200" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-8 max-h-[85vh]">
            <DrawerHeader className="text-left px-2">
              <DrawerTitle className="text-xl font-bold">More options</DrawerTitle>
            </DrawerHeader>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4 overflow-y-auto px-2 pb-6">
              {moreNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => { triggerHaptic("light"); setIsMoreMenuOpen(false) }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </>
  )
}
