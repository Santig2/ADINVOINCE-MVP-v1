"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IdCard, QrCode, ScanLine, Share2, Download, Palette, Link as LinkIcon, Edit3, Smartphone, Briefcase, PlusCircle, CheckCircle2, Instagram, Facebook, Linkedin, Twitter } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const nicheTemplates = {
  plumbing: { profession: "Master Plumber", color: "from-[#0f172a] via-[#1e3a8a] to-[#0f172a]", accent: "bg-blue-500/20" },
  electrician: { profession: "Licensed Electrician", color: "from-[#18181b] via-[#451a03] to-[#78350f]", accent: "bg-yellow-500/20" },
  real_estate: { profession: "Real Estate Broker", color: "from-[#022c22] via-[#064e3b] to-[#022c22]", accent: "bg-emerald-500/20" },
  it_services: { profession: "IT Consultant", color: "from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]", accent: "bg-indigo-500/20" },
}

export default function BusinessCardPage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [cardData, setCardData] = useState({
    name: "John Doe",
    niche: "plumbing",
    profession: "Master Plumber",
    phone: "+1 (555) 123-4567",
    email: "john@doeplumbing.com",
    website: "www.doeplumbing.com",
    socialNetwork: "instagram",
    socialHandle: "@doeplumbing",
    color: "from-[#0f172a] via-[#1e3a8a] to-[#0f172a]",
    accent: "bg-blue-500/20"
  })
  
  const [walletAdded, setWalletAdded] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    toast({
      title: "Card Updated",
      description: "Your digital business card has been updated successfully."
    })
  }

  const handleNicheChange = (val: string) => {
    const tpl = nicheTemplates[val as keyof typeof nicheTemplates]
    setCardData({
      ...cardData,
      niche: val,
      profession: tpl.profession,
      color: tpl.color,
      accent: tpl.accent
    })
  }

  const handleAddToWallet = () => {
    setWalletAdded(true)
    toast({ title: "Added to Apple Wallet", description: "Your card is now available in your digital wallet." })
  }

  const renderSocialIcon = (network: string, className: string) => {
    switch (network) {
      case "instagram": return <Instagram className={className} />;
      case "facebook": return <Facebook className={className} />;
      case "linkedin": return <Linkedin className={className} />;
      case "twitter": return <Twitter className={className} />;
      default: return null;
    }
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <IdCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">Digital Business Card</h1>
              <p className="text-muted-foreground mt-1">Design, share, and add to your digital wallet instantly.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Preview Area */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center justify-between">
              Your Digital Card
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </h2>
            
            {/* Mock Business Card */}
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative group perspective">
              <div className={`w-full aspect-[1.586/1] bg-gradient-to-br ${cardData.color} rounded-[2rem] text-white shadow-2xl relative overflow-hidden transform transition-all duration-500 group-hover:shadow-primary/40 flex flex-col`}>
                
                {/* Decorative background elements */}
                <div className="absolute top-[-20%] right-[-10%] w-3/4 h-3/4 bg-white/5 rounded-full blur-3xl" />
                <div className={`absolute bottom-[-20%] left-[-10%] w-1/2 h-1/2 ${cardData.accent} rounded-full blur-3xl`} />
                
                {/* Top Section */}
                <div className="flex-1 p-5 sm:p-8 relative z-10 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">{cardData.name}</h3>
                      <p className="text-white/80 font-medium mt-0.5 sm:mt-1 uppercase tracking-wider text-[10px] sm:text-xs">{cardData.profession}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 flex items-center justify-center shadow-inner shrink-0 ml-2">
                      <IdCard className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Bottom Section (Glassmorphism Footer) */}
                <div className="h-auto min-h-[45%] w-full bg-black/20 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 sm:px-8 flex justify-between items-end relative z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] gap-2">
                  <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-white/90">
                    <p className="flex items-center gap-1.5 sm:gap-2"><span className="w-3 sm:w-4 flex justify-center opacity-70">📱</span> {cardData.phone}</p>
                    <p className="flex items-center gap-1.5 sm:gap-2"><span className="w-3 sm:w-4 flex justify-center opacity-70">✉️</span> {cardData.email}</p>
                    <p className="flex items-center gap-1.5 sm:gap-2"><span className="w-3 sm:w-4 flex justify-center opacity-70">🌐</span> {cardData.website}</p>
                    {cardData.socialHandle && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 font-medium text-white">
                        <span className="w-3 sm:w-4 flex justify-center opacity-90">{renderSocialIcon(cardData.socialNetwork, "w-3 h-3 sm:w-4 sm:h-4")}</span>
                        <span>{cardData.socialHandle}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code Container styled like a chip/scan zone */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/90 p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-lg transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300 shrink-0 mb-1">
                    <div className="w-full h-full border sm:border-2 border-dashed border-slate-400 rounded sm:rounded-lg flex items-center justify-center bg-white">
                      <QrCode className="w-8 h-8 sm:w-12 sm:h-12 text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAddToWallet} disabled={walletAdded} className="flex-1 rounded-full h-12 bg-black hover:bg-black/80 text-white font-semibold transition-all">
                {walletAdded ? (
                   <><CheckCircle2 className="w-5 h-5 mr-2 text-green-400" /> Added to Wallet</>
                ) : (
                   <><Smartphone className="w-5 h-5 mr-2" /> Add to Apple Wallet</>
                )}
              </Button>
            </div>
            <div className="flex gap-3 justify-center sm:justify-start">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full flex-1 sm:flex-none">
                <Share2 className="w-4 h-4 mr-2" />
                Share QR
              </Button>
              <Button variant="outline" className="rounded-full flex-1 sm:flex-none border-primary/20 hover:bg-primary/5">
                <Download className="w-4 h-4 mr-2" />
                Save Image
              </Button>
              <Button variant="outline" size="icon" className="rounded-full shrink-0 border-primary/20 hover:bg-primary/5">
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tools & Features */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Profile Settings</h2>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-semibold">Business Niche Template</Label>
                    <Select value={cardData.niche} onValueChange={handleNicheChange}>
                      <SelectTrigger className="bg-background border-primary/20 focus:ring-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">💧 Plumbing & Water Services</SelectItem>
                        <SelectItem value="electrician">⚡ Electrical Services</SelectItem>
                        <SelectItem value="real_estate">🏠 Real Estate & Brokers</SelectItem>
                        <SelectItem value="it_services">💻 IT & Tech Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Job Title / Profession</Label>
                      <Input value={cardData.profession} onChange={e => setCardData({...cardData, profession: e.target.value})} className="bg-background" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Phone Number</Label>
                      <Input value={cardData.phone} onChange={e => setCardData({...cardData, phone: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <Input type="email" value={cardData.email} onChange={e => setCardData({...cardData, email: e.target.value})} className="bg-background" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Website URL</Label>
                    <Input value={cardData.website} onChange={e => setCardData({...cardData, website: e.target.value})} className="bg-background" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Social Network</Label>
                      <Select value={cardData.socialNetwork} onValueChange={(val) => setCardData({...cardData, socialNetwork: val})}>
                        <SelectTrigger className="bg-background border-primary/20 focus:ring-primary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter / X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Social Handle / Link</Label>
                      <Input value={cardData.socialHandle} onChange={e => setCardData({...cardData, socialHandle: e.target.value})} className="bg-background" placeholder="@username" />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <ScanLine className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">NFC Tap Enabled</h3>
                  <p className="text-sm text-muted-foreground">Order a physical NFC card linked to this profile. Tap it on any phone to share your details instantly.</p>
                  <Button variant="link" className="px-0 mt-1 h-auto text-primary">Order Physical Card &rarr;</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
