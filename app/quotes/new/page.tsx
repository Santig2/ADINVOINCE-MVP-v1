"use client";

import type React from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Send,
  FileDown,
  ArrowLeft,
  CheckCircle2,
  BookmarkPlus,
  User,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TemplateSelectionDialog } from "@/components/template-selection-dialog";
import { QuotePDFTemplate, QuoteData, QuoteItem } from "@/components/quote-pdf-template";
import { generateQuotePrintHTML } from "@/components/quote-print-template";

type QuoteDraft = QuoteData & {
  createdAt: string;
};

type Client = {
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  phone?: string;
};

type CompanyTemplate = {
  id: number;
  name: string;
  nit: string;
  address: string;
  email: string;
  phone: string;
  logo: string | null;
  template: string;
  isDefault: boolean;
};

const PAYMENT_OPTIONS = ["Bank Transfer", "Credit Card", "PayPal", "Zelle", "Other"];

function QuotesFormContent() {
  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", description: "", longDescription: "", quantity: 1, unitPrice: 0, tax: 0 },
  ]);
  const [logo, setLogo] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quotePreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [quoteNumber, setQuoteNumber] = useState("QUO-001");
  const [status, setStatus] = useState("draft");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  // Client Info
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [availableClients, setAvailableClients] = useState<Client[]>([]);

  // Company Info
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyNIT, setCompanyNIT] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  // Proposal Info
  const [projectName, setProjectName] = useState("");
  const [proposalSummary, setProposalSummary] = useState("");
  const [estimatedStartDate, setEstimatedStartDate] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [warrantyNotes, setWarrantyNotes] = useState("");

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);

  useEffect(() => {
    // Load clients
    const loadClients = () => {
      const emittedInvoices = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
      const draftInvoices = JSON.parse(localStorage.getItem("invoiceDrafts") || "[]");
      const emittedQuotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
      const draftQuotes = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
      const allDocuments = [...emittedInvoices, ...draftInvoices, ...emittedQuotes, ...draftQuotes];

      const clientMap = new Map<string, Client>();
      allDocuments.forEach((doc: any) => {
        if (doc.clientName) {
          const key = doc.clientName.toLowerCase();
          if (!clientMap.has(key)) {
            clientMap.set(key, {
              name: doc.clientName,
              contact: doc.clientContact || "",
              email: doc.clientEmail || "",
              address: doc.clientAddress || "",
              phone: doc.clientPhone || "",
            });
          } else {
            const existing = clientMap.get(key)!;
            if (!existing.email && doc.clientEmail) existing.email = doc.clientEmail;
            if (!existing.address && doc.clientAddress) existing.address = doc.clientAddress;
            if (!existing.phone && doc.clientPhone) existing.phone = doc.clientPhone;
            if (!existing.contact && doc.clientContact) existing.contact = doc.clientContact;
          }
        }
      });
      setAvailableClients(Array.from(clientMap.values()));
    };

    loadClients();

    const editingDraftStr = localStorage.getItem("editingQuoteDraft");
    const editingId = localStorage.getItem("editingQuoteId");
    let draftToLoad: QuoteDraft | null = null;

    if (editingDraftStr) {
      draftToLoad = JSON.parse(editingDraftStr);
    } else if (editingId) {
      const emittedQuotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
      const draftQuotes = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
      const allQuotes = [...emittedQuotes, ...draftQuotes];
      draftToLoad = allQuotes.find((q: any) => q.id.toString() === editingId) || null;
    }

    if (draftToLoad) {
      const draft = draftToLoad;
      setEditingDraftId(Number(draft.id));
      setQuoteNumber(draft.quoteNumber);
      setStatus(draft.status);
      setIssueDate(draft.issueDate || "");
      setValidUntil(draft.validUntil || "");
      setClientName(draft.clientName || "");
      setClientContact(draft.clientContact || "");
      setClientEmail(draft.clientEmail || "");
      setClientAddress(draft.clientAddress || "");
      setClientPhone(draft.clientPhone || "");
      setCompanyName(draft.companyName || "");
      setCompanyAddress(draft.companyAddress || "");
      setCompanyNIT(draft.companyNIT || "");
      setCompanyEmail(draft.companyEmail || "");
      setCompanyPhone(draft.companyPhone || "");

      setProjectName(draft.projectName || "");
      setProposalSummary(draft.proposalSummary || "");
      setEstimatedStartDate(draft.estimatedStartDate || "");
      setEstimatedDeliveryDate(draft.estimatedDeliveryDate || "");
      setPaymentMethods(draft.paymentMethods || []);
      setWarrantyNotes(draft.warrantyNotes || "");

      setItems(draft.items || []);
      setNotes(draft.notes || "");
      setTerms(draft.terms || "");
      setLogo(draft.logo || "");
      localStorage.removeItem("editingQuoteDraft");
      localStorage.removeItem("editingQuoteId");
    } else {
      const savedCompanies = localStorage.getItem("companies");
      if (savedCompanies) {
        const companies = JSON.parse(savedCompanies);
        if (companies.length > 0) {
          const defaultCompany = companies.find((c: any) => c.isDefault) || companies[0];
          setCompanyName(defaultCompany.name);
          setCompanyAddress(defaultCompany.address);
          setCompanyNIT(defaultCompany.nit);
          setCompanyEmail(defaultCompany.email);
          setCompanyPhone(defaultCompany.phone);
          setLogo(defaultCompany.logo);
        }
      }
      setShowTemplateDialog(true);
    }
  }, []);

  const handleTemplateSelect = (template: CompanyTemplate | null) => {
    if (template) {
      setCompanyName(template.name);
      setCompanyAddress(template.address);
      setCompanyNIT(template.nit);
      setCompanyEmail(template.email);
      setCompanyPhone(template.phone);
      setLogo(template.logo);

      const savedInvoiceConfig = localStorage.getItem("invoiceConfig");
      if (savedInvoiceConfig) {
        const config = JSON.parse(savedInvoiceConfig);
        if (config.reminderMessage) {
          setTerms("This quote is valid for 30 days. Terms and conditions apply.");
        }
      }

      toast({
        title: "Template loaded",
        description: `Company information from ${template.name} has been applied`,
      });
    }
    setShowTemplateDialog(false);
  };

  const handleSaveAsTemplate = () => setShowSaveTemplateDialog(true);

  const confirmSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: CompanyTemplate = {
      id: Date.now(),
      name: templateName,
      nit: companyNIT,
      address: companyAddress,
      email: companyEmail,
      phone: companyPhone,
      logo: logo,
      template: "custom",
      isDefault: false,
    };

    const existingCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
    localStorage.setItem("companies", JSON.stringify([...existingCompanies, newTemplate]));

    toast({ title: "Template saved", description: `${templateName} has been saved as a template` });
    setShowSaveTemplateDialog(false);
    setTemplateName("");
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", longDescription: "", quantity: 1, unitPrice: 0, tax: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: QuoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    return subtotal + (subtotal * item.tax) / 100;
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const calculateTotalTax = () => items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * item.tax) / 100, 0);
  const calculateTotal = () => items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleClientSelect = (clientName: string) => {
    const client = availableClients.find((c) => c.name === clientName);
    if (client) {
      setClientName(client.name);
      setClientContact(client.contact || "");
      setClientEmail(client.email || "");
      setClientAddress(client.address || "");
      setClientPhone(client.phone || "");
      setSelectedClientId(clientName);
      toast({ title: "Client selected", description: `Client information for ${client.name} has been filled.` });
    }
  };

  const saveClientToStorage = (clientData: any) => {
    if (!clientData.name.trim()) return;
    const existingClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const existingIndex = existingClients.findIndex((c: any) => c.name.toLowerCase() === clientData.name.toLowerCase());

    const clientToSave = {
      id: existingIndex >= 0 ? existingClients[existingIndex].id : Date.now().toString(),
      name: clientData.name,
      email: clientData.email || "",
      phone: clientData.phone || "",
      address: clientData.address || "",
      contact: clientData.contact || "",
      status: "active",
      createdAt: existingIndex >= 0 ? existingClients[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      existingClients[existingIndex] = {
        ...existingClients[existingIndex],
        ...clientToSave,
        email: clientData.email || existingClients[existingIndex].email || "",
        phone: clientData.phone || existingClients[existingIndex].phone || "",
        address: clientData.address || existingClients[existingIndex].address || "",
        contact: clientData.contact || existingClients[existingIndex].contact || "",
        updatedAt: new Date().toISOString(),
      };
    } else {
      existingClients.push(clientToSave);
    }
    localStorage.setItem("clients", JSON.stringify(existingClients));
  };

  const gatherQuoteData = (): QuoteDraft => {
    return {
      id: editingDraftId || Date.now(),
      quoteNumber,
      status,
      issueDate,
      validUntil,
      clientName,
      clientContact: clientContact || undefined,
      clientEmail: clientEmail || undefined,
      clientAddress: clientAddress || undefined,
      clientPhone: clientPhone || undefined,
      companyName,
      companyAddress,
      companyNIT,
      companyEmail,
      companyPhone,
      projectName,
      proposalSummary,
      estimatedStartDate,
      estimatedDeliveryDate,
      paymentMethods,
      warrantyNotes,
      items,
      notes,
      terms,
      logo,
      subtotal: calculateSubtotal(),
      totalTax: calculateTotalTax(),
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
    };
  };

  const handleSaveDraft = () => {
    if (clientName.trim()) saveClientToStorage({ name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, contact: clientContact });

    const draftData = gatherQuoteData();
    const existingDrafts = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");

    let updatedDrafts;
    if (editingDraftId) {
      updatedDrafts = existingDrafts.map((d: QuoteDraft) => d.id === editingDraftId ? draftData : d);
    } else {
      updatedDrafts = [...existingDrafts, draftData];
      setEditingDraftId(Number(draftData.id));
    }

    localStorage.setItem("quoteDrafts", JSON.stringify(updatedDrafts));
    setShowDraftDialog(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({ title: "Logo uploaded", description: "Your company logo has been added." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = async () => {
    setIsExporting(true);
    toast({ title: "Preparing Print", description: "Please wait while we prepare your document..." });

    try {
      const quoteData = gatherQuoteData();
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast({ title: "Popup Blocked", description: "Please allow popups to print quotes", variant: "destructive" });
        return;
      }

      const htmlContent = generateQuotePrintHTML(quoteData);
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendQuote = () => setShowSendDialog(true);

  const confirmSendQuote = () => {
    if (clientName.trim()) saveClientToStorage({ name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, contact: clientContact });

    const emittedQuoteData = { ...gatherQuoteData(), status: "sent", sentAt: new Date().toISOString() };
    const existingEmitted = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
    localStorage.setItem("emittedQuotes", JSON.stringify([...existingEmitted, emittedQuoteData]));

    if (editingDraftId) {
      const existingDrafts = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
      const updatedDrafts = existingDrafts.filter((d: QuoteDraft) => d.id !== editingDraftId);
      localStorage.setItem("quoteDrafts", JSON.stringify(updatedDrafts));
    }

    setShowSendDialog(false);
    setShowSuccessDialog(true);

    setTimeout(() => {
      setShowSuccessDialog(false);
      setQuoteNumber("QUO-002");
      setClientName(""); setClientContact(""); setClientEmail(""); setClientAddress(""); setClientPhone("");
      setProjectName(""); setProposalSummary(""); setEstimatedStartDate(""); setEstimatedDeliveryDate(""); setPaymentMethods([]);
      setSelectedClientId("");
      setItems([{ id: "1", description: "", longDescription: "", quantity: 1, unitPrice: 0, tax: 0 }]);
      setNotes(""); setTerms(""); setWarrantyNotes(""); setLogo(null); setEditingDraftId(null);
    }, 2000);
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const currentQuoteData = gatherQuoteData();

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/quotes">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">QUOTE / PROPOSAL</h1>
              <p className="text-muted-foreground mt-1">This is an estimate, not a payment request</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveAsTemplate} variant="outline" className="gap-2 bg-transparent">
              <BookmarkPlus className="h-4 w-4" /> Save as Template
            </Button>
            <Button onClick={handleSaveDraft} variant="outline" className="gap-2 bg-transparent">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button onClick={handlePrint} disabled={isExporting} variant="outline" className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" /> {isExporting ? "Preparing..." : "Print"}
            </Button>
            <Button onClick={handleSendQuote} className="gap-2">
              <Send className="h-4 w-4" /> Send Quote
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Company Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg font-bold">Company Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Logo</Label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                    {logo ? <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" /> : (
                      <div className="text-center"><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Upload logo</p></div>
                    )}
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div><Label>Company Name</Label><Input className="mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
                  <div><Label>Address</Label><Textarea className="mt-1" rows={2} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} /></div>
                  <div><Label>NIT / Tax ID</Label><Input className="mt-1" value={companyNIT} onChange={(e) => setCompanyNIT(e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" className="mt-1" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} /></div>
                  <div><Label>Phone</Label><Input type="tel" className="mt-1" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><User className="h-5 w-5" /> Client Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Existing</Label>
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Search client" /></SelectTrigger>
                    <SelectContent>
                      {availableClients.length > 0 ? availableClients.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>) : <SelectItem value="none" disabled>No clients found</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div><Label>Client Name *</Label><Input className="mt-1" value={clientName} onChange={(e) => { setClientName(e.target.value); setSelectedClientId(""); }} /></div>
                  <div><Label>Contact Name</Label><Input className="mt-1" value={clientContact} onChange={(e) => setClientContact(e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" className="mt-1" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
                  <div><Label>Address</Label><Textarea className="mt-1" rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg font-bold">Quote Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Quote Number</Label><Input className="mt-1" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-1">
                  <div><Label>Issue Date</Label><Input type="date" className="mt-1" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg font-bold">Proposal Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input placeholder="E.g., Website Development for Acme Corp" className="mt-1" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </div>
                <div>
                  <Label>What is this proposal about?</Label>
                  <Textarea placeholder="This proposal outlines the scope, timeline, and estimated cost for the development of..." className="mt-1 min-h-[100px]" value={proposalSummary} onChange={(e) => setProposalSummary(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Services / Products</CardTitle>
                  <Button onClick={addItem} size="sm" variant="outline" className="gap-2 bg-transparent"><Plus className="h-4 w-4" /> Add Item</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-xl bg-secondary/30 border border-border shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <Label className="text-sm font-semibold mb-1 block">Title / Service Name</Label>
                        <Input placeholder="e.g. UX/UI Design" className="font-bold text-foreground" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                      </div>
                      {items.length > 1 && (
                        <Button onClick={() => removeItem(item.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Long Description (Optional)</Label>
                      <Textarea placeholder="Describe the service in detail..." className="text-sm resize-none" rows={2} value={item.longDescription || ""} onChange={(e) => updateItem(index, "longDescription", e.target.value)} />
                    </div>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 pt-2">
                      <div><Label className="text-xs">Quantity</Label><Input type="number" min="1" className="mt-1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} /></div>
                      <div><Label className="text-xs">Unit Price</Label><Input type="number" min="0" step="0.01" className="mt-1" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))} /></div>
                      <div><Label className="text-xs">Tax (%)</Label><Input type="number" min="0" max="100" step="0.1" className="mt-1" value={item.tax} onChange={(e) => updateItem(index, "tax", Number(e.target.value))} /></div>
                      <div>
                        <Label className="text-xs">Line Total</Label>
                        <div className="mt-1 h-10 flex items-center justify-end px-3 rounded-md bg-muted text-foreground font-semibold">
                          ${calculateItemTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-6 md:gap-0 justify-between">
                  <div className="flex-1" />
                  <div className="w-full md:w-72 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal:</span><span className="font-semibold text-foreground">${calculateSubtotal().toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxes:</span><span className="font-semibold text-foreground">${calculateTotalTax().toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg pt-3 border-t border-border mt-3"><span className="font-bold text-foreground">Estimated Total:</span><span className="font-bold text-primary">${calculateTotal().toFixed(2)}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg font-bold">Timeline & Payment Setup (Optional)</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Estimated Start Date</Label>
                    <Input placeholder="e.g. May 1st, 2026 or 'Available immediately'" className="mt-1" value={estimatedStartDate} onChange={(e) => setEstimatedStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Estimated Delivery Date</Label>
                    <Input placeholder="e.g. 4 Weeks from kickoff" className="mt-1" value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Accepted Payment Methods</Label>
                  <div className="flex flex-wrap gap-4">
                    {PAYMENT_OPTIONS.map(method => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox id={`pm-${method}`} checked={paymentMethods.includes(method)} onCheckedChange={() => togglePaymentMethod(method)} />
                        <label htmlFor={`pm-${method}`} className="text-sm font-medium leading-none cursor-pointer">{method}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        <TemplateSelectionDialog open={showTemplateDialog} onSelect={handleTemplateSelect} onOpenChange={setShowTemplateDialog} />

        <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Save as Template</DialogTitle><DialogDescription>Save the current company information as a reusable template</DialogDescription></DialogHeader>
            <div className="py-4"><Label>Template Name</Label><Input placeholder="e.g., My Company Template" className="mt-2" value={templateName} onChange={(e) => setTemplateName(e.target.value)} /></div>
            <DialogFooter><Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>Cancel</Button><Button onClick={confirmSaveTemplate}>Save Template</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Quote</DialogTitle><DialogDescription>Are you sure you want to send this quote to {clientName || "the client"}?</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button><Button onClick={confirmSendQuote}>Confirm & Send</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-100 p-3"><CheckCircle2 className="h-12 w-12 text-green-600" /></div>
              <DialogTitle className="text-2xl font-bold text-center">Quote Sent Successfully!</DialogTitle>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-100 p-3"><CheckCircle2 className="h-12 w-12 text-green-600" /></div>
              <DialogTitle className="text-2xl font-bold text-center">Draft Saved!</DialogTitle>
              <DialogFooter className="w-full"><Button onClick={() => setShowDraftDialog(false)} className="w-full">Continue Editing</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden PDF renderer */}
        <div id="quote-export-preview" style={{ display: 'none' }} className="absolute left-[-9999px] top-[-9999px] bg-white">
          {quoteNumber && <QuotePDFTemplate quote={currentQuoteData} signatures={[]} />}
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <QuotesFormContent />
    </Suspense>
  );
}
