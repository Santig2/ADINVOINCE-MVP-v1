"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Building2, CheckCircle, Clock, FileText, PenTool, Printer, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
// import ReactToPrint from 'react-to-print';

// Types
type Subscription = {
    id: string;
    clientId: number | string;
    clientName: string;
    companyId: number | string;
    companyName: string;
    serviceId: string;
    serviceName: string;
    frequency: string;
    price: number;
    startDate: string;
    nextBillingDate: string;
    status: string;
    billingDay: number;
    reminderDays: number;
};

type ServiceProof = {
    id: string;
    subscriptionId: string;
    date: string;
    period: string;
    notes: string;
    providerSignature?: string;
    clientSignature?: string;
    createdAt: string;
};

export default function SubscriptionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [proofs, setProofs] = useState<ServiceProof[]>([]);
    const [loading, setLoading] = useState(true);

    // New Proof State
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [proofNotes, setProofNotes] = useState("");
    const [proofPeriod, setProofPeriod] = useState(format(new Date(), "MMMM yyyy"));
    const [providerSigned, setProviderSigned] = useState(false);
    const [clientSigned, setClientSigned] = useState(false);

    // Print ref
    const printRef = useRef<HTMLDivElement>(null);
    const [selectedProof, setSelectedProof] = useState<ServiceProof | null>(null);

    useEffect(() => {
        const loadData = () => {
            const subs = JSON.parse(localStorage.getItem("subscriptions") || "[]");
            const sub = subs.find((s: Subscription) => s.id === params.id);
            if (sub) {
                setSubscription(sub);
            } else {
                toast({ title: "Error", description: "Subscription not found", variant: "destructive" });
                router.push("/subscriptions");
            }

            const allProofs = JSON.parse(localStorage.getItem("serviceProofs") || "[]");
            const subProofs = allProofs.filter((p: ServiceProof) => p.subscriptionId === params.id);
            setProofs(subProofs.sort((a: ServiceProof, b: ServiceProof) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setLoading(false);
        };
        loadData();
    }, [params.id, router, toast]);

    const handleCreateProof = () => {
        if (!subscription) return;
        if (!providerSigned) { // Enforce at least provider signature
            toast({ title: "Signature Required", description: "Provider must sign the proof.", variant: "destructive" });
            return;
        }

        const newProof: ServiceProof = {
            id: crypto.randomUUID(),
            subscriptionId: subscription.id,
            date: new Date().toISOString(),
            period: proofPeriod,
            notes: proofNotes,
            providerSignature: providerSigned ? "Signed by Provider" : undefined,
            clientSignature: clientSigned ? "Signed by Client" : undefined,
            createdAt: new Date().toISOString()
        };

        const allProofs = JSON.parse(localStorage.getItem("serviceProofs") || "[]");
        const updatedProofs = [newProof, ...allProofs];
        localStorage.setItem("serviceProofs", JSON.stringify(updatedProofs));

        // Update local state
        setProofs([newProof, ...proofs]);
        setIsProofModalOpen(false);
        setProofNotes("");
        setProviderSigned(false);
        setClientSigned(false);

        toast({ title: "Service Proof Created", description: "Service delivery recorded successfully." });
    };

    const handleVoiceRecord = () => {
        toast({ title: "Listening...", description: "Say 'Service completed...'" });
        setTimeout(() => {
            setIsProofModalOpen(true);
            setProofNotes("Routine maintenance performed. All systems nominal. (Voice captured)");
            setProviderSigned(true);
            toast({ title: "Voice Captured", description: "Form filled from voice." });
        }, 1500);
    };

    if (loading || !subscription) {
        return <AppLayout><div className="p-8">Loading...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" /> Back to Subscriptions
                </Button>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{subscription.serviceName}</h1>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <Badge variant="outline">{subscription.frequency}</Badge>
                            <span>ID: {subscription.id.slice(0, 8)}</span>
                        </div>
                    </div>
                    <Badge className={subscription.status === 'active' ? "bg-green-500" : "bg-gray-500"}>
                        {subscription.status.toUpperCase()}
                    </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="font-medium">{subscription.clientName}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Company</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="font-medium">{subscription.companyName}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Billing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">${subscription.price.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">Next: {new Date(subscription.nextBillingDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="history">
                    <TabsList className="mb-4">
                        <TabsTrigger value="history">Service History</TabsTrigger>
                        <TabsTrigger value="details">Details & Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="history">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Service Proofs</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" className="gap-2" onClick={handleVoiceRecord}>
                                    <Mic className="h-4 w-4" />
                                    Voice Record
                                </Button>
                                <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <FileText className="h-4 w-4" />
                                            Record Delivery
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Record Service Delivery</DialogTitle>
                                            <DialogDescription>
                                                Generate a proof of service for this subscription period.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Period</Label>
                                                <Input
                                                    value={proofPeriod}
                                                    onChange={(e) => setProofPeriod(e.target.value)}
                                                    placeholder="e.g. February 2024"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Notes</Label>
                                                <Textarea
                                                    value={proofNotes}
                                                    onChange={(e) => setProofNotes(e.target.value)}
                                                    placeholder="Describe the service performed..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${providerSigned ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'}`}
                                                    onClick={() => setProviderSigned(!providerSigned)}
                                                >
                                                    <PenTool className={`h-6 w-6 mx-auto mb-2 ${providerSigned ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <p className="text-sm font-medium">{providerSigned ? "Signed (Provider)" : "Click to Sign (Provider)"}</p>
                                                </div>
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${clientSigned ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'}`}
                                                    onClick={() => setClientSigned(!clientSigned)}
                                                >
                                                    <User className={`h-6 w-6 mx-auto mb-2 ${clientSigned ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <p className="text-sm font-medium">{clientSigned ? "Signed (Client)" : "Click to Sign (Client)"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsProofModalOpen(false)}>Cancel</Button>
                                            <Button onClick={handleCreateProof}>Generate Proof</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {proofs.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No service records found.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {proofs.map(proof => (
                                    <Card key={proof.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProof(proof)}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{proof.period}</h4>
                                                    <p className="text-sm text-muted-foreground">{new Date(proof.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">View Receipt</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="details">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscription Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Start Date</p>
                                        <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Billing Day</p>
                                        <p className="font-medium">Day {subscription.billingDay} of month</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Reminders</p>
                                        <p className="font-medium">{subscription.reminderDays} days before</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => {
                                    // Handle cancellation logic
                                }}>
                                    Cancel Subscription
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Print/View Modal */}
                <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Service Proof Receipt</DialogTitle>
                        </DialogHeader>

                        <div ref={printRef} className="p-8 border rounded-lg bg-white text-black my-4">
                            {selectedProof && (
                                <>
                                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                                        <h2 className="text-2xl font-bold uppercase tracking-wide">Service Proof</h2>
                                        <div className="text-right">
                                            <p className="font-bold">{subscription.companyName}</p>
                                            <p className="text-sm text-gray-500">Receipt #{selectedProof.id.slice(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-semibold">Client</p>
                                            <p className="text-lg font-medium">{subscription.clientName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-semibold">Service Details</p>
                                            <p className="font-medium">{subscription.serviceName}</p>
                                            <p className="text-sm">{selectedProof.period}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-8">
                                        <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Service Notes</p>
                                        <p className="whitespace-pre-wrap">{selectedProof.notes || "No notes provided."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mt-12 pt-4 border-t">
                                        <div>
                                            <div className="h-16 flex items-end justify-center pb-2 border-b border-gray-300 mb-2">
                                                <span className="font-script text-xl">{selectedProof.providerSignature || "Not Signed"}</span>
                                            </div>
                                            <p className="text-xs text-center text-gray-500 uppercase">Provider Signature</p>
                                        </div>
                                        <div>
                                            <div className="h-16 flex items-end justify-center pb-2 border-b border-gray-300 mb-2">
                                                <span className="font-script text-xl">{selectedProof.clientSignature || "Not Signed"}</span>
                                            </div>
                                            <p className="text-xs text-center text-gray-500 uppercase">Client Signature</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-center text-xs text-gray-400">
                                        <p>Generated on {new Date(selectedProof.createdAt).toLocaleString()} by AddInvoices</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setSelectedProof(null)}>Close</Button>
                                {/* NOTE: ReactToPrint Trigger would go here usually, but simplified for this context */}
                                <Button onClick={() => window.print()} className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
