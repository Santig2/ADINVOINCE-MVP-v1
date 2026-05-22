"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type VoiceQueryParams = {
    keyword?: string;
    minAmount?: number;
    maxAmount?: number;
    date?: string;
    company?: string;
};

interface VoiceSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSearch: (params: VoiceQueryParams) => void;
}

const SAMPLE_PHRASES = [
    "Find the Starbucks expense",
    "Show me expenses over $200",
    "Find office supplies from last month",
    "Search expenses for Uber",
    "Expenses under $50",
    "Show me expenses from January"
];

export function VoiceSearchModal({ open, onOpenChange, onSearch }: VoiceSearchModalProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [parsedIntent, setParsedIntent] = useState<VoiceQueryParams | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setTranscript("");
            setParsedIntent(null);
            setIsListening(false);
        }
    }, [open]);

    const toggleListening = () => {
        if (isListening) return;

        setIsListening(true);
        setTranscript("");
        setParsedIntent(null);

        // Simulate listening delay
        setTimeout(() => {
            setIsListening(false);
            // Pick a random phrase
            const randomPhrase = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)];
            setTranscript(randomPhrase);
            parseIntent(randomPhrase);
        }, 2000);
    };

    const parseIntent = (text: string) => {
        const params: VoiceQueryParams = {};
        const lowerText = text.toLowerCase();

        // Amount parsing
        const overMatch = lowerText.match(/(?:over|greater than|more than|>) \$?(\d+)/);
        const underMatch = lowerText.match(/(?:under|less than|<) \$?(\d+)/);

        if (overMatch) params.minAmount = parseInt(overMatch[1]);
        if (underMatch) params.maxAmount = parseInt(underMatch[1]);

        // Date parsing (basic)
        if (lowerText.includes("last month")) params.date = "last month";
        const monthMatch = lowerText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/);
        if (monthMatch) params.date = monthMatch[1];

        // specific case for "Company A" in prompt
        if (text.includes("Company A")) {
            params.company = "Company A";
        }

        // Clean text to extract keywords
        let cleanText = lowerText
            .replace(/(?:find|show|search|me|expenses|the|expense|list|get)/g, "")
            .replace(/(?:over|under|less than|more than) \$?\d+/g, "")
            .replace(/(?:from|for)/g, "") // remove prepositions
            .replace(/(?:january|february|march|april|may|june|july|august|september|october|november|december)/g, "")
            .replace("last month", "")
            .replace("Company A", "")
            .trim();

        // Remove extra spaces
        cleanText = cleanText.replace(/\s+/g, " ");

        if (cleanText.length > 0) {
            params.keyword = cleanText;
        }

        setParsedIntent(params);
    };

    const handleApply = () => {
        if (parsedIntent) {
            onSearch(parsedIntent);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background border-border">
                <DialogHeader>
                    <DialogTitle>Find Expenses by Voice</DialogTitle>
                    <DialogDescription>
                        Tell me what expense you're looking for
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${isListening ? "bg-primary/20 scale-110" : "bg-primary/10 hover:bg-primary/20"}`}>
                        {isListening && (
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-full h-full rounded-full"
                            onClick={toggleListening}
                        >
                            <Mic className={`h-10 w-10 ${isListening ? "text-primary animate-pulse" : "text-primary"}`} />
                        </Button>
                    </div>

                    <div className="w-full space-y-2">
                        <p className="text-sm font-medium text-muted-foreground ml-1">Transcript</p>
                        <div className="relative">
                            <Textarea
                                value={transcript}
                                onChange={(e) => {
                                    setTranscript(e.target.value);
                                }}
                                onBlur={() => parseIntent(transcript)}
                                placeholder="Click the mic or type here..."
                                className="min-h-[80px] resize-none pr-10"
                            />
                            {isListening && (
                                <div className="absolute right-3 top-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>

                    {parsedIntent && (
                        <div className="w-full bg-secondary/50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Searching expenses with:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {parsedIntent.keyword && (
                                    <Badge variant="outline" className="bg-background">Keyword: {parsedIntent.keyword}</Badge>
                                )}
                                {parsedIntent.minAmount !== undefined && (
                                    <Badge variant="outline" className="bg-background">Amount: &gt; ${parsedIntent.minAmount}</Badge>
                                )}
                                {parsedIntent.maxAmount !== undefined && (
                                    <Badge variant="outline" className="bg-background">Amount: &lt; ${parsedIntent.maxAmount}</Badge>
                                )}
                                {parsedIntent.date && (
                                    <Badge variant="outline" className="bg-background">Date: {parsedIntent.date}</Badge>
                                )}
                                {parsedIntent.company && (
                                    <Badge variant="outline" className="bg-background">Company: {parsedIntent.company}</Badge>
                                )}
                                {Object.keys(parsedIntent).length === 0 && (
                                    <span className="text-sm text-muted-foreground">No specific filters detected.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="w-full space-y-2">
                        <p className="text-xs text-muted-foreground text-center">Try saying:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {["Expenses over $100", "Starbucks from last month", "Office supplies"].map(phrase => (
                                <Badge
                                    key={phrase}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/80"
                                    onClick={() => {
                                        setTranscript(phrase);
                                        parseIntent(phrase);
                                    }}
                                >
                                    "{phrase}"
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                        setTranscript("");
                        setParsedIntent(null);
                    }}>
                        Clear
                    </Button>
                    <Button onClick={handleApply} disabled={!parsedIntent}>
                        Apply Search
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
