"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FileText, Sparkles, LayoutDashboard, ArrowRight, Check, Mic } from "lucide-react"
import { useHaptic } from "@/hooks/use-haptic"

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const { triggerHaptic } = useHaptic()

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding")
    if (!hasSeen) {
      setTimeout(() => {
        setOpen(true)
        triggerHaptic("heavy")
      }, 1500)
    }
  }, [triggerHaptic])

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setOpen(false)
    triggerHaptic("success")
  }

  const nextStep = () => {
    triggerHaptic("light")
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const steps = [
    {
      title: "Welcome to AddInvoices",
      description: "The ultimate platform to manage your business, invoices, and clients seamlessly.",
      bg: "bg-blue-500/10",
      icon: <Image src="/images/logotipoaddinvoces.png" alt="Logo" width={80} height={80} className="drop-shadow-lg" />
    },
    {
      title: "Invoicing made simple",
      description: "Say goodbye to complex spreadsheets. Generate professional invoices and quotes instantly.",
      bg: "bg-green-500/10",
      icon: <FileText className="w-20 h-20 text-green-500 drop-shadow-md" />
    },
    {
      title: "Meet your AI Assistant",
      description: "Too busy to type? Just use your voice to create invoices, register expenses, and navigate the app.",
      bg: "bg-purple-500/10",
      icon: <div className="relative"><div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" /><Mic className="w-20 h-20 text-purple-500 drop-shadow-md relative z-10" /></div>
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border/50 shadow-2xl sm:rounded-[2rem] rounded-[2rem] max-w-[calc(100vw-32px)]">
        <DialogTitle className="sr-only">Welcome to AddInvoices</DialogTitle>
        <DialogDescription className="sr-only">Onboarding steps to introduce the app</DialogDescription>
        
        <div className="relative w-full h-[450px] flex flex-col bg-background">
          {/* Step Indicator */}
          <div className="absolute top-6 inset-x-0 flex justify-center gap-2 z-20">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : "w-2 bg-primary/20"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${steps[step].bg}`}
            >
              <div className="mb-8">
                {steps[step].icon}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {steps[step].title}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-[280px]">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="p-6 bg-card border-t border-border/50 flex justify-between items-center z-20">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={handleComplete}
            >
              Skip
            </Button>
            <Button 
              onClick={nextStep}
              className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20"
            >
              {step === steps.length - 1 ? (
                <>Get Started <Check className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
