"use client";

import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Mic,
    Loader2,
    ListFilter,
    FileText,
    ChevronLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { TemplateSelectionDialog } from "@/components/template-selection-dialog";
import Image from "next/image";

// --- TYPES ---

type Company = {
    id: number;
    name: string;
};

type Client = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    contact?: string;
};

type ContractType = "template" | "custom_full" | "custom_short";

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

// --- CONSTANTS ---

const CONTRACT_TEMPLATES = {
    custom_full: {
        title: "Service Agreement",
        content: {
            scope: "The Service Provider agrees to perform the following services:\n\n[Describe services here...]",
            paymentTerms: "The Client agrees to pay the Service Provider as follows:\n\nTotal Fee: $[Amount]\nPayment Schedule: [Date/Milestones]",
            duration: "This Agreement shall commence on [Start Date] and continue until [End Date] or completion of services.",
            termination: "Either party may terminate this Agreement with [Number] days written notice.",
            confidentiality: "Both parties agree to keep all proprietary information confidential.",
            ip: "All intellectual property created during the course of this Agreement shall belong to the Client upon full payment.",
            liability: "The Service Provider's liability shall be limited to the total amount paid under this Agreement.",
            notes: ""
        }
    },
    custom_short: {
        title: "Letter of Agreement",
        content: {
            scope: "Services to be provided: [Brief description]",
            paymentTerms: "Payment of $[Amount] is due on [Date].",
            duration: "Effective as of [Date].",
            termination: "Terminable by either party with written notice.",
            confidentiality: "Confidential information shall remain private.",
            ip: "",
            liability: "",
            notes: ""
        }
    }
};

// --- SPEECH RECOGNITION TYPES & SETUP ---

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
    onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

// Note: We don't need to declare Window.SpeechRecognition as it's already in lib.dom.d.ts
// We'll use type assertions for webkitSpeechRecognition when needed

// --- VOICE FLOW COMPONENT ---

const VOICE_STEPS = {
    TEMPLATE_SELECT: 0,
    FORMAT_SELECT: 1,
    CLIENT_SELECT: 2,
    SERVICE_SCOPE: 3,
    TOTAL_FEE: 4,
    PAYMENT_SCHEDULE: 5,
    START_DATE: 6,
    END_DATE: 7,
    TERMINATION_NOTICE: 8,
    CONFIRMATION: 9,
};

type VoiceContractData = {
    companyId?: number;
    companyName: string;
    clientId?: string;
    clientName: string;
    type: "custom_short" | "custom_full";
    serviceScope: string;
    totalFee: string;
    paymentSchedule: string;
    startDate: string;
    endDate: string;
    terminationNoticeDays: string;
};

