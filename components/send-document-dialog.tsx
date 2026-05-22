"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mail, LinkIcon, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Document types supported
export type DocumentType = "invoice" | "quote" | "contract" | "reminder"

interface SendDocumentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentId: string
    documentType: DocumentType
    clientName: string
    clientEmail?: string
    onSend: (email: string, subject: string, message: string) => Promise<void>
}

export function SendDocumentDialog({
    open,
    onOpenChange,
    documentId,
    documentType,
    clientName,
    clientEmail = "",
    onSend,
}: SendDocumentDialogProps) {
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [email, setEmail] = useState(clientEmail)
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")

    // Check if subject/message needs update when dependencies change
    useEffect(() => {
        if (open) {
            setEmail(clientEmail)
            setSent(false)
            setSending(false)

            // Set defaults based on type
            const titleCaseType = documentType.charAt(0).toUpperCase() + documentType.slice(1)
            setSubject(`${titleCaseType} ${documentId} from ADSTRATEGIC`)

            let defaultMessage = `Dear ${clientName},

Please find attached the ${documentType} ${documentId}.`

            if (documentType === 'contract') {
                defaultMessage += `\n\nPlease review and sign the contract.`
            }

            defaultMessage += `\n\nType: ${titleCaseType}
Reference: ${documentId}

If you have any questions, please let us know.

Thank you,
ADSTRATEGIC`
            setMessage(defaultMessage)
        }
    }, [open, documentId, documentType, clientName, clientEmail])

    const handleSendEmail = async () => {
        if (!email) return

        setSending(true)
        try {
            await onSend(email, subject, message)
            setSent(true)
            setTimeout(() => {
                setSent(false)
                onOpenChange(false)
            }, 2000)
        } catch (error) {
            console.error("Failed to send", error)
        } finally {
            setSending(false)
        }
    }

    const handleCopyLink = () => {
        // In a real app this would be a real link, for now we simulate
        const link = `https://AddInvoices.app/${documentType}s/${documentId}`
        navigator.clipboard.writeText(link)
    }

    const titleCaseType = documentType.charAt(0).toUpperCase() + documentType.slice(1)

    if (sent) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-semibold text-foreground mb-2 text-center">
                            {titleCaseType} Sent Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground text-center">
                            The {documentType} has been marked as sent to {clientName}
                        </DialogDescription>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Send {titleCaseType} {documentId}</DialogTitle>
                    <DialogDescription>
                        Choose how you want to send this {documentType} to {clientName}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="email" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email" className="gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </TabsTrigger>
                        <TabsTrigger value="link" className="gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Link
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4 mt-4">
                        <div>
                            <Label>Recipient Email</Label>
                            <Input
                                type="email"
                                placeholder="client@example.com"
                                className="mt-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Subject</Label>
                            <Input
                                placeholder={`Invoice from ADSTRATEGIC`}
                                className="mt-1"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Message</Label>
                            <Textarea
                                placeholder="Add a personal message..."
                                className="mt-1"
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                * Because this is a local-only app, sending will open your default email client with this message pre-filled. You will need to attach the PDF manually.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
                                Cancel
                            </Button>
                            <Button onClick={handleSendEmail} disabled={sending || !email} className="gap-2">
                                {sending ? (
                                    <>Sending...</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="link" className="space-y-4 mt-4">
                        <div>
                            <Label>Shareable Link</Label>
                            <div className="flex gap-2 mt-1">
                                <Input readOnly value={`https://AddInvoices.app/${documentType}s/${documentId}`} className="font-mono text-sm" />
                                <Button onClick={handleCopyLink} variant="outline" className="bg-transparent">
                                    Copy
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Share this link with your client to view the {documentType} online
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
                                Close
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
