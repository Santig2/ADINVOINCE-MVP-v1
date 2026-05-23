"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IdCard, QrCode, ScanLine, Share2, Download, Palette, Link as LinkIcon, Edit3 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BusinessCardPage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [cardData, setCardData] = useState({
    name: "John Doe",
    profession: "Master Plumber",
    phone: "+1 (555) 123-4567",
    email: "john@doeplumbing.com",
    website: "www.doeplumbing.com",
    color: "from-slate-900 to-slate-800",
    accent: "bg-cyan-500/20"
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    toast({
      title: "Card Updated",
      description: "Your digital business card has been updated successfully."
    })
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
              <h1 className="text-3xl md:text-4xl font-black text-foreground">Business Cards</h1>
              <p className="text-muted-foreground mt-1">Smart digital cards to network faster and better.</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-4 rounded-full font-bold">
            EN DESARROLLO
          </Badge>
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
              <div className={`w-full aspect-[1.586/1] bg-gradient-to-br ${cardData.color} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transform transition-all duration-500 group-hover:shadow-primary/30`}>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className={`absolute bottom-0 left-0 w-48 h-48 ${cardData.accent} rounded-full blur-3xl translate-y-1/3 -translate-x-1/4`} />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{cardData.name}</h3>
                      <p className="text-white/70 font-medium mt-1">{cardData.profession}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <IdCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1 text-sm text-white/80">
                      <p>{cardData.phone}</p>
                      <p>{cardData.email}</p>
                      <p>{cardData.website}</p>
                    </div>
                    <div className="w-20 h-20 bg-white p-1 rounded-lg">
                      <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-3 justify-center sm:justify-start">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full flex-1 sm:flex-none">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="rounded-full flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Save PDF
              </Button>
              <Button variant="outline" size="icon" className="rounded-full shrink-0">
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tools & Features */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Tools</h2>
            
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Custom Branding</h3>
                  <p className="text-sm text-muted-foreground">Modify colors, fonts, and layout to match your business identity perfectly.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Scan Existing Cards</h3>
                  <p className="text-sm text-muted-foreground">Use AI to scan physical cards and automatically extract the information to your contacts.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Smart Distribution</h3>
                  <p className="text-sm text-muted-foreground">Share via QR, NFC, text message, or email. Track how many times your card is viewed.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business Card</DialogTitle>
            <DialogDescription>Update the information displayed on your digital card.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Profession / Title</Label>
              <Input value={cardData.profession} onChange={e => setCardData({...cardData, profession: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={cardData.phone} onChange={e => setCardData({...cardData, phone: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={cardData.email} onChange={e => setCardData({...cardData, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input value={cardData.website} onChange={e => setCardData({...cardData, website: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Theme Color</Label>
              <div className="flex gap-2">
                <div onClick={() => setCardData({...cardData, color: 'from-slate-900 to-slate-800', accent: 'bg-cyan-500/20'})} className={`w-8 h-8 rounded-full bg-slate-800 cursor-pointer ${cardData.color.includes('slate') ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                <div onClick={() => setCardData({...cardData, color: 'from-blue-900 to-blue-700', accent: 'bg-blue-400/20'})} className={`w-8 h-8 rounded-full bg-blue-800 cursor-pointer ${cardData.color.includes('blue') ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                <div onClick={() => setCardData({...cardData, color: 'from-orange-600 to-orange-400', accent: 'bg-yellow-300/20'})} className={`w-8 h-8 rounded-full bg-orange-500 cursor-pointer ${cardData.color.includes('orange') ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
