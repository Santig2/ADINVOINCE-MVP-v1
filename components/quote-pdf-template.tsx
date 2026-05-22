import React from "react";
import { SignatureDisplay } from "@/components/signature-display";

export type QuoteItem = {
    id: string;
    description: string;   // Title
    longDescription?: string;
    quantity: number;
    unitPrice: number;
    tax: number;
};

export type QuoteData = {
    id: number | string;
    quoteNumber: string;
    status: string;
    issueDate?: string;
    validUntil?: string;
    clientName?: string;
    clientContact?: string;
    clientEmail?: string;
    clientAddress?: string;
    clientPhone?: string;
    companyName?: string;
    companyAddress?: string;
    companyNIT?: string;
    companyEmail?: string;
    companyPhone?: string;
    items?: QuoteItem[];
    notes?: string;
    terms?: string;
    logo?: string | null;
    subtotal?: number;
    totalTax?: number;
    total?: number;

    // New proposal fields
    projectName?: string;
    proposalSummary?: string;
    estimatedStartDate?: string;
    estimatedDeliveryDate?: string;
    paymentMethods?: string[];
    warrantyNotes?: string;
};

interface QuotePDFTemplateProps {
    quote: QuoteData;
    signatures?: any[]; // optional signatures list
}

export function QuotePDFTemplate({ quote, signatures = [] }: QuotePDFTemplateProps) {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    const calculateItemTotal = (item: QuoteItem) => {
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = (subtotal * item.tax) / 100;
        return subtotal + taxAmount;
    };

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-10 text-black font-sans box-border" style={{ letterSpacing: "-0.5px" }}>
            {/* HEADER */}
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">QUOTE</h1>
                    {quote.projectName ? (
                        <p className="text-lg text-gray-500 font-medium tracking-wide mt-1 uppercase">
                            {quote.projectName}
                        </p>
                    ) : (
                        <p className="text-lg text-gray-500 font-medium tracking-wide mt-1 uppercase">
                            Estimate for services
                        </p>
                    )}
                    <p className="text-sm font-semibold text-gray-400 mt-1"># {quote.quoteNumber}</p>
                </div>

                {quote.logo && (
                    <div className="max-w-[180px] max-h-[80px]">
                        <img src={quote.logo} alt="Company Logo" className="object-contain max-w-full max-h-full" />
                    </div>
                )}
            </header>

            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* PREPARED FOR */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prepared For</h3>
                    <p className="font-bold text-gray-900 text-lg">{quote.clientName}</p>
                    {quote.clientContact && <p className="text-sm text-gray-600">{quote.clientContact}</p>}
                    {quote.clientEmail && <p className="text-sm text-gray-600">{quote.clientEmail}</p>}
                    {quote.clientPhone && <p className="text-sm text-gray-600">{quote.clientPhone}</p>}
                    {quote.clientAddress && <p className="text-sm text-gray-600 max-w-xs">{quote.clientAddress}</p>}
                </section>

                {/* QUOTE DETAILS */}
                <section className="text-right">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details</h3>
                    <p className="text-sm"><span className="text-gray-500">Issue Date:</span> <span className="font-semibold">{quote.issueDate || "N/A"}</span></p>
                    {quote.estimatedStartDate && (
                        <p className="text-sm"><span className="text-gray-500">Est. Start:</span> <span className="font-semibold">{quote.estimatedStartDate}</span></p>
                    )}
                    {quote.estimatedDeliveryDate && (
                        <p className="text-sm"><span className="text-gray-500">Est. Delivery:</span> <span className="font-semibold">{quote.estimatedDeliveryDate}</span></p>
                    )}
                </section>
            </div>

            {/* PROPOSAL SUMMARY */}
            {quote.proposalSummary && (
                <section className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Executive Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.proposalSummary}</p>
                </section>
            )}

            {/* SERVICES / PRODUCTS */}
            <section className="mb-10">
                <h3 className="text-sm font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4">Investment Summary</h3>
                <div className="space-y-4">
                    {quote.items?.map((item, idx) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 page-break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-4">
                                    <h4 className="text-base font-bold text-gray-900">{item.description}</h4>
                                    {item.longDescription && (
                                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.longDescription}</p>
                                    )}
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <p className="font-semibold text-gray-900">{formatCurrency(calculateItemTotal(item))}</p>
                                </div>
                            </div>
                            <div className="flex bg-gray-50 p-2 rounded text-xs text-gray-500 justify-between items-center mt-3">
                                <span>Qty: {item.quantity}</span>
                                <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                                {item.tax > 0 && <span>Tax: {item.tax}%</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TOTALS */}
            <section className="flex justify-end mb-10 page-break-inside-avoid">
                <div className="w-72 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between text-sm mb-2 text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(quote.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4 text-gray-600">
                        <span>Taxes</span>
                        <span>{formatCurrency(quote.totalTax || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-4 text-primary">
                        <span>Estimated Total</span>
                        <span>{formatCurrency(quote.total || 0)}</span>
                    </div>
                </div>
            </section>

            {/* PAYMENT METHODS */}
            <div className="mb-16 page-break-inside-avoid">
                {(quote.paymentMethods && quote.paymentMethods.length > 0) && (
                    <section className="mb-6">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Payment Methods</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {quote.paymentMethods.map(method => (
                                <li key={method} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {method}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            {signatures.length > 0 && (
                <div className="mb-10 page-break-inside-avoid">
                    <SignatureDisplay signatures={signatures} />
                </div>
            )}

            {/* FOOTER (Bottom of the page/PDF) */}
            <footer className="mt-20 pt-8 border-t border-gray-200 text-center space-y-1 page-break-inside-avoid">
                <p className="font-bold text-gray-900">{quote.companyName}</p>
                <p className="text-xs text-gray-500">
                    {quote.companyAddress} {quote.companyNIT && `| NIT: ${quote.companyNIT}`}
                </p>
                <p className="text-xs text-gray-500">
                    {quote.companyEmail} {quote.companyPhone && `| ${quote.companyPhone}`}
                </p>
            </footer>
        </div>
    );
}
