"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Mic, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Types (replicated for simplicity)
type SubscriptionStatus = 'active' | 'paused' | 'canceled';
type SubscriptionFrequency = 'monthly' | 'biweekly';

type Subscription = {
    id: string;
    clientId: number | string;
    clientName: string;
    companyId: number | string;
    companyName: string;
    serviceId: string;
    serviceName: string;
    frequency: SubscriptionFrequency;
    price: number;
    startDate: string;
    nextBillingDate: string;
    status: SubscriptionStatus;
    billingDay: number;
    reminderDays: number;
    createdAt: string;
    updatedAt: string;
};

type Client = {
    id: number;
    name: string;
    email?: string;
};

type Company = {
    id: number;
    name: string;
    logo?: string;
};

type Service = {
    id: string;
    name: string;
    price: number;
    companyId: number;
};

function CreateSubscriptionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Data Loading State
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    // Form State
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");

    const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly");
    const [price, setPrice] = useState<number>(0);
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [billingDay, setBillingDay] = useState<number>(new Date().getDate());
    const [reminderDays, setReminderDays] = useState<string>("3");
    const [status, setStatus] = useState<SubscriptionStatus>("active");

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState("");

    const isEditMode = searchParams.get("edit");
    const isVoiceMode = searchParams.get("mode") === "voice";

    useEffect(() => {
        // Load dependencies
        const loadData = () => {
            const loadedClients = JSON.parse(localStorage.getItem("clients") || "[]");
            const loadedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
            const loadedServices = JSON.parse(localStorage.getItem("catalogItems") || "[]");

            setClients(loadedClients);
            setCompanies(loadedCompanies);
            setServices(loadedServices);

            if (isEditMode) {
                const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
                const sub = subscriptions.find((s: Subscription) => s.id === isEditMode);
                if (sub) {
                    setSelectedCompanyId(sub.companyId.toString());
                    setSelectedClientId(sub.clientId.toString());
                    setSelectedServiceId(sub.serviceId);
                    setFrequency(sub.frequency);
                    setPrice(sub.price);
                    setStartDate(new Date(sub.startDate));
                    setBillingDay(sub.billingDay);
                    setReminderDays(sub.reminderDays.toString());
                    setStatus(sub.status);
                }
            } else if (isVoiceMode) {
                // Auto-start voice if requested
                setTimeout(() => handleVoiceInput(), 500);
            }

            setLoading(false);
        };

        loadData();
    }, [isEditMode, isVoiceMode]);

    // Update available services when company changes
    const availableServices = services.filter(
        s => !selectedCompanyId || s.companyId.toString() === selectedCompanyId
    );

    // Update price when service changes
    useEffect(() => {
        if (selectedServiceId) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service) {
                setPrice(service.price);
            }
        }
    }, [selectedServiceId, services]);

    const handleSave = () => {
        if (!selectedCompanyId || !selectedClientId || !selectedServiceId || !startDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        const client = clients.find(c => c.id.toString() === selectedClientId);
        const company = companies.find(c => c.id.toString() === selectedCompanyId);
        const service = services.find(s => s.id === selectedServiceId);

        if (!client || !company || !service) return;

        const newSubscription: Subscription = {
            id: isEditMode || crypto.randomUUID(),
            clientId: client.id,
            clientName: client.name,
            companyId: company.id,
            companyName: company.name,
            serviceId: service.id,
            serviceName: service.name,
            frequency,
            price,
            startDate: startDate.toISOString(),
            nextBillingDate: startDate.toISOString(), // Simplified logic
            status,
            billingDay,
            reminderDays: parseInt(reminderDays),
            createdAt: isEditMode ? (new Date()).toISOString() : (new Date()).toISOString(), // Should preserve created if edit
            updatedAt: (new Date()).toISOString(),
        };

        const existingSubscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");

        let updatedSubscriptions;
        if (isEditMode) {
            updatedSubscriptions = existingSubscriptions.map((s: Subscription) =>
                s.id === isEditMode ? { ...newSubscription, createdAt: s.createdAt } : s
            );
        } else {
            updatedSubscriptions = [newSubscription, ...existingSubscriptions];
        }

        localStorage.setItem("subscriptions", JSON.stringify(updatedSubscriptions));

        toast({
            title: isEditMode ? "Subscription Updated" : "Subscription Created",
            description: `Successfully ${isEditMode ? "updated" : "created"} subscription for ${client.name}.`,
        });

        router.push("/subscriptions");
    };

    const handleVoiceInput = () => {
        setIsListening(true);
        // Simulate voice recognition
        setTimeout(() => {
            // Mock simulation logic
            const randomClient = clients[0];
            const randomCompany = companies[0];
            const randomService = services.find(s => s.companyId === randomCompany?.id);

            if (randomClient && randomCompany && randomService) {
                setVoiceTranscript(`Create monthly subscription for ${randomClient.name} with ${randomCompany.name} service ${randomService.name}`);

                setTimeout(() => {
                    setSelectedCompanyId(randomCompany.id.toString());
                    setSelectedClientId(randomClient.id.toString());
                    setSelectedServiceId(randomService.id);
                    setFrequency("monthly");
                    setIsListening(false);
                    toast({
                        title: "Voice Command Recognized",
                        description: "Form filled based on voice input.",
                    });
                }, 1500);
            } else {
                setIsListening(false);
                setVoiceTranscript("Could not find matching entities.");
            }
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isEditMode ? "Edit Subscription" : "New Subscription"}</h1>
                    <p className="text-muted-foreground">Set up recurring services and billing.</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Details</CardTitle>
                        <CardDescription>Configure the subscription parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Voice Input Section */}
                        <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border">
                            <Button
                                variant={isListening ? "destructive" : "default"}
                                onClick={handleVoiceInput}
                                className="gap-2 shrink-0"
                            >
                                {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                                {isListening ? "Listening..." : "Fill with Voice"}
                            </Button>
                            <div className="text-sm text-muted-foreground italic flex-1 truncate">
                                {voiceTranscript || "Try saying: 'Create monthly subscription for Client Name...'"}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Company</Label>
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Client</Label>
                                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Service</Label>
                                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service from catalog" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableServices.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} - ${s.price}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select value={frequency} onValueChange={(v: SubscriptionFrequency) => setFrequency(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        className="pl-7"
                                        value={price}
                                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Billing Day (Monthly)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={billingDay}
                                    onChange={(e) => setBillingDay(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Reminders</Label>
                                <Select value={reminderDays} onValueChange={setReminderDays}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Day Before</SelectItem>
                                        <SelectItem value="3">3 Days Before</SelectItem>
                                        <SelectItem value="7">1 Week Before</SelectItem>
                                        <SelectItem value="0">No Reminder</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(v: SubscriptionStatus) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                        <SelectItem value="canceled">Canceled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button onClick={handleSave} className="gap-2">
                                <Save className="h-4 w-4" />
                                {isEditMode ? "Update Subscription" : "Create Subscription"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function NewSubscriptionPage() {
    return (
        <AppLayout>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
                <CreateSubscriptionContent />
            </Suspense>
        </AppLayout>
    );
}
