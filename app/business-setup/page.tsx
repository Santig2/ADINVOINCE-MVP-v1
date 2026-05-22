"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Keyboard, Upload, ArrowRight, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
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

declare global {
    interface Window {
        SpeechRecognition?: {
            new(): SpeechRecognition;
        };
        webkitSpeechRecognition?: {
            new(): SpeechRecognition;
        };
    }
}

interface BusinessData {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    taxRate: string;
    logoUrl: string | null;
    createdAt: string;
    nit: string;
    template: string;
    isDefault: boolean;
}

export default function BusinessSetupPage() {
    const [mode, setMode] = useState<"voice" | "manual">("voice");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAutoListening, setIsAutoListening] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState(
        "Before you start using AddInvoices, let's set up your business. This only takes a moment."
    );

    const [businessData, setBusinessData] = useState<BusinessData>({
        id: Date.now(),
        name: "",
        email: "",
        phone: "",
        address: "",
        currency: "USD",
        taxRate: "0",
        logoUrl: null,
        createdAt: new Date().toISOString(),
        nit: "",
        template: "default",
        isDefault: true,
    });

    const [conversationStep, setConversationStep] = useState(0);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const router = useRouter();

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
                if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                }
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
            if (mode !== "voice") {
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.lang = "en-US";

            if (typeof window !== "undefined" && window.speechSynthesis) {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    const preferredVoice = voices.find(
                        (voice) =>
                            voice.lang.startsWith("en") &&
                            (voice.name.includes("Samantha") ||
                                voice.name.includes("Victoria") ||
                                voice.name.includes("Google UK English Female"))
                    );
                    if (preferredVoice) {
                        utterance.voice = preferredVoice;
                    }
                }
            }

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsAutoListening(true);
                setTimeout(() => {
                    if (recognitionRef.current && conversationStep > 0 && mode === "voice") {
                        try { recognitionRef.current.start(); } catch (e) { }
                    }
                }, 800);
                resolve();
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                resolve();
            };

            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else {
                resolve();
            }
        });
    };

    const startListening = async () => {
        if (conversationStep === 0) {
            setConversationStep(1);
            const greeting = "What's the name of your business?";
            setCurrentSubtitle(greeting);
            await speakText(greeting);
            return;
        }

        if (!recognitionRef.current) {
            setMode("manual");
            toast({ title: "Speech Recognition Unavailable", description: "Falling back to manual setup." });
            return;
        }

        recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
            let isFinal = false;
            const transcript = Array.from(event.results)
                .map((result: SpeechRecognitionResult) => {
                    if (result.isFinal) isFinal = true;
                    return result.item(0)?.transcript || result[0]?.transcript || "";
                })
                .join("");

            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            if (isFinal) {
                silenceTimeoutRef.current = setTimeout(() => {
                    if (recognitionRef.current) {
                        recognitionRef.current.stop();
                        setIsAutoListening(false);
                    }
                }, 500);

                await processVoiceInput(transcript);
            }
        };

        try { recognitionRef.current.start(); } catch (e) { }
    };

    const processVoiceInput = async (transcript: string) => {
        const lowerTranscript = transcript.toLowerCase().trim();

        if (!transcript || transcript.length < 2) {
            const retry = "I didn't catch that. Could you say it again?";
            setCurrentSubtitle(retry);
            await speakText(retry);
            return;
        }

        let aiResponse = "";

        switch (conversationStep) {
            case 1: // Name
                setBusinessData((prev) => ({ ...prev, name: transcript }));
                aiResponse = `Great name! What email do you use for your business invoices?`;
                setCurrentSubtitle(aiResponse);
                await speakText(aiResponse);
                setConversationStep(2);
                break;

            case 2: // Email
                const email = transcript.replace(/\s+/g, "").toLowerCase().replace("at", "@").replace("dot", ".");
                setBusinessData((prev) => ({ ...prev, email }));
                aiResponse = `Got it. What's your business phone number?`;
                setCurrentSubtitle(aiResponse);
                await speakText(aiResponse);
                setConversationStep(3);
                break;

            case 3: // Phone
                setBusinessData((prev) => ({ ...prev, phone: transcript }));
                aiResponse = `And what is your business address?`;
                setCurrentSubtitle(aiResponse);
                await speakText(aiResponse);
                setConversationStep(4);
                break;

            case 4: // Address
                setBusinessData((prev) => ({ ...prev, address: transcript }));
                aiResponse = `Address saved. Would you like to upload your business logo now? Say yes to select a file, or no to skip.`;
                setCurrentSubtitle(aiResponse);
                await speakText(aiResponse);
                setConversationStep(5);
                break;

            case 5: // Logo
                if (lowerTranscript.includes("yes") || lowerTranscript.includes("yeah") || lowerTranscript.includes("sure")) {
                    setMode("manual");
                    setConversationStep(6);
                    setCurrentSubtitle("Please click the upload button to add your logo.");
                } else {
                    handleCompleteVoice();
                }
                break;
        }
    };

    const handleCompleteVoice = async () => {
        const bye = "Perfect, your business is all set up. Taking you to the dashboard!";
        setCurrentSubtitle(bye);
        await speakText(bye);
        handleComplete();
    };

    const handleComplete = () => {
        // Validate
        if (!businessData.name || businessData.name.length < 2) {
            toast({ title: "Validation Error", description: "Business name must be at least 2 characters.", variant: "destructive" });
            return;
        }

        const { id, name, email, phone, address, logoUrl, createdAt, nit, template, isDefault } = businessData;
        const companyConfig = { id, name, email, phone, address, logo: logoUrl, createdAt, nit, template, isDefault };

        localStorage.setItem("companies", JSON.stringify([companyConfig]));
        localStorage.setItem("businessSetupCompleted", "true");
        localStorage.removeItem("tourCompleted"); // Trigger guide tour

        toast({ title: "Business Setup Complete", description: "Taking you to the dashboard..." });
        setTimeout(() => {
            router.push("/");
        }, 1500);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusinessData({ ...businessData, logoUrl: reader.result as string });
                toast({ title: "Logo uploaded", description: "Your business logo has been saved." });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen inset-0 transition-colors duration-500 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative ${mode === "voice" ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" : "bg-background text-foreground"}`}>

            {mode === "voice" ? (
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl px-4 text-center">

                    <div className={`mb-12 transition-all duration-300 ${isSpeaking ? "animate-pulse scale-110" : "scale-100"}`}>
                        <Image src="/images/adstrategic-icon.png" alt="AdStrategic Flow" width={100} height={100} className="mx-auto drop-shadow-lg" />
                    </div>

                    {(isSpeaking || isListening) && (
                        <div className="flex items-center justify-center gap-1 mb-8 h-12">
                            {[...Array(15)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1 rounded-full ${isSpeaking ? "bg-cyan-400" : "bg-green-400"}`}
                                    style={{
                                        height: `${15 + Math.sin(i * 0.5) * 15}px`,
                                        animation: `wave 0.5s ease-in-out ${i * 0.05}s infinite`,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mb-12 min-h-[4rem]">
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight max-w-xl mx-auto drop-shadow-md">
                            {currentSubtitle}
                        </h1>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {isListening ? (
                            <Button
                                onClick={() => {
                                    recognitionRef.current?.stop();
                                    setIsAutoListening(false);
                                }}
                                size="lg"
                                className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse"
                            >
                                <div className="w-5 h-5 bg-white rounded-sm" />
                            </Button>
                        ) : (
                            <Button
                                onClick={startListening}
                                size="lg"
                                className={`rounded-full shadow-xl transition-all duration-300 ${conversationStep === 0
                                    ? "px-8 py-4 h-auto bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg"
                                    : "w-20 h-20 bg-green-500 hover:bg-green-600 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                                    }`}
                            >
                                {conversationStep === 0 ? "Start with Voice" : <Mic className="h-8 w-8" />}
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            className="text-slate-300 hover:text-white"
                            onClick={() => {
                                window.speechSynthesis.cancel();
                                setMode("manual");
                            }}
                        >
                            <Keyboard className="h-4 w-4 mr-2" />
                            Type Instead
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-card border shadow-xl rounded-xl p-6 sm:p-10 relative">
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="sm" onClick={() => setMode("voice")}>
                            <Mic className="h-4 w-4 mr-2" /> Use Voice
                        </Button>
                    </div>
                    <div className="mb-8 text-center sm:text-left mt-6 sm:mt-0">
                        <h2 className="text-3xl font-bold text-foreground">Business Setup</h2>
                        <p className="text-muted-foreground mt-2">Enter your details to configure your invoice workspace.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Business Name *</Label>
                                <Input
                                    placeholder="e.g. Acme Corp"
                                    value={businessData.name}
                                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Email</Label>
                                <Input
                                    type="email"
                                    placeholder="hello@acme.com"
                                    value={businessData.email}
                                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    value={businessData.phone}
                                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={businessData.taxRate}
                                    onChange={(e) => setBusinessData({ ...businessData, taxRate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Business Address</Label>
                            <Input
                                placeholder="123 Main St, City, ST 12345"
                                value={businessData.address}
                                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Business Identity</Label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 border border-dashed rounded-lg p-4">
                                <div className="h-16 w-16 mb-2 sm:mb-0 rounded-md bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                    {businessData.logoUrl ? (
                                        <img src={businessData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <Label htmlFor="logo-upload" className="cursor-pointer">
                                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Logo
                                        </span>
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-2">PNG or JPG, under 2MB recommended.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                            <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-foreground" onClick={() => handleComplete()}>Skip Logo & Finish</Button>
                            <Button className="w-full sm:w-auto font-semibold px-8" onClick={handleComplete}>
                                Save Details <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
        </div>
    );
}
