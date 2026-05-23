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
  { id: 't1', name: "Standard Pro", category: "General", icon: LayoutTemplate, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 't2', name: "Clean Minimal", category: "General", icon: LayoutTemplate, color: "text-gray-500", bg: "bg-gray-500/10" },
  { id: 't3', name: "Plumbing Expert", category: "Plumbing", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: 't4', name: "Electrician Sparks", category: "Electrical", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: 't5', name: "HVAC Cool Breeze", category: "HVAC", icon: Wrench, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 't6', name: "Beauty Salon", category: "Beauty", icon: Scissors, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: 't7', name: "Auto Repair", category: "Automotive", icon: Car, color: "text-red-500", bg: "bg-red-500/10" },
  { id: 't8', name: "Landscaping", category: "Home Services", icon: Home, color: "text-green-500", bg: "bg-green-500/10" },
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
              <div className="aspect-[1/1.4] bg-secondary rounded-xl border border-border shadow-inner p-8 flex flex-col relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full ${previewTemplate.bg} opacity-50`} />
                 <div className="flex justify-between items-start mb-10">
                    <div className={`w-16 h-16 rounded-2xl ${previewTemplate.bg} ${previewTemplate.color} flex items-center justify-center`}>
                      <previewTemplate.icon className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-black opacity-20 uppercase tracking-widest">INVOICE</h2>
                      <p className="text-sm font-medium mt-1">#INV-001</p>
                    </div>
                 </div>
                 <div className="w-1/2 space-y-2 mb-10">
                   <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
                   <div className="h-2 w-3/4 bg-muted-foreground/20 rounded-full" />
                   <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full" />
                 </div>
                 <div className="flex-1 bg-background rounded-lg border border-border/50 p-4 shadow-sm space-y-4">
                   <div className="flex justify-between border-b pb-2">
                     <div className="h-3 w-1/4 bg-muted-foreground/30 rounded-full" />
                     <div className="h-3 w-1/6 bg-muted-foreground/30 rounded-full" />
                   </div>
                   {[1,2,3].map(i => (
                     <div key={i} className="flex justify-between">
                       <div className="h-2 w-1/3 bg-muted-foreground/10 rounded-full" />
                       <div className="h-2 w-1/6 bg-muted-foreground/10 rounded-full" />
                     </div>
                   ))}
                   <div className="pt-4 flex justify-between font-bold">
                     <span className="text-sm">Total</span>
                     <span className="text-sm">$450.00</span>
                   </div>
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
