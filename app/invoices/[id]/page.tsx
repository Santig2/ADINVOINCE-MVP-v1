"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send, Edit, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SendInvoiceDialog } from "@/components/send-invoice-dialog";
import { RegisterPaymentDialog } from "@/components/register-payment-dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt, History, PenTool } from "lucide-react";
import { DigitalSignatureDialog } from "@/components/digital-signature-dialog";
import { SignatureDisplay } from "@/components/signature-display";
import { useSignatures } from "@/hooks/use-signatures";

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
  status: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
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
  companyId?: number | string;
  selectedPaymentMethod?: string;
  customPaymentInstructions?: string;
  payments?: Payment[];
  totalPaid?: number;
};

type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
};

const statusConfig = {
  paid: { label: "Paid", className: "bg-primary/20 text-primary" },
  pending: { label: "Pending", className: "bg-chart-4/20 text-chart-4" },
  "partially-paid": { label: "Partially Paid", className: "bg-warning/20 text-warning" },
  issued: { label: "Issued", className: "bg-chart-3/20 text-chart-3" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/invoices";
  const { toast } = useToast();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceColors, setInvoiceColors] = useState<any>(null);

  const { getSignaturesForDocument } = useSignatures();
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const documentSignatures = invoice ? getSignaturesForDocument(invoice.id.toString(), 'invoice') : [];

  useEffect(() => {
    const invoiceId = params?.id as string;
    if (!invoiceId) return;

    // Load invoice from localStorage
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );

    const allInvoices = [...emittedInvoices, ...draftInvoices];
    const foundInvoice = allInvoices.find(
      (inv: Invoice) => inv.id.toString() === invoiceId.toString()
    );

    if (foundInvoice) {
      // Ensure defaults for new fields
      const invoiceData = {
        ...foundInvoice,
        payments: foundInvoice.payments || [],
        totalPaid: foundInvoice.totalPaid || 0,
      };
      setInvoice(invoiceData);

      // Check for action param to open payment dialog
      const action = searchParams.get('action');
      if (action === 'register-payment' && invoiceData.status !== 'paid') {
        setPaymentDialogOpen(true);
      }

      // Load specific invoice colors based on the companyId
      const savedColors = localStorage.getItem("companyInvoiceColors");
      if (savedColors && invoiceData.companyId) {
        const colors = JSON.parse(savedColors);
        const compCols = colors.find((c: any) => c.companyId === invoiceData.companyId.toString());
        setInvoiceColors(compCols || null);
      }
    } else {
      toast({
        title: "Invoice not found",
        description: "The invoice you're looking for doesn't exist.",
        variant: "destructive",
      });
      router.push("/invoices");
    }
    setLoading(false);
  }, [params?.id, router, toast, searchParams]);

  const handleSavePayment = (payment: Payment) => {
    if (!invoice) return;

    const newPayments = [...(invoice.payments || []), payment];
    const newTotalPaid = (invoice.totalPaid || 0) + payment.amount;

    // Determine new status
    let newStatus = invoice.status;
    const total = invoice.total ?? calculateTotal(); // Use helper or fallback

    // Float precision safety
    if (newTotalPaid >= total - 0.01) {
      newStatus = "paid";
    } else if (newTotalPaid > 0) {
      newStatus = "partially-paid";
    }

    const updatedInvoice = {
      ...invoice,
      payments: newPayments,
      totalPaid: newTotalPaid,
      status: newStatus,
    };

    setInvoice(updatedInvoice);

    // Update in localStorage
    const emittedInvoices = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
    const updatedEmitted = emittedInvoices.map((inv: Invoice) =>
      inv.id.toString() === invoice.id.toString() ? updatedInvoice : inv
    );
    localStorage.setItem("emittedInvoices", JSON.stringify(updatedEmitted));

    toast({
      title: "Payment Registered",
      description: "Payment has been saved successfully.",
    });

    // Auto-generate receipt
    handleDownloadReceipt(payment, updatedInvoice);
  };

  const handleDownloadReceipt = (payment: Payment, currentInvoice: Invoice = invoice!) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups for this site to print receipts.",
        variant: "destructive",
      });
      return;
    }

    const escapeHtml = (text: string) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    // Calculate remaining balance at time of this payment? 
    // Or simpler: just show current payment details. 
    // User flow says "Payment receipt generated".

    // Colors
    const primaryC = invoiceColors?.primaryColor || "#15803d"; // default for receipts
    const separatorC = invoiceColors?.separatorColor || "#eee";
    const headerAccentC = invoiceColors?.headerAccentColor || "#f0fdf4"; // default for receipts

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Payment Receipt ${escapeHtml(payment.id)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${separatorC}; padding-bottom: 20px; }
    .logo { max-height: 80px; margin-bottom: 10px; }
    .title { font-size: 24px; font-weight: bold; color: ${primaryC}; }
    .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; color: #888; }
    .amount-box { background: ${headerAccentC}; border: 1px solid ${separatorC}; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .amount-label { font-size: 14px; color: ${primaryC}; }
    .amount-value { font-size: 32px; font-weight: bold; color: ${primaryC}; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${separatorC}; }
    .info-label { font-weight: bold; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    ${currentInvoice.logo ? `<img src="${currentInvoice.logo}" class="logo" />` : ""}
    <div class="title">PAYMENT RECEIPT</div>
    <div class="subtitle">${currentInvoice.companyName}</div>
    ${currentInvoice.companyAddress ? `<div>${escapeHtml(currentInvoice.companyAddress)}</div>` : ""}
  </div>

  <div class="amount-box">
    <div class="amount-label">AMOUNT PAID</div>
    <div class="amount-value">${formatCurrency(payment.amount)}</div>
    <div style="margin-top: 10px; font-size: 14px; color: #666;">
        Method: ${payment.method.toUpperCase()}
    </div>
  </div>

  <div class="details">
    <div>
      <div class="section-title">RECEIVED FROM</div>
      <div><strong>${escapeHtml(currentInvoice.clientName)}</strong></div>
      ${currentInvoice.clientEmail ? `<div>${escapeHtml(currentInvoice.clientEmail)}</div>` : ""}
    </div>
    <div style="text-align: right;">
      <div class="section-title">PAYMENT DETAILS</div>
      <div>Date: ${payment.date}</div>
      <div>Receipt #: ${payment.id.slice(-6)}</div>
    </div>
  </div>

  <div style="margin-bottom: 30px;">
    <div class="section-title">APPLIED TO INVOICE</div>
    <div class="info-row">
      <span>Invoice Number</span>
      <span>${escapeHtml(currentInvoice.invoiceNumber)}</span>
    </div>
    <div class="info-row">
      <span>Invoice Total</span>
      <span>${formatCurrency(currentInvoice.total)}</span>
    </div>
    <div class="info-row">
      <span>Payment Status</span>
      <span>${currentInvoice.status.toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span>Paid to Date</span>
      <span>${formatCurrency(currentInvoice.totalPaid || 0)}</span>
    </div>
    <div class="info-row">
      <span>Balance Due</span>
      <span style="color: ${(currentInvoice.total - (currentInvoice.totalPaid || 0)) > 0.01 ? "#dc2626" : "#166534"}; font-weight: bold;">
        ${formatCurrency(Math.max(0, currentInvoice.total - (currentInvoice.totalPaid || 0)))}
      </span>
    </div>
  </div>

  ${currentInvoice.payments && currentInvoice.payments.length > 0 ? `
  <div style="margin-bottom: 30px;">
    <div class="section-title">PAYMENT HISTORY</div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="border-bottom: 1px solid ${separatorC}; text-align: left;">
          <th style="padding: 8px 0; font-size: 12px; color: #666;">DATE</th>
          <th style="padding: 8px 0; font-size: 12px; color: #666;">METHOD</th>
          <th style="padding: 8px 0; font-size: 12px; color: #666; text-align: right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${currentInvoice.payments.map(p => `
        <tr style="border-bottom: 1px solid ${separatorC};">
          <td style="padding: 10px 0;">${p.date}</td>
          <td style="padding: 10px 0; text-transform: capitalize;">${escapeHtml(p.method)}</td>
          <td style="padding: 10px 0; text-align: right;">${formatCurrency(p.amount)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ""}


  ${payment.notes ? `
  <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 5px;">
    <div class="section-title">NOTES</div>
    <div>${escapeHtml(payment.notes)}</div>
  </div>
  ` : ""}

  <div class="footer">
    Thank you for your business!
  </div>

  <script>
    window.onload = () => { setTimeout(() => window.print(), 500); };
  </script>
</body>
</html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center mb-8">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="h-10 w-32 bg-muted rounded-xl"></div>
            </div>
            <Card className="bg-card border-border shadow-sm mx-auto max-w-4xl">
              <CardHeader className="border-b border-border pb-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="h-16 w-16 bg-muted rounded-xl"></div>
                    <div className="h-6 w-48 bg-muted rounded"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </div>
                  <div className="space-y-3 text-right">
                    <div className="h-8 w-32 bg-muted rounded ml-auto"></div>
                    <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-10 w-full bg-muted rounded-lg"></div>
                  <div className="h-10 w-full bg-muted/50 rounded-lg"></div>
                  <div className="h-10 w-full bg-muted/30 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Invoice not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * item.tax) / 100;
    return subtotal + taxAmount;
  };

  const subtotal =
    invoice.subtotal ??
    invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  const totalTax =
    invoice.totalTax ??
    invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.tax) / 100;
    }, 0);
  const total = invoice.total ?? subtotal + totalTax;

  // PDF/Print function similar to reference code
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups for this site to print invoices.",
        variant: "destructive",
      });
      return;
    }

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
    const logoHtml = invoice.logo
      ? `<img src="${invoice.logo}" alt="Company Logo" style="height: 180px; max-width: 300px; object-fit: contain;" />`
      : "";

    // Build company info HTML
    const companyInfoHtml = `
      <div style="text-align: right; margin-left: 20px; font-size: 12px;">
        <h1 style="margin: 0; font-size: 22px; color: #000; font-weight: bold;">
          ${escapeHtml(invoice.companyName || "Company Name")}
        </h1>
        ${invoice.companyAddress
        ? `<div class="info-line">${escapeHtml(
          invoice.companyAddress
        )}</div>`
        : ""
      }
        ${invoice.companyEmail && invoice.companyPhone
        ? `<div class="info-line">${escapeHtml(
          invoice.companyEmail
        )} | Phone ${escapeHtml(invoice.companyPhone)}</div>`
        : invoice.companyEmail
          ? `<div class="info-line">${escapeHtml(invoice.companyEmail)}</div>`
          : invoice.companyPhone
            ? `<div class="info-line">Phone ${escapeHtml(
              invoice.companyPhone
            )}</div>`
            : ""
      }
        ${invoice.companyNIT
        ? `<div class="info-line">NIT: ${escapeHtml(
          invoice.companyNIT
        )}</div>`
        : ""
      }
      </div>
    `;

    // Build items table rows
    const itemsRowsHtml = invoice.items
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

    const total = invoice.total ?? subtotal + totalTax;

    // Just building data for payment method HTML
    let paymentMethodHtml = "";
    if (invoice.selectedPaymentMethod) {
      let methodTitle = "";

      switch (invoice.selectedPaymentMethod) {
        case "stripe":
          methodTitle = "Stripe";
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
             ${invoice.customPaymentInstructions ? `<div style="white-space: pre-wrap;">${escapeHtml(invoice.customPaymentInstructions)}</div>` : ""}
          </div>
       `;
    }

    // Build the complete HTML document
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
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
  <div class="watermark">${escapeHtml(invoice.companyName || "INVOICE")}</div>

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
      <div><strong>NAME:</strong> ${escapeHtml(invoice.clientName || "")}</div>
      ${invoice.clientAddress
        ? `<div><strong>ADDRESS:</strong> ${escapeHtml(
          invoice.clientAddress
        )}</div>`
        : ""
      }
      ${invoice.clientPhone
        ? `<div><strong>PHONE:</strong> ${escapeHtml(
          invoice.clientPhone
        )}</div>`
        : ""
      }
      ${invoice.clientEmail
        ? `<div><strong>EMAIL:</strong> ${escapeHtml(
          invoice.clientEmail
        )}</div>`
        : ""
      }
    </div>
    <div style="text-align: right;">
      <div><strong>INVOICE No:</strong> ${escapeHtml(
        invoice.invoiceNumber
      )}</div>
      <div><strong>INVOICE date:</strong> ${escapeHtml(invoice.issueDate)}</div>
      <div><strong>INVOICE due date:</strong> ${escapeHtml(
        invoice.dueDate
      )}</div>

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
    ${totalPaid > 0
        ? `
    <p style="color: #16a34a;"><strong>Paid to Date:</strong> ${formatCurrency(totalPaid)}</p>
    <p style="color: ${remainingBalance > 0 ? "#dc2626" : "#16a34a"}; font-size: 14px; margin-top: 8px;">
      <strong>Balance Due:</strong> ${formatCurrency(Math.max(0, remainingBalance))}
    </p>`
        : ""
      }
  </div>

  <!-- Payment History for PDF -->
  ${invoice.payments && invoice.payments.length > 0
        ? `
    <div style="margin-top: 30px;">
      <div class="section-title">PAYMENT HISTORY</div>
      <table>
        <thead>
          <tr>
            <th>DATE</th>
            <th>METHOD</th>
            <th style="text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.payments
          .map(
            (p) => `
          <tr>
            <td>${p.date}</td>
            <td style="text-transform: capitalize;">${escapeHtml(p.method)}</td>
            <td style="text-align: right;">${formatCurrency(p.amount)}</td>
          </tr>`
          )
          .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
      }

  <!-- Payment Method -->
  ${paymentMethodHtml}

  <!-- Remarks and Terms -->
  ${invoice.notes || invoice.terms
        ? `
  <div class="remarks">
    ${invoice.notes
          ? `<p><strong>REMARKS:</strong> ${escapeHtml(invoice.notes)}</p>`
          : ""
        }
    ${invoice.terms ? `<p>${escapeHtml(invoice.terms)}</p>` : ""}
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
      }, 250);
    };
  };



  const handlePrint = () => {
    handleDownloadPDF();
  };

  const calculateTotal = () => {
    if (invoice.total) return invoice.total;
    return subtotal + totalTax;
  };

  const totalAmount = calculateTotal();
  const totalPaid = invoice.totalPaid || 0;
  const scale = 100; // floating point handling
  const remainingBalance = Math.round((totalAmount - totalPaid) * scale) / scale;

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={returnTo}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {invoice.invoiceNumber}
                </h1>
                <Badge
                  className={
                    statusConfig[invoice.status as keyof typeof statusConfig]
                      ?.className || "bg-muted text-muted-foreground"
                  }
                >
                  {statusConfig[invoice.status as keyof typeof statusConfig]
                    ?.label || invoice.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Invoice details and information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="outline" size="icon" className="bg-transparent">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent text-primary hover:text-primary border-primary hover:bg-primary/10"
              onClick={() => setSignatureDialogOpen(true)}
              title="Sign Document"
            >
              <PenTool className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {invoice.status !== "paid" && (
              <Button onClick={() => setPaymentDialogOpen(true)} variant="outline" className="gap-2 bg-transparent border-primary text-primary hover:bg-primary/10">
                <Badge className="h-4 w-4 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary">$</Badge>
                Register Payment
              </Button>
            )}
            <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="bg-card border-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mx-auto max-w-4xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none border border-black/5 dark:border-white/5 rounded-xl" />
          <CardHeader className="border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {invoice.logo ? (
                  <img
                    src={invoice.logo}
                    alt="Company Logo"
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <Image
                    src="/images/adstrategic-icon.png"
                    alt="Company Logo"
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {invoice.companyName}
                  </h2>
                  {invoice.companyAddress && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.companyAddress}
                    </p>
                  )}
                  {invoice.companyNIT && (
                    <p className="text-sm text-muted-foreground">
                      NIT: {invoice.companyNIT}
                    </p>
                  )}
                  {invoice.companyEmail && (
                    <p className="text-sm text-muted-foreground">
                      {invoice.companyEmail}
                    </p>
                  )}
                  {invoice.companyPhone && (
                    <p className="text-sm text-muted-foreground">
                      {invoice.companyPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold" style={{ color: invoiceColors?.headerAccentColor || undefined }}>INVOICE</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>Invoice #:</span>{" "}
                  <span style={{ color: invoiceColors?.primaryColor || undefined }}>{invoice.invoiceNumber}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Issue Date:</span>{" "}
                  {invoice.issueDate}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Due Date:</span>{" "}
                  {invoice.dueDate}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Bill To */}
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: invoiceColors?.headerAccentColor || undefined }}>
                BILL TO:
              </h4>
              <p className="font-semibold text-foreground">
                {invoice.clientName}
              </p>
              {invoice.clientAddress && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.clientAddress}
                </p>
              )}
              {invoice.clientPhone && (
                <p className="text-sm text-muted-foreground">
                  {invoice.clientPhone}
                </p>
              )}
              {invoice.clientEmail && (
                <p className="text-sm text-muted-foreground">
                  {invoice.clientEmail}
                </p>
              )}
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: invoiceColors?.separatorColor || undefined }}>
              <table className="w-full">
                <thead style={{ backgroundColor: invoiceColors?.headerAccentColor || 'hsl(var(--secondary))' }}>
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                      Description
                    </th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                      Qty
                    </th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                      Unit Price
                    </th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                      Tax
                    </th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: invoiceColors?.headerAccentColor ? '#fff' : undefined }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t" style={{ borderTopColor: invoiceColors?.separatorColor || undefined }}>
                      <td className="p-3 text-sm text-foreground">
                        {item.description}
                      </td>
                      <td className="p-3 text-sm text-right text-foreground">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-sm text-right text-foreground">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-sm text-right text-foreground">
                        {item.tax}%
                      </td>
                      <td className="p-3 text-sm text-right font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                        ${calculateItemTotal(item).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}


            {/* Payment History & Balance */}
            <div className="flex flex-col gap-6 mt-6 border-t pt-6" style={{ borderTopColor: invoiceColors?.separatorColor || undefined }}>
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                      ${totalTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t mt-2" style={{ borderTopColor: invoiceColors?.separatorColor || undefined }}>
                    <span className="font-bold text-foreground">Total:</span>
                    <span className="font-bold" style={{ color: invoiceColors?.primaryColor || undefined }}>
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">Paid to Date:</span>
                    <span className="font-bold">
                      ${totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-border mt-2">
                    <span className="font-bold text-foreground">Balance Due:</span>
                    <span className="font-bold text-destructive">
                      ${Math.max(0, remainingBalance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History Table */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Payment History
                  </h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold text-foreground">Date</th>
                          <th className="text-left p-3 text-sm font-semibold text-foreground">Method</th>
                          <th className="text-left p-3 text-sm font-semibold text-foreground">Ref/Notes</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">Amount</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.payments.map((payment) => (
                          <tr key={payment.id} className="border-t border-border">
                            <td className="p-3 text-sm">{payment.date}</td>
                            <td className="p-3 text-sm capitalize">{payment.method}</td>
                            <td className="p-3 text-sm text-muted-foreground">{payment.notes || "-"}</td>
                            <td className="p-3 text-sm text-right font-medium">${payment.amount.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right">
                              <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(payment)}>
                                <Receipt className="h-4 w-4 mr-1" /> Receipt
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Notes and Terms */}
            {invoice.notes && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Notes:
                </h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Terms & Conditions:
                </h4>
                <p className="text-sm text-muted-foreground">{invoice.terms}</p>
              </div>
            )}

            {/* Signatures */}
            <SignatureDisplay signatures={documentSignatures} />
          </CardContent>
        </Card>
      </div>

      <SendInvoiceDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        invoiceId={invoice.id.toString()}
        clientName={invoice.clientName}
      />

      <RegisterPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoiceId={invoice.id.toString()}
        invoiceNumber={invoice.invoiceNumber}
        remainingBalance={remainingBalance}
        onPaymentSaved={handleSavePayment}
      />

      {invoice && (
        <DigitalSignatureDialog
          open={signatureDialogOpen}
          onOpenChange={setSignatureDialogOpen}
          documentId={invoice.id.toString()}
          documentType="invoice"
          companyId={invoice.companyId?.toString() || ""}
        />
      )}
    </AppLayout >
  );
}
