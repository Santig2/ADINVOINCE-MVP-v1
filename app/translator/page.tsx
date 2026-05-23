"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Mic, Send, Languages, Volume2, Globe, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

export default function TranslatorPage() {
  const [isListening, setIsListening] = useState(false)
  const [liveTextSp, setLiveTextSp] = useState("...")
  const [liveTextEn, setLiveTextEn] = useState("Waiting for voice...")
  const [isTranslating, setIsTranslating] = useState(false)
  
  // Chat State
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState([
    { id: 1, sender: "client", text: "Can you send me the invoice for today's work?", translation: "¿Puedes enviarme la factura del trabajo de hoy?" },
    { id: 2, sender: "me", text: "Claro que sí, te la envío en 5 minutos.", translation: "Sure, I'll send it to you in 5 minutes." }
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false)
    } else {
      setIsListening(true)
      setLiveTextSp("...")
      setLiveTextEn("Translating...")
      // Mock listening & translating
      setTimeout(() => {
        setLiveTextSp("Hola, el servicio de plomería estará listo en dos horas.")
        setIsTranslating(true)
        setTimeout(() => {
          setIsTranslating(false)
          setLiveTextEn("Hello, the plumbing service will be ready in two hours.")
          setIsListening(false)
        }, 1500)
      }, 2000)
    }
  }

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!chatInput.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: chatInput,
      translation: "Translating..."
    }
    setMessages((prev) => [...prev, newMsg])
    setChatInput("")

    // Mock response translation
    setTimeout(() => {
      setMessages((prev) => prev.map(m => m.id === newMsg.id ? { ...m, translation: "[Translated to English automatically]" } : m))
      
      // Mock client reply
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          sender: "client",
          text: "Perfect, thank you!",
          translation: "¡Perfecto, gracias!"
        }])
      }, 2000)
    }, 1000)
  }
  
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Languages className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground">AI Translator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Real-time communication breaking language barriers.
          </p>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="live">Live Voice</TabsTrigger>
            <TabsTrigger value="chat">Async Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* You (Spanish) */}
              <Card className="bg-card/50 backdrop-blur-md border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Globe className="w-24 h-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tú (Español)</span>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Listening</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex flex-col justify-between">
                  <div className="flex-1 text-xl font-medium text-foreground/80 overflow-y-auto">
                    <p className={isListening ? "animate-pulse text-muted-foreground" : ""}>{liveTextSp}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button 
                      size="lg" 
                      className={`rounded-full w-16 h-16 shadow-lg transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
                      onClick={handleMicClick}
                    >
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Client (English) */}
              <Card className="bg-secondary/30 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Client (English)</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex flex-col justify-between">
                  <div className="flex-1 text-xl font-medium text-foreground/80 overflow-y-auto flex flex-col">
                    {isTranslating ? (
                      <div className="flex items-center gap-2 text-primary opacity-70">
                        <Loader2 className="w-5 h-5 animate-spin" /> Translating audio...
                      </div>
                    ) : (
                      <p className="text-primary">{liveTextEn}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Press the microphone to start speaking. The translation will be played automatically to the client.</p>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-card/50 backdrop-blur-md border-white/10 h-[600px] flex flex-col">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  Client Chat (Auto-translated)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden relative">
                {/* Chat feed mock */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-20">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div 
                        key={msg.id}
                        initial={{opacity:0, y:10, scale:0.95}} 
                        animate={{opacity:1, y:0, scale:1}} 
                        className={`flex flex-col gap-1 ${msg.sender === 'client' ? 'items-start' : 'items-end'}`}
                      >
                        <div className={`p-3 max-w-[80%] ${msg.sender === 'client' ? 'bg-secondary rounded-2xl rounded-tl-none' : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'}`}>
                          <p className="text-sm font-medium">{msg.text}</p>
                          <p className={`text-xs mt-1 italic ${msg.sender === 'client' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                            {msg.translation}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>
                
                {/* Input area */}
                <form onSubmit={handleSendChat} className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-xl p-2 rounded-full border border-border shadow-lg">
                  <Input 
                    placeholder="Escribe en español..." 
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <Button type="submit" className="rounded-full w-10 h-10 p-0 shrink-0 bg-primary hover:bg-primary/90 text-white" disabled={!chatInput.trim()}>
                    <Send className="w-5 h-5 -ml-1" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
