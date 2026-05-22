"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = localStorage.getItem("AddInvoices-auth")
    setIsAuthenticated(authStatus === "true")
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true"
      const companiesJson = localStorage.getItem("companies")
      const hasCompanies = companiesJson && JSON.parse(companiesJson).length > 0 && JSON.parse(companiesJson)[0].name !== "My Company"
      const businessSetupCompleted = localStorage.getItem("businessSetupCompleted") === "true" || hasCompanies

      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login")
      } else if (isAuthenticated) {
        if (!onboardingCompleted && pathname !== "/onboarding") {
          router.push("/onboarding")
        } else if (onboardingCompleted && !businessSetupCompleted && pathname !== "/business-setup") {
          router.push("/business-setup")
        } else if (onboardingCompleted && businessSetupCompleted && (pathname === "/login" || pathname === "/onboarding" || pathname === "/business-setup")) {
          router.push("/?mode=shortcuts")
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = (username: string, password: string): boolean => {
    if (username === "adstrategic" && password === "adstrategic") {
      setIsAuthenticated(true)
      localStorage.setItem("AddInvoices-auth", "true")

      // Check if this is an existing user (has data)
      const companiesJson = localStorage.getItem("companies")
      const invoicesJson = localStorage.getItem("emittedInvoices")
      const hasCompanies = companiesJson && JSON.parse(companiesJson).length > 0 && JSON.parse(companiesJson)[0].name !== "My Company"
      const hasInvoices = invoicesJson && JSON.parse(invoicesJson).length > 0

      if (hasCompanies || hasInvoices) {
        localStorage.setItem("onboardingCompleted", "true")
        localStorage.setItem("businessSetupCompleted", "true")
        localStorage.setItem("tourCompleted", "true")
      }

      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("AddInvoices-auth")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
