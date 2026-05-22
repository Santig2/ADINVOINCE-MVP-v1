"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Save, Plus, Trash2, Building2, User, FileText, SettingsIcon, CheckCircle2, CreditCard, Wallet, Send, Smartphone, Download, Database, TableProperties, FileSpreadsheet } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/theme-provider"

type UserConfig = {
  fullName: string
  email: string
  language: string
  timezone: string
  profilePhoto: string | null
}

type CompanyConfig = {
  id: number
  name: string
  nit: string
  address: string
  email: string
  phone: string
  logo: string | null
  template: string
  isDefault: boolean
  defaultRemarks?: string
  defaultTerms?: string
}

type InvoiceConfig = {
  prefix: string
  nextNumber: number
  numberFormat: string
  remindersEnabled: boolean
  reminderMessage: string
  reminderAfter: string
  reminderFrequency: string
}

type GeneralConfig = {
  colorPalette: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  paymentNotifications: boolean
  overdueNotifications: boolean
}

type PaymentMethodConfig = {
  stripeEnabled: boolean
  paypalEnabled: boolean
  zelleEnabled: boolean
  nequiEnabled: boolean
  manualInstructions: string
}

type CompanyInvoiceColors = {
  companyId: string
  primaryColor: string
  separatorColor: string
  headerAccentColor: string
  updatedAt: string
}


