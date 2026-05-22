"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send, Edit, Trash2, Printer, PenTool } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { SendDocumentDialog } from "@/components/send-document-dialog";
import { DigitalSignatureDialog } from "@/components/digital-signature-dialog";
import { useSignatures } from "@/hooks/use-signatures";
import { QuotePDFTemplate } from "@/components/quote-pdf-template";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateQuotePrintHTML } from "@/components/quote-print-template";

// Re-defining Quote type minimally for page constraints
type QuoteItem = {
    id: string;
    description: string;
    longDescription?: string;
    quantity: number;
    unitPrice: number;
    tax: number;
};

type Quote = {
    id: number | string;
    quoteNumber: string;
    status: string;
    issueDate: string;
    validUntil: string;
    clientName: string;
    clientEmail?: string;
    companyName: string;
    companyId?: string | number;
    items: QuoteItem[];
    total: number;
    [key: string]: any; // Allow other properties for flexibility
};

const statusConfig = {
    accepted: { label: "Accepted", className: "bg-primary/20 text-primary" },
    pending: { label: "Pending", className: "bg-chart-4/20 text-chart-4" },
    sent: { label: "Sent", className: "bg-chart-3/20 text-chart-3" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
};

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/quotes";
    const { toast } = useToast();

    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);

    const { getSignaturesForDocument } = useSignatures();
    const documentSignatures = quote ? getSignaturesForDocument(quote.id.toString(), 'quote') : [];

    useEffect(() => {
        const quoteId = params?.id as string;
        if (!quoteId) return;

        // Load quote from localStorage
        const emittedQuotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
        const draftQuotes = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");

        const allQuotes = [...emittedQuotes, ...draftQuotes];
        const foundQuote = allQuotes.find((q: Quote) => q.id.toString() === quoteId.toString());

        if (foundQuote) {
            setQuote(foundQuote);
        } else {
            toast({
                title: "Quote not found",
                description: "The proposal you're looking for doesn't exist.",
                variant: "destructive",
            });
            router.push("/quotes");
        }
        setLoading(false);
    }, [params?.id, router, toast]);

    const handleDelete = () => {
        if (!quote) return;

        if (quote.status === "draft") {
            const drafts = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
            const updated = drafts.filter((d: Quote) => d.id !== quote.id);
            localStorage.setItem("quoteDrafts", JSON.stringify(updated));
        } else {
            const emitted = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
            const updated = emitted.filter((e: Quote) => e.id !== quote.id);
            localStorage.setItem("emittedQuotes", JSON.stringify(updated));
        }

        toast({
            title: "Quote deleted",
            description: `Quote has been successfully deleted.`,
        });
        router.push("/quotes");
    };

    const processSend = async (email: string, subject: string, message: string) => {
        if (!quote) return;

        await new Promise(resolve => setTimeout(resolve, 500));
        await handleDownloadPDF();

        const body = encodeURIComponent(message);
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailtoLink;

        if (quote.status !== "sent" && quote.status !== "accepted") {
            const emittedQuotes = JSON.parse(localStorage.getItem("emittedQuotes") || "[]");
            let quoteUpdated = false;

            const updatedEmitted = emittedQuotes.map((q: Quote) => {
                if (q.id.toString() === quote.id.toString()) {
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
                setQuote(prev => prev ? { ...prev, status: "sent" } : prev);
            } else {
                const draftQuotes = JSON.parse(localStorage.getItem("quoteDrafts") || "[]");
                const draftIndex = draftQuotes.findIndex((q: Quote) => q.id.toString() === quote.id.toString());

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
                    setQuote(newQuote);
                }
            }
        }
    };

    const capturePDFPreview = async (scale: number) => {
        // Obsolete function due to oklch breaking canvas API
        return null;
    };

    const handleDownloadPDF = async () => {
        if (!quote) return;
        toast({ title: "Opening Print Dialog", description: "You can 'Save as PDF' from the Print options.", duration: 3000 });
        handlePrint();
    };

    const handlePrint = async () => {
        if (!quote) return;
        toast({ title: "Preparing Print", description: "Please wait while we prepare your document..." });

        try {
            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                toast({ title: "Popup Blocked", description: "Please allow popups to print quotes", variant: "destructive" });
                return;
            }

            // Add signatures onto the quote object before rendering
            const quoteWithSignatures = { ...quote, signatures: documentSignatures };
            // @ts-ignore Let it merge the signature formats smoothly
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
        }
    };

    const handleEdit = () => {
        if (!quote) return;
        localStorage.removeItem("editingQuoteDraft");
        localStorage.setItem("editingQuoteId", quote.id.toString());
        router.push(`/quotes/new`);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="container mx-auto px-6 py-8 max-w-5xl">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading proposal...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!quote) return null;

    return (
        <AppLayout>
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={returnTo}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {quote.quoteNumber}
                                </h1>
                                <Badge
                                    className={
                                        statusConfig[quote.status as keyof typeof statusConfig]
                                            ?.className || "bg-muted text-muted-foreground"
                                    }
                                >
                                    {statusConfig[quote.status as keyof typeof statusConfig]
                                        ?.label || quote.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                                Proposal details and information
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-transparent"
                            onClick={handlePrint}
                            title="Print"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-transparent"
                            onClick={handleEdit}
                            title="Edit Proposal"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
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
                            onClick={handleDelete}
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
                            <Send className="h-4 w-4" />
                            Send
                        </Button>
                    </div>
                </div>

                {/* View Layout Container */}
                <div className="bg-muted p-4 sm:p-8 flex justify-center w-full overflow-auto rounded-xl">
                    <div className="shadow-2xl overflow-hidden scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
                        <div id="quote-preview-content">
                            <QuotePDFTemplate
                                quote={quote as any}
                                signatures={documentSignatures}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {quote && (
                <SendDocumentDialog
                    open={sendDialogOpen}
                    onOpenChange={setSendDialogOpen}
                    documentId={quote.quoteNumber}
                    documentType="quote"
                    clientName={quote.clientName}
                    clientEmail={quote.clientEmail}
                    onSend={processSend}
                />
            )}

            {quote && (
                <DigitalSignatureDialog
                    open={signatureDialogOpen}
                    onOpenChange={setSignatureDialogOpen}
                    documentId={quote.id.toString()}
                    documentType="quote"
                    companyId={quote.companyId?.toString() || ""}
                />
            )}
        </AppLayout>
    );
}
