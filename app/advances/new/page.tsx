"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Save,
  Download,
  Send,
  Upload,
  Mic,
  Languages,
  Wand2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Building2,
  CalendarDays,
  MapPin,
  ClipboardCheck,
  User,
  Phone,
} from "lucide-react";

type Company = {
  id: string | number;
  name: string;
  logo?: string;
};

type AIReport = {
  summary: string;
  workCompleted: string;
  notes: string;
};

// Extremely simple mock translations for the AI block (assuming the user writes in Spanish)
const mockEnglishTransform = (text: string) => {
  if (!text) return "";
  const dictionary: Record<string, string> = {
    "hoy": "today",
    "instalamos": "we installed",
    "ventanas": "windows",
    "paredes": "walls",
    "pintamos": "we painted",
    "hicimos": "we did",
    "drywall": "drywall",
    "techo": "ceiling",
    "piso": "floor",
    "segundo": "second",
    "terminado": "finished",
    "trabajo": "work",
    "en": "in/on",
    "la": "the",
    "el": "the",
    "cuarto": "room"
  };
  
  let translated = text.toLowerCase();
  Object.keys(dictionary).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, dictionary[key]);
  });
  
  return `[Mock Translated]: ${translated}`;
};

export default function NewAdvancePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isEnglish, setIsEnglish] = useState(false);
  
  // AI Mock states
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStep, setAiStep] = useState("");
  const [generatedReport, setGeneratedReport] = useState<AIReport | null>(null);

  // Voice Mock states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  const { toast } = useToast();
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load companies
    const savedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
    setCompanies(savedCompanies);
    if (savedCompanies.length > 0) {
      setCompanyId(savedCompanies[0].id.toString());
    }
    // Set today as default date
    setDate(new Date().toISOString().split("T")[0]);

    // Load available clients from localStorage
    const savedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    setAvailableClients(savedClients);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setImages([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleClientSelect = (clientId: string) => {
    if (clientId === "none") {
      setClientName("");
      setClientPhone("");
      return;
    }
    const client = availableClients.find((c: any) => c.id?.toString() === clientId || c.name === clientId);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone || "");
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) return;
    setIsRecording(true);
    setVoiceText("");
    
    // Mock transcript progressive simulation
    const mockPhrase = "Hoy instalamos ventanas en el segundo piso y pintamos paredes.";
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex += 5;
      if (currentIndex >= mockPhrase.length) {
        currentIndex = mockPhrase.length;
        clearInterval(interval);
        setTimeout(() => {
          setIsRecording(false);
          setNotes((prev) => prev ? `${prev} \n${mockPhrase}` : mockPhrase);
          toast({
            title: "Voice capture complete",
            description: "Transcript added to notes.",
          });
        }, 800);
      }
      setVoiceText(mockPhrase.substring(0, currentIndex));
    }, 150);
  };

  const handleGenerateReport = () => {
    if (!projectName.trim()) {
      toast({ title: "Required Field", description: "Please enter a Project Name", variant: "destructive" });
      return;
    }
    if (!clientPhone.trim()) {
      toast({ title: "Required Field", description: "Please enter the Client's Phone Number", variant: "destructive" });
      return;
    }
    if (!notes.trim() && images.length === 0) {
      toast({ title: "Empty Content", description: "Please add notes or images before generating.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedReport(null);
    setAiStep("Analyzing content...");

    setTimeout(() => {
      setAiStep("Processing notes and voice...");
    }, 1200);

    setTimeout(() => {
      setAiStep("Generating professional report...");
    }, 2400);

    setTimeout(() => {
      setIsGenerating(false);
      
      const spanishReport = {
        summary: `Resumen de avance en ${projectName}. Se documentó el progreso registrado el día ${date}.`,
        workCompleted: `Se completaron las siguientes tareas basadas en sus notas:\n${notes || "Documentación fotográfica solamente."}`,
        notes: "Todo el equipo operó de acuerdo a los estándares de seguridad requeridos."
      };
      
      setGeneratedReport(spanishReport);
      toast({
        title: "Report Generated ✨",
        description: "Your professional report is ready to be previewed.",
      });
    }, 3800);
  };

  const handleSaveDraft = () => {
    if (!projectName.trim()) {
      toast({ title: "Missing Project Name", description: "Cannot save without a project name", variant: "destructive" });
      return;
    }
    if (!clientPhone.trim()) {
      toast({ title: "Missing Phone Number", description: "You must provide a phone number to send the report", variant: "destructive" });
      return;
    }

    const reportId = Date.now().toString();
    const selectedCompany = companies.find(c => c.id.toString() === companyId);
    
    const newReport = {
      id: reportId,
      companyId,
      companyName: selectedCompany?.name,
      projectName,
      date,
      location: locationStr,
      clientName,
      clientPhone,
      notes,
      images,
      generatedReport: JSON.stringify(generatedReport),
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem("advancesReports") || "[]");
    localStorage.setItem("advancesReports", JSON.stringify([...existing, newReport]));
    
    toast({
      title: "Draft Saved",
      description: "Advance report saved to your dashboard.",
    });
    router.push("/advances");
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    
    const element = previewRef.current;
    toast({ title: "Exporting...", description: "Generating PDF document." });
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Advance_Report_${projectName.replace(/\s+/g, '_')}_${date}.pdf`);
      
      toast({ title: "Success", description: "PDF exported successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  // Safe getter for report content based on language toggle
  const getDisplayReport = (): AIReport | null => {
    if (!generatedReport) return null;
    if (isEnglish) {
      return {
        summary: mockEnglishTransform(generatedReport.summary),
        workCompleted: mockEnglishTransform(generatedReport.workCompleted),
        notes: mockEnglishTransform(generatedReport.notes)
      };
    }
    return generatedReport;
  };

  const displayReport = getDisplayReport();
  const selectedCompany = companies.find(c => c.id.toString() === companyId);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New Work Advance</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Turn your field work into professional reports — powered by voice. <Mic className="h-3 w-3 text-primary" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => toast({ title: "Sent successfully", description: "Mock email has been sent."})}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button className="flex-1 md:flex-none" onClick={handleExportPDF} disabled={!generatedReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Grid: Inputs vs Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT PANEL: Inputs */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project / Job Name *</Label>
                  <div className="relative">
                    <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="e.g. Downtown Office Renovation" value={projectName} onChange={e => setProjectName(e.target.value)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Profile</Label>
                    <Select value={companyId} onValueChange={setCompanyId}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select Business..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                        {companies.length === 0 && <SelectItem value="none" disabled>No companies found</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="date" className="pl-9" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border rounded-xl p-4 bg-secondary/10">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-semibold uppercase">Import Client (Optional)</Label>
                    <Select onValueChange={handleClientSelect}>
                      <SelectTrigger className="bg-background">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select existing client to auto-fill..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Clear values / Type custom...</SelectItem>
                        {availableClients.map((c, i) => (
                           <SelectItem key={c.id || i} value={c.name}>{c.name}</SelectItem>
                        ))}
                        {availableClients.length === 0 && <SelectItem value="empty" disabled>No saved clients</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client Name (Optional)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="John Doe" value={clientName} onChange={e => setClientName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Client Phone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="+1 (555) 000-0000" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Site specific location" value={locationStr} onChange={e => setLocationStr(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  Work Progress
                  <Button variant="outline" size="sm" onClick={handleVoiceRecord} disabled={isRecording} className="gap-2 rounded-full hover:shadow-md hover:shadow-primary/20 transition-all border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
                    <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                    {isRecording ? "Recording..." : "Create by Voice"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {isRecording && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                     <p className="text-sm italic text-foreground tracking-wide flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        &quot;{voiceText}&quot;
                     </p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label>Progress Notes</Label>
                  <Textarea 
                    placeholder="Describe what was accomplished today..." 
                    className="min-h-[120px] resize-y rounded-xl"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Visual Evidence (Images)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                        <img src={img} alt="advance" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Trash2 className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ))}
                    <Label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Add Photo</span>
                      <Input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                 <Button className="w-full gap-2 text-md h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold" onClick={handleGenerateReport} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                    {isGenerating ? aiStep : "Generate Professional Report"}
                 </Button>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT PANEL: Preview */}
          <div className="space-y-4">
             <div className="flex items-center justify-end gap-3 mb-2 px-2">
                <Languages className={`h-4 w-4 ${isEnglish ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label className="font-semibold text-sm cursor-pointer" htmlFor="lang-toggle">
                   Translate to English
                </Label>
                <Switch id="lang-toggle" checked={isEnglish} onCheckedChange={setIsEnglish} />
             </div>

             <div className="bg-card border shadow-xl rounded-2xl overflow-hidden min-h-[600px] flex flex-col relative sticky top-6 transition-all ring-1 ring-border/50">
                {!displayReport && !isGenerating && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/10 backdrop-blur-[2px] z-10 p-8 text-center">
                     <ClipboardCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                     <h3 className="text-xl font-semibold text-foreground">No Report Generated</h3>
                     <p className="text-muted-foreground max-w-[300px] mt-2">Fill out the project details and click Generate to see the magic happen.</p>
                   </div>
                )}

                {/* The Printable Container */}
                <div className="overflow-x-auto flex-1 h-full w-full">
                  <div ref={previewRef} className="bg-white text-black p-8 sm:p-12 min-w-[700px] min-h-full font-sans print:p-0">
                     {/* Header */}
                     <div className="flex justify-between items-start border-b-2 border-black/10 pb-6 mb-8">
                        <div>
                           <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Work Progress Report</h1>
                           <div className="h-1 w-20 bg-primary mt-4 mb-4 rounded-full"></div>
                           <div className="space-y-1 text-gray-600 font-medium">
                              <p className="text-sm"><span className="text-gray-400">PROJECT:</span> <span className="text-gray-900 font-bold">{projectName || "—"}</span></p>
                              <p className="text-sm"><span className="text-gray-400">DATE:</span> <span className="text-gray-900">{date || "—"}</span></p>
                              {clientName && <p className="text-sm"><span className="text-gray-400">CLIENT:</span> <span className="text-gray-900">{clientName}</span></p>}
                              {clientPhone && <p className="text-sm"><span className="text-gray-400">PHONE:</span> <span className="text-gray-900">{clientPhone}</span></p>}
                              {locationStr && <p className="text-sm"><span className="text-gray-400">LOCATION:</span> <span className="text-gray-900">{locationStr}</span></p>}
                           </div>
                        </div>
                        {selectedCompany?.logo && (
                           <div className="max-w-[140px] max-h-[80px]">
                              <img src={selectedCompany.logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                           </div>
                        )}
                     </div>

                     {displayReport && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                           {/* Sections */}
                           <section>
                              <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-primary pl-3">Executive Summary</h3>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayReport.summary}</p>
                           </section>

                           <section>
                              <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-primary pl-3">Work Completed</h3>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayReport.workCompleted}</p>
                           </section>

                           <section>
                              <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-primary pl-3">Additional Notes</h3>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayReport.notes}</p>
                           </section>

                           {/* Image Grid */}
                           {images.length > 0 && (
                              <section className="pt-4 border-t border-gray-100">
                                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <ImageIcon className="h-5 w-5 text-gray-400" /> Site Photos
                                 </h3>
                                 <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, i) => (
                                       <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                                          <img src={img} className="w-full h-full object-cover" alt={`Proof ${i}`} />
                                       </div>
                                    ))}
                                 </div>
                              </section>
                           )}
                        </motion.div>
                     )}

                     {/* Footer Info */}
                     <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 max-w-full">
                        <p className="font-bold text-gray-600">{selectedCompany?.name || "Company Name"}</p>
                        <p>Generated via AddInvoices Advances Module</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
