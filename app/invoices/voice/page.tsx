"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Mic, Square, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { TemplateSelectionDialog } from "@/components/template-selection-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Speech Recognition types
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
  defaultRemarks?: string;
  defaultTerms?: string;
};

interface InvoiceData {
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
  }>;
  notes: string;
  terms: string;
}

export default function InvoiceByVoicePage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<CompanyTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoListening, setIsAutoListening] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(
    "Click the microphone to start speaking..."
  );
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pendingAction, setPendingAction] = useState<"send" | "draft" | null>(
    null
  );
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [],
    notes: "",
    terms: "",
  });
  const [conversationStep, setConversationStep] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
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
          if (recognitionRef.current && conversationStep > 0) {
            recognitionRef.current.start();
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

  const handleTemplateSelect = (template: CompanyTemplate | null) => {
    if (template) {
      setSelectedTemplate(template);
      setInvoiceData((prev) => ({
        ...prev,
        notes: template.defaultRemarks || "",
        terms: template.defaultTerms || "",
      }));
      setShowTemplateDialog(false);
      setShowInstructions(true);
    } else {
      toast({
        title: "Template required",
        description: "Please select a company template to continue",
        variant: "destructive",
      });
    }
  };

  const handleStartInvoice = () => {
    setShowInstructions(false);
    initializeConversation();
  };

  const initializeConversation = async () => {
    const greetings = [
      `Hi! Let's create an invoice for ${selectedTemplate?.name}. What's the client's name?`,
      `Hello! Ready to invoice for ${selectedTemplate?.name}. Who is the client?`,
      `Hey! I can help you with an invoice for ${selectedTemplate?.name}. What's the client name?`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    setCurrentSubtitle(greeting);
    await speakText(greeting);
    setConversationStep(1);
  };

  const startListening = () => {
    if (conversationStep === 0) {
      return; // Don't start if not initialized (waiting for template/instructions)
    }

    if (!recognitionRef.current) return;

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

    recognitionRef.current.start();
  };

  const processVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: transcript },
    ]);

    if (!transcript || transcript.length < 2) {
      const retry = "I didn't catch that. Could you say it again?";
      setCurrentSubtitle(retry);
      await speakText(retry);
      return;
    }

    let aiResponse = "";

    switch (conversationStep) {
      case 1: // Client Name
        setInvoiceData((prev) => ({ ...prev, clientName: transcript }));
        const clientAcks = [
          `Okay, ${transcript}. What is the invoice number?`,
          `Got it, ${transcript}. What invoice number should I use?`,
          `Client is ${transcript}. And the invoice number?`,
        ];
        aiResponse = clientAcks[Math.floor(Math.random() * clientAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(2);
        break;

      case 2: // Invoice Number
        setInvoiceData((prev) => ({ ...prev, invoiceNumber: transcript }));
        const numAcks = [
          `Invoice ${transcript}. Now, tell me what item you are billing for.`,
          `Number ${transcript} set. What's the service or product description?`,
          `Okay, ${transcript}. What are we adding to this invoice?`,
        ];
        aiResponse = numAcks[Math.floor(Math.random() * numAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(3);
        break;

      case 3: // Item Description
        const itemDescription = transcript;
        setInvoiceData((prev) => ({
          ...prev,
          items: [
            {
              description: itemDescription,
              quantity: 1,
              unitPrice: 0,
              tax: 0,
            },
          ],
        }));
        const itemAcks = [
          `"${itemDescription}" added. How many units?`,
          `Okay, "${itemDescription}". What is the quantity?`,
          `Got "${itemDescription}". How many?`,
        ];
        aiResponse = itemAcks[Math.floor(Math.random() * itemAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(4);
        break;

      case 4: // Quantity
        const quantity = parseInt(lowerTranscript.replace(/[^\d]/g, "")) || 1;
        setInvoiceData((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === 0 ? { ...item, quantity } : item
          ),
        }));
        const qtyAcks = [
          `${quantity} units. What is the price per unit?`,
          `Quantity set to ${quantity}. What's the unit price?`,
          `Okay, ${quantity}. How much does each cost?`,
        ];
        aiResponse = qtyAcks[Math.floor(Math.random() * qtyAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(5);
        break;

      case 5: // Price
        const price = parseFloat(lowerTranscript.replace(/[^\d.]/g, "")) || 0;
        setInvoiceData((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === 0 ? { ...item, unitPrice: price } : item
          ),
        }));
        const priceAcks = [
          `$${price} per unit. Any tax percentage?`,
          `Price is $${price}. What tax rate should apply?`,
          `Okay, $${price}. Tax percentage?`,
        ];
        aiResponse = priceAcks[Math.floor(Math.random() * priceAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(6);
        break;

      case 6: // Tax
        const tax = parseFloat(lowerTranscript.replace(/[^\d.]/g, "")) || 0;
        setInvoiceData((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === 0 ? { ...item, tax } : item
          ),
        }));
        const taxAcks = [
          `${tax}% tax. Any special notes for this invoice?`,
          `Tax set to ${tax}%. Do you want to add any notes?`,
          `Okay, ${tax}%. Any additional notes?`,
        ];
        aiResponse = taxAcks[Math.floor(Math.random() * taxAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(7);
        break;

      case 7: // Notes
        const notes = lowerTranscript.includes("no") || lowerTranscript.includes("none") ? invoiceData.notes : transcript;
        setInvoiceData((prev) => ({ ...prev, notes }));

        const finalAcks = [
          "Perfect! Would you like to 'send' this invoice or save it as a 'draft'? You can also say 'edit remarks' or 'edit terms'.",
          "All done! Say 'send' to email it or 'draft' to save it. You can also 'change terms' or 'edit remarks'.",
          "Great! Do you want to 'send' or save as 'draft'? Say 'edit terms' if you need to update them.",
        ];
        aiResponse = finalAcks[Math.floor(Math.random() * finalAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(8);
        break;

      case 8: // Action (Send/Draft/Edit Remarks/Edit Terms)
        if (lowerTranscript.includes("send")) {
          setPendingAction("send");
          setShowEmailConfirmation(true);
          const sendMsg = "Okay, I'll need the client's email. Please type it in the box.";
          setCurrentSubtitle(sendMsg);
          await speakText(sendMsg);
        } else if (lowerTranscript.includes("draft")) {
          setPendingAction("draft");
          setShowEmailConfirmation(true); // Still ask for email for draft association if needed, or just save
          const draftMsg = "Okay, saving as draft. Please confirm the client email.";
          setCurrentSubtitle(draftMsg);
          await speakText(draftMsg);
        } else if (lowerTranscript.includes("remark") || lowerTranscript.includes("note")) {
          const msg = "What should the new remarks be?";
          setCurrentSubtitle(msg);
          await speakText(msg);
          setConversationStep(9);
        } else if (lowerTranscript.includes("term") || lowerTranscript.includes("condition")) {
          const msg = "What should the new terms be?";
          setCurrentSubtitle(msg);
          await speakText(msg);
          setConversationStep(10);
        } else {
          const retry = "Please say 'send', 'draft', 'edit remarks', or 'edit terms'.";
          setCurrentSubtitle(retry);
          await speakText(retry);
        }
        break;

      case 9: // Edit Remarks
        setInvoiceData((prev) => ({ ...prev, notes: transcript }));
        const remarkMsg = "Remarks updated. Should I send or draft it now?";
        setCurrentSubtitle(remarkMsg);
        await speakText(remarkMsg);
        setConversationStep(8);
        break;

      case 10: // Edit Terms
        setInvoiceData((prev) => ({ ...prev, terms: transcript }));
        const termMsg = "Terms updated. Should I send or draft it now?";
        setCurrentSubtitle(termMsg);
        await speakText(termMsg);
        setConversationStep(8);
        break;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailConfirm = async () => {
    if (!clientEmail.trim()) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!validateEmail(clientEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setShowEmailConfirmation(false);

    if (pendingAction === "send") {
      const confirmMsg = "Sending invoice now!";
      setCurrentSubtitle(confirmMsg);
      await speakText(confirmMsg);
      saveAndSendInvoice();
    } else if (pendingAction === "draft") {
      const confirmMsg = "Saving draft now!";
      setCurrentSubtitle(confirmMsg);
      await speakText(confirmMsg);
      saveDraftInvoice();
    }

    setTimeout(() => {
      router.push("/invoices");
    }, 3000);
  };

  const saveDraftInvoice = () => {
    if (!selectedTemplate) return;

    const invoiceDraft = {
      id: Date.now(),
      ...invoiceData,
      status: "draft",
      clientEmail,
      companyName: selectedTemplate.name,
      companyAddress: selectedTemplate.address,
      companyNIT: selectedTemplate.nit,
      companyEmail: selectedTemplate.email,
      companyPhone: selectedTemplate.phone,
      logo: selectedTemplate.logo,
      subtotal: invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      totalTax: invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.tax) / 100, 0),
      total: invoiceData.items.reduce((sum, item) => {
        const sub = item.quantity * item.unitPrice;
        return sum + sub + (sub * item.tax) / 100;
      }, 0),
      createdAt: new Date().toISOString(),
    };

    const existingDrafts = JSON.parse(localStorage.getItem("invoiceDrafts") || "[]");
    localStorage.setItem("invoiceDrafts", JSON.stringify([...existingDrafts, invoiceDraft]));

    toast({
      title: "Draft Saved",
      description: "Invoice draft has been saved successfully.",
    });
  };

  const saveAndSendInvoice = () => {
    if (!selectedTemplate) return;

    const emittedInvoice = {
      id: Date.now(),
      ...invoiceData,
      status: "issued",
      clientEmail,
      companyName: selectedTemplate.name,
      companyAddress: selectedTemplate.address,
      companyNIT: selectedTemplate.nit,
      companyEmail: selectedTemplate.email,
      companyPhone: selectedTemplate.phone,
      logo: selectedTemplate.logo,
      subtotal: invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      totalTax: invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.tax) / 100, 0),
      total: invoiceData.items.reduce((sum, item) => {
        const sub = item.quantity * item.unitPrice;
        return sum + sub + (sub * item.tax) / 100;
      }, 0),
      emittedAt: new Date().toISOString(),
    };

    const existingEmitted = JSON.parse(localStorage.getItem("emittedInvoices") || "[]");
    localStorage.setItem("emittedInvoices", JSON.stringify([...existingEmitted, emittedInvoice]));

    toast({
      title: "Invoice Sent",
      description: `Invoice sent to ${clientEmail}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <TemplateSelectionDialog
        open={showTemplateDialog}
        onSelect={handleTemplateSelect}
        onOpenChange={setShowTemplateDialog}
      />

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              How it works
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-center space-y-4">
              <p>
                I'll guide you through creating an invoice step by step. Just
                speak naturally!
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-left bg-slate-800 p-4 rounded-lg">
                <div>1. Client Name</div>
                <div>2. Invoice Number</div>
                <div>3. Item Description</div>
                <div>4. Quantity</div>
                <div>5. Price</div>
                <div>6. Tax %</div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                You can say "No" to skip optional fields like notes.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleStartInvoice}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              Start Creating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailConfirmation} onOpenChange={setShowEmailConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle>Confirm Email</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please enter the client's email address to {pendingAction} this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {emailError && (
                <p className="text-sm text-red-400">{emailError}</p>
              )}
            </div>
            <Button onClick={handleEmailConfirm} className="w-full">
              Confirm & {pendingAction === "send" ? "Send" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="absolute top-0 left-0 right-0 flex items-center gap-4 p-6 z-40">
        <Link href="/invoices">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full px-6">
        <div
          className={`mb-8 transition-all duration-300 ${isSpeaking ? "animate-pulse scale-110" : "scale-100"
            }`}
        >
          <Image
            src="/images/adstrategic-icon.png"
            alt="AdStrategic"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        {(isSpeaking || isListening) && (
          <div className="flex items-center justify-center gap-1 mb-8 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full ${isSpeaking ? "bg-cyan-400" : "bg-green-400"
                  }`}
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}px`,
                  animation: `wave 0.5s ease-in-out ${i * 0.05}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div className="mb-12 min-h-16 text-center max-w-2xl">
          <p className="text-2xl font-semibold text-white text-balance">
            {currentSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isListening ? (
            <Button
              onClick={() => {
                recognitionRef.current?.stop();
                setIsAutoListening(false);
              }}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse"
            >
              <div className="w-4 h-4 bg-white rounded-sm" />
            </Button>
          ) : (
            <Button
              onClick={startListening}
              disabled={showTemplateDialog || showInstructions}
              size="lg"
              className={`rounded-full w-16 h-16 transition-all duration-300 ${conversationStep === 0
                  ? "bg-white text-slate-900 hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                }`}
            >
              <Mic className="h-8 w-8" />
            </Button>
          )}
        </div>

        <p className="mt-8 text-slate-400 text-sm">
          {conversationStep === 0
            ? "Select a template to start"
            : isListening
              ? "Listening..."
              : "Tap to speak"}
        </p>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </div>
  );
}