export default function ConfigurationPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const companyLogoRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const [userConfig, setUserConfig] = useState<UserConfig>({
    fullName: "",
    email: "",
    language: "en",
    timezone: "utc",
    profilePhoto: null,
  })

  const [companies, setCompanies] = useState<CompanyConfig[]>([
    {
      id: 1,
      name: "My Company",
      nit: "",
      address: "",
      email: "",
      phone: "",
      logo: null,
      template: "default",
      isDefault: true,
      defaultRemarks: "Thank you for your business.\nWe appreciate the opportunity to work with you.\nPlease review this invoice carefully and contact us if you have any questions.",
      defaultTerms: "Payment is due according to the terms stated on this invoice unless otherwise agreed in writing.\n\nAll goods and services provided are considered final unless otherwise specified in a written agreement.\n\nThe client agrees to review the invoice upon receipt and notify the issuer of any discrepancies within a reasonable timeframe. Failure to do so will be considered acceptance of the invoice as issued.\n\nOwnership of goods or completion of services remains subject to full payment being received. Any costs incurred in collecting overdue balances, including reasonable administrative or legal fees, may be charged where permitted by law.\n\nPrices, availability, and terms are subject to change unless otherwise stated in writing.",
    },
  ])

  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig>({
    prefix: "INV-",
    nextNumber: 1,
    numberFormat: "001",
    remindersEnabled: true,
    reminderMessage:
      "Hello [client], this is a friendly reminder that invoice #[number] is still pending payment. Thank you for your attention.",
    reminderAfter: "7",
    reminderFrequency: "weekly",
  })

  const [generalConfig, setGeneralConfig] = useState<GeneralConfig>({
    colorPalette: "adstrategic",
    notificationsEnabled: true,
    emailNotifications: true,
    paymentNotifications: true,
    overdueNotifications: true,
  })

  const [paymentMethodConfig, setPaymentMethodConfig] = useState<PaymentMethodConfig>({
    stripeEnabled: false,
    paypalEnabled: false,
    zelleEnabled: false,
    nequiEnabled: false,
    manualInstructions: "",
  })

  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null)

  const [companyColors, setCompanyColors] = useState<CompanyInvoiceColors[]>([])

  useEffect(() => {
    const savedUserConfig = localStorage.getItem("userConfig")
    const savedCompanies = localStorage.getItem("companies")
    const savedInvoiceConfig = localStorage.getItem("invoiceConfig")
    const savedGeneralConfig = localStorage.getItem("generalConfig")

    if (savedUserConfig) setUserConfig(JSON.parse(savedUserConfig))
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies))
    if (savedInvoiceConfig) setInvoiceConfig(JSON.parse(savedInvoiceConfig))
    if (savedGeneralConfig) setGeneralConfig(JSON.parse(savedGeneralConfig))

    const savedPaymentMethodConfig = localStorage.getItem("paymentMethodConfig")
    if (savedPaymentMethodConfig) setPaymentMethodConfig(JSON.parse(savedPaymentMethodConfig))

    const savedColors = localStorage.getItem("companyInvoiceColors")
    if (savedColors) setCompanyColors(JSON.parse(savedColors))
  }, [])

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserConfig({ ...userConfig, profilePhoto: reader.result as string })
        toast({
          title: "Profile photo uploaded",
          description: "Your profile photo has been updated.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveUserConfig = () => {
    localStorage.setItem("userConfig", JSON.stringify(userConfig))
    setSuccessMessage("User settings saved successfully!")
    setShowSuccessDialog(true)
  }

  const handleAddCompany = () => {
    const newCompany: CompanyConfig = {
      id: Date.now(),
      name: "New Company",
      nit: "",
      address: "",
      email: "",
      phone: "",
      logo: null,
      template: "default",
      isDefault: false,
      defaultRemarks: "Thank you for your business.\nWe appreciate the opportunity to work with you.\nPlease review this invoice carefully and contact us if you have any questions.",
      defaultTerms: "Payment is due according to the terms stated on this invoice unless otherwise agreed in writing.\n\nAll goods and services provided are considered final unless otherwise specified in a written agreement.\n\nThe client agrees to review the invoice upon receipt and notify the issuer of any discrepancies within a reasonable timeframe. Failure to do so will be considered acceptance of the invoice as issued.\n\nOwnership of goods or completion of services remains subject to full payment being received. Any costs incurred in collecting overdue balances, including reasonable administrative or legal fees, may be charged where permitted by law.\n\nPrices, availability, and terms are subject to change unless otherwise stated in writing.",
    }
    setCompanies([...companies, newCompany])
    toast({
      title: "Company added",
      description: "New company has been added. Don't forget to save!",
    })
  }

  const handleDeleteCompany = (id: number) => {
    setCompanyToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDeleteCompany = () => {
    if (companyToDelete) {
      const updatedCompanies = companies.filter((c) => c.id !== companyToDelete)
      setCompanies(updatedCompanies)
      localStorage.setItem("companies", JSON.stringify(updatedCompanies))
      toast({
        title: "Company deleted",
        description: "The company has been removed.",
      })
    }
    setShowDeleteDialog(false)
    setCompanyToDelete(null)
  }

  const handleExportData = () => {
    const dataToExport = {
      userConfig: localStorage.getItem("userConfig"),
      companies: localStorage.getItem("companies"),
      invoiceConfig: localStorage.getItem("invoiceConfig"),
      generalConfig: localStorage.getItem("generalConfig"),
      paymentMethodConfig: localStorage.getItem("paymentMethodConfig"),
      invoices: localStorage.getItem("emittedInvoices"),
      drafts: localStorage.getItem("invoiceDrafts"),
      quotes: localStorage.getItem("emittedQuotes"),
      clients: localStorage.getItem("clients"),
      expenses: localStorage.getItem("expenses"),
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `addinvoices_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
    
    toast({
      title: "Data Exported",
      description: "Your data has been successfully backed up to your device.",
    })
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            let fieldData = row[fieldName] === null || row[fieldName] === undefined ? "" : row[fieldName];
            fieldData = String(fieldData).replace(/"/g, '""');
            return `"${fieldData}"`;
          })
          .join(",")
      ),
    ];
    return csvRows.join("\n");
  };

  const handleExportCSV = (type: "invoices" | "clients" | "expenses" | "quotes") => {
    let dataStr = "";
    let data: any[] = [];
    
    try {
      if (type === "invoices") {
        const emittedInvoices = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
        data = emittedInvoices.map((inv: any) => ({
          Number: inv.invoiceNumber,
          Client: inv.client || inv.clientName,
          Amount: inv.amount || inv.total,
          Status: inv.status,
          Date: inv.date || inv.issueDate || inv.emittedAt || inv.createdAt,
        }));
      } else if (type === "quotes") {
        const quotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
        data = quotes.map((q: any) => ({
          Number: q.quoteNumber,
          Client: q.clientName,
          Amount: q.total,
          Status: q.status,
          Date: q.issueDate,
        }));
      } else if (type === "clients") {
        data = JSON.parse(localStorage.getItem("clients") || "[]").map((c: any) => ({
          Name: c.name,
          Email: c.email,
          Phone: c.phone,
          Status: c.status,
        }));
      } else if (type === "expenses") {
        data = JSON.parse(localStorage.getItem("expenses") || "[]").map((e: any) => ({
          Amount: e.amount,
          Category: e.category,
          Vendor: e.vendor || e.merchant,
          Date: e.date || e.createdAt,
        }));
      }

      if (data.length === 0) {
        toast({ title: "No data", description: `There are no ${type} to export.`, variant: "destructive" });
        return;
      }

      const csvStr = convertToCSV(data);
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `addinvoices_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV Exported",
        description: `Your ${type} have been exported to CSV.`,
      });
    } catch (error) {
      toast({ title: "Export Error", description: "Failed to export data.", variant: "destructive" });
    }
  }

  const handleCompanyLogoUpload = (companyId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedCompanies = companies.map((c) =>
          c.id === companyId ? { ...c, logo: reader.result as string } : c,
        )
        setCompanies(updatedCompanies)
        toast({
          title: "Logo uploaded",
          description: "Company logo has been updated.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateCompany = (id: number, field: keyof CompanyConfig, value: any) => {
    const updatedCompanies = companies.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    setCompanies(updatedCompanies)
  }

  const handleSetDefaultCompany = (id: number) => {
    const updatedCompanies = companies.map((c) => ({ ...c, isDefault: c.id === id }))
    setCompanies(updatedCompanies)
  }

  const handleSaveCompany = (id: number) => {
    localStorage.setItem("companies", JSON.stringify(companies))
    localStorage.setItem("companyInvoiceColors", JSON.stringify(companyColors))
    setSuccessMessage("Company settings saved successfully!")
    setShowSuccessDialog(true)
  }

  const handleUpdateCompanyColors = (companyId: number, field: string, value: string) => {
    setCompanyColors((prev) => {
      const existingIndex = prev.findIndex((c) => c.companyId === companyId.toString());
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value, updatedAt: new Date().toISOString() };
        return updated;
      } else {
        return [...prev, {
          companyId: companyId.toString(),
          primaryColor: field === "primaryColor" ? value : "#000000",
          separatorColor: field === "separatorColor" ? value : "#e5e7eb",
          headerAccentColor: field === "headerAccentColor" ? value : "#f9fafb",
          updatedAt: new Date().toISOString()
        }];
      }
    });
  }


  const handleSaveInvoiceConfig = () => {
    localStorage.setItem("invoiceConfig", JSON.stringify(invoiceConfig))
    setSuccessMessage("Invoice settings saved successfully!")
    setShowSuccessDialog(true)
  }

  const handleImportConfiguration = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string)
            if (config.userConfig) setUserConfig(config.userConfig)
            if (config.companies) setCompanies(config.companies)
            if (config.invoiceConfig) setInvoiceConfig(config.invoiceConfig)
            if (config.generalConfig) setGeneralConfig(config.generalConfig)

            localStorage.setItem("userConfig", JSON.stringify(config.userConfig))
            localStorage.setItem("companies", JSON.stringify(config.companies))
            localStorage.setItem("invoiceConfig", JSON.stringify(config.invoiceConfig))
            localStorage.setItem("generalConfig", JSON.stringify(config.generalConfig))

            toast({
              title: "Configuration imported",
              description: "All settings have been imported successfully.",
            })
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Invalid configuration file.",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExportConfiguration = () => {
    const config = {
      userConfig,
      companies,
      invoiceConfig,
      generalConfig,
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `AddInvoices-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Configuration exported",
      description: "Your settings have been downloaded.",
    })
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage your account, company, and invoice settings</p>
        </div>

        <Accordion type="single" collapsible defaultValue="user" className="flex flex-col gap-4 max-w-4xl mx-auto mt-4 pb-20">

          {/* User Profile Configuration */}
          <AccordionItem value="user" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-blue-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/10 transition-all duration-300">
            <AccordionTrigger id="config-user" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-blue-500/20 transition-all duration-300 shadow-inner">
                  <User className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-blue-500 transition-colors">User Profile</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">Personal details & preferences</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label>Profile Photo</Label>
                  <input
                    ref={profilePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {userConfig.profilePhoto ? (
                        <img
                          src={userConfig.profilePhoto || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => profilePhotoRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      className="mt-1"
                      value={userConfig.fullName}
                      onChange={(e) => setUserConfig({ ...userConfig, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="mt-1"
                      value={userConfig.email}
                      onChange={(e) => setUserConfig({ ...userConfig, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" className="mt-1" />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="Confirm new password" className="mt-1" />
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={userConfig.language}
                      onValueChange={(v) => setUserConfig({ ...userConfig, language: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={userConfig.timezone}
                      onValueChange={(v) => setUserConfig({ ...userConfig, timezone: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">EST (UTC-5)</SelectItem>
                        <SelectItem value="pst">PST (UTC-8)</SelectItem>
                        <SelectItem value="cet">CET (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="gap-2" onClick={handleSaveUserConfig}>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Company Configuration */}
          <AccordionItem value="company" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-indigo-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-indigo-500/10 transition-all duration-300">
            <AccordionTrigger id="config-company" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-indigo-500/20 transition-all duration-300 shadow-inner">
                  <Building2 className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-indigo-500 transition-colors">Company</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">Business info & templates</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your Companies</h3>
                <p className="text-sm text-muted-foreground">Manage multiple companies and their invoice templates</p>
              </div>
              <Button className="gap-2" onClick={handleAddCompany}>
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </div>

            {/* Company Cards */}
            <div className="space-y-4">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                          {company.logo ? (
                            <img
                              src={company.logo || "/placeholder.svg"}
                              alt="Company Logo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{company.name}</CardTitle>
                          {company.isDefault && <p className="text-xs text-primary mt-0.5">Default Company</p>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Company Name</Label>
                        <Input
                          placeholder="Company name"
                          className="mt-1"
                          value={company.name}
                          onChange={(e) => handleUpdateCompany(company.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>NIT / Tax ID</Label>
                        <Input
                          placeholder="123456789-0"
                          className="mt-1"
                          value={company.nit}
                          onChange={(e) => handleUpdateCompany(company.id, "nit", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Address</Label>
                      <Textarea
                        placeholder="Company address"
                        className="mt-1"
                        rows={2}
                        value={company.address}
                        onChange={(e) => handleUpdateCompany(company.id, "address", e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="contact@company.com"
                          className="mt-1"
                          value={company.email}
                          onChange={(e) => handleUpdateCompany(company.id, "email", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="mt-1"
                          value={company.phone}
                          onChange={(e) => handleUpdateCompany(company.id, "phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Company Logo</Label>
                        <input
                          ref={(el) => {
                            companyLogoRefs.current[company.id] = el
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCompanyLogoUpload(company.id, e)}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full mt-1 gap-2 bg-transparent"
                          onClick={() => companyLogoRefs.current[company.id]?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </Button>
                      </div>
                      <div>
                        <Label>Invoice Template</Label>
                        <Select
                          value={company.template}
                          onValueChange={(v) => handleUpdateCompany(company.id, "template", v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default Template</SelectItem>
                            <SelectItem value="modern">Modern Template</SelectItem>
                            <SelectItem value="classic">Classic Template</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border">
                      <h4 className="text-sm font-semibold mb-3 text-foreground">Default Invoice Content</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>Default Remarks</Label>
                          <Textarea
                            placeholder="Thank you for your business..."
                            className="mt-1"
                            rows={3}
                            value={company.defaultRemarks || ""}
                            onChange={(e) => handleUpdateCompany(company.id, "defaultRemarks", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Friendly message shown on every invoice.</p>
                        </div>
                        <div>
                          <Label>Default Terms & Conditions</Label>
                          <Textarea
                            placeholder="Payment is due within 30 days..."
                            className="mt-1"
                            rows={5}
                            value={company.defaultTerms || ""}
                            onChange={(e) => handleUpdateCompany(company.id, "defaultTerms", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Legal and operational conditions that apply to invoices.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border">
                      <h4 className="text-sm font-semibold mb-3 text-foreground">Invoice Colors</h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        {(() => {
                          const colors = companyColors.find(c => c.companyId === company.id.toString()) || {
                            primaryColor: "#000000",
                            separatorColor: "#e5e7eb",
                            headerAccentColor: "#f9fafb"
                          };
                          return (
                            <>
                              <div>
                                <Label>Primary Color</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input type="color" className="w-12 p-1 h-9 cursor-pointer" value={colors.primaryColor} onChange={(e) => handleUpdateCompanyColors(company.id, "primaryColor", e.target.value)} />
                                  <Input type="text" className="flex-1 uppercase font-mono text-xs" value={colors.primaryColor} onChange={(e) => handleUpdateCompanyColors(company.id, "primaryColor", e.target.value)} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Numbers, totals, highlights</p>
                              </div>
                              <div>
                                <Label>Separator Color</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input type="color" className="w-12 p-1 h-9 cursor-pointer" value={colors.separatorColor} onChange={(e) => handleUpdateCompanyColors(company.id, "separatorColor", e.target.value)} />
                                  <Input type="text" className="flex-1 uppercase font-mono text-xs" value={colors.separatorColor} onChange={(e) => handleUpdateCompanyColors(company.id, "separatorColor", e.target.value)} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Borders, divider lines</p>
                              </div>
                              <div>
                                <Label>Header Accent Color</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input type="color" className="w-12 p-1 h-9 cursor-pointer" value={colors.headerAccentColor} onChange={(e) => handleUpdateCompanyColors(company.id, "headerAccentColor", e.target.value)} />
                                  <Input type="text" className="flex-1 uppercase font-mono text-xs" value={colors.headerAccentColor} onChange={(e) => handleUpdateCompanyColors(company.id, "headerAccentColor", e.target.value)} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Table header backgrounds</p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={company.isDefault}
                          onCheckedChange={() => handleSetDefaultCompany(company.id)}
                        />
                        <Label className="cursor-pointer">Set as default company</Label>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => handleSaveCompany(company.id)}
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Invoices Configuration */}
          <AccordionItem value="invoices" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-emerald-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-emerald-500/10 transition-all duration-300">
            <AccordionTrigger id="config-invoices" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-emerald-500/20 transition-all duration-300 shadow-inner">
                  <FileText className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-emerald-500 transition-colors">Invoices</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">Numbering & auto-reminders</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card>
              <CardHeader>
                <CardTitle>Invoice Templates</CardTitle>
                <CardDescription>Create and manage invoice templates for different companies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="font-semibold text-foreground">Default Template</p>
                    <p className="text-sm text-muted-foreground">Standard invoice layout</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() =>
                        toast({
                          title: "Edit template",
                          description: "Template editor coming soon!",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() =>
                        toast({
                          title: "Preview template",
                          description: "Template preview coming soon!",
                        })
                      }
                    >
                      Preview
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="font-semibold text-foreground">Modern Template</p>
                    <p className="text-sm text-muted-foreground">Clean and minimal design</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() =>
                        toast({
                          title: "Edit template",
                          description: "Template editor coming soon!",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() =>
                        toast({
                          title: "Preview template",
                          description: "Template preview coming soon!",
                        })
                      }
                    >
                      Preview
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() =>
                    toast({
                      title: "Create template",
                      description: "Template creator coming soon!",
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Numbering</CardTitle>
                <CardDescription>Configure automatic invoice number generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Prefix</Label>
                    <Input
                      placeholder="INV-"
                      className="mt-1"
                      value={invoiceConfig.prefix}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, prefix: e.target.value })}

                    />
                  </div>
                  <div>
                    <Label>Next Number</Label>
                    <Input
                      type="number"
                      placeholder="001"
                      className="mt-1"
                      value={invoiceConfig.nextNumber}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, nextNumber: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Number Format</Label>
                  <Select
                    value={invoiceConfig.numberFormat}
                    onValueChange={(v) => setInvoiceConfig({ ...invoiceConfig, numberFormat: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">001, 002, 003...</SelectItem>
                      <SelectItem value="0001">0001, 0002, 0003...</SelectItem>
                      <SelectItem value="1">1, 2, 3...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2" onClick={handleSaveInvoiceConfig}>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automatic Reminders</CardTitle>
                <CardDescription>Configure automatic payment reminders for pending invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="font-semibold text-foreground">Enable Automatic Reminders</p>
                    <p className="text-sm text-muted-foreground">Send reminders for overdue invoices</p>
                  </div>
                  <Switch
                    checked={invoiceConfig.remindersEnabled}
                    onCheckedChange={(v) => setInvoiceConfig({ ...invoiceConfig, remindersEnabled: v })}
                  />
                </div>

                {invoiceConfig.remindersEnabled && (
                  <>
                    <div>
                      <Label>Reminder Message</Label>
                      <Textarea
                        placeholder="Customize your reminder message..."
                        className="mt-1"
                        rows={4}
                        value={invoiceConfig.reminderMessage}
                        onChange={(e) => setInvoiceConfig({ ...invoiceConfig, reminderMessage: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Use [client] for client name and [number] for invoice number
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Send Reminder After</Label>
                        <Select
                          value={invoiceConfig.reminderAfter}
                          onValueChange={(v) => setInvoiceConfig({ ...invoiceConfig, reminderAfter: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day overdue</SelectItem>
                            <SelectItem value="3">3 days overdue</SelectItem>
                            <SelectItem value="7">7 days overdue</SelectItem>
                            <SelectItem value="14">14 days overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reminder Frequency</Label>
                        <Select
                          value={invoiceConfig.reminderFrequency}
                          onValueChange={(v) => setInvoiceConfig({ ...invoiceConfig, reminderFrequency: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4">
                  <Button className="gap-2" onClick={handleSaveInvoiceConfig}>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payments Configuration */}
          <AccordionItem value="payments" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-amber-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-amber-500/10 transition-all duration-300">
            <AccordionTrigger id="config-payments" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-amber-500/20 transition-all duration-300 shadow-inner">
                  <CreditCard className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-amber-500 transition-colors">Payments</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">Payment gateways & methods</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure how you accept payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stripe Connect */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden p-2">
                      <Image
                        src="/images/stripe-icon.png"
                        alt="Stripe"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Stripe Connect</p>
                      <p className="text-sm text-muted-foreground">Accept credit card payments directly on your invoices</p>

                    </div>
                  </div>
                  <div className="flex items-center gap-2">

                    <Switch
                      checked={paymentMethodConfig.stripeEnabled}
                      onCheckedChange={(v) => setPaymentMethodConfig({ ...paymentMethodConfig, stripeEnabled: v })}
                    />
                  </div>
                </div>

                {/* PayPal */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden p-2">
                      <Image
                        src="/images/PayPal-icon.png"
                        alt="PayPal"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">PayPal</p>
                      <p className="text-sm text-muted-foreground">Accept PayPal payments on your invoices</p>

                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={paymentMethodConfig.paypalEnabled}
                      onCheckedChange={(v) => setPaymentMethodConfig({ ...paymentMethodConfig, paypalEnabled: v })}
                    />
                  </div>
                </div>

                {/* Zelle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden p-2">
                      <Image
                        src="/images/zelle-icon.png"
                        alt="Zelle"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Zelle</p>
                      <p className="text-sm text-muted-foreground">Accept payments via Zelle</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethodConfig.zelleEnabled}
                    onCheckedChange={(v) => setPaymentMethodConfig({ ...paymentMethodConfig, zelleEnabled: v })}
                  />
                </div>
                <CardDescription>Payment method only for South America</CardDescription>
                {/* Nequi */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden p-2">
                      <Image
                        src="/images/nequi-icon.png"
                        alt="Nequi"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Nequi</p>
                      <p className="text-sm text-muted-foreground">Accept payments via Nequi</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethodConfig.nequiEnabled}
                    onCheckedChange={(v) => setPaymentMethodConfig({ ...paymentMethodConfig, nequiEnabled: v })}
                  />
                </div>

                {/* Manual Instructions */}
                <div>
                  <Label>Manual Payment Instructions</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add instructions for bank transfers, checks, or other payment methods
                  </p>
                  <Textarea
                    value={paymentMethodConfig.manualInstructions}
                    onChange={(e) => setPaymentMethodConfig({ ...paymentMethodConfig, manualInstructions: e.target.value })}
                    placeholder="e.g., Bank Transfer to Account #123456789"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="gap-2" onClick={() => {
                    localStorage.setItem("paymentMethodConfig", JSON.stringify(paymentMethodConfig));
                    toast({ title: "Payment settings saved", description: "Your payment preferences have been updated." });
                  }}>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* General Configuration */}
          <AccordionItem value="general" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-slate-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-slate-500/10 transition-all duration-300">
            <AccordionTrigger id="config-general" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-500/20 text-slate-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-slate-500/20 transition-all duration-300 shadow-inner">
                  <SettingsIcon className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-slate-500 transition-colors">General</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">App settings & data export</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card>
              <CardHeader>
                <CardTitle>Storage Management</CardTitle>
                <CardDescription>Manage your local data and storage usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                  <p className="font-semibold text-sm">Storage Limit Warning</p>
                  <p className="text-xs mt-1">
                    Browsers limit the amount of data you can store locally (usually around 5MB).
                    If you are unable to save new invoices, try optimizing storage or clearing old data.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => {
                      try {
                        const emitted = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
                        const optimized = emitted.map((inv: any) => ({ ...inv, logo: null }));
                        localStorage.setItem("emittedInvoices", JSON.stringify(optimized));
                        toast({
                          title: "Storage Optimized",
                          description: "Removed logos from historical invoices to free up space.",
                        });
                      } catch (e) {
                        toast({
                          title: "Optimization Failed",
                          description: "Could not optimize storage.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Optimize Storage (Remove Logos)
                  </Button>

                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Color Palette</Label>
                  <Select
                    value={generalConfig.colorPalette}
                    onValueChange={(v) => {
                      setGeneralConfig({ ...generalConfig, colorPalette: v })
                      localStorage.setItem("generalConfig", JSON.stringify({ ...generalConfig, colorPalette: v }))
                      toast({
                        title: "Color palette updated",
                        description: "Your color preference has been saved.",
                      })
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adstrategic">ADSTRATEGIC (Aqua)</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border mt-4">
                  <div>
                    <p className="font-semibold text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or import your configuration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Import Configuration
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Restore your settings from a previously exported JSON file.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleImportConfiguration}>
                      Import JSON
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Export Configuration
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a backup of your current settings and preferences.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleExportConfiguration}>
                      Export JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Backup Configuration */}
          <AccordionItem value="data" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-rose-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-rose-500/10 transition-all duration-300">
            <AccordionTrigger id="config-data" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-rose-500/20 transition-all duration-300 shadow-inner">
                  <Database className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-rose-500 transition-colors">Backup</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">Export your data</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Database className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <CardTitle>Backup & Restore</CardTitle>
                    <CardDescription>Export your data before migrating to a cloud database</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-start">
                  <Download className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Export your data</h4>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mb-6 max-w-xl">
                      Download a complete JSON backup of all your invoices, quotes, clients, and settings. 
                      This is highly recommended before we connect the application to a cloud database (like Supabase or Firebase).
                    </p>
                    <Button onClick={handleExportData} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                      <Download className="h-4 w-4" />
                      Download Full Backup
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 sm:p-5 flex gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-500 shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Export Invoices</h4>
                      <p className="text-sm text-muted-foreground mb-4">Download all your invoices as a CSV file for Excel or accounting software.</p>
                      <Button variant="outline" onClick={() => handleExportCSV('invoices')} className="w-full gap-2">
                        <Download className="h-4 w-4" /> CSV Export
                      </Button>
                    </div>
                  </div>

                  <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 sm:p-5 flex gap-3">
                    <TableProperties className="h-5 w-5 text-purple-500 shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Export Clients</h4>
                      <p className="text-sm text-muted-foreground mb-4">Download your client directory as a CSV file for CRM imports.</p>
                      <Button variant="outline" onClick={() => handleExportCSV('clients')} className="w-full gap-2">
                        <Download className="h-4 w-4" /> CSV Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Success!</DialogTitle>
            <DialogDescription className="text-center">{successMessage}</DialogDescription>
            <DialogFooter className="w-full">
              <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
                Continue
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCompany}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
