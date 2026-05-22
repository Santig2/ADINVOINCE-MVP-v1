"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Receipt,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Upload,
  Mic,
  X,
  Eye,
} from "lucide-react";
import { SwipeableItem } from "@/components/ui/swipeable-item";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

import { VoiceSearchModal, VoiceQueryParams } from "./components/voice-search-modal";

// Types
type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
  ocrData?: {
    merchant?: string;
    total?: number;
    date?: string;
    items?: string[];
  };
};

const expenseCategories = [
  "Office Supplies",
  "Travel",
  "Meals & Entertainment",
  "Software & Subscriptions",
  "Marketing & Advertising",
  "Professional Services",
  "Utilities",
  "Rent",
  "Equipment",
  "Other",
];

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [voiceFilters, setVoiceFilters] = useState<VoiceQueryParams | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const stored = JSON.parse(localStorage.getItem("expenses") || "[]");
    // Sort by date (most recent first)
    const sorted = stored.sort((a: Expense, b: Expense) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    });
    setExpenses(sorted);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.amount.toString().includes(searchQuery) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    let matchesVoice = true;
    if (voiceFilters) {
      if (voiceFilters.minAmount !== undefined && expense.amount <= voiceFilters.minAmount) matchesVoice = false;
      if (voiceFilters.maxAmount !== undefined && expense.amount >= voiceFilters.maxAmount) matchesVoice = false;

      if (voiceFilters.keyword) {
        const kw = voiceFilters.keyword.toLowerCase();
        const desc = expense.description.toLowerCase();
        const merchant = expense.ocrData?.merchant?.toLowerCase() || "";
        if (!desc.includes(kw) && !merchant.includes(kw)) matchesVoice = false;
      }

      if (voiceFilters.company) {
        const company = voiceFilters.company.toLowerCase();
        const merchant = expense.ocrData?.merchant?.toLowerCase() || "";
        if (!merchant.includes(company)) matchesVoice = false;
      }

      if (voiceFilters.date) {
        const expDate = new Date(expense.date || expense.createdAt);
        const now = new Date();
        if (voiceFilters.date === "last month") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          if (expDate.getMonth() !== lastMonth.getMonth() || expDate.getFullYear() !== lastMonth.getFullYear()) matchesVoice = false;
        } else {
          const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
          const monthIndex = monthNames.indexOf(voiceFilters.date.toLowerCase());
          if (monthIndex !== -1) {
            if (expDate.getMonth() !== monthIndex) matchesVoice = false;
          }
        }
      }
    }

    return matchesSearch && matchesCategory && matchesVoice;
  });

  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    thisMonth: expenses.filter((exp) => {
      const expDate = new Date(exp.date || exp.createdAt);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    }).length,
    thisMonthAmount: expenses
      .filter((exp) => {
        const expDate = new Date(exp.date || exp.createdAt);
        const now = new Date();
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0),
  };

  const handleDelete = (expenseId: string) => {
    const updated = expenses.filter((exp) => exp.id !== expenseId);
    localStorage.setItem("expenses", JSON.stringify(updated));
    loadExpenses();
    toast({
      title: "Expense deleted",
      description: "The expense has been removed",
      variant: "destructive",
    });
  };

  // Note: View/Edit pages not implemented yet
  // For now, users can delete and recreate expenses if needed

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
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Expenses
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your business expenses
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/expenses/upload" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-transparent"
              >
                <Upload className="h-5 w-5" />
                Upload Receipt
              </Button>
            </Link>
            <Link href="/expenses/new" className="w-full sm:w-auto">
              <Button
                id="expenses-create-btn"
                variant="accent"
                size="lg"
                className="gap-2 w-full transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                Add Expense
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
            Total Amount
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            ${stats.totalAmount.toLocaleString()}
          </h2>

          {/* Scrollable Glass Stat Cards */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-4 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
                  <div className="p-1.5 bg-blue-500/15 dark:bg-blue-500/20 rounded-lg ring-1 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">This Month</CardTitle>
                  <div className="p-1.5 bg-purple-500/15 dark:bg-purple-500/20 rounded-lg ring-1 ring-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.thisMonth}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">This Month Amount</CardTitle>
                  <div className="p-1.5 bg-rose-500/15 dark:bg-rose-500/20 rounded-lg ring-1 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                    <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">${stats.thisMonthAmount.toLocaleString()}</div>
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
          {/* Search & Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1" id="expenses-search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1 sm:w-[180px] h-12 bg-secondary/50 border-transparent rounded-xl" id="expenses-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-12 w-12 sm:w-auto px-0 sm:px-4 gap-2 shrink-0 border-primary/20 text-primary hover:bg-primary/10 rounded-xl"
                onClick={() => setIsVoiceSearchOpen(true)}
              >
                <Mic className="h-5 w-5" />
                <span className="hidden sm:inline">Search by Voice</span>
              </Button>
            </div>
          </div>

          {voiceFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 flex items-center gap-2"
            >
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 gap-2 py-1.5 px-3 rounded-full text-sm">
                <Mic className="h-3.5 w-3.5" />
                Voice Search Applied
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => setVoiceFilters(null)}
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear Voice Filters
              </Button>
            </motion.div>
          )}

          <div id="expenses-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                Expenses ({filteredExpenses.length})
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gradient-to-b from-background to-secondary/20 rounded-3xl border border-dashed border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5 border border-primary/10 relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                    <Receipt className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">
                    {expenses.length === 0 ? "No expenses yet" : "No expenses found"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[250px] mx-auto">
                    {expenses.length === 0
                      ? "Track your first expense to keep your cashflow in check."
                      : "Try adjusting your filters or add a new expense."}
                  </p>
                  {expenses.length === 0 && (
                    <Link href="/expenses/new">
                      <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8 py-6 text-base">
                        <Plus className="h-5 w-5" />
                        Add your first expense
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense, index) => (
                    <SwipeableItem
                      key={expense.id}
                      onDelete={() => handleDelete(expense.id)}
                    >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.1 + index * 0.05,
                      }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-sm cursor-pointer group border border-border/50 sm:border-transparent"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Receipt className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-foreground text-base leading-none">
                              {expense.description}
                            </p>
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                              {expense.category}
                            </Badge>
                            {expense.receipt && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-green-500/10 text-green-600 border-green-500/20"
                              >
                                Receipt
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-foreground text-base sm:text-lg">
                            ${expense.amount.toLocaleString()}
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
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => handleDelete(expense.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                    </SwipeableItem>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <VoiceSearchModal
        open={isVoiceSearchOpen}
        onOpenChange={setIsVoiceSearchOpen}
        onSearch={setVoiceFilters}
      />
    </AppLayout >
  );
}

