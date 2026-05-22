"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
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
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ClientByVoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoListening, setIsAutoListening] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(
    "Click the microphone to start speaking..."
  );
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    email: "",
    phone: "",
    address: "",
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

  const initializeConversation = async () => {
    const greetings = [
      "Hi! Let's add a new client. What is the client's name?",
      "Hello! Ready to add a client. Who are we adding today?",
      "Hey! I can help you add a client. What's their name?",
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    setCurrentSubtitle(greeting);
    await speakText(greeting);
    setConversationStep(1);
  };

  const startListening = () => {
    if (conversationStep === 0) {
      initializeConversation();
      return;
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
      case 1: // Name
        setClientData((prev) => ({ ...prev, name: transcript }));
        const nameAcks = [
          `Got it, ${transcript}. What is their email address?`,
          `Okay, ${transcript}. Please provide their email.`,
          `Name recorded. What's the email for ${transcript}?`,
        ];
        aiResponse = nameAcks[Math.floor(Math.random() * nameAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(2);
        break;

      case 2: // Email
        // Basic email cleanup/validation could go here, but voice email is tricky.
        // We'll just accept the transcript for now, maybe remove spaces.
        const email = lowerTranscript.replace(/\s/g, "").replace("at", "@").replace("dot", ".");
        setClientData((prev) => ({ ...prev, email: email }));
        const emailAcks = [
          `Email saved. What is their phone number?`,
          `Got the email. Now, what's the phone number?`,
          `Okay. Phone number?`,
        ];
        aiResponse = emailAcks[Math.floor(Math.random() * emailAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(3);
        break;

      case 3: // Phone
        setClientData((prev) => ({ ...prev, phone: transcript }));
        const phoneAcks = [
          `Phone number recorded. Finally, what is their address?`,
          `Got it. What's the client's address?`,
          `Okay. Address?`,
        ];
        aiResponse = phoneAcks[Math.floor(Math.random() * phoneAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        setConversationStep(4);
        break;

      case 4: // Address
        const address = lowerTranscript.includes("no") || lowerTranscript.includes("none") ? "" : transcript;
        setClientData((prev) => ({ ...prev, address }));
        
        const finalAcks = [
          "Perfect! I've added the new client. Redirecting you to the list now.",
          "All done! Client added. Taking you back to the clients page.",
          "Great! That's all recorded. Going back to clients.",
        ];
        aiResponse = finalAcks[Math.floor(Math.random() * finalAcks.length)];
        setCurrentSubtitle(aiResponse);
        await speakText(aiResponse);
        
        // Save and redirect
        saveClient({ ...clientData, address });
        setTimeout(() => {
            router.push("/clients");
        }, 3000);
        break;
    }
  };

  const saveClient = (data: ClientData) => {
    const newClient = {
      id: Date.now().toString(),
      ...data,
      totalInvoices: 0,
      totalAmount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("clients") || "[]");
    localStorage.setItem("clients", JSON.stringify([newClient, ...existing]));
    toast({
      title: "Client Added",
      description: `${data.name} has been successfully added.`,
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <div className="absolute top-0 left-0 right-0 flex items-center gap-4 p-6 z-40">
        <Link href="/clients">
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
          className={`mb-8 transition-all duration-300 ${
            isSpeaking ? "animate-pulse scale-110" : "scale-100"
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
                className={`w-1 rounded-full ${
                  isSpeaking ? "bg-cyan-400" : "bg-green-400"
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
              size="lg"
              className={`rounded-full w-16 h-16 transition-all duration-300 ${
                conversationStep === 0
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
            ? "Tap the microphone to start"
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
