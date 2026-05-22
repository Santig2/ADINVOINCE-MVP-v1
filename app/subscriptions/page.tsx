"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    CalendarClock,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Mic,
    Building2,
    User,
    CheckCircle,
    PauseCircle,
    XCircle,
    Clock,
    Calendar
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SwipeableItem } from "@/components/ui/swipeable-item";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
export type SubscriptionStatus = 'active' | 'paused' | 'canceled';
export type SubscriptionFrequency = 'monthly' | 'biweekly';

export type Subscription = {
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

const statusConfig = {
    active: {
        label: "Active",
        className: "bg-green-500/20 text-green-600 hover:bg-green-500/30",
        icon: CheckCircle,
    },
    paused: {
        label: "Paused",
        className: "bg-amber-500/20 text-amber-600 hover:bg-amber-500/30",
        icon: PauseCircle,
    },
    canceled: {
        label: "Canceled",
        className: "bg-red-500/20 text-red-600 hover:bg-red-500/30",
        icon: XCircle,
    },
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = () => {
        const savedSubscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
        // Sort by updated at, newest first
        const sorted = savedSubscriptions.sort((a: Subscription, b: Subscription) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setSubscriptions(sorted);
    };

    const filteredSubscriptions = subscriptions.filter((sub) => {
        const matchesSearch =
            sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || sub.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.status === "active").length,
        paused: subscriptions.filter((s) => s.status === "paused").length,
        canceled: subscriptions.filter((s) => s.status === "canceled").length,
    };

    const handleDelete = (id: string) => {
        const updated = subscriptions.filter((s) => s.id !== id);
        localStorage.setItem("subscriptions", JSON.stringify(updated));
        setSubscriptions(updated);
        toast({
            title: "Subscription deleted",
            description: "The subscription has been permanently deleted.",
            variant: "destructive",
        });
    };

    const handleCreateByVoice = () => {
        // Navigate to new subscription page with voice mode active query param
        router.push("/subscriptions/new?mode=voice");
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-0 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-80px)] flex flex-col">
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 px-4 sm:px-0 pt-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                            Subscriptions
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage recurring services and automated billing
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            id="subscriptions-voice-btn"
                            size="lg"
                            variant="outline"
                            onClick={handleCreateByVoice}
                            className="flex-1 sm:flex-none gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-transparent"
                        >
                            <Mic className="h-5 w-5" />
                            Voice Command
                        </Button>
                        <Link href="/subscriptions/new" className="flex-1 sm:flex-none">
                            <Button
                                id="subscriptions-create-btn"
                                variant="accent"
                                size="lg"
                                className="gap-2 w-full transition-all duration-300"
                            >
                                <Plus className="h-5 w-5" />
                                Add Subscription
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Mobile Stats Hero */}
                <motion.div
                    className="mb-8 px-4 sm:px-0 text-center sm:text-left"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                        Total Subscriptions
                    </p>
                    <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
                        {stats.total}
                    </h2>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Active
                                    </CardTitle>
                                    <div className="p-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.active}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Paused
                                    </CardTitle>
                                    <div className="p-1.5 bg-amber-500/15 dark:bg-amber-500/20 rounded-lg ring-1 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                        <PauseCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.paused}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Canceled
                                    </CardTitle>
                                    <div className="p-1.5 bg-rose-500/15 dark:bg-rose-500/20 rounded-lg ring-1 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 drop-shadow-sm" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.canceled}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Overlapping Content Container */}
                <motion.div
                    className="flex-1 bg-card sm:bg-transparent rounded-t-[2.5rem] sm:rounded-none p-5 sm:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-none border-t border-border/50 sm:border-none"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subscriptions..."
                                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-secondary/50 border-transparent rounded-xl" id="subscriptions-filter">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div id="subscriptions-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
                        <div className="mb-4 sm:px-6 sm:pt-6">
                            <h3 className="text-lg font-bold text-foreground hidden sm:block">
                                All Subscriptions {filteredSubscriptions.length !== subscriptions.length && `(${filteredSubscriptions.length})`}
                            </h3>
                        </div>
                        <div className="sm:px-6 sm:pb-6">
                            {filteredSubscriptions.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-gradient-to-b from-background to-secondary/20 rounded-3xl border border-dashed border-primary/20 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5 border border-primary/10 relative">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                                        <CalendarClock className="h-10 w-10 text-primary" />
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">
                                        {subscriptions.length === 0 ? "No subscriptions yet" : "No subscriptions found"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-8 max-w-[250px] mx-auto">
                                        {subscriptions.length === 0
                                            ? "Create your first subscription to track recurring revenue."
                                            : "No subscriptions match your current filters."}
                                    </p>
                                    {subscriptions.length === 0 && (
                                        <Link href="/subscriptions/new">
                                            <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8 py-6 text-base">
                                                <Plus className="h-5 w-5" />
                                                Create your first subscription
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredSubscriptions.map((sub, index) => {
                                        const StatusIcon = statusConfig[sub.status].icon;
                                        return (
                                            <SwipeableItem
                                                key={sub.id}
                                                onDelete={() => handleDelete(sub.id)}
                                                onEdit={() => router.push(`/subscriptions/${sub.id}`)}
                                            >
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.1 + index * 0.05,
                                                }}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-sm cursor-pointer group border border-border/50 sm:border-transparent"
                                                onClick={() => router.push(`/subscriptions/${sub.id}`)}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig[sub.status].className.split(' ')[0]}`}>
                                                        <Clock className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="font-bold text-foreground text-base leading-none">
                                                                {sub.serviceName}
                                                            </p>
                                                            <span className={cn(
                                                                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                                                statusConfig[sub.status].className
                                                            )}>
                                                                {statusConfig[sub.status].label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground font-medium">
                                                            <span className="truncate">{sub.clientName}</span>
                                                            <span className="hidden sm:inline text-muted-foreground/50">•</span>
                                                            <span className="truncate">{sub.companyName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="capitalize">{sub.frequency}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0" onClick={(e) => e.stopPropagation()}>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-base sm:text-lg font-bold text-foreground leading-none">
                                                            ${sub.price.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-medium mt-1">
                                                            Next: {new Date(sub.nextBillingDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="shrink-0 h-10 w-10 rounded-full hover:bg-secondary transition-colors duration-300"
                                                            >
                                                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                            <DropdownMenuItem onClick={() => router.push(`/subscriptions/${sub.id}`)} className="rounded-lg py-2">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/subscriptions/new?edit=${sub.id}`)} className="rounded-lg py-2">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(sub.id)}
                                                                className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </motion.div>
                                            </SwipeableItem>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
