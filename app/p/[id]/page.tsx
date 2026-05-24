"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink, ShieldCheck, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicDocumentPortal() {
  const params = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState<"invoice" | "estimate" | "advance" | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [error, setError] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchDocument = () => {
      const idParam = params.id as string;
      if (!idParam) {
        setError("Invalid link.");
        setLoading(false);
        return;
      }

      // Format is prefix-id (e.g. inv-17382912)
      const prefix = idParam.substring(0, 3);
      const docId = idParam.substring(4);

      let foundDoc = null;
      let type: "invoice" | "estimate" | "advance" | null = null;
      let storageKey = "";

      if (prefix === "inv") {
        type = "invoice";
        storageKey = "emittedInvoices";
      } else if (prefix === "est") {
        type = "estimate";
        storageKey = "emittedQuotes"; // Using current quote naming
      } else if (prefix === "adv") {
        type = "advance";
        storageKey = "advances";
      } else {
        setError("Document type not recognized.");
        setLoading(false);
        return;
      }

      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        foundDoc = parsed.find((d: any) => d.id.toString() === docId);
      }

      if (!foundDoc) {
        setError("Document not found or has been deleted.");
        setLoading(false);
        return;
      }

      setDocType(type);
      setDocument(foundDoc);
      setLoading(false);

      // Track as 'viewed' if not already viewed or paid
      if (
        (foundDoc.status === "issued" || foundDoc.status === "sent" || foundDoc.status === "pending")
      ) {
        const updatedDoc = { ...foundDoc, status: "viewed", viewedAt: new Date().toISOString() };
        
        // Update in localStorage
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const updatedList = parsed.map((d: any) => d.id.toString() === docId ? updatedDoc : d);
          localStorage.setItem(storageKey, JSON.stringify(updatedList));
          
          // Also set local state so UI updates
          setDocument(updatedDoc);
        }
      }
    };

    fetchDocument();
  }, [params.id]);

  const handleAction = async () => {
    if (docType === "invoice") {
      setShowPaymentModal(true);
    } else if (docType === "estimate") {
      // Simulate accepting estimate
      setIsProcessing(true);
      setTimeout(() => {
        updateDocumentStatus("emittedQuotes", "accepted");
        setIsProcessing(false);
        toast({ title: "Estimate Accepted", description: "The business owner has been notified." });
      }, 1500);
    } else if (docType === "advance") {
      // Simulate approving advance
      setIsProcessing(true);
      setTimeout(() => {
        updateDocumentStatus("advances", "approved");
        setIsProcessing(false);
        toast({ title: "Advance Approved", description: "The business owner has been notified." });
      }, 1500);
    }
  };

  const updateDocumentStatus = (storageKey: string, newStatus: string) => {
    const docId = document.id.toString();
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const updatedList = parsed.map((d: any) => d.id.toString() === docId ? { ...d, status: newStatus } : d);
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      setDocument({ ...document, status: newStatus });
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      updateDocumentStatus("emittedInvoices", "paid");
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Update dashboard metrics (simulated)
      toast({ title: "Payment Successful", description: "Thank you! Your payment has been processed securely." });
      
      setTimeout(() => setShowPaymentModal(false), 2000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-2xl border-0 rounded-3xl">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-500">{error}</p>
        </Card>
      </div>
    );
  }

  const isPaid = document?.status === "paid" || document?.paymentStatus === "paid";
  const isAccepted = document?.status === "accepted" || document?.status === "approved";
  const docNumber = document?.invoiceNumber || document?.quoteNumber || document?.advanceNumber || `#${document?.id.toString().substring(0, 6)}`;
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Left side: Action Panel (Mobile: Top, Desktop: Left fixed) */}
      <div className="w-full md:w-[400px] bg-white border-b md:border-r border-slate-200 shadow-sm p-6 flex flex-col md:fixed md:h-screen md:left-0 md:top-0 z-20">
        
        <div className="flex items-center justify-between mb-8">
          <div className="font-black text-2xl tracking-tight text-slate-900">
            {document?.companyName || "Business"}
          </div>
          {(isPaid || isAccepted) && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {isPaid ? "Paid" : "Approved"}
            </div>
          )}
        </div>

        <div className="space-y-6 flex-1">
          {docType === "advance" ? (
            <>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Status Update
                </p>
                <h1 className="text-2xl font-black text-slate-900 mb-1 leading-tight">
                  Work Progress Report
                </h1>
                <p className="text-slate-500 text-sm">{docNumber} • {document?.date || document?.createdAt?.split('T')[0]}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase">Prepared For</h3>
                <p className="font-semibold text-slate-900 break-words">{document?.clientName}</p>
                {document?.clientPhone && <p className="text-slate-500 text-sm mt-1">{document?.clientPhone}</p>}
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                <p className="text-xs leading-relaxed font-medium">
                  Review the details of this progress report and click "Approve Advance" to acknowledge receipt.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">
                  {docType === "invoice" ? "Invoice Summary" : "Estimate Summary"}
                </p>
                <h1 className="text-4xl font-black text-slate-900 mb-1">
                  ${(document?.total || document?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>
                <p className="text-slate-500 text-sm">{docNumber} • Due {document?.dueDate || document?.issueDate || "Upon receipt"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase">Billed To</h3>
                <p className="font-semibold text-slate-900 break-words">{document?.clientName}</p>
                {document?.clientEmail && <p className="text-slate-500 text-sm break-words mt-1">{document?.clientEmail}</p>}
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                <p className="text-xs leading-relaxed font-medium">
                  This is a secure link powered by ADSTRATEGIC. Your payment details are encrypted and securely processed.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
          <Button 
            className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            size="lg"
            onClick={handleAction}
            disabled={isPaid || isAccepted || isProcessing}
          >
            {isProcessing ? (
               <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : isPaid ? (
               <><CheckCircle2 className="w-5 h-5 mr-2" /> Payment Complete</>
            ) : isAccepted ? (
               <><CheckCircle2 className="w-5 h-5 mr-2" /> Document Accepted</>
            ) : docType === "invoice" ? (
               <><CreditCard className="w-5 h-5 mr-2" /> Pay ${(document?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
            ) : docType === "estimate" ? (
               "Accept Estimate"
            ) : (
               "Approve Advance"
            )}
          </Button>
          
          <Button variant="outline" className="w-full h-12 rounded-xl text-slate-600 bg-white">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Right side: Document Viewer */}
      <div className="flex-1 md:ml-[400px] p-4 sm:p-10 lg:p-20 bg-slate-100/50 flex justify-center items-start min-h-screen">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-slate-200 overflow-hidden relative">
          
          {/* Simple Document Viewer (Can be expanded to use the actual preview components later) */}
          {docType === "advance" ? (
            <div className="p-8 sm:p-14">
              <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase">Work Progress Report</h1>
                  <div className="mt-4 space-y-1 text-sm text-slate-600 font-medium uppercase tracking-wider">
                    <p>PROJECT: <span className="font-bold text-slate-900">{document?.projectName}</span></p>
                    <p>DATE: <span className="font-bold text-slate-900">{document?.date}</span></p>
                    <p>CLIENT: <span className="font-bold text-slate-900">{document?.clientName}</span></p>
                    <p>PHONE: <span className="font-bold text-slate-900">{document?.clientPhone}</span></p>
                    {document?.location && <p>LOCATION: <span className="font-bold text-slate-900">{document?.location}</span></p>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {(() => {
                  let report = null;
                  try {
                    report = typeof document?.generatedReport === 'string' ? JSON.parse(document.generatedReport) : document?.generatedReport;
                  } catch (e) {}
                  
                  return report ? (
                    <>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                          <h3 className="text-lg font-bold text-slate-900">Executive Summary</h3>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed break-words">{report.summary}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                          <h3 className="text-lg font-bold text-slate-900">Work Completed</h3>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed break-words">{report.workCompleted}</p>
                      </div>
                      
                      {report.notes && (
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-900">Additional Notes</h3>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed break-words">{report.notes}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                        <h3 className="text-lg font-bold text-slate-900">Notes</h3>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed break-words">{document?.notes}</p>
                    </div>
                  );
                })()}

                {document?.images && document.images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Site Photos
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {document.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200">
                          <img src={img} alt={`Site photo ${i + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-14">
              <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
              <div>
                {document?.logo && <img src={document.logo} alt="Logo" className="h-16 mb-4 object-contain" />}
                <h2 className="text-2xl font-bold text-slate-900 break-words">{document?.companyName}</h2>
                <p className="text-slate-500 text-sm whitespace-pre-line break-words mt-1">{document?.companyAddress}</p>
                {document?.companyNIT && <p className="text-slate-500 text-sm break-words mt-1">NIT: {document?.companyNIT}</p>}
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-slate-200 uppercase tracking-widest">{docType}</h1>
                <p className="font-semibold text-slate-800 mt-2">{docNumber}</p>
                <p className="text-sm text-slate-500 mt-1">Date: {document?.issueDate}</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
              <p className="font-bold text-slate-900 text-lg break-words">{document?.clientName}</p>
              <p className="text-slate-500 whitespace-pre-line break-words">{document?.clientAddress}</p>
            </div>

            {/* Items Table */}
            {document?.items && document.items.length > 0 && (
              <div className="mb-10 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-3 px-2 text-sm font-bold text-slate-600 uppercase">Item</th>
                      <th className="py-3 px-2 text-sm font-bold text-slate-600 uppercase text-right">Qty</th>
                      <th className="py-3 px-2 text-sm font-bold text-slate-600 uppercase text-right">Price</th>
                      <th className="py-3 px-2 text-sm font-bold text-slate-600 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.items.map((item: any, i: number) => {
                      const itemTotal = item.quantity * item.unitPrice * (1 + (item.tax || 0) / 100);
                      return (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-4 px-2 font-medium text-slate-800 break-words max-w-[200px]">{item.description}</td>
                          <td className="py-4 px-2 text-right text-slate-600">{item.quantity}</td>
                          <td className="py-4 px-2 text-right text-slate-600">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-2 text-right font-bold text-slate-900">${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end border-t border-slate-200 pt-6">
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${(document?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>${(document?.totalTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-200">
                  <span>Total Due</span>
                  <span>${(document?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Method / Terms */}
            {document?.notes && (
              <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase">Notes & Instructions</h4>
                <p className="text-slate-600 whitespace-pre-line break-words text-sm leading-relaxed">{document.notes}</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Payment Modal Simulation */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => !isProcessing && !paymentSuccess && setShowPaymentModal(open)}>
        <DialogContent className="sm:max-w-md">
          {paymentSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="rounded-full bg-green-100 p-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <DialogTitle className="text-3xl font-black text-center text-slate-900">
                Payment Successful!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                A receipt has been sent to your email. Thank you for your business.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Secure Payment</DialogTitle>
                <DialogDescription>
                  Enter your card details to pay ${(document?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} to {document?.companyName}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <div className="relative">
                    <Input placeholder="0000 0000 0000 0000" className="pl-10" />
                    <CreditCard className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Name on Card</Label>
                  <Input placeholder="John Doe" />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800" 
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Pay Now"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
