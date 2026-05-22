"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Building2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    contact?: string;
  } | null;
}

export function AddClientDialog({
  open,
  onOpenChange,
  onClientAdded,
  client,
}: AddClientDialogProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (!open) {
      setAdded(false);
      setAdding(false);
    }
  }, [open]);

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);

    const formData = new FormData(e.currentTarget);
    const clientData = {
      id: client?.id || Date.now().toString(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || "",
      address: (formData.get("address") as string) || "",
      contact: (formData.get("contact") as string) || "",
      status: "active",
      createdAt: client ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingClients = JSON.parse(localStorage.getItem("clients") || "[]");

    if (client) {
      // Update existing client
      const existingIndex = existingClients.findIndex(
        (c: any) => c.id === client.id
      );

      if (existingIndex >= 0) {
        existingClients[existingIndex] = {
          ...existingClients[existingIndex],
          ...clientData,
          createdAt: existingClients[existingIndex].createdAt, // Preserve creation date
        };
        
        toast({
          title: "Client updated",
          description: `${clientData.name} has been updated successfully.`,
        });
      }
    } else {
      // Check if client already exists (case-insensitive) for new clients
      const existingIndex = existingClients.findIndex(
        (c: any) => c.name.toLowerCase() === clientData.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update existing client if found by name
        existingClients[existingIndex] = {
          ...existingClients[existingIndex],
          ...clientData,
          id: existingClients[existingIndex].id,
          createdAt: existingClients[existingIndex].createdAt,
        };
        toast({
          title: "Client updated",
          description: `${clientData.name} has been updated.`,
        });
      } else {
        // Add new client
        existingClients.push(clientData);
        toast({
          title: "Client added successfully!",
          description: `${clientData.name} has been added to your clients list.`,
        });
      }
    }

    localStorage.setItem("clients", JSON.stringify(existingClients));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setAdding(false);
    setAdded(true);

    // Show success state for 2 seconds
    setTimeout(() => {
      setAdded(false);
      onOpenChange(false);
      if (onClientAdded) {
        onClientAdded();
      }
    }, 2000);
  };

  if (added) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-4">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center">
              {client ? "Client Updated Successfully!" : "Client Added Successfully!"}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              The client has been {client ? "updated in" : "added to"} your list
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {client ? (
              <Edit className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            {client ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {client 
              ? "Update the client details below" 
              : "Enter the client details to add them to your system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddClient} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Corporation"
              className="mt-1"
              required
              defaultValue={client?.name}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@acme.com"
              className="mt-1"
              required
              defaultValue={client?.email}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="mt-1"
              defaultValue={client?.phone}
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              name="contact"
              placeholder="John Doe"
              className="mt-1"
              defaultValue={client?.contact}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="123 Business St, City, State, ZIP"
              className="mt-1"
              rows={3}
              defaultValue={client?.address}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent w-full sm:w-auto"
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={adding}
              className="gap-2 w-full sm:w-auto"
            >
              {adding ? (
                <>{client ? "Updating..." : "Adding..."}</>
              ) : (
                <>
                  {client ? <Edit className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  {client ? "Update Client" : "Add Client"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
