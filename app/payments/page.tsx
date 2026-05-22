"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  DollarSign,
  Calendar,
  MoreVertical,
  Eye,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type Invoice = {
  id: number | string;
  invoiceNumber: string;
  client?: string;
  clientName?: string;
  amount?: number;
  total?: number;
  status: string;
  date?: string;
  issueDate?: string;
  dueDate: string;
  paidAmount?: number;
  paymentStatus?: "paid" | "pending" | "overdue" | "partially_paid";
  emittedAt?: string;
  createdAt?: string;
};

// Status config
const paymentStatusConfig = {
  paid: {
    label: "Paid",
    className: "bg-primary/20 text-primary hover:bg-primary/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
    icon: Clock,
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
    icon: AlertCircle,
  },
  partially_paid: {
    label: "Partially Paid",
    className: "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30",
    icon: DollarSign,
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// ... (existing code)

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const router = useRouter();

  const loAddInvoices = useCallback(() => {
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );

    // Combine and calculate payment status
    const allInvoices = [...emittedInvoices, ...draftInvoices].map(
      (invoice: Invoice) => {
        // Map totalPaid to paidAmount for consistency
        const paidAmount = (invoice as any).totalPaid || invoice.paidAmount || 0;
        const total = invoice.amount || invoice.total || 0;
        let paymentStatus: "paid" | "pending" | "overdue" | "partially_paid" = "pending";

        if (invoice.status === "paid") {
          paymentStatus = "paid";
        } else if (invoice.paymentStatus === "overdue") {
          paymentStatus = "overdue";
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(invoice.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (paidAmount >= total - 0.01 && total > 0) {
            paymentStatus = "paid";
          } else if (paidAmount > 0) {
            paymentStatus = "partially_paid";
          } else if (dueDate < today && invoice.status !== "paid") {
            paymentStatus = "overdue";
          }
        }

        return {
          ...invoice,
          paymentStatus,
          paidAmount: paidAmount,
        };
      }
    );

    // Sort by date (most recent first)
    allInvoices.sort((a, b) => {
      const dateA = new Date(
        a.emittedAt || a.createdAt || a.issueDate || a.date || 0
      ).getTime();
      const dateB = new Date(
        b.emittedAt || b.createdAt || b.issueDate || b.date || 0
      ).getTime();
      return dateB - dateA;
    });

    setInvoices(allInvoices);
  }, []);

  const checkOverdueInvoices = useCallback(() => {
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );
    const allInvoices = [...emittedInvoices, ...draftInvoices];

    let updated = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedInvoices: Invoice[] = allInvoices.map((invoice: Invoice) => {
      if (
        (invoice.status === "pending" || invoice.status === "issued") &&
        invoice.paymentStatus !== "paid" &&
        invoice.paymentStatus !== "partially_paid"
      ) {
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          updated = true;
          return { ...invoice, paymentStatus: "overdue", status: "overdue" };
        }
      }
      return invoice;
    });

    if (updated) {
      // Separate back into emitted and drafts
      const updatedEmitted = updatedInvoices.filter(
        (inv: Invoice) => inv.status !== "draft"
      );
      const updatedDrafts = updatedInvoices.filter(
        (inv: Invoice) => inv.status === "draft"
      );

      localStorage.setItem("emittedInvoices", JSON.stringify(updatedEmitted));
      localStorage.setItem("invoiceDrafts", JSON.stringify(updatedDrafts));

      loAddInvoices();
    }
  }, [loAddInvoices]);

  useEffect(() => {
    loAddInvoices();
    checkOverdueInvoices();
    // Check for overdue invoices daily
    const interval = setInterval(checkOverdueInvoices, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loAddInvoices, checkOverdueInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = invoice.client || invoice.clientName || "";
    const invoiceAmount = invoice.amount || invoice.total || 0;

    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoiceAmount.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || invoice.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.paymentStatus === "paid").length,
    pending: invoices.filter((inv) => inv.paymentStatus === "pending").length,
    overdue: invoices.filter((inv) => inv.paymentStatus === "overdue").length,
    partiallyPaid: invoices.filter(
      (inv) => inv.paymentStatus === "partially_paid"
    ).length,
    totalRevenue: invoices
      .filter((inv) => inv.paymentStatus === "paid")
      .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0),
    pendingAmount: invoices
      .filter((inv) => inv.paymentStatus === "pending" || inv.paymentStatus === "overdue")
      .reduce((sum, inv) => {
        const total = inv.amount || inv.total || 0;
        const paid = inv.paidAmount || 0;
        return sum + (total - paid);
      }, 0),
  };

  const handleReceivePayment = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}?action=register-payment&returnTo=/payments`);
  };

  const handleView = (invoiceId: string | number) => {
    router.push(`/invoices/${invoiceId}?returnTo=/payments`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-0 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 px-4 sm:px-0 pt-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage invoice payments
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/payments/methods">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-transparent"
              >
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Mobile Stats Hero */}
        <motion.div
          className="mb-8 px-4 sm:px-0 text-center sm:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">
            Total Revenue
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            ${(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible">
          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card id="payments-balance" className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</CardTitle>
                <div className="p-1.5 bg-blue-500/15 dark:bg-blue-500/20 rounded-lg ring-1 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paid</CardTitle>
                <div className="p-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  {stats.paid}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</CardTitle>
                <div className="p-1.5 bg-amber-500/15 dark:bg-amber-500/20 rounded-lg ring-1 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overdue</CardTitle>
                <div className="p-1.5 bg-rose-500/15 dark:bg-rose-500/20 rounded-lg ring-1 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  {stats.overdue}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Partially Paid</CardTitle>
                <div className="p-1.5 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-lg ring-1 ring-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <DollarSign className="h-4 w-4 text-cyan-600 dark:text-cyan-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  {stats.partiallyPaid}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="snap-start shrink-0">
            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Amount</CardTitle>
                <div className="p-1.5 bg-amber-500/15 dark:bg-amber-500/20 rounded-lg ring-1 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  ${(stats.pendingAmount / 1000).toFixed(1)}K
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </motion.div>

        {/* Overlapping Content Container */}
        <motion.div
          className="flex-1 bg-card sm:bg-transparent rounded-t-[2.5rem] sm:rounded-none p-5 sm:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-none border-t border-border/50 sm:border-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 bg-secondary/50 border-transparent rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div id="payments-history" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                Invoices ({filteredInvoices.length})
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    No invoices found
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No invoices match your filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice, index) => {
                    const clientName =
                      invoice.client || invoice.clientName || "Unknown Client";
                    const amount = invoice.amount || invoice.total || 0;
                    const paidAmount = invoice.paidAmount || 0;
                    const remaining = amount - paidAmount;
                    const StatusIcon =
                      paymentStatusConfig[
                        invoice.paymentStatus as keyof typeof paymentStatusConfig
                      ]?.icon || Clock;

                    return (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.5 + index * 0.05,
                        }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-background sm:bg-secondary/30 border border-border/50 sm:border-transparent hover:border-primary/30 sm:hover:bg-secondary/70 transition-all duration-300 hover:shadow-sm cursor-pointer group"
                        onClick={() => handleView(invoice.id)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${paymentStatusConfig[invoice.paymentStatus as keyof typeof paymentStatusConfig]?.className || "bg-secondary"}`}>
                            <StatusIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-foreground text-base leading-none">
                                {invoice.invoiceNumber}
                              </p>
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                paymentStatusConfig[invoice.paymentStatus as keyof typeof paymentStatusConfig]?.className
                              )}>
                                {paymentStatusConfig[invoice.paymentStatus as keyof typeof paymentStatusConfig]?.label || "Pending"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium truncate">
                              {clientName}
                            </p>
                            {paidAmount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Paid: ${paidAmount.toLocaleString()} / Total: ${amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0" onClick={(e) => e.stopPropagation()}>
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-foreground text-base sm:text-lg leading-none">
                              ${amount.toLocaleString()}
                            </p>
                            {remaining > 0 && remaining < amount && (
                              <p className="text-xs text-destructive font-medium mt-1">
                                Remaining: ${remaining.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground font-medium mt-1">
                              Due: {invoice.dueDate}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-10 w-10 rounded-full hover:bg-secondary transition-colors duration-300"
                              >
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(invoice.id)}
                                className="rounded-lg py-2"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {invoice.paymentStatus !== "paid" && (
                                <DropdownMenuItem
                                  onClick={() => handleReceivePayment(invoice)}
                                  className="rounded-lg py-2"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Receive Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

    </AppLayout>
  );
}

