"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type PendingInvoice = {
  id: number
  invoiceNumber: string
  clientName: string
  companyName: string
  total: number
  dueDate: string
  status: string
}

type MassReminderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MassReminderDialog({ open, onOpenChange }: MassReminderDialogProps) {
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([])
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set())
  const [messageTemplate, setMessageTemplate] = useState(
    "Hello {clientName},\n\nThis is a friendly reminder from {businessName} that invoice #{invoiceNumber} with an amount of ${dueAmount} was due on {dueDate} and is currently pending payment.\n\nWe kindly request that you process this payment at your earliest convenience. If you have any questions or concerns, please don't hesitate to contact us.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\n{businessName}",
  )
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadPendingInvoices()
      setSelectedInvoices(new Set())
      setShowPreview(false)
      setShowSuccess(false)
    }
  }, [open])

  const loadPendingInvoices = () => {
    const emitted = localStorage.getItem("emittedInvoices")
    if (emitted) {
      const invoices = JSON.parse(emitted)
      const pending = invoices.filter((inv: any) =>
        (inv.status === "pending" || inv.status === "issued" || inv.status === "overdue") &&
        inv.status !== "paid"
      )
      setPendingInvoices(pending)
      // Select all by default
      setSelectedInvoices(new Set(pending.map((inv: PendingInvoice) => inv.id)))
    }
  }

  const toggleInvoiceSelection = (invoiceId: number) => {
    const newSelected = new Set(selectedInvoices)
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId)
    } else {
      newSelected.add(invoiceId)
    }
    setSelectedInvoices(newSelected)
  }

  const selectAll = () => {
    setSelectedInvoices(new Set(pendingInvoices.map(inv => inv.id)))
  }

  const deselectAll = () => {
    setSelectedInvoices(new Set())
  }

  const generatePersonalizedMessage = (invoice: PendingInvoice) => {
    // Get business name from configuration
    const config = JSON.parse(localStorage.getItem("userConfig") || "{}")
    const businessName = config.businessName || invoice.companyName || "Your Business"

    return messageTemplate
      .replace(/{clientName}/g, invoice.clientName)
      .replace(/{businessName}/g, businessName)
      .replace(/{companyName}/g, businessName)
      .replace(/{invoiceNumber}/g, invoice.invoiceNumber)
      .replace(/{dueDate}/g, invoice.dueDate)
      .replace(/{dueAmount}/g, invoice.total.toFixed(2))
      .replace(/{amount}/g, invoice.total.toFixed(2))
  }

  const selectedInvoicesList = pendingInvoices.filter(inv => selectedInvoices.has(inv.id))

  const handleSendReminders = () => {
    if (selectedInvoicesList.length === 0) {
      toast({
        title: "No invoices selected",
        description: "Please select at least one invoice to send reminders",
        variant: "destructive",
      })
      return
    }

    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      onOpenChange(false)
      toast({
        title: "Reminders sent successfully",
        description: `${selectedInvoicesList.length} reminder${selectedInvoicesList.length > 1 ? "s" : ""} sent to clients`,
      })
    }, 2000)
  }

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Reminders Sent!</DialogTitle>
            <DialogDescription className="text-center">
              {selectedInvoicesList.length} personalized reminder{selectedInvoicesList.length > 1 ? "s have" : " has"} been sent
              successfully
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Mass Reminders</DialogTitle>
          <DialogDescription>
            Send personalized payment reminders to all clients with pending invoices
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label>Message Template</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Use variables: {"{clientName}"}, {"{businessName}"}, {"{invoiceNumber}"}, {"{dueDate}"}, {"{dueAmount}"}
              </p>
              <Textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">Recipients</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoicesList.length} of {pendingInvoices.length} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {pendingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/70 transition-colors"
                    >
                      <Checkbox
                        checked={selectedInvoices.has(invoice.id)}
                        onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                      />
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1 sm:gap-0">
                        <span className="text-foreground font-medium">{invoice.clientName}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground">{invoice.invoiceNumber}</span>
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                            ${invoice.total.toFixed(2)}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">Due: {invoice.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="font-semibold text-foreground mb-3">Preview Personalized Messages ({selectedInvoicesList.length})</h4>
            <ScrollArea className="flex-1 border border-border rounded-lg">
              <div className="p-4 space-y-4">
                {selectedInvoicesList.map((invoice) => (
                  <div key={invoice.id} className="bg-secondary/50 border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{invoice.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.invoiceNumber} • ${invoice.total.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="bg-background rounded p-3 text-sm text-foreground whitespace-pre-wrap font-mono">
                      {generatePersonalizedMessage(invoice)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-2 mt-4 sm:mt-0">
          {showPreview ? (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)} className="w-full sm:w-auto">
                Back to Edit
              </Button>
              <Button onClick={handleSendReminders} className="gap-2 w-full sm:w-auto" disabled={selectedInvoicesList.length === 0}>
                <Send className="h-4 w-4" />
                Send {selectedInvoicesList.length} Reminder{selectedInvoicesList.length > 1 ? "s" : ""}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={() => setShowPreview(true)} disabled={selectedInvoicesList.length === 0} className="w-full sm:w-auto">
                Preview Messages ({selectedInvoicesList.length})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
