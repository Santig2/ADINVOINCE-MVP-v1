"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, ExternalLink, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ReviewPortalPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [company, setCompany] = useState<any>(null)
  const [googleLink, setGoogleLink] = useState("")
  
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  
  const [clientName, setClientName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from an API using companyId
    // For MVP, we read from localStorage
    const savedCompanies = JSON.parse(localStorage.getItem("companies") || "[]")
    const found = savedCompanies.find((c: any) => c.id.toString() === companyId)
    if (found) {
      setCompany(found)
    }

    const link = localStorage.getItem("googleBusinessLink") || ""
    setGoogleLink(link)
  }, [companyId])

  const handleSubmitInternal = () => {
    if (!feedback.trim()) return

    setIsSubmitting(true)
    
    setTimeout(() => {
      // Save intercepted review
      const intercepted = JSON.parse(localStorage.getItem("interceptedReviews") || "[]")
      intercepted.unshift({
        id: Date.now(),
        name: clientName.trim() || "Anonymous Client",
        date: "Just now",
        text: feedback,
        rating
      })
      localStorage.setItem("interceptedReviews", JSON.stringify(intercepted))
      
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  const handleGoogleRedirect = () => {
    if (googleLink) {
      window.open(googleLink, "_blank")
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl rounded-3xl border-0">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">
            {rating >= 4 
              ? "We appreciate your support and for sharing your experience!" 
              : "Your feedback is incredibly valuable to us. Our management team will review it and may reach out to make things right."}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
      
      <div className="w-full max-w-xl text-center mb-10 mt-6">
        {company?.logo ? (
          <img src={company.logo} alt={company.name} className="h-24 mx-auto object-contain mb-6" />
        ) : (
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10" />
          </div>
        )}

        {company?.name && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
            {company.address && <p className="text-slate-500 text-sm mt-1">{company.address}</p>}
            {(company.email || company.phone) && (
              <p className="text-slate-500 text-sm mt-1">
                {company.email} {company.email && company.phone ? ' | ' : ''} {company.phone}
              </p>
            )}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
          How was your experience{company?.name ? ` with ${company.name}` : ''}?
        </h1>
        <p className="text-slate-500 text-lg">Your feedback helps us improve our service.</p>
      </div>

      <Card className="max-w-xl w-full bg-white shadow-2xl rounded-3xl border-0 overflow-hidden">
        <div className="p-8 sm:p-10 text-center border-b border-slate-100">
          <div className="flex justify-center gap-2 sm:gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-12 h-12 sm:w-16 sm:h-16 transition-colors ${
                    (hoverRating || rating) >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-slate-200 fill-slate-50"
                  }`} 
                />
              </button>
            ))}
          </div>
          <p className="text-slate-400 font-medium mt-6 uppercase tracking-wider text-sm">
            {rating === 0 && "Select a star rating"}
            {rating === 1 && "Terrible"}
            {rating === 2 && "Poor"}
            {rating === 3 && "Average"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent!"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {rating > 0 && rating <= 3 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 sm:p-10 bg-slate-50/50"
            >
              <h3 className="font-bold text-slate-900 mb-2">We're sorry we didn't meet your expectations.</h3>
              <p className="text-slate-600 text-sm mb-6">
                Please let us know what went wrong so we can make it right. Your feedback is strictly private and goes directly to management.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name (Optional)</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>What happened?</Label>
                  <Textarea 
                    placeholder="Tell us about your experience..." 
                    className="min-h-[120px] bg-white resize-none"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-12 text-base font-bold rounded-xl mt-4" 
                  onClick={handleSubmitInternal}
                  disabled={!feedback.trim() || isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit Feedback securely"}
                </Button>
              </div>
            </motion.div>
          )}

          {rating >= 4 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 sm:p-10 bg-slate-50/50 text-center"
            >
              <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                <Star className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">We're thrilled!</h3>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                Thank you for the {rating}-star rating! The highest compliment you can give us is sharing your experience with others online.
              </p>
              
              {googleLink ? (
                <Button 
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-xl bg-[#4285F4] hover:bg-[#3367D6] shadow-lg shadow-blue-500/20" 
                  onClick={handleGoogleRedirect}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Post Review on Google
                </Button>
              ) : (
                <Button 
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-xl" 
                  onClick={() => setSubmitted(true)}
                >
                  Submit Review
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <div className="mt-12 text-center text-slate-400 text-sm font-medium">
        Powered by <span className="font-bold text-slate-900">ADSTRATEGIC</span> Reputation Manager
      </div>
    </div>
  )
}