function VoiceContractFlow({ onExit }: { onExit: () => void }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CompanyTemplate | null>(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAutoListening, setIsAutoListening] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState("Select a company template to start...");

    const [contractData, setContractData] = useState<VoiceContractData>({
        companyName: "",
        clientName: "",
        type: "custom_full",
        serviceScope: "",
        totalFee: "",
        paymentSchedule: "",
        startDate: "",
        endDate: "",
        terminationNoticeDays: "",
    });

    const [step, setStep] = useState(VOICE_STEPS.TEMPLATE_SELECT);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Load clients
    useEffect(() => {
        const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
        setClients(savedClients);
    }, []);

    // Init Speech
    useEffect(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognitionConstructor =
            window.SpeechRecognition ||
            (window as any).webkitSpeechRecognition ||
            null;
        if (SpeechRecognitionConstructor) {
            const recognition = new SpeechRecognitionConstructor();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            recognition.onstart = () => {
                setIsListening(true);
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            };
            recognition.onend = () => {
                setIsListening(false);
            };
            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const speakText = async (text: string) => {
        return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1;
            utterance.lang = "en-US";

            if (typeof window !== "undefined" && window.speechSynthesis) {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google US English") || v.name.includes("Samantha")));
                    if (preferredVoice) utterance.voice = preferredVoice;
                }
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                setIsAutoListening(true);
                setTimeout(() => {
                    if (recognitionRef.current && step > 0 && step < VOICE_STEPS.CONFIRMATION) {
                        try { recognitionRef.current.start(); } catch (e) { }
                    }
                }, 500);
                resolve();
            };
            utterance.onerror = () => { setIsSpeaking(false); resolve(); };

            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else {
                resolve();
            }
        });
    };

    const handleTemplateSelect = (template: CompanyTemplate | null) => {
        if (template) {
            setSelectedTemplate(template);
            setContractData(prev => ({ ...prev, companyId: template.id, companyName: template.name }));
            setShowTemplateDialog(false);
            setTimeout(() => startVoiceFlow(template.name), 500);
        } else {
            setSelectedTemplate({ name: "My Company" } as CompanyTemplate);
            setContractData(prev => ({ ...prev, companyName: "My Company" }));
            setShowTemplateDialog(false);
            setTimeout(() => startVoiceFlow("your company"), 500);
        }
    };

    const startVoiceFlow = async (companyName: string) => {
        setStep(VOICE_STEPS.FORMAT_SELECT);
        const greeting = `Selected ${companyName}. Do you want a Short or Complete contract format?`;
        setCurrentSubtitle(greeting);
        await speakText(greeting);
    };

    const startListening = () => {
        if (step === 0 || !recognitionRef.current) return;
        try { recognitionRef.current.start(); } catch (e) { }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsAutoListening(false);
        }
    };

    const processVoiceInput = async (transcript: string) => {
        const lowerTranscript = transcript.toLowerCase().trim();
        if (!transcript || transcript.length < 2) return;
        stopListening();

        switch (step) {
            case VOICE_STEPS.FORMAT_SELECT:
                if (lowerTranscript.includes("short")) {
                    setContractData(prev => ({ ...prev, type: "custom_short" }));
                    await nextStep(VOICE_STEPS.CLIENT_SELECT, "Short format selected. Who is the client? Name an existing client or a new one.");
                } else if (lowerTranscript.includes("complete") || lowerTranscript.includes("full")) {
                    setContractData(prev => ({ ...prev, type: "custom_full" }));
                    await nextStep(VOICE_STEPS.CLIENT_SELECT, "Complete format selected. Who is the client? Name an existing client or a new one.");
                } else {
                    await retryStep("Please say 'Short' or 'Complete'.");
                }
                break;
            case VOICE_STEPS.CLIENT_SELECT:
                const foundClient = clients.find(c => c.name.toLowerCase().includes(lowerTranscript));
                if (foundClient) {
                    setContractData(prev => ({ ...prev, clientName: foundClient.name, clientId: foundClient.id }));
                    await nextStep(VOICE_STEPS.SERVICE_SCOPE, `Using client ${foundClient.name}. What services will be provided? Describe them briefly.`);
                } else {
                    setContractData(prev => ({ ...prev, clientName: transcript }));
                    await nextStep(VOICE_STEPS.SERVICE_SCOPE, `I'll create a new client "${transcript}". What services will be provided? Describe them briefly.`);
                }
                break;
            case VOICE_STEPS.SERVICE_SCOPE:
                setContractData(prev => ({ ...prev, serviceScope: transcript }));
                await nextStep(VOICE_STEPS.TOTAL_FEE, "Got the services. What is the total fee amount?");
                break;
            case VOICE_STEPS.TOTAL_FEE:
                setContractData(prev => ({ ...prev, totalFee: transcript }));
                await nextStep(VOICE_STEPS.PAYMENT_SCHEDULE, "Fee recorded. What is the payment schedule? For example: '50% upon signing'.");
                break;
            case VOICE_STEPS.PAYMENT_SCHEDULE:
                setContractData(prev => ({ ...prev, paymentSchedule: transcript }));
                await nextStep(VOICE_STEPS.START_DATE, "Payment terms set. When does the contract start?");
                break;
            case VOICE_STEPS.START_DATE:
                setContractData(prev => ({ ...prev, startDate: transcript }));
                await nextStep(VOICE_STEPS.END_DATE, "Start date set. When does it end? Or say 'on completion'.");
                break;
            case VOICE_STEPS.END_DATE:
                setContractData(prev => ({ ...prev, endDate: transcript }));
                await nextStep(VOICE_STEPS.TERMINATION_NOTICE, "End date set. How many days written notice for termination?");
                break;
            case VOICE_STEPS.TERMINATION_NOTICE:
                const days = transcript.replace(/\D/g, "") || "30";
                setContractData(prev => ({ ...prev, terminationNoticeDays: days }));
                await nextStep(VOICE_STEPS.CONFIRMATION, `Okay, ${days} days notice. I'm creating the contract now.`);
                createContract({ ...contractData, terminationNoticeDays: days });
                break;
        }
    };

    const nextStep = async (nextStepId: number, prompt: string) => {
        setStep(nextStepId);
        setCurrentSubtitle(prompt);
        await speakText(prompt);
    };

    const retryStep = async (prompt: string) => {
        setCurrentSubtitle(prompt);
        await speakText(prompt);
    }

    const createContract = (data: VoiceContractData) => {
        // Save new client if needed
        let finalClientId = data.clientId;
        if (!finalClientId && data.clientName) {
            const newClient: Client = { id: Date.now().toString(), name: data.clientName };
            const updatedClients = [...clients, newClient];
            localStorage.setItem("clients", JSON.stringify(updatedClients));
            finalClientId = newClient.id;
        }

        const newContract = {
            id: Date.now().toString(),
            companyId: data.companyId,
            companyName: data.companyName,
            clientId: finalClientId,
            clientName: data.clientName,
            title: data.type === "custom_short" ? "Letter of Agreement" : "Service Agreement",
            type: data.type,
            status: "draft",
            content: {
                scope: `The Service Provider agrees to perform the following services:\n\n${data.serviceScope}`,
                paymentTerms: `The Client agrees to pay the Service Provider as follows:\n\nTotal Fee: ${data.totalFee}\nPayment Schedule: ${data.paymentSchedule}`,
                duration: `This Agreement shall commence on ${data.startDate} and continue until ${data.endDate}.`,
                termination: `Either party may terminate this Agreement with ${data.terminationNoticeDays} days written notice.`,
                confidentiality: `Both parties agree to keep all proprietary information confidential.`,
                ip: `All intellectual property created during the course of this Agreement shall belong to the Client upon full payment.`
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const existingContracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        localStorage.setItem("contracts", JSON.stringify([...existingContracts, newContract]));

        toast({ title: "Contract Created!", description: "Redirecting to editor..." });
        setTimeout(() => { router.push(`/contracts/${newContract.id}?edit=true`); }, 1500);
    };

    const stepRef = useRef(step);
    useEffect(() => { stepRef.current = step; }, [step]);

    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
                let isFinal = false;
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        isFinal = true;
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (isFinal && stepRef.current > 0 && stepRef.current < VOICE_STEPS.CONFIRMATION) {
                    await processVoiceInput(transcript);
                }
            };
        }
    });

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white overflow-hidden z-50">
            <TemplateSelectionDialog
                open={showTemplateDialog}
                onSelect={handleTemplateSelect}
                onOpenChange={(open) => {
                    if (!open && !selectedTemplate) onExit();
                    setShowTemplateDialog(open);
                }}
            />
            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
                <Button variant="ghost" size="icon" onClick={onExit} className="text-white hover:bg-white/10">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="text-sm text-slate-400">Voice Assistant</div>
            </div>
            {!showTemplateDialog && (
                <div className="flex flex-col items-center justify-center w-full max-w-2xl px-6 z-0">
                    <div className={`mb-10 transition-transform duration-500 ${isSpeaking ? "scale-110" : "scale-100"}`}>
                        <Image src="/images/adstrategic-icon.png" width={100} height={100} alt="AI" className="rounded-xl opacity-90 shadow-2xl" />
                    </div>
                    {(isListening || isSpeaking) && (
                        <div className="flex items-center gap-1 h-16 mb-8">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className={`w-2 rounded-full transition-all duration-200 ${isSpeaking ? "bg-cyan-400" : "bg-emerald-400"}`} style={{ height: isSpeaking || isListening ? `${Math.random() * 40 + 10}px` : "10px", animation: `wave 0.5s infinite ease-in-out ${i * 0.1}s` }} />
                            ))}
                        </div>
                    )}
                    <div className="text-center space-y-4 mb-12 min-h-[120px]">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{currentSubtitle}</h2>
                    </div>
                    <div className="relative">
                        {isListening && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />}
                        <Button size="lg" className={`h-20 w-20 rounded-full border-4 transition-all duration-300 ${isListening ? "bg-emerald-500 border-emerald-300 hover:bg-emerald-600" : "bg-slate-700 border-slate-600 hover:bg-slate-600"}`} onClick={isListening ? stopListening : startListening}>
                            <Mic className={`h-8 w-8 ${isListening ? "text-white" : "text-slate-300"}`} />
                        </Button>
                    </div>
                    <p className="mt-6 text-slate-500 text-sm">{isListening ? "Listening..." : "Tap to speak"}</p>
                </div>
            )}
            <style jsx global>{` @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } } `}</style>
        </div>
    );
}

