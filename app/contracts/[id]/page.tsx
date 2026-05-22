"use client";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    Save,
    Send,
    Download,
    PenTool,
    Building2,
    Printer,
    FileCode,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { SendDocumentDialog } from "@/components/send-document-dialog";
import { DigitalSignatureDialog } from "@/components/digital-signature-dialog";
import { SignatureDisplay } from "@/components/signature-display";
import { useSignatures } from "@/hooks/use-signatures";

export default function ContractEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [contract, setContract] = useState<any | null>(null);
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showSignDialog, setShowSignDialog] = useState(false);
    const contractRef = useRef<HTMLDivElement>(null);
    const { getSignaturesForDocument } = useSignatures();
    const documentSignatures = contract ? getSignaturesForDocument(contract.id.toString(), 'contract') : [];

    // Load Contract
    useEffect(() => {
        const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        const found = contracts.find((c: any) => c.id === id);
        if (found) {
            setContract(found);

            // Load company logo
            const companies = JSON.parse(localStorage.getItem("companies") || "[]");
            const company = companies.find((c: any) => c.id.toString() === found.companyId?.toString());
            if (company && company.logo) {
                setCompanyLogo(company.logo);
            }

            // If query param edit=true and not signed, enable edit mode
            if (searchParams.get("edit") === "true" && found.status === "draft") {
                setIsEditing(true);
            }
        } else {
            toast({
                title: "Error",
                description: "Contract not found",
                variant: "destructive",
            });
            router.push("/contracts");
        }
        setLoading(false);
    }, [id, searchParams]);

    const handleSave = () => {
        const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        const updatedContracts = contracts.map((c: any) =>
            c.id === contract.id ? { ...contract, updatedAt: new Date().toISOString() } : c
        );
        localStorage.setItem("contracts", JSON.stringify(updatedContracts));
        toast({
            title: "Saved",
            description: "Contract saved successfully.",
        });
        setIsEditing(false);
    };

    const handleUpdateContent = (field: string, value: string) => {
        setContract((prev: any) => ({
            ...prev,
            content: {
                ...prev.content,
                [field]: value
            }
        }));
    };

    const [showSendDialog, setShowSendDialog] = useState(false);

    const handleSendClick = () => {
        setShowSendDialog(true);
    };

    const handleConfirmSend = async (email: string, subject: string, message: string) => {
        // In a real app, this would call an API
        console.log(`Sending email to ${email} with subject: ${subject}`);

        // Update status to sent
        const updatedContract = {
            ...contract,
            status: "sent",
            updatedAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
            sentTo: email
        };
        setContract(updatedContract);

        const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        const updatedContracts = contracts.map((c: any) =>
            c.id === contract.id ? updatedContract : c
        );
        localStorage.setItem("contracts", JSON.stringify(updatedContracts));

        toast({
            title: "Contract Sent",
            description: `Contract sent to ${email}.`,
        });

        // Simulate default email client opening
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`);
    };

    const handleSignatureSaved = () => {
        const updatedContract = {
            ...contract,
            status: "signed",
            signedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setContract(updatedContract);

        const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        const updatedContracts = contracts.map((c: any) =>
            c.id === contract.id ? updatedContract : c
        );
        localStorage.setItem("contracts", JSON.stringify(updatedContracts));

        toast({
            title: "Contract Signed!",
            description: "The contract has been legally signed and your signature is saved.",
        });
    };


    const downloadHTML = () => {
        const content = document.getElementById("contract-print-view");
        if (!content) return;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contract.title} - ${contract.clientName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        .font-handwriting { font-family: 'Caveat', cursive; }
        @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex justify-center items-start p-8">
    <div class="bg-white text-black p-12 w-full max-w-[210mm] shadow-lg relative overflow-hidden mx-auto">
        ${content.innerHTML}
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Contract-${contract.title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "HTML Downloaded" });
    };

    const handlePrint = () => {
        const content = document.getElementById("contract-print-view");
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Print Contract</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    .font-handwriting { font-family: 'Caveat', cursive; }
                    body { margin: 0; padding: 20px; }
                     @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div style="max-width: 210mm; margin: 0 auto; position: relative;">
                    ${content.innerHTML}
                </div>
            </body>
            </html>
         `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const downloadPDF = async () => {
        const element = document.getElementById("contract-print-view");
        if (!element) return;

        toast({
            title: "Generating PDF",
            description: "Please wait...",
        });

        try {
            // Wait a small amount for any pending renders/images
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true, // Allow cross-origin images to taint the canvas (often needed for local dev or data URLs)
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

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

            pdf.save(`Contract-${contract.title}-${contract.clientName}.pdf`);
            toast({ title: "PDF Downloaded" });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
        }
    };

    if (loading || !contract) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">Loading...</div>
            </AppLayout>
        );
    }

    const isEditable = isEditing && contract.status === "draft";
    const isSigned = contract.status === "signed";

    // Watermark component for reusability
    const Watermark = () => (
        <div className="watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none z-0 text-gray-200 select-none overflow-hidden">
            <div className="transform -rotate-45 text-6xl sm:text-8xl font-bold opacity-20 whitespace-nowrap px-4 text-center">
                {contract.companyName}
            </div>
        </div>
    );

    return (
        <AppLayout>
            <div className="container mx-auto px-6 py-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/contracts")}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">{contract.title}</h1>
                        <Badge variant="secondary" className="ml-2 capitalize">
                            {contract.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {contract.status === "draft" && (
                            <>
                                {isEditing ? (
                                    <Button onClick={handleSave} className="gap-2">
                                        <Save className="h-4 w-4" /> Save Draft
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                                        <PenTool className="h-4 w-4" /> Edit
                                    </Button>
                                )}
                                <Button onClick={handleSendClick} variant="default" className="gap-2">
                                    <Send className="h-4 w-4" /> Send to Client
                                </Button>
                            </>
                        )}

                        {contract.status === "sent" && (
                            <Button onClick={() => setShowSignDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <PenTool className="h-4 w-4" /> Sign Contract
                            </Button>
                        )}

                        <Button variant="outline" onClick={handlePrint} className="gap-2">
                            <Download className="h-4 w-4" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Contract Document (Interactive View) */}
                <div className="flex justify-center">
                    <Card className="relative w-full max-w-[210mm] min-h-[297mm] p-12 bg-white text-black shadow-lg overflow-hidden" ref={contractRef}>

                        <Watermark />

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {companyLogo ? (
                                        <img
                                            src={companyLogo}
                                            alt={contract.companyName}
                                            className="h-16 w-auto object-contain"
                                            crossOrigin="anonymous" // Improve CORS handling for export
                                        />
                                    ) : (
                                        <Building2 className="h-12 w-12 text-gray-400" />
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{contract.title}</h1>
                                <p className="text-gray-500">Effective Date: {new Date(contract.createdAt).toLocaleDateString()}</p>
                            </div>

                            {/* Parties */}
                            <div className="mb-8">
                                <p className="mb-4">This Service Agreement (&quot;Agreement&quot;) is entered into by and between:</p>
                                <div className="grid grid-cols-2 gap-8 mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">Service Provider</h3>
                                        <p className="font-medium">{contract.companyName}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">Client</h3>
                                        <p className="font-medium">{contract.clientName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 1. Scope */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold uppercase mb-2">1. Scope of Services</h3>
                                {isEditable ? (
                                    <Textarea
                                        value={contract.content.scope}
                                        onChange={(e) => handleUpdateContent('scope', e.target.value)}
                                        className="min-h-[100px] border-gray-200"
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap text-gray-800">{contract.content.scope || "N/A"}</div>
                                )}
                            </div>

                            {/* 2. Payment Terms */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold uppercase mb-2">2. Payment Terms</h3>
                                {isEditable ? (
                                    <Textarea
                                        value={contract.content.paymentTerms}
                                        onChange={(e) => handleUpdateContent('paymentTerms', e.target.value)}
                                        className="min-h-[80px] border-gray-200"
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap text-gray-800">{contract.content.paymentTerms || "N/A"}</div>
                                )}
                            </div>

                            {/* 3. Duration  */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold uppercase mb-2">3. Term & Termination</h3>
                                {isEditable ? (
                                    <div className="grid gap-4">
                                        <Textarea
                                            placeholder="Duration"
                                            value={contract.content.duration}
                                            onChange={(e) => handleUpdateContent('duration', e.target.value)}
                                            className="border-gray-200"
                                        />
                                        <Textarea
                                            placeholder="Termination Clause"
                                            value={contract.content.termination}
                                            onChange={(e) => handleUpdateContent('termination', e.target.value)}
                                            className="border-gray-200"
                                        />
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap text-gray-800">
                                        <p className="mb-2">{contract.content.duration}</p>
                                        <p>{contract.content.termination}</p>
                                    </div>
                                )}
                            </div>

                            {/* 4. Confidentiality */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold uppercase mb-2">4. Confidentiality</h3>
                                {isEditable ? (
                                    <Textarea
                                        value={contract.content.confidentiality}
                                        onChange={(e) => handleUpdateContent('confidentiality', e.target.value)}
                                        className="min-h-[80px] border-gray-200"
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap text-gray-800">{contract.content.confidentiality || "N/A"}</div>
                                )}
                            </div>

                            {/* 5. Custom Sections */}
                            {contract.content.ip && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold uppercase mb-2">5. Intellectual Property</h3>
                                    {isEditable ? (
                                        <Textarea
                                            value={contract.content.ip}
                                            onChange={(e) => handleUpdateContent('ip', e.target.value)}
                                            className="min-h-[80px] border-gray-200"
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap text-gray-800">{contract.content.ip}</div>
                                    )}
                                </div>
                            )}

                            {/* Standard Legal Clauses */}
                            <div className="mb-8 space-y-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-bold">Governing Law:</span> This Agreement shall be governed by the laws of the State of New York.
                                </div>
                                <div>
                                    <span className="font-bold">Entire Agreement:</span> This Agreement constitutes the entire agreement between the parties.
                                </div>
                                <div>
                                    <span className="font-bold">Electronic Signatures:</span> Both parties agree that electronic signatures are legally binding.
                                </div>
                            </div>

                            <Separator className="my-8" />

                            <SignatureDisplay signatures={documentSignatures} />
                        </div>

                    </Card>
                </div>

                {/* HIDDEN PRINT VIEW - ALWAYS READ ONLY - Used for PDF/HTML Export */}
                <div id="contract-print-view" className="fixed -left-[9999px] top-0 w-[210mm] bg-white p-12 text-black shadow-lg relative overflow-hidden">
                    <Watermark />
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={contract.companyName}
                                        className="h-16 w-auto object-contain"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <Building2 className="h-12 w-12 text-gray-400" />
                                )}
                            </div>
                            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{contract.title}</h1>
                            <p className="text-gray-500">Effective Date: {new Date(contract.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mb-8">
                            <p className="mb-4">This Service Agreement (&quot;Agreement&quot;) is entered into by and between:</p>
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">Service Provider</h3>
                                    <p className="font-medium">{contract.companyName}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">Client</h3>
                                    <p className="font-medium">{contract.clientName}</p>
                                </div>
                            </div>
                        </div>
                        {/* 1. Scope */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">1. Scope of Services</h3>
                            <div className="whitespace-pre-wrap text-gray-800">{contract.content.scope || "N/A"}</div>
                        </div>
                        {/* 2. Payment Terms */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">2. Payment Terms</h3>
                            <div className="whitespace-pre-wrap text-gray-800">{contract.content.paymentTerms || "N/A"}</div>
                        </div>
                        {/* 3. Duration  */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">3. Term & Termination</h3>
                            <div className="whitespace-pre-wrap text-gray-800">
                                <p className="mb-2">{contract.content.duration}</p>
                                <p>{contract.content.termination}</p>
                            </div>
                        </div>
                        {/* 4. Confidentiality */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase mb-2">4. Confidentiality</h3>
                            <div className="whitespace-pre-wrap text-gray-800">{contract.content.confidentiality || "N/A"}</div>
                        </div>
                        {/* 5. Custom Sections */}
                        {contract.content.ip && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold uppercase mb-2">5. Intellectual Property</h3>
                                <div className="whitespace-pre-wrap text-gray-800">{contract.content.ip}</div>
                            </div>
                        )}
                        <div className="mb-8 space-y-4 text-sm text-gray-600">
                            <div><span className="font-bold">Governing Law:</span> This Agreement shall be governed by the laws of the State of New York.</div>
                            <div><span className="font-bold">Entire Agreement:</span> This Agreement constitutes the entire agreement between the parties.</div>
                            <div><span className="font-bold">Electronic Signatures:</span> Both parties agree that electronic signatures are legally binding.</div>
                        </div>
                        <SignatureDisplay signatures={documentSignatures} />
                    </div>
                </div>

            </div>

            {contract && (
                <DigitalSignatureDialog
                    open={showSignDialog}
                    onOpenChange={setShowSignDialog}
                    documentId={contract.id.toString()}
                    documentType="contract"
                    companyId={contract.companyId?.toString() || "default"}
                    onSignatureSaved={handleSignatureSaved}
                />
            )}

            <SendDocumentDialog
                open={showSendDialog}
                onOpenChange={setShowSendDialog}
                documentId={contract.title}
                documentType="contract"
                clientName={contract.clientName}
                clientEmail={contract.clientEmail || ""}
                onSend={handleConfirmSend}
            />
        </AppLayout>
    );
}
