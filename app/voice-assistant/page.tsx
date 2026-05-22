"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic, ArrowLeft, Keyboard, Settings2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptic } from "@/hooks/use-haptic";

export default function VoiceAssistantPage() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const router = useRouter();
    const { triggerHaptic } = useHaptic();

    // Mock transcript for demo purposes
    useEffect(() => {
        let interval: any;
        if (isListening) {
            triggerHaptic("heavy");
            const phrases = [
                "Listening...",
                "Create an invoice...",
                "Create an invoice for...",
                "Create an invoice for John Doe...",
                "Create an invoice for John Doe for $500."
            ];
            let i = 0;
            interval = setInterval(() => {
                setTranscript(phrases[i]);
                i++;
                if (i >= phrases.length) clearInterval(interval);
            }, 1200);
        } else {
            if (transcript) triggerHaptic("success");
            setTranscript("");
        }
        return () => clearInterval(interval);
    }, [isListening, triggerHaptic]);

    return (
        <div className="flex-1 w-full min-h-screen bg-[#020817] text-white relative flex flex-col items-center justify-between overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] mix-blend-screen" />
                {isListening && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 inset-x-0 h-[60%] bg-gradient-to-t from-primary/30 to-transparent blur-3xl pointer-events-none" 
                    />
                )}
            </div>

            {/* Header */}
            <div className="w-full flex items-center justify-between p-4 z-10">
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-full p-2 h-12 w-12"
                    onClick={() => { triggerHaptic("light"); router.push("/?mode=dashboard"); }}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-white/80">AI Active</span>
                </div>
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-full p-2 h-12 w-12"
                >
                    <Settings2 className="h-6 w-6" />
                </Button>
            </div>

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl px-6 text-center z-10 mt-[-10vh]">
                <AnimatePresence mode="wait">
                    {!isListening ? (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                                <Image src="/images/logotipoaddinvoces.png" alt="AddInvoices AI" width={96} height={96} className="relative z-10" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 tracking-tight">
                                How can I help you?
                            </h1>
                            <p className="text-white/50 text-lg max-w-md mx-auto font-medium">
                                Try saying: "Create a new invoice for John Doe"
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="listening"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center w-full"
                        >
                            <div className="h-32 flex flex-col justify-end mb-8 w-full">
                                <p className="text-2xl sm:text-3xl font-medium leading-tight text-white/90">
                                    {transcript || "Listening..."}
                                </p>
                            </div>
                            
                            {/* Sound wave animation */}
                            <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-[200px] mx-auto">
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 rounded-full bg-primary"
                                        animate={{
                                            height: [
                                                "10px", 
                                                `${20 + Math.random() * 50}px`, 
                                                `${10 + Math.random() * 20}px`
                                            ],
                                        }}
                                        transition={{
                                            duration: 0.5 + Math.random() * 0.5,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut",
                                            delay: i * 0.05
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="w-full pb-12 pt-6 flex flex-col items-center z-10">
                <div className="relative flex items-center justify-center w-full">
                    {/* Pulsing rings when listening */}
                    {isListening && (
                        <>
                            <motion.div 
                                className="absolute w-32 h-32 rounded-full border border-primary/40"
                                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            />
                            <motion.div 
                                className="absolute w-32 h-32 rounded-full border border-primary/20"
                                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                            />
                        </>
                    )}

                    <Button
                        onClick={() => setIsListening(!isListening)}
                        className={`rounded-full shadow-2xl transition-all duration-300 w-24 h-24 relative z-10 flex items-center justify-center
                            ${isListening 
                                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)]' 
                                : 'bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary),0.4)]'
                            }`}
                    >
                        {isListening ? (
                            <div className="w-6 h-6 bg-white rounded-sm" />
                        ) : (
                            <Mic className="h-10 w-10 text-primary-foreground" />
                        )}
                    </Button>
                </div>
                
                <Button variant="ghost" className="mt-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full gap-2">
                    <Keyboard className="h-4 w-4" />
                    Type instead
                </Button>
            </div>
        </div>
    );
}
