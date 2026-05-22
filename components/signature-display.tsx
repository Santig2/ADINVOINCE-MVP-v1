import { SignatureRecord } from '@/hooks/use-signatures';
import { format } from 'date-fns';

interface SignatureDisplayProps {
    signatures: SignatureRecord[];
}

export function SignatureDisplay({ signatures }: SignatureDisplayProps) {
    if (!signatures || signatures.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {signatures.map((sig) => (
                    <div key={sig.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col items-center text-center">
                        <div className="h-24 w-full flex justify-center mb-2">
                            {sig.signatureData.startsWith('data:image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={sig.signatureData} alt="Signature" className="h-full object-contain pointer-events-none" />
                            ) : null}
                        </div>
                        <div className="w-full border-t border-gray-300 pt-2 space-y-1">
                            <p className="font-medium text-sm">{sig.signerName}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                Signed as: {sig.signerRole}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(sig.createdAt), 'MMM dd, yyyy - hh:mm a')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
