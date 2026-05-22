"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    FileText,
    MoreVertical,
    Eye,
    Edit,
    Send,
    Trash2,
    Mic,
    PenTool,
    CheckCircle,
    Archive,
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
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { SendDocumentDialog } from "@/components/send-document-dialog";
import { SwipeableItem } from "@/components/ui/swipeable-item";

// Types
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'archived';

export type Contract = {
    id: string;
    title: string;
    companyName: string;
    clientName: string;
    type: string;
    status: ContractStatus;
    createdAt: string;
    updatedAt: string;
    signedAt?: string;
};

const statusConfig = {
    draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground hover:bg-muted/80",
        icon: FileText,
    },
    sent: {
        label: "Sent",
        className: "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30",
        icon: Send,
    },
    signed: {
        label: "Signed",
        className: "bg-green-500/20 text-green-600 hover:bg-green-500/30",
        icon: CheckCircle,
    },
    archived: {
        label: "Archived",
        className: "bg-gray-500/20 text-gray-600 hover:bg-gray-500/30",
        icon: Archive,
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

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<{
        id: string;
        title: string;
        clientName: string;
        clientEmail?: string;
    } | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = () => {
        const savedContracts = JSON.parse(localStorage.getItem("contracts") || "[]");
        // Sort by updated at, newest first
        const sorted = savedContracts.sort((a: Contract, b: Contract) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setContracts(sorted);
    };

    const filteredContracts = contracts.filter((contract) => {
        const matchesSearch =
            contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || contract.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: contracts.length,
        draft: contracts.filter((c) => c.status === "draft").length,
        sent: contracts.filter((c) => c.status === "sent").length,
        signed: contracts.filter((c) => c.status === "signed").length,
    };

    const handleDelete = (id: string) => {
        const updated = contracts.filter((c) => c.id !== id);
        localStorage.setItem("contracts", JSON.stringify(updated));
        setContracts(updated);
        toast({
            title: "Contract deleted",
            description: "The contract has been permanently deleted.",
            variant: "destructive",
        });
    };

    const handleCreateByVoice = () => {
        // Navigate to new contract page with voice mode active query param
        router.push("/contracts/new?mode=voice");
    };

    const handleSend = (contract: Contract) => {
        // Find client email
        const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
        const client = savedClients.find(
            (c: any) => c.name === contract.clientName
        );

        setSelectedContract({
            id: contract.id,
            title: contract.title,
            clientName: contract.clientName,
            clientEmail: client?.email || "",
        });
        setSendDialogOpen(true);
    };

    const processSend = async (email: string, subject: string, message: string) => {
        if (!selectedContract) return;

        // 1. No PDF download for contracts yet (future: generate PDF)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Open mailto link
        const body = encodeURIComponent(message);
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailtoLink;

        // 3. Update status
        const contractsList = JSON.parse(localStorage.getItem("contracts") || "[]");
        const updatedContracts = contractsList.map((c: Contract) => {
            if (c.id === selectedContract.id) {
                return {
                    ...c,
                    status: "sent",
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        });

        localStorage.setItem("contracts", JSON.stringify(updatedContracts));
        setContracts(updatedContracts);
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-0 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-80px)] flex flex-col">
                {/* Hero Section */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 px-4 sm:px-0 pt-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                            Contracts
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create, manage, and sign professional contracts
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href="/contracts/new" className="flex-1 sm:flex-none">
                            <Button
                                id="contracts-create-btn"
                                size="lg"
                                className="gap-2 w-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                            >
                                <Plus className="h-5 w-5" />
                                Create Contract
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
                        Total Contracts
                    </p>
                    <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
                        {stats.total}
                    </h2>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">
                                        Drafts
                                    </CardTitle>
                                    <PenTool className="h-4 w-4 text-muted-foreground opacity-70" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.draft}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">
                                        Sent
                                    </CardTitle>
                                    <Send className="h-4 w-4 text-blue-500 opacity-70" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.sent}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} className="snap-start shrink-0">
                            <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">
                                        Signed
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500 opacity-70" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-xl font-bold">
                                        {stats.signed}
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
                                placeholder="Search contracts..."
                                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-secondary/50 border-transparent rounded-xl">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="signed">Signed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div id="contracts-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
                        <div className="mb-4 sm:px-6 sm:pt-6">
                            <h3 className="text-lg font-bold text-foreground hidden sm:block">
                                All Contracts {filteredContracts.length !== contracts.length && `(${filteredContracts.length})`}
                            </h3>
                        </div>
                        <div className="sm:px-6 sm:pb-6">
                            {filteredContracts.length === 0 ? (
                                <div className="text-center py-16 px-4 bg-gradient-to-b from-background to-secondary/20 rounded-3xl border border-dashed border-primary/20 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5 border border-primary/10 relative">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">
                                        {contracts.length === 0 ? "No contracts yet" : "No contracts found"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-8 max-w-[250px] mx-auto">
                                        {contracts.length === 0
                                            ? "Create your first contract to establish clear agreements."
                                            : "No contracts match your current filters."}
                                    </p>
                                    {contracts.length === 0 && (
                                        <Link href="/contracts/new">
                                            <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8 py-6 text-base">
                                                <Plus className="h-5 w-5" />
                                                Create your first contract
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredContracts.map((contract, index) => {
                                        const StatusIcon = statusConfig[contract.status].icon;
                                        return (
                                            <SwipeableItem
                                                key={contract.id}
                                                onDelete={() => handleDelete(contract.id)}
                                                onSend={() => handleSend(contract)}
                                            >
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.1 + index * 0.05,
                                                }}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-sm cursor-pointer group border border-border/50 sm:border-transparent"
                                                onClick={() => router.push(`/contracts/${contract.id}`)}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig[contract.status].className.split(' ')[0]}`}>
                                                        <StatusIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="font-bold text-foreground text-base leading-none">
                                                                {contract.title}
                                                            </p>
                                                            <span className={cn(
                                                                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                                                statusConfig[contract.status].className
                                                            )}>
                                                                {statusConfig[contract.status].label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground font-medium">
                                                            <span className="truncate">{contract.clientName}</span>
                                                            <span className="hidden sm:inline text-muted-foreground/50">•</span>
                                                            <span className="truncate">{contract.companyName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0" onClick={(e) => e.stopPropagation()}>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-bold text-foreground">
                                                            {new Date(contract.updatedAt).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Last Updated</p>
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
                                                            <DropdownMenuItem onClick={() => router.push(`/contracts/${contract.id}`)} className="rounded-lg py-2">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View / Sign
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/contracts/${contract.id}?edit=true`)} className="rounded-lg py-2">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSend(contract)} className="rounded-lg py-2">
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Send
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(contract.id)}
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

                {selectedContract && (
                    <SendDocumentDialog
                        open={sendDialogOpen}
                        onOpenChange={setSendDialogOpen}
                        documentId={selectedContract.title} // Using title as ID/Ref for clarity in contracts
                        documentType="contract"
                        clientName={selectedContract.clientName}
                        clientEmail={selectedContract.clientEmail}
                        onSend={processSend}
                    />
                )}
            </div>
        </AppLayout>
    );
}
