"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutTemplate, Droplets, Zap, Wrench, Scissors, Car, Home, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

const templates = [
  { id: 't1', name: "Standard Pro", category: "General", icon: LayoutTemplate, color: "text-blue-500", bg: "bg-blue-500/10", theme: "bg-white text-black", table: "border-slate-100", textPrimary: "text-slate-800", textSecondary: "text-slate-500", textMuted: "text-slate-400", accent: "bg-slate-50" },
  { id: 't2', name: "Clean Minimal", category: "General", icon: LayoutTemplate, color: "text-slate-700", bg: "bg-slate-500/10", theme: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900", table: "border-slate-200", textPrimary: "text-slate-900", textSecondary: "text-slate-600", textMuted: "text-slate-500", accent: "bg-white/50" },
  { id: 't3', name: "Plumbing Expert", category: "Plumbing", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/20", theme: "bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-white", table: "border-white/10", textPrimary: "text-white", textSecondary: "text-blue-100/70", textMuted: "text-blue-200/40", accent: "bg-white/5" },
  { id: 't4', name: "Electrician Sparks", category: "Electrical", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", theme: "bg-gradient-to-br from-zinc-900 to-zinc-950 text-white", table: "border-white/10", textPrimary: "text-white", textSecondary: "text-zinc-300", textMuted: "text-zinc-500", accent: "bg-white/5" },
  { id: 't5', name: "HVAC Cool Breeze", category: "HVAC", icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/20", theme: "bg-gradient-to-br from-slate-900 to-orange-950/40 text-white", table: "border-white/10", textPrimary: "text-white", textSecondary: "text-orange-100/70", textMuted: "text-orange-200/40", accent: "bg-white/5" },
  { id: 't6', name: "Beauty Salon", category: "Beauty", icon: Scissors, color: "text-pink-600", bg: "bg-pink-500/20", theme: "bg-gradient-to-br from-pink-50 to-rose-100 text-slate-900", table: "border-pink-200", textPrimary: "text-slate-900", textSecondary: "text-slate-600", textMuted: "text-slate-400", accent: "bg-white/50" },
  { id: 't7', name: "Auto Repair", category: "Automotive", icon: Car, color: "text-red-400", bg: "bg-red-500/20", theme: "bg-gradient-to-br from-neutral-900 to-neutral-950 text-white", table: "border-white/10", textPrimary: "text-white", textSecondary: "text-neutral-300", textMuted: "text-neutral-500", accent: "bg-white/5" },
  { id: 't8', name: "Landscaping", category: "Home Services", icon: Home, color: "text-green-400", bg: "bg-green-500/20", theme: "bg-gradient-to-br from-emerald-950 to-green-900 text-white", table: "border-white/10", textPrimary: "text-white", textSecondary: "text-green-100/70", textMuted: "text-green-200/40", accent: "bg-white/5" },
]

export default function TemplatesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("All")
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("t1")

  const filteredTemplates = activeTab === "All" ? templates : templates.filter(t => t.category === activeTab)

  const handleApply = (id: string, name: string) => {
    setSelectedTemplate(id)
    setPreviewTemplate(null)
    toast({
      title: "Template Applied!",
      description: `Your default template is now set to ${name}.`
    })
  }
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">Invoice Templates</h1>
              <p className="text-muted-foreground mt-1">Professional templates for every type of business.</p>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            Create Custom Template
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["All", "General", "Plumbing", "Electrical", "HVAC", "Beauty", "Automotive", "Home Services"].map((cat) => (
            <Badge 
              key={cat} 
              variant={cat === activeTab ? "default" : "secondary"}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 cursor-pointer text-sm whitespace-nowrap rounded-full transition-all ${cat === activeTab ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((tpl, i) => (
              <motion.div
                key={tpl.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  onClick={() => setPreviewTemplate(tpl)}
                  className={`group overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer h-full flex flex-col ${selectedTemplate === tpl.id ? 'border-primary shadow-primary/20' : 'border-border/50 hover:border-primary/50'}`}
                >
                  <div className="h-48 bg-secondary/50 relative flex items-center justify-center p-6 border-b border-border/50">
                    {/* Mock preview of a template */}
                  <div className="w-full h-full bg-background rounded-lg shadow-sm border border-border/50 p-3 flex flex-col gap-2 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="flex justify-between items-start">
                      <div className={`w-8 h-8 rounded-md ${tpl.bg} ${tpl.color} flex items-center justify-center`}>
                        <tpl.icon className="w-4 h-4" />
                      </div>
                      <div className="w-16 h-3 bg-muted rounded-full" />
                    </div>
                    <div className="w-24 h-4 bg-muted rounded-full mt-2" />
                    <div className="space-y-1 mt-4">
                      <div className="w-full h-2 bg-muted/50 rounded-full" />
                      <div className="w-full h-2 bg-muted/50 rounded-full" />
                      <div className="w-3/4 h-2 bg-muted/50 rounded-full" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tpl); }}>Preview</Button>
                    </div>
                    {selectedTemplate === tpl.id && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col gap-1 relative">
                  <h3 className="font-bold text-lg">{tpl.name}</h3>
                  <p className="text-sm text-muted-foreground">{tpl.category}</p>
                </CardContent>
              </Card>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} Preview</DialogTitle>
            <DialogDescription>Template optimized for {previewTemplate?.category} businesses.</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="flex flex-col gap-6">
              <div className={`w-full min-h-[500px] max-h-[60vh] sm:max-h-none overflow-y-auto sm:aspect-[1/1.4] ${previewTemplate.theme} rounded-xl border border-border shadow-2xl p-4 sm:p-8 flex flex-col relative`}>
                 {/* Top Colored Bar */}
                 <div className={`absolute top-0 left-0 w-full h-3 ${previewTemplate.bg} opacity-80`} />
                 
                 {/* Header */}
                 <div className="flex justify-between items-start mb-8 mt-2">
                    <div className="flex gap-2 sm:gap-3 items-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${previewTemplate.bg} ${previewTemplate.color} flex items-center justify-center backdrop-blur-md border border-white/10`}>
                        <previewTemplate.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-base sm:text-lg leading-tight ${previewTemplate.textPrimary}`}>{previewTemplate.name}</h3>
                        <p className={`text-[10px] sm:text-xs ${previewTemplate.textSecondary}`}>Professional Services</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-widest opacity-20`}>INVOICE</h2>
                      <p className={`text-xs sm:text-sm font-semibold mt-1 ${previewTemplate.textSecondary}`}>#INV-2024-001</p>
                    </div>
                 </div>
                 
                 {/* Billing Info */}
                 <div className="flex justify-between gap-4 mb-8 text-xs sm:text-sm">
                   <div>
                     <p className={`text-xs font-bold uppercase mb-1 ${previewTemplate.textMuted}`}>Bill To:</p>
                     <p className={`font-semibold ${previewTemplate.textPrimary}`}>Acme Corporation</p>
                     <p className={previewTemplate.textSecondary}>123 Business Rd.</p>
                     <p className={previewTemplate.textSecondary}>Suite 100, City</p>
                   </div>
                   <div className="text-right">
                     <p className={`text-xs font-bold uppercase mb-1 ${previewTemplate.textMuted}`}>Date:</p>
                     <p className={`font-semibold ${previewTemplate.textPrimary}`}>Oct 24, 2024</p>
                     <p className={`text-xs font-bold uppercase mt-2 mb-1 ${previewTemplate.textMuted}`}>Due Date:</p>
                     <p className={`font-semibold ${previewTemplate.textPrimary}`}>Nov 24, 2024</p>
                   </div>
                 </div>

                 {/* Table */}
                 <div className="flex-1 overflow-x-auto pb-4">
                   <table className="w-full text-xs sm:text-sm min-w-[350px]">
                     <thead>
                       <tr className={`border-b-2 ${previewTemplate.table} ${previewTemplate.textMuted}`}>
                         <th className="text-left pb-2 font-semibold">Description</th>
                         <th className="text-center pb-2 font-semibold">Qty</th>
                         <th className="text-right pb-2 font-semibold">Price</th>
                         <th className="text-right pb-2 font-semibold">Total</th>
                       </tr>
                     </thead>
                     <tbody className={previewTemplate.textSecondary}>
                       <tr className={`border-b ${previewTemplate.table} ${previewTemplate.accent}`}>
                         <td className="py-3 px-2 rounded-l-lg">Standard Service Call</td>
                         <td className="py-3 text-center">1</td>
                         <td className="py-3 text-right">$150.00</td>
                         <td className={`py-3 px-2 text-right font-medium rounded-r-lg ${previewTemplate.textPrimary}`}>$150.00</td>
                       </tr>
                       <tr className={`border-b ${previewTemplate.table}`}>
                         <td className="py-3 px-2">Parts and Materials</td>
                         <td className="py-3 text-center">1</td>
                         <td className="py-3 text-right">$85.00</td>
                         <td className={`py-3 px-2 text-right font-medium ${previewTemplate.textPrimary}`}>$85.00</td>
                       </tr>
                       <tr className={`border-b ${previewTemplate.table} ${previewTemplate.accent}`}>
                         <td className="py-3 px-2 rounded-l-lg">Labor (Hours)</td>
                         <td className="py-3 text-center">2</td>
                         <td className="py-3 text-right">$65.00</td>
                         <td className={`py-3 px-2 text-right font-medium rounded-r-lg ${previewTemplate.textPrimary}`}>$130.00</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>

                 {/* Totals */}
                 <div className={`flex justify-end pt-4 mb-8 border-t ${previewTemplate.table}`}>
                   <div className="w-1/2 space-y-2 text-sm">
                     <div className={`flex justify-between ${previewTemplate.textSecondary}`}>
                       <span>Subtotal</span>
                       <span>$365.00</span>
                     </div>
                     <div className={`flex justify-between ${previewTemplate.textSecondary}`}>
                       <span>Tax (10%)</span>
                       <span>$36.50</span>
                     </div>
                     <div className={`flex justify-between font-bold text-lg pt-2 border-t ${previewTemplate.table} ${previewTemplate.textPrimary}`}>
                       <span>Total Due</span>
                       <span className={previewTemplate.color.replace('text-', 'text-')}>$401.50</span>
                     </div>
                   </div>
                 </div>

                 {/* Footer */}
                 <div className={`mt-auto text-center border-t ${previewTemplate.table} pt-4`}>
                   <p className={`text-xs font-medium ${previewTemplate.textMuted}`}>Thank you for your business!</p>
                 </div>
              </div>
              <Button 
                size="lg" 
                className="w-full rounded-full"
                onClick={() => handleApply(previewTemplate.id, previewTemplate.name)}
                disabled={selectedTemplate === previewTemplate.id}
              >
                {selectedTemplate === previewTemplate.id ? "Already Applied" : "Apply to Invoices"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
