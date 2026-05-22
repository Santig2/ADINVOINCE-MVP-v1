"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { FileText, CheckCircle2, Clock, Calendar, CalendarDays, Plus, TrendingUp, DollarSign, FileCheck, Users } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { OnboardingModal } from "@/components/onboarding-modal"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import { motion, Variants } from "framer-motion"
import { ShortcutInterface } from "@/components/shortcut-interface"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-md shadow-md">
        <p className="font-semibold text-popover-foreground mb-1">{label}</p>
        <p className="text-popover-foreground">
          Revenue: <span className="font-mono font-bold">${payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomXAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" className="fill-muted-foreground text-xs font-medium">
        {payload.value}
      </text>
    </g>
  )
}

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const value = payload.value
  const formattedValue = value >= 1000 ? `$${value / 1000}K` : `$${value}`

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-10} dy={4} textAnchor="end" className="fill-muted-foreground text-xs font-medium">
        {formattedValue}
      </text>
    </g>
  )
}

function DashboardContent() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([])
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const viewMode = searchParams.get("mode") === "dashboard" ? "dashboard" : "shortcuts"

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Load invoices
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    )
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    )
    const allInvoices = [...emittedInvoices, ...draftInvoices]

    setInvoices(allInvoices)

    const allClients = JSON.parse(localStorage.getItem("clients") || "[]")
    const allExpenses = JSON.parse(localStorage.getItem("expenses") || "[]")

    // Build Activity Feed
    const feed: any[] = []
    
    allInvoices.forEach((inv: any) => {
      feed.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        title: `Invoice: ${inv.client || inv.clientName || 'Unknown'}`,
        subtitle: inv.status === 'paid' ? 'Paid' : 'Sent',
        amount: inv.amount || inv.total || 0,
        date: new Date(inv.emittedAt || inv.createdAt || inv.issueDate || inv.date || 0).getTime(),
        status: inv.status === "paid" || inv.paymentStatus === "paid" ? "paid" : "pending",
      })
    })

    allClients.forEach((client: any) => {
      feed.push({
        id: `cli-${client.id}`,
        type: 'client',
        title: `Client: ${client.name}`,
        subtitle: client.email || 'Added',
        amount: null,
        date: new Date(client.createdAt || Date.now()).getTime(),
        status: 'client',
      })
    })

    allExpenses.forEach((exp: any) => {
      feed.push({
        id: `exp-${exp.id}`,
        type: 'expense',
        title: `Expense: ${exp.category || 'General'}`,
        subtitle: exp.vendor || exp.merchant || 'Recorded',
        amount: exp.amount || exp.total || 0,
        date: new Date(exp.date || exp.createdAt || 0).getTime(),
        status: 'expense',
      })
    })

    feed.sort((a, b) => b.date - a.date)
    setActivityFeed(feed.slice(0, 5))

    // Calculate monthly revenue from paid invoices
    const monthlyRevenue: { [key: string]: number } = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize all months to 0
    monthNames.forEach((month) => {
      monthlyRevenue[month] = 0
    })

    // Calculate revenue from paid invoices
    allInvoices
      .filter((inv) => inv.status === "paid" || inv.paymentStatus === "paid")
      .forEach((invoice) => {
        const date = new Date(
          invoice.emittedAt || invoice.createdAt || invoice.issueDate || invoice.date || Date.now()
        )
        const monthIndex = date.getMonth()
        const monthName = monthNames[monthIndex]
        const amount = invoice.amount || invoice.total || 0
        monthlyRevenue[monthName] = (monthlyRevenue[monthName] || 0) + amount
      })

    // Convert to array format for chart
    const chartData = monthNames.map((month) => ({
      month,
      revenue: monthlyRevenue[month] || 0,
    }))

    setRevenueData(chartData)
  }

  // Calculate stats from real data
  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === "paid" || inv.paymentStatus === "paid").length,
    pending: invoices.filter(
      (inv) =>
        (inv.status === "pending" || inv.status === "issued") &&
        inv.status !== "paid" &&
        inv.paymentStatus !== "paid"
    ).length,
    thisWeek: invoices.filter((inv) => {
      const invDate = new Date(
        inv.emittedAt || inv.createdAt || inv.issueDate || inv.date || 0
      )
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return invDate >= weekAgo
    }).length,
    thisMonth: invoices.filter((inv) => {
      const invDate = new Date(
        inv.emittedAt || inv.createdAt || inv.issueDate || inv.date || 0
      )
      const now = new Date()
      return (
        invDate.getMonth() === now.getMonth() &&
        invDate.getFullYear() === now.getFullYear()
      )
    }).length,
  }

  // Calculate total revenue
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid" || inv.paymentStatus === "paid")
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0)

  // Additional revenue calculations for the new UI format
  const pendingRevenue = invoices
    .filter(
      (inv) =>
        (inv.status === "pending" || inv.status === "issued") &&
        inv.status !== "paid" &&
        inv.paymentStatus !== "paid"
    )
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0)

  const draftRevenue = invoices
    .filter((inv) => inv.status === "draft")
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0)

  const barColor = "#007587"

  if (viewMode === "shortcuts") {
    return <ShortcutInterface />
  }

  return (
    <AppLayout>
      <OnboardingModal />
      <div className="flex flex-col min-h-screen">
        {/* Top Hero Section */}
        <div className="pt-8 sm:pt-12 pb-20 px-4 sm:px-6 relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-2 mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-muted-foreground uppercase">
                Projected Revenue
              </span>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-primary/10 text-primary">Demo</Badge>
            </div>
            <h1 id="dashboard-total-invoices" className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm font-mono">
              <AnimatedCounter value={totalRevenue + pendingRevenue} prefix="$" decimals={0} />
            </h1>
            
            {/* Horizontal progress bar similar to reference */}
            <div className="w-full max-w-sm flex h-2 rounded-full overflow-hidden mt-6 bg-secondary/50 shadow-inner backdrop-blur-sm relative border border-border/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(totalRevenue / ((totalRevenue + pendingRevenue) || 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary-dark via-primary to-primary-light h-full relative" 
              >
                <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40" />
              </motion.div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(pendingRevenue / ((totalRevenue + pendingRevenue) || 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                className="bg-gradient-to-r from-chart-4/80 to-chart-4 h-full relative" 
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto"
          >
            <motion.div variants={cardVariants} id="dashboard-paid-invoices">
              <div className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-4 sm:p-5 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-light/10 rounded-full blur-2xl group-hover:bg-primary-light/30 transition-colors" />
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-light shadow-[0_0_12px_rgba(0,117,135,1)]" />
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Paid</span>
                </div>
                <p className="text-base sm:text-xl font-black text-foreground relative z-10 font-mono">
                  <AnimatedCounter value={totalRevenue} prefix="$" decimals={1} />
                </p>
              </div>
            </motion.div>

            {/* Open / Pending Card */}
            <motion.div variants={cardVariants} id="dashboard-pending-invoices">
              <div className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-4 sm:p-5 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-chart-4/10 rounded-full blur-2xl group-hover:bg-chart-4/20 transition-colors" />
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-4 shadow-[0_0_8px_rgba(255,180,84,0.8)]" />
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Open</span>
                </div>
                <p className="text-base sm:text-xl font-black text-foreground relative z-10 font-mono">
                  <AnimatedCounter value={pendingRevenue} prefix="$" decimals={1} />
                </p>
              </div>
            </motion.div>

            {/* To Charge / Draft Card */}
            <motion.div variants={cardVariants}>
              <div className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-4 sm:p-5 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-muted-foreground/10 rounded-full blur-2xl group-hover:bg-muted-foreground/20 transition-colors" />
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground shadow-[0_0_8px_rgba(150,150,150,0.5)]" />
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Drafts</span>
                </div>
                <p className="text-base sm:text-xl font-black text-foreground relative z-10 font-mono">
                  <AnimatedCounter value={draftRevenue} prefix="$" decimals={1} />
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 max-w-2xl mx-auto flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start sm:justify-center"
          >
            <Link href="/invoices/new" className="flex flex-col items-center gap-2.5 group shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-accent-warm/20 to-accent-warm/5 border border-accent-warm/20 text-accent-warm flex items-center justify-center group-hover:bg-accent-warm group-hover:text-white transition-all duration-300 shadow-[0_8px_16px_-6px_rgba(255,100,50,0.3)] group-hover:shadow-[0_12px_24px_-6px_rgba(255,100,50,0.6)] group-hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Invoice</span>
            </Link>
            
            <Link href="/quotes/new" className="flex flex-col items-center gap-2.5 group shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-[0_8px_16px_-6px_rgba(249,115,22,0.3)] group-hover:shadow-[0_12px_20px_-6px_rgba(249,115,22,0.5)] group-hover:-translate-y-1">
                <FileCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Estimate</span>
            </Link>

            <Link href="/expenses" className="flex flex-col items-center gap-2.5 group shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-[0_8px_16px_-6px_rgba(34,197,94,0.3)] group-hover:shadow-[0_12px_20px_-6px_rgba(34,197,94,0.5)] group-hover:-translate-y-1">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Expense</span>
            </Link>

            <Link href="/clients" className="flex flex-col items-center gap-2.5 group shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_8px_16px_-6px_rgba(168,85,247,0.3)] group-hover:shadow-[0_12px_20px_-6px_rgba(168,85,247,0.5)] group-hover:-translate-y-1">
                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Client</span>
            </Link>
          </motion.div>
        </div>

        {/* Overlapping Bottom Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 bg-background/80 backdrop-blur-3xl rounded-t-[3rem] p-5 sm:p-10 -mt-8 relative z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] border-t border-white/20 dark:border-white/5"
        >
          {/* Subtle top glow with Ocean depth */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-primary-dark/0 via-primary-light/20 to-primary-dark/0 blur-2xl rounded-full" />

          {/* Draggable Handle Indicator */}
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 opacity-50" />

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Invoices</h2>
            </div>
            <Link href="/invoices">
              <Button variant="link" className="text-muted-foreground hover:text-foreground p-0">
                View all
              </Button>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1 text-xs rounded-full">Recent</Badge>
            <Badge variant="secondary" className="px-4 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">Open</Badge>
            <Badge variant="secondary" className="px-4 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">Overdue</Badge>
            <Badge variant="secondary" className="px-4 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">Paid</Badge>
          </div>

          {/* Activity Feed */}
          <div id="dashboard-recent-invoices" className="space-y-1 mb-8">
            {activityFeed.length > 0 ? (
              activityFeed.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
                    className="flex flex-row items-center justify-between gap-4 p-4 border border-border/40 hover:border-primary/30 bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 cursor-pointer group rounded-2xl"
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      <div className={cn(
                        "flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                        item.type === 'invoice' ? "bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-500 border border-blue-500/10 group-hover:bg-blue-500 group-hover:text-white" :
                        item.type === 'expense' ? "bg-gradient-to-br from-red-500/20 to-red-500/5 text-red-500 border border-red-500/10 group-hover:bg-red-500 group-hover:text-white" :
                        "bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-500 border border-purple-500/10 group-hover:bg-purple-500 group-hover:text-white"
                      )}>
                        {item.type === 'invoice' && <FileText className="h-5 w-5" />}
                        {item.type === 'expense' && <DollarSign className="h-5 w-5" />}
                        {item.type === 'client' && <Users className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {item.subtitle} <span className="opacity-50 mx-1">•</span> {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.amount !== null && (
                        <p className="font-black text-foreground text-sm sm:text-base font-mono">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </p>
                      )}
                      {item.type === 'invoice' && (
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "paid" ? "bg-primary shadow-[0_0_8px_rgba(0,117,135,0.6)]" : "bg-chart-4 shadow-[0_0_8px_rgba(255,180,84,0.6)]"
                            }`}
                          />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "paid" ? "text-primary" : "text-chart-4"
                          }`}>
                            {item.status === "paid" ? "Paid" : "Sent"}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                <p className="text-muted-foreground text-sm">No recent activity</p>
              </div>
            )}
          </div>

          {/* Estimates Section (Placeholder for structure) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Estimates</h2>
            </div>
            <Link href="/quotes">
              <Button variant="link" className="text-muted-foreground hover:text-foreground p-0">
                View all
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1 text-xs rounded-full">Recent</Badge>
            <Badge variant="secondary" className="px-4 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">Sent</Badge>
            <Badge variant="secondary" className="px-4 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">Accepted</Badge>
          </div>

          {/* Chart Section (Keeping functionality, just restyling slightly) */}
          <div id="dashboard-revenue-chart" className="mt-8 pt-8 border-t border-border/50">
            <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
            {revenueData.length > 0 && revenueData.some((d) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary-light))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--primary-dark))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary-light))" />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#lineColor)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
                <p className="text-sm">No revenue data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Link href="/invoices/new">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="max-md:hidden"
        >
          <Button
            id="dashboard-create-invoice-btn"
            size="lg"
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Create Invoice</span>
          </Button>
        </motion.div>
      </Link>
    </AppLayout>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"></div>}>
      <DashboardContent />
    </Suspense>
  )
}
