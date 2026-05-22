"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileCheck,
  DollarSign,
  Calendar,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Send,
  Trash2,
  FileText,
  Printer,
  ArrowRight,
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
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { generateQuotePrintHTML } from "@/components/quote-print-template";
import { SendDocumentDialog } from "@/components/send-document-dialog";
import { SwipeableItem } from "@/components/ui/swipeable-item";
import { DigitalSignatureDialog } from "@/components/digital-signature-dialog";
import { SignatureDisplay } from "@/components/signature-display";
import { useSignatures } from "@/hooks/use-signatures";
import { PenTool } from "lucide-react";
import { QuotePDFTemplate } from "@/components/quote-pdf-template";

// Types
type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

type Quote = {
  id: number | string;
  quoteNumber: string;
  clientName?: string;
  total?: number;
  status: string;
  issueDate?: string;
  validUntil?: string;
  companyName?: string;
  companyAddress?: string;
  companyNIT?: string;
  companyEmail?: string;
  companyPhone?: string;
  items?: QuoteItem[];
  notes?: string;
  terms?: string;
  logo?: string | null;
  subtotal?: number;
  totalTax?: number;
  createdAt?: string;
  sentAt?: string;
};

// Status config (used for badge classes/labels)
const statusConfig = {
  sent: {
    label: "Sent",
    className: "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30",
  },
  pending: {
    label: "Pending",
    className: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
  },
  accepted: {
    label: "Accepted",
    className: "bg-primary/20 text-primary hover:bg-primary/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground hover:bg-muted/80",
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<{
    id: string;
    quoteNumber: string;
    clientName: string;
    clientEmail?: string;
  } | null>(null);

  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [selectedQuoteForSign, setSelectedQuoteForSign] = useState<{ id: string, companyId: string } | null>(null);
  const { signatures, getSignaturesForDocument } = useSignatures();

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    const emittedQuotes = JSON.parse(
      localStorage.getItem("emittedQuotes") || "[]"
    );
    const draftQuotes = JSON.parse(
      localStorage.getItem("quoteDrafts") || "[]"
    );

    // Combine both arrays and sort by date (most recent first)
    const allQuotes = [...emittedQuotes, ...draftQuotes].sort((a, b) => {
      const dateA = new Date(
        a.sentAt || a.createdAt || a.issueDate || 0
      ).getTime();
      const dateB = new Date(
        b.sentAt || b.createdAt || b.issueDate || 0
      ).getTime();
      return dateB - dateA;
    });

    setQuotes(allQuotes);
  };

  const filteredQuotes = quotes.filter((quote) => {
    const clientName = quote.clientName || "";
    const quoteAmount = quote.total || 0;

    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quoteAmount.toString().includes(searchQuery);

    // Tab filtering
    let matchesTab = true;
    if (activeTab === "sent") {
      matchesTab = quote.status === "sent";
    } else if (activeTab === "accepted") {
      matchesTab = quote.status === "accepted";
    } else if (activeTab === "pending") {
      matchesTab = quote.status === "pending";
    } else if (activeTab === "drafts") {
      matchesTab = quote.status === "draft";
    }

    // Dropdown filter
    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesTab && matchesStatus;
  });

  const stats = {
    total: quotes.length,
    sent: quotes.filter((q) => q.status === "sent").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    estimatedValue: quotes.reduce((sum, q) => sum + (q.total || 0), 0),
  };

  const handleView = (quoteId: string | number) => {
    router.push(`/quotes/${quoteId}`);
  };

  const handleEdit = (quoteId: string | number) => {
    localStorage.removeItem("editingQuoteDraft");
    localStorage.setItem("editingQuoteId", quoteId.toString());
    router.push(`/quotes/new`);
  };

  const handlePrint = async (quote: Quote) => {
    toast({ title: "Preparing Print", description: "Please wait while we prepare your document..." });

    try {
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast({ title: "Popup Blocked", description: "Please allow popups to print quotes", variant: "destructive" });
        return;
      }

      // Load specific quote signature if needed
      const documentSignatures = getSignaturesForDocument(quote.id.toString(), 'quote');
      const quoteWithSignatures = { ...quote, signatures: documentSignatures };

      // @ts-ignore
      const htmlContent = generateQuotePrintHTML({ ...quoteWithSignatures, id: quoteWithSignatures.id.toString(), quoteNumber: quoteWithSignatures.quoteNumber, status: quoteWithSignatures.status });

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } catch (error) {
      console.error("Print generation failed:", error);
      toast({ title: "Print failed", description: "There was an error generating the print document.", variant: "destructive" });
    }
  };

  const handleDelete = (quote: Quote) => {
    // Delete from appropriate localStorage
    if (quote.status === "draft") {
      const drafts = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
      const updated = drafts.filter((d: Quote) => d.id !== quote.id);
      localStorage.setItem("quoteDrafts", JSON.stringify(updated));
    } else {
      const emitted = JSON.parse(
        localStorage.getItem("emittedQuotes") || "[]"
      );
      const updated = emitted.filter((e: Quote) => e.id !== quote.id);
      localStorage.setItem("emittedQuotes", JSON.stringify(updated));
    }

    loadQuotes();

    toast({
      title: "Quote deleted",
      description: `${quote.quoteNumber} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleSignQuote = (quote: Quote) => {
    setSelectedQuoteForSign({ id: quote.id.toString(), companyId: "default" });
    setSignatureDialogOpen(true);
  };

  const handleConvertToInvoice = (quote: Quote) => {
    // Check if the quote has been signed before converting
    const quoteSignatures = getSignaturesForDocument(quote.id.toString(), "quote");
    if (quoteSignatures.length === 0) {
      toast({
        title: "Signature Required",
        description: "Please have the client sign the quote before converting it to an invoice.",
        variant: "destructive"
      });
      return;
    }
    // Generate invoice number
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const invoiceNumber = `INV-${String(emittedInvoices.length + 1).padStart(4, "0")}`;

    // Convert quote to invoice
    const invoice = {
      ...quote,
      id: Date.now(),
      invoiceNumber,
      status: "draft",
      date: new Date().toISOString().split("T")[0],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    // Save as draft invoice
    const invoiceDrafts = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );
    invoiceDrafts.push(invoice);
    localStorage.setItem("invoiceDrafts", JSON.stringify(invoiceDrafts));

    toast({
      title: "Quote converted to invoice",
      description: `Invoice ${invoiceNumber} has been created from quote ${quote.quoteNumber}`,
    });

    // Navigate to edit the new invoice
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const calculateItemTotal = (item: QuoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * item.tax) / 100;
    return subtotal + taxAmount;
  };

  const handleSend = (quote: Quote) => {
    // Find client email
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const client = savedClients.find(
      (c: any) => c.name === quote.clientName
    );

    setSelectedQuote({
      id: quote.id.toString(),
      quoteNumber: quote.quoteNumber,
      clientName: quote.clientName || "Unknown Client",
      clientEmail: client?.email || "",
    });
    setSendDialogOpen(true);
  };

  const processSend = async (email: string, subject: string, message: string) => {
    if (!selectedQuote) return;

    // 1. Trigger System Print action instead of obsolete download
    const fullQuote = quotes.find(q => q.id.toString() === selectedQuote.id);
    if (fullQuote) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await handlePrint(fullQuote);
    }

    // 2. Open mailto link
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoLink;

    // 3. Update status
    const emittedQuotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
    let quoteUpdated = false;

    const updatedEmitted = emittedQuotes.map((q: Quote) => {
      if (q.id.toString() === selectedQuote.id) {
        quoteUpdated = true;
        return {
          ...q,
          status: "sent",
          sentAt: new Date().toISOString()
        };
      }
      return q;
    });

    if (quoteUpdated) {
      localStorage.setItem("emittedQuotes", JSON.stringify(updatedEmitted));
    } else {
      // Check drafts
      const draftQuotes = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
      const draftIndex = draftQuotes.findIndex((q: Quote) => q.id.toString() === selectedQuote.id);

      if (draftIndex !== -1) {
        const draft = draftQuotes[draftIndex];
        const newQuote = {
          ...draft,
          status: "sent",
          sentAt: new Date().toISOString()
        };
        draftQuotes.splice(draftIndex, 1);
        localStorage.setItem("quoteDrafts", JSON.stringify(draftQuotes));
        updatedEmitted.push(newQuote);
        localStorage.setItem("emittedQuotes", JSON.stringify(updatedEmitted));
      }
    }

    loadQuotes();
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
              Estimates
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track all your quotes
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/quotes/new" className="w-full sm:w-auto">
              <Button
                id="quotes-create-btn"
                size="lg"
                className="gap-2 w-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                Create Estimate
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
            Estimated Value
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            ${stats.estimatedValue.toLocaleString()}
          </h2>

          {/* Scrollable Glass Stat Cards */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-4 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
                  <FileCheck className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Sent</CardTitle>
                  <Send className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.sent}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Accepted</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.accepted}</div>
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
            <div className="relative flex-1" id="quotes-search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="quotes-tabs">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                All Estimates
              </Button>
              <Button
                variant={activeTab === "sent" ? "default" : "outline"}
                onClick={() => setActiveTab("sent")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Sent
              </Button>
              <Button
                variant={activeTab === "accepted" ? "default" : "outline"}
                onClick={() => setActiveTab("accepted")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Accepted
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
                variant={activeTab === "drafts" ? "default" : "outline"}
                onClick={() => setActiveTab("drafts")}
                className="whitespace-nowrap rounded-full"
                size="sm"
              >
                Drafts
              </Button>
            </div>
          </div>

          <div id="quotes-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                {activeTab === "all" && "All Estimates"}
                {activeTab === "sent" && "Sent Estimates"}
                {activeTab === "accepted" && "Accepted Estimates"}
                {activeTab === "pending" && "Pending Estimates"}
                {activeTab === "drafts" && "Draft Estimates"}
                {filteredQuotes.length !== quotes.length &&
                  ` (${filteredQuotes.length})`}
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-16 px-4 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-primary/5">
                    <FileCheck className="h-10 w-10 text-primary/60" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">No estimates found</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                    You haven't created any estimates with these filters yet.
                  </p>
                  <Link href="/quotes/new">
                    <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                      <Plus className="h-5 w-5" />
                      Create your first estimate
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuotes.map((quote, index) => {
                    const clientName = quote.clientName || "Unknown Client";
                    const amount = quote.total || 0;
                    const displayDate = quote.issueDate || "N/A";

                    return (
                      <SwipeableItem
                        key={quote.id}
                        onDelete={() => handleDelete(quote)}
                        onEdit={() => handleEdit(quote.id)}
                        onSend={() => handleSend(quote)}
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
                        <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => handleView(quote.id)}>
                          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <FileCheck className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-foreground text-base leading-none">
                                {quote.quoteNumber}
                              </p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5",
                                  statusConfig[
                                    quote.status as keyof typeof statusConfig
                                  ]?.className ||
                                  "bg-muted text-muted-foreground"
                                )}
                              >
                                {
                                  statusConfig[
                                    quote.status as keyof typeof statusConfig
                                  ]?.label || quote.status
                                }
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate font-medium">
                              {clientName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                          <div className="text-left sm:text-right" onClick={() => handleView(quote.id)}>
                            <p className="font-bold text-foreground text-base sm:text-lg">
                              ${amount.toLocaleString()}
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
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                              <DropdownMenuItem
                                onClick={() => handleView(quote.id)}
                                className="rounded-lg py-2"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(quote.id)}
                                className="rounded-lg py-2"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Estimate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePrint(quote)}
                                className="rounded-lg py-2"
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSend(quote)}
                                className="rounded-lg py-2"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send to Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSignQuote(quote)}
                                className="rounded-lg py-2"
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Sign Estimate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleConvertToInvoice(quote)}
                                className="rounded-lg py-2 font-medium text-primary"
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Convert to Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(quote)}
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

      {selectedQuote && (
        <SendDocumentDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          documentId={selectedQuote.quoteNumber}
          documentType="quote"
          clientName={selectedQuote.clientName}
          clientEmail={selectedQuote.clientEmail}
          onSend={processSend}
        />
      )}

      {selectedQuoteForSign && (
        <DigitalSignatureDialog
          open={signatureDialogOpen}
          onOpenChange={setSignatureDialogOpen}
          documentId={selectedQuoteForSign.id}
          documentType="quote"
          companyId={selectedQuoteForSign.companyId}
        />
      )}





    </AppLayout>
  );
}

