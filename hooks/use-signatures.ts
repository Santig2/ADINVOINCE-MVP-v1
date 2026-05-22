import { useState, useEffect } from 'react';

export type SignatureRole = 'user' | 'client';

export interface SignatureRecord {
    id: string;
    documentType: 'invoice' | 'quote' | 'contract' | 'expense' | 'other';
    documentId: string;
    signerName: string;
    signerRole: SignatureRole;
    signatureData: string; // Base64 SVG or PNG
    companyId: string;
    createdAt: string;
}

export function useSignatures() {
    const [signatures, setSignatures] = useState<SignatureRecord[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('add-invoices-signatures');
        if (stored) {
            try {
                setSignatures(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse signatures from localStorage');
            }
        }
    }, []);

    const saveSignature = (signature: Omit<SignatureRecord, 'id' | 'createdAt'>) => {
        const newSignature: SignatureRecord = {
            ...signature,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        setSignatures((prev) => {
            const updated = [...prev, newSignature];
            localStorage.setItem('add-invoices-signatures', JSON.stringify(updated));
            return updated;
        });

        return newSignature;
    };

    const getSignaturesForDocument = (documentId: string, documentType?: string) => {
        return signatures.filter((sig) =>
            sig.documentId === documentId &&
            (!documentType || sig.documentType === documentType)
        );
    };

    const getActiveCompanySignatures = (companyId: string) => {
        return signatures.filter((sig) => sig.companyId === companyId);
    };

    const deleteSignature = (id: string) => {
        setSignatures((prev) => {
            const updated = prev.filter((sig) => sig.id !== id);
            localStorage.setItem('add-invoices-signatures', JSON.stringify(updated));
            return updated;
        });
    };

    return {
        signatures,
        saveSignature,
        getSignaturesForDocument,
        getActiveCompanySignatures,
        deleteSignature
    };
}
