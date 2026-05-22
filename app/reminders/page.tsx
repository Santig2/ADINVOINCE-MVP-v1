"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Send, Clock, CheckCircle2, AlertCircle, Search, Calendar, SendHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { SendDocumentDialog } from "@/components/send-document-dialog"
import { MassReminderDialog } from "@/components/mass-reminder-dialog"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Mock reminders data
const pendingReminders = [
  {
    id: "1",
    invoiceId: "INV-002",
    client: "TechStart Inc",
    amount: 3280,
    dueDate: "2025-01-18",
    daysOverdue: 3,
    lastReminder: "2025-01-20",
    reminderCount: 1,
  },
  {
    id: "2",
    invoiceId: "INV-004",
    client: "Digital Ventures",
    amount: 4190,
    dueDate: "2025-01-20",
    daysOverdue: 1,
    lastReminder: null,
    reminderCount: 0,
  },
  {
    id: "3",
    invoiceId: "INV-008",
    client: "Creative Studios",
    amount: 5670,
    dueDate: "2025-01-10",
    daysOverdue: 11,
    lastReminder: "2025-01-15",
    reminderCount: 2,
  },
]

const scheduledReminders = [
  {
    id: "4",
    invoiceId: "INV-006",
    client: "Innovation Labs",
    amount: 2890,
    dueDate: "2025-01-25",
    scheduledDate: "2025-01-26",
    status: "scheduled",
  },
  {
    id: "5",
    invoiceId: "INV-007",
    client: "Tech Solutions",
    amount: 4500,
    dueDate: "2025-01-28",
    scheduledDate: "2025-01-29",
    status: "scheduled",
  },
]

const reminderHistory = [
  {
    id: "1",
    invoiceId: "INV-001",
    client: "Acme Corp",
    amount: 5420,
    sentDate: "2025-01-19",
    status: "delivered",
    result: "Paid on 2025-01-20",
  },
  {
    id: "2",
    invoiceId: "INV-003",
    client: "Global Solutions",
    amount: 7650,
    sentDate: "2025-01-18",
    status: "delivered",
    result: "Paid on 2025-01-19",
  },
  {
    id: "3",
    invoiceId: "INV-002",
    client: "TechStart Inc",
    amount: 3280,
    sentDate: "2025-01-20",
    status: "delivered",
    result: "No response",
  },
]

export default function RemindersPage() {
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [massReminderDialogOpen, setMassReminderDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; client: string; clientEmail?: string } | null>(null)
  const { toast } = useToast()

  const handleSendReminder = (invoiceId: string, clientName: string) => {
    // Try to find client email from real storage if possible
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const client = savedClients.find(
      (c: any) => c.name === clientName
    );

    setSelectedInvoice({
      id: invoiceId,
      client: clientName,
      clientEmail: client?.email || ""
    })
    setSendDialogOpen(true)
  }

  const processSend = async (email: string, subject: string, message: string) => {
    if (!selectedInvoice) return;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Open mailto link
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoLink;

    toast({
      title: "Reminder Sent",
      description: `Payment reminder for ${selectedInvoice.id} has been sent to ${email}`,
    })
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-0 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <motion.div
          className="mb-8 px-4 sm:px-0 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Reminders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage payment reminders for overdue invoices
            </p>
          </div>
          <Button id="reminders-create-btn" onClick={() => setMassReminderDialogOpen(true)} className="gap-2 w-full sm:w-auto rounded-xl sm:rounded-md h-12 sm:h-10">
            <SendHorizontal className="h-4 w-4" />
            Send Mass Reminders
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="mb-8 px-4 sm:px-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold">3</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Need attention</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Scheduled</CardTitle>
                  <Clock className="h-4 w-4 text-chart-4 opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold">2</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Queued</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Sent Today</CardTitle>
                  <Send className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold">5</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Delivered</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold">78%</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Payment after</p>
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

        {/* Tabs */}
        <Tabs id="reminders-list" defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Scheduled</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Pending Reminders */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Overdue Invoices</CardTitle>
                    <CardDescription className="hidden sm:block">
                      Invoices that require payment reminders
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoices..." className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="space-y-3">
                  {pendingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl sm:rounded-lg bg-background sm:bg-secondary/30 border border-border/50 sm:border-transparent hover:border-primary/30 sm:hover:bg-secondary/70 transition-all duration-300 hover:shadow-sm cursor-pointer group gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                          <Bell className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-foreground text-base leading-none">{reminder.invoiceId}</p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              {reminder.daysOverdue}d overdue
                            </span>
                            {reminder.reminderCount > 0 && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {reminder.reminderCount} sent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium truncate">{reminder.client}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-foreground text-base sm:text-lg leading-none">${reminder.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            Due: {reminder.dueDate}
                            {reminder.lastReminder && (
                              <span className="hidden sm:inline"> • Last: {reminder.lastReminder}</span>
                            )}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendReminder(reminder.invoiceId, reminder.client)
                          }}
                          size="icon"
                          className="shrink-0 h-10 w-10 rounded-full"
                          title="Send Reminder"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Reminders */}
          <TabsContent value="scheduled" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Scheduled Reminders</CardTitle>
                <CardDescription className="hidden sm:block">
                  Automatic reminders that will be sent soon
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="space-y-3">
                  {scheduledReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl sm:rounded-lg bg-background sm:bg-secondary/30 border border-border/50 sm:border-transparent gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center shrink-0">
                          <Clock className="h-6 w-6 text-chart-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-foreground text-base leading-none">{reminder.invoiceId}</p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-chart-4/10 text-chart-4">
                              Scheduled
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium truncate">{reminder.client}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-foreground text-base sm:text-lg leading-none">${reminder.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            Due: {reminder.dueDate} • Will send: {reminder.scheduledDate}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent shrink-0 rounded-full h-10 px-4">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminder History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Reminder History</CardTitle>
                    <CardDescription className="hidden sm:block">Past reminders and their outcomes</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search history..." className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="space-y-3">
                  {reminderHistory.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl sm:rounded-lg bg-background sm:bg-secondary/30 border border-border/50 sm:border-transparent gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-foreground text-base leading-none">{reminder.invoiceId}</p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {reminder.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium truncate">{reminder.client}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-[64px] sm:pl-0">
                        <p className="font-bold text-foreground text-base sm:text-lg leading-none">${reminder.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Sent: {reminder.sentDate} • {reminder.result}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>

      {selectedInvoice && (
        <SendDocumentDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          documentId={selectedInvoice.id}
          documentType="reminder"
          clientName={selectedInvoice.client}
          clientEmail={selectedInvoice.clientEmail}
          onSend={processSend}
        />
      )}

      <MassReminderDialog open={massReminderDialogOpen} onOpenChange={setMassReminderDialogOpen} />
    </AppLayout>
  )
}
