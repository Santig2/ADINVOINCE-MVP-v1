"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, ArrowRight, Bot, Link as LinkIcon, Share2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShareLinkDialog } from "@/components/share-link-dialog"

export default function ReputationPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState([
    { id: 1, name: "Maria S.", date: "Yesterday", text: "The plumber arrived 2 hours late. Work was good but communication was poor." },
    { id: 2, name: "John D.", date: "2 days ago", text: "They left a mess in the kitchen after fixing the sink. Very unprofessional." }
  ])
  const [resolvingId, setResolvingId] = useState<number | null>(null)
  const [resolutionText, setResolutionText] = useState("")
  
  const [googleBusinessLink, setGoogleBusinessLink] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [companyId, setCompanyId] = useState("default-company")

  useEffect(() => {
    // Load reviews and config
    const savedLink = localStorage.getItem("googleBusinessLink") || ""
    setGoogleBusinessLink(savedLink)
    
    const intercepted = JSON.parse(localStorage.getItem("interceptedReviews") || "[]")
    if (intercepted.length > 0) {
      setReviews(intercepted)
    }

    const savedCompanies = JSON.parse(localStorage.getItem("companies") || "[]")
    if (savedCompanies.length > 0) {
      setCompanyId(savedCompanies[0].id.toString())
    }
  }, [])

  const handleSaveLink = () => {
    localStorage.setItem("googleBusinessLink", googleBusinessLink)
    toast({
      title: "Link Saved",
      description: "Google Business link updated successfully."
    })
  }

  const handleResolve = () => {
    if (!resolvingId) return
    setReviews(prev => prev.filter(r => r.id !== resolvingId))
    setResolvingId(null)
    setResolutionText("")
    toast({
      title: "Issue Resolved",
      description: "The client has been notified and the ticket is closed."
    })
    
    // update localStorage
    const intercepted = JSON.parse(localStorage.getItem("interceptedReviews") || "[]")
    const updated = intercepted.filter((r: any) => r.id !== resolvingId)
    localStorage.setItem("interceptedReviews", JSON.stringify(updated))
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">Reputation Manager</h1>
              <p className="text-muted-foreground mt-1">Review Filtering System by Botsy.</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-4 rounded-full font-bold">
            EN DESARROLLO
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Banner */}
            <Card className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white border-0 overflow-hidden relative">
              <div className="absolute right-0 bottom-0 opacity-20 -mr-10 -mb-10">
                <Bot className="w-48 h-48" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Automated Review Filtering</h2>
                      <p className="text-white/80 max-w-md">
                        Botsy automatically requests reviews from your clients. Positive experiences go to Google, while issues are sent privately to you to resolve.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="shrink-0 bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Request Review
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard / Toggles */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Configure how Botsy handles your clients' feedback.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Google Business Link */}
                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 shrink-0">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="font-bold text-slate-800 text-base">Google Business Link</Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Where should happy clients (4-5 stars) be redirected to post their review?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pl-12">
                    <Input 
                      placeholder="https://g.page/r/..." 
                      value={googleBusinessLink}
                      onChange={(e) => setGoogleBusinessLink(e.target.value)}
                      className="bg-white border-blue-100"
                    />
                    <Button onClick={handleSaveLink} className="shrink-0 bg-blue-600 hover:bg-blue-700">Save Link</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Auto-Request Reviews</p>
                      <p className="text-sm text-muted-foreground">Send SMS/Email 24h after job completion.</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Redirect Positive to Google</p>
                      <p className="text-sm text-muted-foreground">4 and 5 star ratings are prompted to post on Google.</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <ThumbsDown className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Intercept Negative Reviews</p>
                      <p className="text-sm text-muted-foreground">1 to 3 star ratings open a private support ticket.</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Intercepted Reviews */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reputation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-black text-foreground">4.8</span>
                  <span className="text-muted-foreground mb-1">/ 5.0</span>
                </div>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current opacity-50" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Google Reviews</span>
                    <span className="font-bold">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-green-500">New this month</span>
                    <span className="font-bold text-green-500">+12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-t-4 border-t-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  Intercepted
                  {reviews.length > 0 && <Badge variant="destructive" className="rounded-full">{reviews.length} Action Required</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {reviews.map(review => (
                    <motion.div key={review.id} initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-sm">{review.name}</p>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-xs text-foreground/80 mb-3">"{review.text}"</p>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => setResolvingId(review.id)}>Resolve Issue</Button>
                      </div>
                    </motion.div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground text-sm">No pending issues!</div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!resolvingId} onOpenChange={(open) => !open && setResolvingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Client Issue</DialogTitle>
            <DialogDescription>Send a direct message to the client to resolve their bad experience privately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea 
              placeholder="Hi, I'm so sorry about your experience..." 
              value={resolutionText}
              onChange={e => setResolutionText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-between items-center">
              <Button variant="ghost" className="text-muted-foreground">Offer Discount</Button>
              <Button onClick={handleResolve} disabled={!resolutionText.trim()}>Send & Resolve</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareLinkDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        documentId={companyId}
        documentType="review"
        customUrl={typeof window !== "undefined" ? `${window.location.origin}/p/review/${companyId}` : ""}
      />
    </AppLayout>
  )
}
