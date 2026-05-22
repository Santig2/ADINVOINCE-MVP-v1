"use client";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Plus,
  Edit,
  MoreVertical,
  Download,
  Send,
  Trash2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AddClientDialog } from "@/components/add-client-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  total: number;
  status: "paid" | "pending" | "overdue" | "draft";
  items: any[];
};

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadClientData(params.id as string);
    }
  }, [params.id]);

  const loadClientData = (clientId: string) => {
    setLoading(true);
    // Load clients
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const foundClient = savedClients.find((c: any) => c.id === clientId);

    if (foundClient) {
      // Load invoices
      const emittedInvoices = JSON.parse(
        localStorage.getItem("emittedInvoices") || "[]"
      );
      const draftInvoices = JSON.parse(
        localStorage.getItem("invoiceDrafts") || "[]"
      );
      const allInvoices = [...emittedInvoices, ...draftInvoices];

      const clientInvoices = allInvoices.filter(
        (inv: any) =>
          inv.clientName?.toLowerCase() === foundClient.name.toLowerCase()
      );

      // Calculate stats
      const totalInvoices = clientInvoices.length;
      const totalAmount = clientInvoices.reduce((sum: number, inv: any) => {
        return sum + (inv.total || 0);
      }, 0);

      setClient({
        ...foundClient,
        totalInvoices,
        totalAmount,
        status: foundClient.status || "active",
      });
      setInvoices(clientInvoices);
    } else {
      toast({
        title: "Error",
        description: "Client not found",
        variant: "destructive",
      });
      router.push("/clients");
    }
    setLoading(false);
  };

  const handleClientUpdated = () => {
    if (client) {
      loadClientData(client.id);
    }
  };

  const handleCreateInvoice = () => {
    router.push("/invoices/new");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      </AppLayout>
    );
  }

  if (!client) return null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/clients")}
            className="rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Client Details</h1>
        </div>

        {/* Client Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {client.name}
            </h2>
            <div className="space-y-1 text-muted-foreground">
              {client.email && (
                <p className="text-sm">Email: {client.email}</p>
              )}
              {client.phone && (
                <p className="text-sm">Phone: {client.phone}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-secondary/50 rounded-xl">
            <TabsTrigger
              value="account"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Account Statement
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-foreground transition-all"
            >
              Information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">
                  {client.totalAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Invoices</p>
                <p className="text-2xl font-bold">{client.totalInvoices}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Quotes
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>

            {/* Sub Tabs for Invoices/Quotes */}
            <div className="bg-secondary/30 rounded-xl p-1 mb-4 inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="bg-background shadow-sm rounded-lg text-foreground hover:bg-background"
              >
                Invoices
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Quotes
              </Button>
            </div>

            {/* Invoices List */}
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No invoices found for this client.
                  </p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {invoice.total.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          invoice.status === "paid"
                            ? "text-green-600"
                            : invoice.status === "overdue"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <Card className="border-border">
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Details
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact Person
                        </p>
                        <p className="text-foreground">
                          {client.contact || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p className="text-foreground">
                          {client.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Phone
                        </p>
                        <p className="text-foreground">
                          {client.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address
                    </h3>
                    <div className="pl-7">
                      <p className="text-foreground whitespace-pre-line">
                        {client.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Client Status
                      </p>
                      <Badge
                        variant={
                          client.status === "active" ? "default" : "secondary"
                        }
                        className="mt-1"
                      >
                        {client.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-foreground mt-1">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            size="lg"
            className="rounded-full h-14 px-6 shadow-lg hover:shadow-xl transition-all gap-2"
            onClick={handleCreateInvoice}
          >
            <span className="font-semibold">Create Invoice</span>
            <FileText className="h-5 w-5" />
          </Button>
        </div>

        <AddClientDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onClientAdded={handleClientUpdated}
          client={client}
        />
      </div>
    </AppLayout>
  );
}
