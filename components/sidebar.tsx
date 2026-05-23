"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LayoutGrid,
  FileText,
  Users,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
  File,
  SendHorizontal,
  FileCheck,
  CreditCard,
  Sparkles,
  Receipt,
  Package,
  PenTool,
  CalendarClock,
  ClipboardList,
  Mic,
  Languages,
  LayoutTemplate,
  Store,
  IdCard,
  Star,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-provider";
import { GlobalSearch } from "@/components/global-search";

const navigation = [
  { name: "Dashboard", href: "/?mode=dashboard", icon: LayoutDashboard },
  { name: "Voice Assistant", href: "/voice-assistant", icon: Mic },
  { name: "Translator", href: "/translator", icon: Languages },
  { name: "Advances", href: "/advances", icon: ClipboardList },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Quotes", href: "/quotes", icon: FileCheck },
  { name: "Contracts", href: "/contracts", icon: PenTool },
  { name: "Subscriptions", href: "/subscriptions", icon: CalendarClock },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Catalog", href: "/catalog", icon: Package },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Templates", href: "/templates", icon: LayoutTemplate },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Business Card", href: "/business-card", icon: IdCard },
  { name: "Reputation", href: "/reputation", icon: Star },
  { name: "Ask Me How", href: "/ask-me-how", icon: HelpCircle },
  { name: "Configuration", href: "/configuration", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 border-r border-white/10 dark:border-white/5 rounded-r-[2.5rem] overflow-hidden shadow-2xl">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <Image
          src="/images/logotipoaddinvoces.png"
          alt="AddInvoices Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="text-lg font-semibold text-foreground">
          AddInvoices
        </span>
      </div>

      {/* Search Section */}
      <div className="px-3 pt-4 pb-2 border-b border-border/50 hidden md:block">
        <GlobalSearch />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          // If viewing shortcuts, / should not appear active for Dashboard unless mode=dashboard
          let isActive = pathname === item.href;
          if (pathname === "/" && mounted) {
            const searchParams = new URLSearchParams(window.location.search);
            const mode = searchParams.get("mode");
            if (item.href === "/?mode=shortcuts" && (!mode || mode === "shortcuts")) {
              isActive = true;
            } else if (item.href === "/?mode=dashboard" && mode === "dashboard") {
              isActive = true;
            } else if (item.href !== "/?mode=shortcuts" && item.href !== "/?mode=dashboard") {
              isActive = false; // Only one of the root modes should be active
            }
          }
          return (
            <Link
              id={`sidebar-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 group",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary-light/5 text-primary shadow-[inset_4px_0_0_0_hsl(var(--primary))] dark:shadow-[inset_4px_0_0_0_hsl(var(--primary-light))] dark:text-primary-light"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300", 
                isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,117,135,0.5)]" : "group-hover:scale-110"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-4 space-y-4">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3"
          suppressHydrationWarning
        >
          {mounted ? (
            theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Dark Mode
              </>
            )
          ) : (
            <>
              <span className="h-4 w-4" />
              <span className="opacity-0">Toggle Theme</span>
            </>
          )}
        </Button>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
          suppressHydrationWarning
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>

        {/* Branding */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Powered by</p>
          <Image
            src="/images/ADDSTRATEGICN.png"
            alt="ADDSTRATEGICN"
            width={120}
            height={24}
            className="mx-auto mt-1 h-5 w-auto opacity-70"
          />
        </div>
      </div>
    </div>
  );
}


export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <SidebarContent />
    </aside>
  );
}
