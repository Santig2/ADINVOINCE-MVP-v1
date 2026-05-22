"use client";

import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, MessageSquare, Send, Sparkles, HelpCircle, GraduationCap } from "lucide-react";
import { useTour } from "@/components/tour/TourContext";
import { TourSelectionModal } from "@/components/tour/TourSelectionModal";
import { motion, AnimatePresence } from "framer-motion";

// Types for Chat
type Message = {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: Date;
};

// Mock Video Data
const TUTORIALS = [
    {
        id: 1,
        title: "How to create an invoice by voice",
        duration: "2:30",
        thumbnail: "/images/tutorials/voice-invoice.jpg",
    },
    {
        id: 2,
        title: "Managing multiple companies",
        duration: "1:45",
        thumbnail: "/images/tutorials/companies.jpg",
    },
    {
        id: 3,
        title: "Tracking payments & receipts",
        duration: "3:10",
        thumbnail: "/images/tutorials/payments.jpg",
    },
];

// Simple Chatbot Logic
const QA_DB: Record<string, string> = {
    "invoice": "To create an invoice, click the '+' button on the dashboard or go to the Invoices page. You can also use 'Invoice by Voice' to dictate it!",
    "voice": "Our Voice features allow you to create invoices, add expenses, and manage your catalog just by speaking. Look for the microphone icon in relevant sections.",
    "payment": "Payments are tracked in the Payments module. You can mark invoices as paid manually or connect Stripe for automatic processing.",
    "product": "Add products in the Catalog section. Once added, they will auto-complete when you type their name in an invoice.",
    "company": "You can manage multiple companies in Configuration > Company Settings.",
    "hello": "Hi there! I'm here to help you use AddInvoices. Ask me anything about creating invoices, payments, or voice features.",
    "help": "I can help with Invoices, Payments, Products, specific Voice commands, and Company settings. What do you need to know?",
};

function findAnswer(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Check for keywords
    for (const [key, answer] of Object.entries(QA_DB)) {
        if (lowerQuery.includes(key)) return answer;
    }

    return "I'm not sure about that yet, but I'm learning! You can try asking about 'invoices', 'payments', or 'voice features'.";
}

export default function AskMeHowPage() {
    const { startTour } = useTour();

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "bot",
            text: "Hi! I'm your AddInvoices assistant. Ask me anything, or type 'help' to see what I can do.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [tourModalOpen, setTourModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate bot delay
        setTimeout(() => {
            const answer = findAnswer(userMsg.text);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: answer,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Ask Me How</h1>
                        <p className="text-muted-foreground mt-1">Learn how to make the most of AddInvoices</p>
                    </div>
                    <Button onClick={() => setTourModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all">
                        <PlayCircle className="mr-2 h-4 w-4" /> Start Guided Tour
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Tutorials & Guides */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Section 1: Quick Access to Tour (Card) */}
                        <Card className="bg-gradient-to-r from-primary/10 via-transparent to-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    New to AddInvoices?
                                </CardTitle>
                                <CardDescription>
                                    Take a quick interactive tour to see where everything is.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button variant="outline" onClick={() => setTourModalOpen(true)} className="w-full sm:w-auto border-primary/50 text-foreground hover:bg-primary/10">
                                    Restart Onboarding Tour
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Section 2: Video Tutorials */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <PlayCircle className="h-5 w-5 text-primary" />
                                Video Tutorials
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {TUTORIALS.map(tutorial => (
                                    <Card key={tutorial.id} className="overflow-hidden hover:shadow-md transition-all group cursor-pointer border-border/60">
                                        <div className="aspect-video bg-secondary/50 relative flex items-center justify-center group-hover:bg-secondary/70 transition-colors">
                                            <PlayCircle className="h-12 w-12 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {tutorial.duration}
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{tutorial.title}</h3>
                                        </CardContent>
                                    </Card>
                                ))}
                                {/* Placeholder for "Coming Soon" */}
                                <Card className="border-dashed border-border flex flex-col items-center justify-center p-6 text-center h-full min-h-[160px]">
                                    <p className="text-muted-foreground text-sm">More tutorials coming soon!</p>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chatbot */}
                    <div className="lg:col-span-1 h-full">
                        <Card className="h-[600px] flex flex-col border-border shadow-sm">
                            <CardHeader className="border-b border-border bg-secondary/20 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    Help Assistant
                                </CardTitle>
                                <CardDescription>
                                    Get instant answers to your questions
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden relative">
                                <ScrollArea className="h-full p-4" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === "user"
                                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                                        : "bg-secondary text-secondary-foreground rounded-bl-none"
                                                        }`}
                                                >
                                                    <p>{msg.text}</p>
                                                    <p className="text-[10px] opacity-70 mt-1 text-right">
                                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            <CardFooter className="p-3 border-t border-border bg-background">
                                <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                                    <Input
                                        placeholder="Type a question..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="flex-1 focus-visible:ring-primary"
                                    />
                                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Tour Selection Modal */}
            <TourSelectionModal
                open={tourModalOpen}
                onOpenChange={setTourModalOpen}
                onSelectTour={startTour}
            />
        </AppLayout>
    );
}
