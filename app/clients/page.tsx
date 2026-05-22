"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  Trash2,
  Mic,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SwipeableItem } from "@/components/ui/swipeable-item";
import { useState, useEffect } from "react";
import { AddClientDialog } from "@/components/add-client-dialog";
import { ViewClientDialog } from "@/components/view-client-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

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


type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  contact?: string;
  totalInvoices: number;
  totalAmount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    // Load clients from localStorage
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");

    // Load invoices to calculate stats
    const emittedInvoices = JSON.parse(
      localStorage.getItem("emittedInvoices") || "[]"
    );
    const draftInvoices = JSON.parse(
      localStorage.getItem("invoiceDrafts") || "[]"
    );
    const allInvoices = [...emittedInvoices, ...draftInvoices];

    // Calculate stats for each client
    const clientsWithStats = savedClients.map((client: any) => {
      const clientInvoices = allInvoices.filter(
        (inv: any) =>
          inv.clientName?.toLowerCase() === client.name.toLowerCase()
      );

      const totalInvoices = clientInvoices.length;
      const totalAmount = clientInvoices.reduce((sum: number, inv: any) => {
        return sum + (inv.total || 0);
      }, 0);

      return {
        ...client,
        totalInvoices,
        totalAmount,
        status: client.status || "active",
      };
    });

    setClients(clientsWithStats);
  };

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    );
  });

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = clients.filter((c) => {
    if (!c.createdAt) return false;
    const createdDate = new Date(c.createdAt);
    return (
      createdDate.getMonth() === currentMonth &&
      createdDate.getFullYear() === currentYear
    );
  }).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalAmount, 0);

  const handleViewDetails = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setAddDialogOpen(true);
  };

  const handleViewInvoices = (client: { id: string; name: string }) => {
    toast({
      title: "View invoices",
      description: `Showing invoices for ${client.name}...`,
    });
    // In a real app, this would navigate to invoices filtered by this client
    router.push(`/invoices?client=${client.id}`);
  };

  const handleSendEmail = (client: { name: string; email: string }) => {
    toast({
      title: "Send email",
      description: `Opening email to ${client.email}...`,
    });
    // In a real app, this would open the user's email client
    window.location.href = `mailto:${client.email}`;
  };

  const handleDelete = (client: { id: string; name: string }) => {
    const existingClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const updatedClients = existingClients.filter(
      (c: any) => c.id !== client.id
    );
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    loadClients();
    toast({
      title: "Client deleted",
      description: `${client.name} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleClientSaved = () => {
    loadClients();
    setSelectedClient(null);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setAddDialogOpen(true);
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
              Clients
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your client relationships
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              id="clients-create-btn"
              variant="accent"
              size="lg"
              className="gap-2 w-full sm:w-auto transition-all duration-300"
              onClick={handleAddClient}
            >
              <Plus className="h-5 w-5" />
              Add Client
            </Button>
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
            Total Revenue
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            ${totalRevenue.toLocaleString()}
          </h2>

          {/* Scrollable Glass Stat Cards */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-4 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Clients</CardTitle>
                  <div className="p-1.5 bg-blue-500/15 dark:bg-blue-500/20 rounded-lg ring-1 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{totalClients}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active</CardTitle>
                  <div className="p-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{activeClients}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl border-white/20 dark:border-white/10 min-w-[140px] sm:min-w-0 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New This Month</CardTitle>
                  <div className="p-1.5 bg-purple-500/15 dark:bg-purple-500/20 rounded-lg ring-1 ring-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400 drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{newThisMonth}</div>
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
          {/* Search */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="relative flex-1" id="clients-search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div id="clients-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                All Clients{" "}
                {filteredClients.length !== clients.length &&
                  `(${filteredClients.length})`}
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredClients.length === 0 ? (
                <div className="text-center py-16 px-4 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-primary/5">
                    <Building2 className="h-10 w-10 text-primary/60" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">
                    {clients.length === 0 ? "No clients yet" : "No clients found"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                    {clients.length === 0
                      ? "Add your first client to get started and send invoices."
                      : "We couldn't find any clients matching your search."}
                  </p>
                  <Button 
                    className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    onClick={() => router.push('/clients/new')}
                  >
                    <Plus className="h-5 w-5" />
                    Add your first client
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client, index) => (
                    <SwipeableItem
                      key={client.id}
                      onDelete={() => handleDelete(client)}
                      onEdit={() => handleEdit(client)}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-sm cursor-pointer group border border-border/50 sm:border-transparent"
                      >
                      <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => handleViewDetails(client)}>
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-foreground text-base leading-none">
                              {client.name}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/20 text-primary"
                            >
                              {client.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                            {client.email && (
                              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 truncate font-medium">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </p>
                            )}
                            {client.phone && (
                              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                {client.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0">
                        <div className="text-left sm:text-right" onClick={() => handleViewDetails(client)}>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">
                            {client.totalInvoices} invoices
                          </p>
                          <p className="font-bold text-foreground text-base sm:text-lg leading-none">
                            ${client.totalAmount.toLocaleString()}
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
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(client)}
                              className="rounded-lg py-2"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(client)} className="rounded-lg py-2">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewInvoices(client)}
                              className="rounded-lg py-2"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Invoices
                            </DropdownMenuItem>
                            {client.email && (
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(client)}
                                className="rounded-lg py-2"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(client)}
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onClientAdded={handleClientSaved}
        client={selectedClient}
      />

      <ViewClientDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        client={selectedClient}
      />
    </AppLayout>
  );
}
