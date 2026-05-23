"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Share2, Sparkles, CheckCircle2, ArrowRight, Activity, Loader2 } from "lucide-react"
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

const platforms = [
  { id: 1, name: "Yelp", status: "Not Connected", color: "bg-red-500", icon: Store },
  { id: 2, name: "Nextdoor", status: "Connected", color: "bg-green-500", icon: Store },
  { id: 3, name: "Care.com", status: "Not Connected", color: "bg-blue-500", icon: Store },
  { id: 4, name: "Google Business", status: "Connected", color: "bg-orange-500", icon: Store },
]

export default function MarketplacePage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [platformList, setPlatformList] = useState(platforms)
  const [connectingPlatform, setConnectingPlatform] = useState<number | null>(null)

  const handleGenerateAI = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setHasGenerated(true)
      toast({
        title: "Profile Generated",
        description: "Your optimized AI Listing is ready to be published."
      })
    }, 2500)
  }

  const handleConnect = (id: number, name: string, status: string) => {
    if (status === "Connected") {
       setPlatformList(prev => prev.map(p => p.id === id ? { ...p, status: "Not Connected" } : p))
       toast({ title: "Disconnected", description: `${name} has been disconnected.` })
       return
    }
    
    setConnectingPlatform(id)
    setTimeout(() => {
      setPlatformList(prev => prev.map(p => p.id === id ? { ...p, status: "Connected" } : p))
      setConnectingPlatform(null)
      toast({
        title: "Platform Connected",
        description: `${name} is now connected and syncing.`
      })
    }, 1500)
  }
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">Marketplace Exposure</h1>
              <p className="text-muted-foreground mt-1">Connect your business to top directories and boost your visibility.</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-4 rounded-full font-bold">
            IN DEVELOPMENT
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Listing Generator
                </CardTitle>
                <CardDescription className="text-base">
                  Let our AI generate an optimized profile, professional description, and strategic keywords based on your existing business info to maximize your online exposure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 mb-6">
                  <h4 className="font-bold mb-4">What AI will do:</h4>
                  <ul className="space-y-3">
                    {['Create optimized profiles', 'Generate professional descriptions', 'Inject strategic keywords', 'Automate digital presence'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  size="lg" 
                  className={`w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/20 transition-all ${hasGenerated ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
                  onClick={handleGenerateAI}
                  disabled={isGenerating || hasGenerated}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : hasGenerated ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> View Generated Profile</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate My AI Profile</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              {platformList.map((plat, i) => (
                <motion.div key={plat.name} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1}}>
                  <Card 
                    className={`transition-colors group cursor-pointer ${plat.status === 'Connected' ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => handleConnect(plat.id, plat.name, plat.status)}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${plat.color} shadow-md`}>
                          {connectingPlatform === plat.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <plat.icon className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{plat.name}</h4>
                          <span className={`text-xs font-semibold ${plat.status === 'Connected' ? 'text-primary' : 'text-muted-foreground'}`}>
                            {connectingPlatform === plat.id ? 'Connecting...' : plat.status}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Exposure Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profile Views</span>
                    <span className="font-bold text-green-500">+124%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-[75%] h-full bg-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Potential Clients</span>
                    <span className="font-bold text-primary">+86</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Saved</span>
                    <span className="font-bold text-orange-500">12 hrs/mo</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-[40%] h-full bg-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary-dark to-primary text-white border-0">
              <CardContent className="p-6 text-center space-y-4">
                <Activity className="w-12 h-12 mx-auto text-white/80" />
                <h3 className="font-bold text-xl">Boost Your Reach</h3>
                <p className="text-sm text-white/80">
                  Businesses connected to at least 3 directories see a 40% increase in new leads.
                </p>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-bold">
                  Connect More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
