"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type RegisterPaymentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoiceId: string;
    invoiceNumber: string;
    remainingBalance: number;
    onPaymentSaved: (payment: any) => void;
};

export function RegisterPaymentDialog({
    open,
    onOpenChange,
    invoiceId,
    invoiceNumber,
    remainingBalance,
    onPaymentSaved,
}: RegisterPaymentDialogProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [method, setMethod] = useState("cash");
    const [notes, setNotes] = useState("");

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid positive amount.",
                variant: "destructive",
            });
            return;
        }

        if (numAmount > remainingBalance + 0.01) { // Small epsilon for float logic
            toast({
                title: "Overpayment detected",
                description: `Amount cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}.`,
                variant: "destructive",
            });
            return;
        }

        const payment = {
            id: Date.now().toString(),
            invoiceId,
            amount: numAmount,
            method,
            date,
            notes,
        };

        onPaymentSaved(payment);
        setAmount("");
        setNotes("");
        setMethod("cash");
        setDate(new Date().toISOString().split("T")[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for Invoice {invoiceNumber}.
                        <br />
                        Remaining Balance: <span className="font-semibold text-primary">${remainingBalance.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">
                            Method
                        </Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="transfer">Bank Transfer</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="col-span-3"
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
