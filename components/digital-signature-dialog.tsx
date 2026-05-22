import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SignatureCanvas from 'react-signature-canvas';
import { useSignatures, SignatureRole } from '@/hooks/use-signatures';
import { Trash2, Eraser } from 'lucide-react';
import { toast } from 'sonner';

interface DigitalSignatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentId: string;
    documentType: 'invoice' | 'quote' | 'contract' | 'expense' | 'other';
    companyId: string;
    title?: string;
    description?: string;
    onSignatureSaved?: () => void;
}

export function DigitalSignatureDialog({
    open,
    onOpenChange,
    documentId,
    documentType,
    companyId,
    title = "Digital Signature Request",
    description = "Please draw your signature below to approve or confirm this document.",
    onSignatureSaved,
}: DigitalSignatureDialogProps) {
    const { saveSignature } = useSignatures();
    const signatureRef = useRef<SignatureCanvas>(null);

    const [signerName, setSignerName] = useState('');
    const [signerRole, setSignerRole] = useState<SignatureRole>('client');

    const handleClear = () => {
        signatureRef.current?.clear();
    };

    const handleSave = () => {
        if (!signerName.trim()) {
            toast.error('Signer name is required');
            return;
        }

        if (signatureRef.current?.isEmpty()) {
            toast.error('Signature is required');
            return;
        }

        // Get SVG base64
        const signatureData = signatureRef.current?.toDataURL('image/svg+xml');

        if (!signatureData) return;

        saveSignature({
            documentId,
            documentType,
            companyId,
            signerName: signerName.trim(),
            signerRole,
            signatureData,
        });

        toast.success('Signature saved successfully');
        onOpenChange(false);

        // Reset form after closing
        setTimeout(() => {
            setSignerName('');
            setSignerRole('client');
            handleClear();
        }, 300);

        if (onSignatureSaved) {
            onSignatureSaved();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="signerName">Signer Name</Label>
                            <Input
                                id="signerName"
                                placeholder="John Doe"
                                value={signerName}
                                onChange={(e) => setSignerName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signerRole">Signer Role</Label>
                            <Select value={signerRole} onValueChange={(val) => setSignerRole(val as SignatureRole)}>
                                <SelectTrigger id="signerRole">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="user">You (User)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Signature</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2 text-muted-foreground">
                                <Eraser className="w-4 h-4 mr-1" />
                                Clear
                            </Button>
                        </div>
                        <div className="border rounded-md bg-white border-input touch-none overflow-hidden h-[200px] w-full relative">
                            <SignatureCanvas
                                ref={signatureRef}
                                penColor="black"
                                canvasProps={{
                                    className: 'w-full h-full cursor-crosshair'
                                }}
                            />
                            <div className="absolute bottom-2 left-0 right-0 text-center opacity-30 select-none pointer-events-none border-b border-dashed border-black mx-8"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            By signing, you agree that this signature is legally binding and equivalent to your handwritten signature.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Confirm & Sign</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
