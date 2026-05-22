"use client";

import type React from "react";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  Download,
  CalendarIcon,
  Search,
  Check,
  CreditCard,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TemplateSelectionDialog } from "@/components/template-selection-dialog";
import { cn } from "@/lib/utils";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

type InvoiceDraft = {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  companyName: string;
  companyAddress: string;
  companyNIT: string;
  companyEmail: string;
  companyPhone: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  logo: string | null;
  subtotal: number;
  totalTax: number;
  total: number;
  createdAt: string;
  companyId?: number;
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
  defaultRemarks?: string;
  defaultTerms?: string;
};

type PaymentMethodConfig = {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  zelleEnabled: boolean;
  nequiEnabled: boolean;
  manualInstructions: string;
};

export default function NewInvoicePage() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, tax: 0 },
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
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Catalog State
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState("draft");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyNIT, setCompanyNIT] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);

  // Payment Method State
  const [paymentMethodConfig, setPaymentMethodConfig] = useState<PaymentMethodConfig | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [customPaymentInstructions, setCustomPaymentInstructions] = useState<string>("");

  // Invoice Colors State
  const [invoiceColors, setInvoiceColors] = useState<any>(null);

  // Mobile Wizard State
  const [mobileStep, setMobileStep] = useState(1);


  useEffect(() => {
    // Load clients from existing invoices
    // Load clients from existing invoices and client list
    const loadClients = () => {
      const emittedInvoices = JSON.parse(
        localStorage.getItem("emittedInvoices") || "[]"
      );
      const draftInvoices = JSON.parse(
        localStorage.getItem("invoiceDrafts") || "[]"
      );
      const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");

      const allInvoices = [...emittedInvoices, ...draftInvoices];

      // Extract unique clients
      const clientMap = new Map<string, Client>();

      // First add saved clients (they serve as the base source of truth)
      savedClients.forEach((client: any) => {
        if (client.name) {
          const key = client.name.toLowerCase();
          clientMap.set(key, {
            name: client.name,
            contact: client.contact || "",
            email: client.email || "",
            address: client.address || "",
            phone: client.phone || "",
          });
        }
      });

      // Then merge/add from invoices
      allInvoices.forEach((invoice: any) => {
        if (invoice.clientName) {
          const key = invoice.clientName.toLowerCase();
          if (!clientMap.has(key)) {
            clientMap.set(key, {
              name: invoice.clientName,
              contact: invoice.clientContact || "",
              email: invoice.clientEmail || "",
              address: invoice.clientAddress || "",
              phone: invoice.clientPhone || "",
            });
          } else {
            // Merge data if we have more complete info in invoices (optional, but usually saved clients are fresher)
            // We prioritize saved client data, but if fields are missing in saved client and present in invoice, we can fill them.
            const existing = clientMap.get(key)!;
            if (!existing.email && invoice.clientEmail)
              existing.email = invoice.clientEmail;
            if (!existing.address && invoice.clientAddress)
              existing.address = invoice.clientAddress;
            if (!existing.phone && invoice.clientPhone)
              existing.phone = invoice.clientPhone;
            if (!existing.contact && invoice.clientContact)
              existing.contact = invoice.clientContact;
          }
        }
      });

      setAvailableClients(Array.from(clientMap.values()));
    };

    loadClients();

    // Load catalog items
    const savedCatalogItems = localStorage.getItem("catalogItems");
    if (savedCatalogItems) {
      setCatalogItems(JSON.parse(savedCatalogItems));
    }

    const savedPaymentConfig = localStorage.getItem("paymentMethodConfig");
    if (savedPaymentConfig) {
      setPaymentMethodConfig(JSON.parse(savedPaymentConfig));
    }
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const savedColors = localStorage.getItem("companyInvoiceColors");
      if (savedColors) {
        const colors = JSON.parse(savedColors);
        const compCols = colors.find((c: any) => c.companyId === selectedCompanyId.toString());
        setInvoiceColors(compCols || null);
      }
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    const editingDraft = localStorage.getItem("editingDraft");
    if (editingDraft) {
      const draft: InvoiceDraft = JSON.parse(editingDraft);
      setEditingDraftId(draft.id);
      setInvoiceNumber(draft.invoiceNumber);
      setStatus(draft.status);
      setIssueDate(draft.issueDate);
      setDueDate(draft.dueDate);
      setClientName(draft.clientName);
      setClientContact(draft.clientContact || "");
      setClientEmail(draft.clientEmail || "");
      setClientAddress(draft.clientAddress || "");
      setClientPhone(draft.clientPhone || "");
      setCompanyName(draft.companyName);
      setCompanyAddress(draft.companyAddress);
      setCompanyNIT(draft.companyNIT);
      setCompanyEmail(draft.companyEmail);
      setCompanyPhone(draft.companyPhone);
      setItems(draft.items);
      setNotes(draft.notes);
      setTerms(draft.terms);
      setLogo(draft.logo);
      if (draft.companyId) setSelectedCompanyId(draft.companyId);
      localStorage.removeItem("editingDraft");
    } else {
      // Set default dates
      const today = new Date();
      setIssueDate(today.toISOString().split('T')[0]);
      const due = new Date(today);
      due.setDate(today.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);

      // Set default invoice number
      const savedInvoiceConfig = localStorage.getItem("invoiceConfig");
      if (savedInvoiceConfig) {
        const config = JSON.parse(savedInvoiceConfig);
        const nextNum = config.nextNumber || 1;
        const formatLength = config.numberFormat ? config.numberFormat.length : 3;
        const formatStr = String(nextNum).padStart(formatLength, '0');
        setInvoiceNumber(`${config.prefix || "INV-"}${formatStr}`);
      } else {
        setInvoiceNumber("INV-001");
      }

      // Set default company
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
          setSelectedCompanyId(defaultCompany.id);
          if (defaultCompany.defaultRemarks) setNotes(defaultCompany.defaultRemarks);
          if (defaultCompany.defaultTerms) setTerms(defaultCompany.defaultTerms);
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
      setSelectedCompanyId(template.id);

      if (template.defaultRemarks !== undefined) setNotes(template.defaultRemarks);
      if (template.defaultTerms !== undefined) setTerms(template.defaultTerms);

      if (!template.defaultTerms) {
        const savedInvoiceConfig = localStorage.getItem("invoiceConfig");
        if (savedInvoiceConfig) {
          const config = JSON.parse(savedInvoiceConfig);
          if (config.reminderMessage) {
            setTerms(
              "Payment is due within 30 days. Late payments may incur additional fees."
            );
          }
        }
      }

      toast({
        title: "Template loaded",
        description: `Company information from ${template.name} has been applied`,
      });
    }
    setShowTemplateDialog(false);
  };

  const handleSaveAsTemplate = () => {
    setShowSaveTemplateDialog(true);
  };

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

    const existingCompanies = JSON.parse(
      localStorage.getItem("companies") || "[]"
    );
    localStorage.setItem(
      "companies",
      JSON.stringify([...existingCompanies, newTemplate])
    );

    toast({
      title: "Template saved",
      description: `${templateName} has been saved as a template`,
    });

    setShowSaveTemplateDialog(false);
    setTemplateName("");
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        tax: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * item.tax) / 100;
    return subtotal + taxAmount;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + (subtotal * item.tax) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleClientSelect = (value: string) => {
    if (value === "create_new") {
      setClientName("");
      setClientContact("");
      setClientEmail("");
      setClientAddress("");
      setClientPhone("");
      setSelectedClientId("");
      return;
    }

    const client = availableClients.find((c) => c.name === value);
    if (client) {
      setClientName(client.name);
      setClientContact(client.contact || "");
      setClientEmail(client.email || "");
      setClientAddress(client.address || "");
      setClientPhone(client.phone || "");
      setSelectedClientId(client.name);
      toast({
        title: "Client selected",
        description: `Client information for ${client.name} has been filled.`,
      });
    }
  };

  // Helper function to save/update client in localStorage
  const saveClientToStorage = (clientData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    contact?: string;
  }) => {
    if (!clientData.name.trim()) return;

    const existingClients = JSON.parse(localStorage.getItem("clients") || "[]");

    // Check if client already exists (case-insensitive)
    const existingIndex = existingClients.findIndex(
      (c: any) => c.name.toLowerCase() === clientData.name.toLowerCase()
    );

    const clientToSave = {
      id:
        existingIndex >= 0
          ? existingClients[existingIndex].id
          : Date.now().toString(),
      name: clientData.name,
      email: clientData.email || "",
      phone: clientData.phone || "",
      address: clientData.address || "",
      contact: clientData.contact || "",
      status: "active",
      createdAt:
        existingIndex >= 0
          ? existingClients[existingIndex].createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing client (merge data, keep what exists if new data is empty)
      existingClients[existingIndex] = {
        ...existingClients[existingIndex],
        ...clientToSave,
        email: clientData.email || existingClients[existingIndex].email || "",
        phone: clientData.phone || existingClients[existingIndex].phone || "",
        address:
          clientData.address || existingClients[existingIndex].address || "",
        contact:
          clientData.contact || existingClients[existingIndex].contact || "",
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new client
      existingClients.push(clientToSave);
    }

    try {
      localStorage.setItem("clients", JSON.stringify(existingClients));
    } catch (error) {
      console.error("Failed to save client to storage", error);
      toast({
        title: "Storage Warning",
        description: "Could not save new client details to address book.",
        variant: "destructive",
      });
    }
  };

  // Helper function to save items to catalog
  const saveItemsToCatalog = (itemsToSave: InvoiceItem[]) => {
    if (!selectedCompanyId) return;

    const savedItems = localStorage.getItem("catalogItems");
    const currentCatalog: any[] = savedItems ? JSON.parse(savedItems) : [];
    let hasChanges = false;
    // We'll use a local array to push new items to avoid issues with state updates during the loop
    const newCatalog = [...currentCatalog];

    itemsToSave.forEach((item) => {
      // Skip empty or invalid items
      if (!item.description || !item.description.trim() || item.unitPrice === undefined) return;

      // Check if item already exists in catalog (by name, for the current company preferably, but global simplified check as per current logic)
      // The current logic in saveProductToCatalog doesn't check for existence, but we should to avoid duplicates
      const exists = newCatalog.some(
        (catalogItem: any) =>
          catalogItem.name.toLowerCase() === item.description.trim().toLowerCase()
      );

      if (!exists) {
        const newItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: item.description.trim(),
          description: item.description.trim(),
          price: item.unitPrice,
          companyId: selectedCompanyId,
          createdAt: new Date().toISOString(),
          type: "service",
        };
        newCatalog.push(newItem);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem("catalogItems", JSON.stringify(newCatalog));
      setCatalogItems(newCatalog);
    }
  };

  const handleSaveDraft = () => {
    // Save client if we have client name
    if (clientName.trim()) {
      saveClientToStorage({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        contact: clientContact,
      });
    }

    // Save items to catalog
    if (items.length > 0) {
      saveItemsToCatalog(items);
    }

    const draftData = {
      id: editingDraftId || Date.now(),
      invoiceNumber,
      status,
      issueDate,
      dueDate,
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
      items,
      notes,
      terms,
      logo,
      subtotal: calculateSubtotal(),
      totalTax: calculateTotalTax(),
      total: calculateTotal(),
      createdAt: new Date().toISOString(),

      companyId: selectedCompanyId || undefined,
      selectedPaymentMethod: selectedPaymentMethod || undefined,
      customPaymentInstructions: customPaymentInstructions || undefined,
      companyIdString: selectedCompanyId ? selectedCompanyId.toString() : undefined,
    };

    const existingDrafts = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );

    let updatedDrafts;
    if (editingDraftId) {
      updatedDrafts = existingDrafts.map((d: InvoiceDraft) =>
        d.id === editingDraftId ? draftData : d
      );
    } else {
      updatedDrafts = [...existingDrafts, draftData];
      setEditingDraftId(draftData.id);
    }

    localStorage.setItem("invoiceDrafts", JSON.stringify(updatedDrafts));

    setShowDraftDialog(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({
          title: "Logo uploaded",
          description: "Your company logo has been added to the invoice.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportPDF = async () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups for this site to print invoices.",
        variant: "destructive",
      });
      setIsExporting(false);
      return;
    }

    setIsExporting(true);

    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
      return `$${amount.toFixed(2)}`;
    };

    // Colors
    const primaryC = invoiceColors?.primaryColor || "#000000";
    const separatorC = invoiceColors?.separatorColor || "#000000";
    const headerAccentC = invoiceColors?.headerAccentColor || "#f0f0f0";

    // Build logo HTML
    const logoHtml = logo
      ? `<img src="${logo}" alt="Company Logo" style="height: 180px; max-width: 300px; object-fit: contain;" />`
      : "";

    // Build company info HTML
    const companyInfoHtml = `
      <div style="text-align: right; margin-left: 20px; font-size: 12px;">
                 <h1 style="margin: 0; font-size: 22px; color: #000; font-weight: bold;">
          ${escapeHtml(companyName || "Company Name")}
        </h1>
        ${companyAddress
        ? `<div class="info-line">${escapeHtml(companyAddress)}</div>`
        : ""
      }
        ${companyEmail && companyPhone
        ? `<div class="info-line">${escapeHtml(
          companyEmail
        )} | Phone ${escapeHtml(companyPhone)}</div>`
        : companyEmail
          ? `<div class="info-line">${escapeHtml(companyEmail)}</div>`
          : companyPhone
            ? `<div class="info-line">Phone ${escapeHtml(companyPhone)}</div>`
            : ""
      }
        ${companyNIT
        ? `<div class="info-line">NIT: ${escapeHtml(companyNIT)}</div>`
        : ""
      }
      </div>
    `;

    // Build items table rows
    const itemsRowsHtml = items
      .map(
        (item, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${escapeHtml(item.description || "")}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="text-align: right;">${formatCurrency(
          item.unitPrice * item.quantity
        )}</td>
      </tr>
    `
      )
      .join("");

    const subtotal = calculateSubtotal();
    const totalTax = calculateTotalTax();
    const total = calculateTotal();

    // Just building data for payment method HTML
    let paymentMethodHtml = "";
    if (selectedPaymentMethod) {
      let methodTitle = "";
      let methodIconSrc = "";

      switch (selectedPaymentMethod) {
        case "stripe":
          methodTitle = "Stripe";
          // Ideally use base64 or absolute URL, but for now we try relative or skip icon if not loading
          break;
        case "paypal":
          methodTitle = "PayPal";
          break;
        case "zelle":
          methodTitle = "Zelle";
          break;
        case "nequi":
          methodTitle = "Nequi";
          break;
        case "manual":
          methodTitle = "Payment Method";
          break;
        case "cash":
          methodTitle = "Pay in cash";
          break;
      }

      paymentMethodHtml = `
          <div style="margin-top: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
             <div style="font-weight: bold; margin-bottom: 5px;">Payment Method: ${methodTitle}</div>
             ${customPaymentInstructions ? `<div style="white-space: pre-wrap;">${escapeHtml(customPaymentInstructions)}</div>` : ""}
          </div>
       `;
    }

    // Build the complete HTML document
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      padding: 0;
      font-size: 12px;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .info-line {
      margin: 2px 0;
    }
    hr {
      border: none;
      border-top: 1px solid ${separatorC};
      margin: 20px 0;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      margin-bottom: 6px;
      color: ${headerAccentC !== '#f0f0f0' ? headerAccentC : '#000'};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 12px;
    }
    table, th, td {
      border: 1px solid ${separatorC};
    }
    th, td {
      padding: 6px;
      text-align: left;
    }
    th {
      background-color: ${headerAccentC};
      font-weight: bold;
    }
    .totals {
      text-align: right;
      margin-top: 10px;
      font-size: 12px;
    }
    .totals p {
      margin: 5px 0;
    }
    .primary-text {
      color: ${primaryC};
      font-weight: bold;
    }
    .remarks {
      margin-top: 30px;
      font-size: 10px;
      text-align: justify;
      border-top: 1px solid black;
      padding-top: 10px;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      z-index: -1;
      pointer-events: none;
      opacity: 0.1;
      font-size: 120px;
      color: #cccccc;
      font-weight: bold;
      white-space: nowrap;
    }
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">${escapeHtml(companyName || "INVOICE")}</div>

  <!-- Header with logo and company info -->
  <div class="header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; z-index: 1;">
    ${logoHtml}
    ${companyInfoHtml}
  </div>

  <hr />

  <!-- Invoice and Client Details -->
  <div class="invoice-details">
    <div>
      <div class="section-title">BILLED TO:</div>
      <div><strong>NAME:</strong> ${escapeHtml(clientName || "")}</div>
      ${clientAddress
        ? `<div><strong>ADDRESS:</strong> ${escapeHtml(clientAddress)}</div>`
        : ""
      }
      ${clientPhone
        ? `<div><strong>PHONE:</strong> ${escapeHtml(clientPhone)}</div>`
        : ""
      }
      ${clientEmail
        ? `<div><strong>EMAIL:</strong> ${escapeHtml(clientEmail)}</div>`
        : ""
      }
      ${clientContact
        ? `<div><strong>CONTACT:</strong> ${escapeHtml(clientContact)}</div>`
        : ""
      }
    </div>
    <div style="text-align: right;">
      <div><strong>INVOICE No:</strong> ${escapeHtml(invoiceNumber)}</div>
      <div><strong>INVOICE date:</strong> ${escapeHtml(issueDate)}</div>
      <div><strong>INVOICE due date:</strong> ${escapeHtml(dueDate)}</div>

    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>ITEM</th>
        <th>DESCRIPTION</th>
        <th>QTY</th>
        <th>PRICE PER UNIT</th>
        <th>AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRowsHtml}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <p><strong>Sub total:</strong> <span class="primary-text">${formatCurrency(subtotal)}</span></p>
    <p><strong>Tax:</strong> <span class="primary-text">${formatCurrency(totalTax)}</span></p>
    <p><strong>Invoice total:</strong> <span class="primary-text" style="font-size: 14px;">${formatCurrency(total)}</span></p>
  </div>
  
  <!-- Payment Method -->
  ${paymentMethodHtml}

  <!-- Remarks and Terms -->
  ${notes || terms
        ? `
  <div class="remarks">
    ${notes
          ? `<p><strong>REMARKS:</strong> ${escapeHtml(notes)}</p>`
          : ""
        }
    ${terms ? `<p>${escapeHtml(terms)}</p>` : ""}
  </div>
  `
        : ""
      }
</body>
</html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setIsExporting(false);
      }, 250);
    };
  };

  const handleSendInvoice = () => {
    setShowSendDialog(true);
  };

  const confirmSendInvoice = () => {
    // Save client if we have client name
    if (clientName.trim()) {
      saveClientToStorage({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        contact: clientContact,
      });
    }

    // Save items to catalog
    if (items.length > 0) {
      saveItemsToCatalog(items);
    }

    const emittedInvoiceData = {
      id: Date.now(),
      invoiceNumber,
      status: "issued",
      issueDate,
      dueDate,
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
      items,
      notes,
      terms,
      logo,
      subtotal: calculateSubtotal(),
      totalTax: calculateTotalTax(),
      total: calculateTotal(),
      emittedAt: new Date().toISOString(),

      selectedPaymentMethod: selectedPaymentMethod || undefined,
      customPaymentInstructions: customPaymentInstructions || undefined,
    };

    const existingEmitted = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );

    try {
      localStorage.setItem(
        "emittedInvoices",
        JSON.stringify([...existingEmitted, emittedInvoiceData])
      );
    } catch (error) {
      // If quota exceeded, try saving without the logo (usually the biggest part)
      console.error("Storage quota exceeded, retrying without logo", error);
      try {
        const invoiceWithoutLogo = { ...emittedInvoiceData, logo: null };
        localStorage.setItem(
          "emittedInvoices",
          JSON.stringify([...existingEmitted, invoiceWithoutLogo])
        );

        toast({
          title: "Storage Warning",
          description: "Invoice saved without logo due to storage limits.",
          variant: "destructive", // Using destructive to catch attention, though it worked
        });
      } catch (retryError) {
        console.error("Storage quota exceeded even without logo", retryError);
        toast({
          title: "Storage Error",
          description: "Could not save invoice. Local storage is full.",
          variant: "destructive",
        });
        return; // Stop execution
      }
    }

    if (editingDraftId) {
      const existingDrafts = JSON.parse(
        localStorage.getItem("invoiceDrafts") || "[]"
      );
      const updatedDrafts = existingDrafts.filter(
        (d: InvoiceDraft) => d.id !== editingDraftId
      );
      localStorage.setItem("invoiceDrafts", JSON.stringify(updatedDrafts));
    }

    setShowSendDialog(false);
    setShowSuccessDialog(true);

    setTimeout(() => {
      setShowSuccessDialog(false);
      setInvoiceNumber("INV-008");
      setClientName("");
      setClientContact("");
      setClientEmail("");
      setClientAddress("");
      setClientPhone("");
      setSelectedClientId("");
      setItems([
        { id: "1", description: "", quantity: 1, unitPrice: 0, tax: 0 },
      ]);
      setNotes("");
      setTerms("");
      setLogo(null);
      setEditingDraftId(null);
    }, 2000);
  };

  const addFromCatalog = (item: any) => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: item.name,
        quantity: 1,
        unitPrice: item.price,
        tax: 0,
      },
    ]);
    setShowCatalogDialog(false);
    toast({
      title: "Item added",
      description: `${item.name} has been added to the invoice.`,
    });
  };

  const saveProductToCatalog = (item: InvoiceItem) => {
    if (!selectedCompanyId) {
      toast({
        title: "Company required",
        description: "Please select a company template first.",
        variant: "destructive",
      });
      return;
    }

    if (!item.description || !item.unitPrice) {
      toast({
        title: "Missing details",
        description: "Product must have a description and price.",
        variant: "destructive",
      });
      return;
    }

    const savedItems = localStorage.getItem("catalogItems");
    const currentCatalog: any[] = savedItems ? JSON.parse(savedItems) : [];

    // Create new catalog item
    const newItem = {
      id: Date.now().toString(),
      name: item.description,
      description: item.description, // using same for now, or could be empty
      price: item.unitPrice,
      companyId: selectedCompanyId,
      createdAt: new Date().toISOString(),
    };

    const updatedCatalog = [...currentCatalog, newItem];
    localStorage.setItem("catalogItems", JSON.stringify(updatedCatalog));
    setCatalogItems(updatedCatalog); // Update local state if needed

    toast({
      title: "Product saved",
      description: `${item.description} has been saved to the catalog.`,
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {editingDraftId ? "Edit Invoice" : "Create Invoice"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Fill in the details to create a new invoice
              </p>
            </div>
          </div>
          
          {/* Mobile Wizard Indicator */}
          <div className="flex items-center gap-2 lg:hidden w-full">
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", mobileStep >= 1 ? "bg-primary" : "bg-secondary")} />
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", mobileStep >= 2 ? "bg-primary" : "bg-secondary")} />
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", mobileStep >= 3 ? "bg-primary" : "bg-secondary")} />
          </div>

          <div className={cn("flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0", mobileStep !== 3 && "max-lg:hidden")}>
            <Button
              onClick={handleSaveAsTemplate}
              variant="outline"
              className="gap-2 bg-transparent w-full sm:w-auto"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save as Template
            </Button>
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="gap-2 bg-transparent w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="gap-2 bg-transparent w-full sm:w-auto"
            >
              <FileDown className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            <Button onClick={handleSendInvoice} className="gap-2 w-full sm:w-auto">
              <Send className="h-4 w-4" />
              Send Invoice
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 pb-24 lg:pb-0">
          {/* Company Information Sidebar */}
          <Card className={cn("bg-card border-border lg:col-span-1", mobileStep !== 1 && "max-lg:hidden")}>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
                >
                  {logo ? (
                    <img
                      src={logo || "/placeholder.svg"}
                      alt="Company Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload logo
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="ADSTRATEGIC"
                    className="mt-1"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    placeholder="123 Business St, City, Country"
                    className="mt-1"
                    rows={2}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label>NIT / Tax ID</Label>
                  <Input
                    placeholder="123456789-0"
                    className="mt-1"
                    value={companyNIT}
                    onChange={(e) => setCompanyNIT(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@adstrategic.com"
                    className="mt-1"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card className={cn("bg-card border-border", mobileStep !== 1 && "max-lg:hidden")}>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Invoice Number</Label>
                    <Input
                      placeholder="INV-001"
                      className="mt-1"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="issued">Issued</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Issue Date</Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card className={cn("bg-card border-border", mobileStep !== 1 && "max-lg:hidden")}>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Invoice Existing Client</Label>
                  <Select
                    value={selectedClientId}
                    onValueChange={handleClientSelect}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select an existing client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_new">Create Client</SelectItem>
                      {availableClients.length > 0 ? (
                        availableClients.map((client) => (
                          <SelectItem key={client.name} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No clients found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableClients.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No previous clients found. Fill in the fields below to
                      create a new client.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Client Name *</Label>
                    <Input
                      placeholder="Enter client name"
                      className="mt-1"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setSelectedClientId("");
                      }}
                    />
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      placeholder="Enter contact name"
                      className="mt-1"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    className="mt-1"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    placeholder="Enter client address"
                    className="mt-1"
                    rows={2}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className={cn("bg-card border-border", mobileStep !== 2 && "max-lg:hidden")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-foreground">
                    Items / Services
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCatalogDialog(true)}
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      disabled={!selectedCompanyId}
                    >
                      <Package className="h-4 w-4" />
                      Add from Catalog
                    </Button>
                    <Button
                      onClick={addItem}
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input
                            placeholder="Product or service description"
                            className="mt-1"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              className="mt-1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="mt-1"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tax (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              className="mt-1"
                              value={item.tax}
                              onChange={(e) =>
                                updateItem(index, "tax", Number(e.target.value))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total</Label>
                            <div className="mt-1 h-10 flex items-center px-3 rounded-md bg-muted text-foreground font-semibold">
                              ${calculateItemTotal(item).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {selectedCompanyId && item.description && (
                          <Button
                            onClick={() => saveProductToCatalog(item)}
                            variant="ghost"
                            size="icon"
                            title="Save to Catalog"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                        {items.length > 1 && (
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tax:</span>
                    <span className="font-semibold text-foreground">
                      ${calculateTotalTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-border">
                    <span className="font-bold text-foreground">Total:</span>
                    <span className="font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentMethodConfig && (
              <Card className={cn("bg-card border-border", mobileStep !== 3 && "max-lg:hidden")}>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {paymentMethodConfig.stripeEnabled && (
                      <div
                        className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "stripe" ? "border-primary bg-secondary/50" : "border-border"}`}
                        onClick={() => setSelectedPaymentMethod("stripe")}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/images/stripe-icon.png" alt="Stripe" className="h-8 w-8 object-contain" />
                          <span className="font-medium text-foreground">Stripe</span>
                        </div>
                      </div>
                    )}
                    {paymentMethodConfig.paypalEnabled && (
                      <div
                        className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "paypal" ? "border-primary bg-secondary/50" : "border-border"}`}
                        onClick={() => setSelectedPaymentMethod("paypal")}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/images/PayPal-icon.png" alt="PayPal" className="h-8 w-8 object-contain" />
                          <span className="font-medium text-foreground">PayPal</span>
                        </div>
                      </div>
                    )}
                    {paymentMethodConfig.zelleEnabled && (
                      <div
                        className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "zelle" ? "border-primary bg-secondary/50" : "border-border"}`}
                        onClick={() => setSelectedPaymentMethod("zelle")}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/images/zelle-icon.png" alt="Zelle" className="h-8 w-8 object-contain" />
                          <span className="font-medium text-foreground">Zelle</span>
                        </div>
                      </div>
                    )}
                    {paymentMethodConfig.nequiEnabled && (
                      <div
                        className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "nequi" ? "border-primary bg-secondary/50" : "border-border"}`}
                        onClick={() => setSelectedPaymentMethod("nequi")}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/images/nequi-icon.png" alt="Nequi" className="h-8 w-8 object-contain" />
                          <span className="font-medium text-foreground">Nequi</span>
                        </div>
                      </div>
                    )}
                    <div
                      className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "manual" ? "border-primary bg-secondary/50" : "border-border"}`}
                      onClick={() => {
                        setSelectedPaymentMethod("manual");
                        setCustomPaymentInstructions(paymentMethodConfig.manualInstructions || "");
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Manual / Other</span>
                      </div>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPaymentMethod === "cash" ? "border-primary bg-secondary/50" : "border-border"}`}
                      onClick={() => {
                        setSelectedPaymentMethod("cash");
                        setCustomPaymentInstructions("Please pay in cash at our office.");
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <Banknote className="h-4 w-4 text-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Pay in cash</span>
                      </div>
                    </div>
                  </div>

                  {(selectedPaymentMethod === "manual" || selectedPaymentMethod === "zelle" || selectedPaymentMethod === "nequi" || selectedPaymentMethod === "cash") && (
                    <div className="mt-4">
                      <Label>Payment Instructions</Label>
                      <Textarea
                        placeholder="Enter payment instructions (e.g., Bank details, phone number...)"
                        className="mt-1"
                        rows={3}
                        value={customPaymentInstructions}
                        onChange={(e) => setCustomPaymentInstructions(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        These instructions will appear on the invoice PDF.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card className={cn("bg-card border-border", mobileStep !== 3 && "max-lg:hidden")}>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add any additional notes or comments..."
                    className="mt-1"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    placeholder="Payment terms, late fees, etc..."
                    className="mt-1"
                    rows={3}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          ref={invoicePreviewRef}
          className="fixed -left-[9999px] w-[210mm] bg-white p-8"
        >
          <div className="space-y-6">
            {/* Header with logo */}
            <div className="flex justify-between items-start">
              <div>
                {logo && (
                  <img
                    src={logo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="h-16 mb-4"
                  />
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                  {companyName}
                </h1>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {companyAddress}
                </p>
                <p className="text-sm text-gray-600">NIT: {companyNIT}</p>
                <p className="text-sm text-gray-600">{companyEmail}</p>
                <p className="text-sm text-gray-600">{companyPhone}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: invoiceColors?.headerAccentColor || undefined }}>INVOICE</h2>
                <p className="text-sm font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>#{invoiceNumber}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Issue Date: {issueDate}
                </p>
                <p className="text-sm text-gray-600">Due Date: {dueDate}</p>
              </div>
            </div>

            {/* Client info */}
            <div className="py-4" style={{ borderTop: `1px solid ${invoiceColors?.separatorColor || '#d1d5db'}`, borderBottom: `1px solid ${invoiceColors?.separatorColor || '#d1d5db'}` }}>
              <p className="text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor || undefined }}>Bill To:</p>
              <p className="text-sm text-gray-900">{clientName}</p>
              {clientAddress && (
                <p className="text-sm text-gray-900">{clientAddress}</p>
              )}
              {clientPhone && (
                <p className="text-sm text-gray-900">{clientPhone}</p>
              )}
              {clientEmail && (
                <p className="text-sm text-gray-900">{clientEmail}</p>
              )}
              {clientContact && (
                <p className="text-sm text-gray-900">
                  Contact: {clientContact}
                </p>
              )}
            </div>

            {/* Items table */}
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: invoiceColors?.headerAccentColor || undefined }}>
                <tr style={{ borderBottom: `1px solid ${invoiceColors?.separatorColor || '#d1d5db'}` }}>
                  <th className="text-left py-2 px-2 text-sm font-semibold text-gray-900" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                    Description
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-900" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                    Qty
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-900" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                    Price
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-900" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                    Tax
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-900" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${invoiceColors?.separatorColor || '#e5e7eb'}` }}>
                    <td className="py-2 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="text-right py-2 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="text-right py-2 text-sm text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-2 text-sm text-gray-900">
                      {item.tax}%
                    </td>
                    <td className="text-right py-2 px-2 text-sm font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                      ${calculateItemTotal(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                    ${calculateTotalTax().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: `1px solid ${invoiceColors?.separatorColor || '#d1d5db'}` }}>
                  <span className="text-gray-900">Total:</span>
                  <span style={{ color: invoiceColors?.primaryColor || undefined }}>
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes and terms */}
            {notes && (
              <div className="mt-6">
                <p className="text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor || undefined }}>Notes:</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {notes}
                </p>
              </div>
            )}
            {terms && (
              <div className="mt-4">
                <p className="text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor || undefined }}>
                  Terms & Conditions:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {terms}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TemplateSelectionDialog
        open={showTemplateDialog}
        onSelect={handleTemplateSelect}
        onOpenChange={setShowTemplateDialog}
      />

      <Dialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save the current company information as a reusable template for
              future invoices
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Template Name</Label>
            <Input
              placeholder="e.g., My Company Template"
              className="mt-2"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing dialogs */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this invoice to{" "}
              {clientName || "the client"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendInvoice}>Confirm & Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Invoice Sent Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your invoice has been sent to the client. The form will be reset.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Draft Saved Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your invoice draft has been saved. You can access it from the
              Drafts page.
            </DialogDescription>
            <DialogFooter className="w-full">
              <Button
                onClick={() => setShowDraftDialog(false)}
                className="w-full"
              >
                Continue Editing
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select from Catalog</DialogTitle>
            <DialogDescription>
              Choose a product or service to add to your invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
            {catalogItems.filter(item => item.companyId === selectedCompanyId).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items found for this company. Add items in the Catalog page.
              </p>
            ) : (
              catalogItems
                .filter(item => item.companyId === selectedCompanyId)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => addFromCatalog(item)}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.description}
                      </p>
                    </div>
                    <span className="font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogDialog(false)}>
              Cancel
            </Button>
            <Link href="/catalog">
              <Button variant="secondary">Manage Catalog</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Wizard Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-40 lg:hidden flex justify-between gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe-offset-4">
        <Button 
          variant="outline" 
          onClick={() => setMobileStep(s => Math.max(1, s - 1))}
          disabled={mobileStep === 1}
          className="flex-1 rounded-xl h-12"
        >
          Back
        </Button>
        {mobileStep < 3 ? (
          <Button onClick={() => setMobileStep(s => s + 1)} className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20">
            Next Step <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        ) : (
          <Button onClick={handleSaveDraft} className="flex-1 rounded-xl h-12 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
        )}
      </div>
    </AppLayout >
  );
}
