"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Send,
  Trash2,
  Mic,
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
import { useState, useEffect } from "react";
import { SendDocumentDialog } from "@/components/send-document-dialog";
import { SwipeableItem } from "@/components/ui/swipeable-item";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Types
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

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
  companyName?: string;
  companyAddress?: string;
  companyNIT?: string;
  companyEmail?: string;
  companyPhone?: string;
  items?: InvoiceItem[];
  notes?: string;
  terms?: string;
  logo?: string | null;
  subtotal?: number;
  totalTax?: number;
  createdAt?: string;
  emittedAt?: string;
};

// Status config (used for badge classes/labels)
const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-primary/20 text-primary hover:bg-primary/30",
  },
  pending: {
    label: "Pending",
    className: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
  },
  issued: {
    label: "Issued",
    className: "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  "partially-paid": {
    label: "Partially Paid",
    className: "bg-orange-500/20 text-orange-600 hover:bg-orange-500/30",
  },
};

// Tipado correcto para variantes de Framer Motion
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{
    id: string;
    client: string;
    clientName?: string;
    clientEmail?: string;
  } | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    checkOverdueInvoices();
    loAddInvoices();
    // Check for overdue invoices daily
    const interval = setInterval(checkOverdueInvoices, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkOverdueInvoices = () => {
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

    const updatedInvoices = allInvoices.map((invoice: Invoice) => {
      if (invoice.status === "pending" || invoice.status === "issued") {
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          updated = true;
          return { ...invoice, status: "overdue" };
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
    }
  };

  const loAddInvoices = () => {
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );

    // Combine both arrays and sort by date (most recent first)
    const allInvoices = [...emittedInvoices, ...draftInvoices].sort((a, b) => {
      const dateA = new Date(
        a.emittedAt || a.createdAt || a.issueDate || a.date || 0
      ).getTime();
      const dateB = new Date(
        b.emittedAt || b.createdAt || b.issueDate || b.date || 0
      ).getTime();
      return dateB - dateA;
    });

    setInvoices(allInvoices);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = invoice.client || invoice.clientName || "";
    const invoiceAmount = invoice.amount || invoice.total || 0;

    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoiceAmount.toString().includes(searchQuery);

    // Tab filtering
    let matchesTab = true;
    if (activeTab === "emitted") {
      matchesTab =
        invoice.status === "issued" ||
        invoice.status === "pending" ||
        invoice.status === "paid";
    } else if (activeTab === "paid") {
      matchesTab = invoice.status === "paid";
    } else if (activeTab === "pending") {
      matchesTab = invoice.status === "pending" || invoice.status === "issued";
    } else if (activeTab === "overdue") {
      matchesTab = invoice.status === "overdue";
    } else if (activeTab === "drafts") {
      matchesTab = invoice.status === "draft";
    }

    // Dropdown filter
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesTab && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    pending: invoices.filter((inv) => inv.status === "pending").length,
    revenue: invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0),
  };

  const handleView = (invoiceId: string | number) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const handleEdit = (invoiceId: string | number) => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleSend = (invoice: Invoice) => {
    // Find client email from clients in localStorage
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const client = savedClients.find(
      (c: any) => c.name === (invoice.client || invoice.clientName)
    );

    setSelectedInvoice({
      ...invoice,
      id: invoice.id.toString(),
      client: invoice.client || invoice.clientName || "Unknown Client",
      clientEmail: client?.email || "",
    });
    setSendDialogOpen(true);
  };

  const processSend = async (email: string, subject: string, message: string) => {
    if (!selectedInvoice) return;

    // 1. Trigger PDF download so user has the file
    // We need to cast selectedInvoice back to Invoice or find it in the list
    const fullInvoice = invoices.find(inv => inv.id.toString() === selectedInvoice.id);
    if (fullInvoice) {
      // Wait a moment for UI to update before capturing
      await new Promise(resolve => setTimeout(resolve, 500));
      await handleDownload(fullInvoice);
    }

    // 2. Open mailto link
    // specific checking for standard newlines and encoding them for mailto
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoLink;

    // 3. Update status to 'issued' if it was 'draft' or 'pending'
    const emittedInvoices = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
    let invoiceUpdated = false;

    const updatedEmitted = emittedInvoices.map((inv: Invoice) => {
      if (inv.id.toString() === selectedInvoice.id) {
        invoiceUpdated = true;
        return {
          ...inv,
          status: "issued",
          emittedAt: new Date().toISOString()
        };
      }
      return inv;
    });

    if (invoiceUpdated) {
      localStorage.setItem("emittedInvoices", JSON.stringify(updatedEmitted));
    } else {
      // Check drafts if not found in emitted
      const draftInvoices = JSON.parse(localStorage.getItem("invoiceDrafts") || "[]");
      const draftIndex = draftInvoices.findIndex((inv: Invoice) => inv.id.toString() === selectedInvoice.id);

      if (draftIndex !== -1) {
        const draft = draftInvoices[draftIndex];
        // Move to emitted
        const newInvoice = {
          ...draft,
          status: "issued",
          emittedAt: new Date().toISOString()
        };

        // Remove from drafts
        draftInvoices.splice(draftIndex, 1);
        localStorage.setItem("invoiceDrafts", JSON.stringify(draftInvoices));

        // Add to emitted
        updatedEmitted.push(newInvoice);
        localStorage.setItem("emittedInvoices", JSON.stringify(updatedEmitted));
      }
    }

    // 4. Reload
    loAddInvoices();
  };

  const handleDownload = async (invoice: Invoice) => {
    const previewElement = document.getElementById(
      `invoice-preview-${invoice.id}`
    );
    if (!previewElement) {
      toast({
        title: "Error",
        description: "Invoice preview not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });

      // Force render by waiting a bit
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture with improved settings
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: previewElement.scrollWidth,
        height: previewElement.scrollHeight,
        windowWidth: previewElement.scrollWidth,
        windowHeight: previewElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded
          const clonedElement = clonedDoc.getElementById(
            `invoice-preview-${invoice.id}`
          );
          if (clonedElement) {
            const images = clonedElement.getElementsByTagName("img");
            Array.from(images).forEach((img) => {
              if (!img.complete) {
                img.src = img.src;
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page if content is taller than one page
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      const clientName = invoice.client || invoice.clientName || "Client";
      const invoiceDate = invoice.date || invoice.issueDate || "date";
      pdf.save(`Invoice-${clientName}-${invoiceDate}.pdf`);

      toast({
        title: "PDF downloaded",
        description: `${invoice.invoiceNumber}.pdf has been downloaded successfully`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (invoice: Invoice) => {
    // Delete from appropriate localStorage
    if (invoice.status === "draft") {
      const drafts = JSON.parse(localStorage.getItem("invoiceDrafts") || "[]");
      const updated = drafts.filter((d: Invoice) => d.id !== invoice.id);
      localStorage.setItem("invoiceDrafts", JSON.stringify(updated));
    } else {
      const emitted = JSON.parse(
        localStorage.getItem("emittedInvoices") || "[]"
      );
      const updated = emitted.filter((e: Invoice) => e.id !== invoice.id);
      localStorage.setItem("emittedInvoices", JSON.stringify(updated));
    }

    loAddInvoices();

    toast({
      title: "Invoice deleted",
      description: `${invoice.invoiceNumber} has been deleted.`,
      variant: "destructive",
    });
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * item.tax) / 100;
    return subtotal + taxAmount;
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
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Invoices
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your billing
            </p>
          </div>
          <div className="hidden md:flex gap-2 w-full sm:w-auto">
            <Link href="/invoices/new" className="flex-1 sm:flex-none">
              <Button
                id="invoices-create-btn"
                variant="accent"
                size="lg"
                className="gap-2 w-full transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                Create Invoice
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
            ${stats.revenue.toLocaleString()}
          </h2>

          {/* Scrollable Glass Stat Cards */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-4 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</CardTitle>
                  <div className="p-1.5 bg-blue-500/15 dark:bg-blue-500/20 rounded-lg ring-1 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black font-mono text-foreground">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paid</CardTitle>
                  <div className="p-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black font-mono text-foreground">{stats.paid}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-chart-4/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</CardTitle>
                  <div className="p-1.5 bg-amber-500/15 dark:bg-amber-500/20 rounded-lg ring-1 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                    <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-black font-mono text-foreground">{stats.pending}</div>
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
            <div className="relative flex-1" id="invoices-search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="invoices-tabs">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                All Invoices
              </Button>
              <Button
                variant={activeTab === "emitted" ? "default" : "outline"}
                onClick={() => setActiveTab("emitted")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Emitted
              </Button>
              <Button
                variant={activeTab === "paid" ? "default" : "outline"}
                onClick={() => setActiveTab("paid")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Paid
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                onClick={() => setActiveTab("pending")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={activeTab === "overdue" ? "default" : "outline"}
                onClick={() => setActiveTab("overdue")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Overdue
              </Button>
              <Button
                variant={activeTab === "drafts" ? "default" : "outline"}
                onClick={() => setActiveTab("drafts")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Drafts
              </Button>
            </div>
          </div>

          <div id="invoices-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                {activeTab === "all" && "All Invoices"}
                {activeTab === "emitted" && "Emitted Invoices"}
                {activeTab === "paid" && "Paid Invoices"}
                {activeTab === "pending" && "Pending Invoices"}
                {activeTab === "overdue" && "Overdue Invoices"}
                {activeTab === "drafts" && "Draft Invoices"}
                {filteredInvoices.length !== invoices.length &&
                  ` (${filteredInvoices.length})`}
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredInvoices.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 px-4 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl rounded-[3rem] border border-white/20 dark:border-white/5 flex flex-col items-center justify-center shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700" />
                  <div className="w-24 h-24 bg-gradient-to-br from-background to-secondary rounded-3xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/10 relative overflow-hidden rotate-3 group-hover:rotate-6 transition-transform duration-500">
                    <div className="absolute inset-0 bg-primary/5 blur-md" />
                    <FileText className="h-10 w-10 text-primary relative z-10" />
                  </div>
                  <h4 className="text-3xl font-black text-foreground mb-3 font-sans">Time to make some money!</h4>
                  <p className="text-base text-muted-foreground mb-8 max-w-[300px] leading-relaxed">
                    You haven't created any invoices yet. Send your first invoice and start getting paid faster.
                  </p>
                  <Link href="/invoices/new">
                    <Button size="lg" className="gap-2 rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,117,135,0.6)] hover:shadow-[0_12px_32px_-8px_rgba(0,117,135,0.8)] hover:-translate-y-1 transition-all duration-300 font-bold px-8">
                      <Plus className="h-5 w-5" />
                      Create First Invoice
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice, index) => {
                    const clientName =
                      invoice.client || invoice.clientName || "Unknown Client";
                    const amount = invoice.amount || invoice.total || 0;
                    const displayDate =
                      invoice.date || invoice.issueDate || "N/A";

                    return (
                      <SwipeableItem
                        key={invoice.id}
                        onDelete={() => handleDelete(invoice)}
                        onEdit={() => handleEdit(invoice.id)}
                        onSend={() => handleSend(invoice)}
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
                        <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => handleView(invoice.id)}>
                          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-foreground text-base leading-none font-mono">
                                {invoice.invoiceNumber}
                              </p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5",
                                  (statusConfig[
                                    invoice.status as keyof typeof statusConfig
                                  ] || statusConfig.draft).className
                                )}
                              >
                                {
                                  (statusConfig[
                                    invoice.status as keyof typeof statusConfig
                                  ] || statusConfig.draft).label
                                }
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate font-medium">
                              {clientName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                          <div className="text-left sm:text-right" onClick={() => handleView(invoice.id)}>
                            <p className="font-bold text-foreground text-base sm:text-lg font-mono">
                              ${amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
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
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem
                                onClick={() => handleView(invoice.id)}
                                className="rounded-lg py-2"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(invoice.id)}
                                className="rounded-lg py-2"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(invoice)}
                                className="rounded-lg py-2"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSend(invoice)}
                                className="rounded-lg py-2"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send to Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(invoice)}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {selectedInvoice && (
        <SendDocumentDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          documentId={selectedInvoice.id}
          documentType="invoice"
          clientName={selectedInvoice.client}
          clientEmail={selectedInvoice.clientEmail}
          onSend={processSend}
        />
      )}
      {filteredInvoices.map((invoice) => (
        <div
          key={`preview-${invoice.id}`}
          id={`invoice-preview-${invoice.id}`}
          className="fixed -left-[9999px] w-[210mm] bg-white p-8"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                {invoice.logo && (
                  <img
                    src={invoice.logo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="h-16 mb-4"
                  />
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                  {invoice.companyName || "Company Name"}
                </h1>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {invoice.companyAddress || ""}
                </p>
                {invoice.companyNIT && (
                  <p className="text-sm text-gray-600">
                    NIT: {invoice.companyNIT}
                  </p>
                )}
                {invoice.companyEmail && (
                  <p className="text-sm text-gray-600">
                    {invoice.companyEmail}
                  </p>
                )}
                {invoice.companyPhone && (
                  <p className="text-sm text-gray-600">
                    {invoice.companyPhone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm text-gray-600">
                  #{invoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Issue Date: {invoice.date || invoice.issueDate}
                </p>
                <p className="text-sm text-gray-600">
                  Due Date: {invoice.dueDate}
                </p>
              </div>
            </div>

            <div className="border-t border-b border-gray-300 py-4">
              <p className="text-sm font-semibold text-gray-900">Bill To:</p>
              <p className="text-sm text-gray-900">
                {invoice.client || invoice.clientName}
              </p>
            </div>

            {invoice.items && invoice.items.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-900">
                      Tax
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="text-right py-2 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="text-right py-2 text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="text-right py-2 text-sm text-gray-900">
                        {item.tax}%
                      </td>
                      <td className="text-right py-2 text-sm text-gray-900">
                        ${calculateItemTotal(item).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ${(invoice.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-semibold text-gray-900">
                    ${(invoice.totalTax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    ${(invoice.total || invoice.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-900">Notes:</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">
                  Terms & Conditions:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}


    </AppLayout>
  );
}