// --- MANUAL FLOW COMPONENT ---

function ManualContractFlow({ switchToVoice }: { switchToVoice: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [selectedType, setSelectedType] = useState<ContractType | "">("");

    useEffect(() => {
        const savedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
        const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
        setCompanies(savedCompanies);
        setClients(savedClients);
        // Removed auto-selection to prevent stuck state

    }, []);

    const handleCreateContract = () => {
        setLoading(true);
        const company = companies.find(c => c.id.toString() === selectedCompanyId.toString());
        const client = clients.find(c => c.id === selectedClientId);
        const type = selectedType as keyof typeof CONTRACT_TEMPLATES;
        const template = CONTRACT_TEMPLATES[type] || CONTRACT_TEMPLATES.custom_full;

        const newContract = {
            id: Date.now().toString(),
            companyId: company?.id,
            companyName: company?.name || "My Company",
            clientId: selectedClientId,
            clientName: client?.name,
            title: template.title,
            type: type,
            status: 'draft',
            content: { ...template.content },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const existingContracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        localStorage.setItem("contracts", JSON.stringify([...existingContracts, newContract]));

        toast({ title: "Contract created", description: "Draft saved. Redirecting to editor..." });
        setTimeout(() => { router.push(`/contracts/${newContract.id}?edit=true`); }, 1000);
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">New Contract</h1>
                        <p className="text-muted-foreground">Follow the steps to create a new contract</p>
                    </div>
                    <div className="ml-auto">
                        <Button variant="outline" onClick={switchToVoice} className="gap-2">
                            <Mic className="h-4 w-4" /> Switch to Voice
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Step 1: Company */}
                    <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
                            <h2 className="text-xl font-semibold">Select Company</h2>
                        </div>
                        {step === 1 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <Select value={selectedCompanyId} onValueChange={(v) => { setSelectedCompanyId(v); setStep(2); }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}
                        {step > 1 && (
                            <div className="pl-11 text-muted-foreground">
                                {companies.find(c => c.id.toString() === selectedCompanyId)?.name}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Client */}
                    <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
                            <h2 className="text-xl font-semibold">Select Client</h2>
                        </div>
                        {step === 2 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <Select value={selectedClientId} onValueChange={(v) => { setSelectedClientId(v); setStep(3); }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-4 flex justify-between">
                                        <Button variant="ghost" onClick={() => { setStep(1); setSelectedCompanyId(""); }}>Back</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {step > 2 && (
                            <div className="pl-11 text-muted-foreground">
                                {clients.find(c => c.id === selectedClientId)?.name}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Type */}
                    <div className={`transition-opacity duration-300 ${step === 3 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
                            <h2 className="text-xl font-semibold">Select Contract Type</h2>
                        </div>
                        {step === 3 && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-11">
                                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedType === 'custom_full' ? 'border-primary ring-2 ring-primary/20' : ''}`} onClick={() => setSelectedType('custom_full')}>
                                    <CardHeader>
                                        <CardTitle>Full Contract</CardTitle>
                                        <CardDescription>Comprehensive service agreement.</CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedType === 'custom_short' ? 'border-primary ring-2 ring-primary/20' : ''}`} onClick={() => setSelectedType('custom_short')}>
                                    <CardHeader>
                                        <CardTitle>Short Agreement</CardTitle>
                                        <CardDescription>One-page simplified agreement.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        )}
                    </div>
                    {/* Action */}
                    {step === 3 && (
                        <div className="flex justify-end pt-8">
                            <Button variant="ghost" onClick={() => { setStep(2); setSelectedClientId(""); }} className="mr-4">Back</Button>
                            <Button size="lg" disabled={!selectedType || loading} onClick={handleCreateContract}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                Create Contract
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// --- MAIN PAGE ---

import { Suspense } from "react";

function NewContractContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    useEffect(() => {
        if (searchParams.get("mode") === "voice") {
            setIsVoiceMode(true);
        } else {
            setIsVoiceMode(false);
        }
    }, [searchParams]);

    const exitVoiceMode = () => {
        setIsVoiceMode(false);
        // Remove query param without triggering full reload if possible, or just push same path
        router.push("/contracts/new");
    };

    return isVoiceMode
        ? <VoiceContractFlow onExit={exitVoiceMode} />
        : <ManualContractFlow switchToVoice={() => {
            setIsVoiceMode(true);
            router.push("/contracts/new?mode=voice"); // Optional update URL
        }} />;
}

export default function NewContractPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <NewContractContent />
        </Suspense>
    );
}
