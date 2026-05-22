"use client"

import React, { useState } from "react"
import { motion, useAnimation, PanInfo } from "framer-motion"
import { Trash2, Edit, Send } from "lucide-react"

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete?: () => void
  onEdit?: () => void
  onSend?: () => void
  threshold?: number
  className?: string
}

export function SwipeableItem({ 
  children, 
  onDelete, 
  onEdit, 
  onSend,
  threshold = -60,
  className = ""
}: SwipeableItemProps) {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  
  let buttonsCount = 0
  if (onSend) buttonsCount++
  if (onEdit) buttonsCount++
  if (onDelete) buttonsCount++
  
  const maxDrag = buttonsCount * -70 // 70px per button to give some breathing room

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset < threshold || velocity < -500) {
      // Snap open
      controls.start({ x: maxDrag, transition: { type: "spring", stiffness: 400, damping: 30 } })
    } else {
      // Snap closed
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } })
    }
  }

  // Reset to 0 when click happens so it closes if touched
  const handleTouchStart = () => {
    if (!isDragging) {
      // Could close others here if we had a global context
    }
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl sm:rounded-lg ${className}`}>
      {/* Background Actions - Only visible when swiped */}
      <div className="absolute inset-y-0 right-0 flex items-stretch justify-end bg-transparent">
        {onSend && (
          <button 
            onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); onSend(); }}
            className="flex w-[70px] flex-col items-center justify-center bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors border-l border-background/50"
          >
            <Send className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Send</span>
          </button>
        )}
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); onEdit(); }}
            className="flex w-[70px] flex-col items-center justify-center bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors border-l border-background/50"
          >
            <Edit className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Edit</span>
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); onDelete(); }}
            className="flex w-[70px] flex-col items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border-l border-background/50"
          >
            <Trash2 className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Delete</span>
          </button>
        )}
      </div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        onTouchStart={handleTouchStart}
        className="relative z-10 w-full h-full bg-background sm:bg-secondary/30 touch-pan-y"
      >
        {/* Pointer events none while dragging so we don't accidentally click links */}
        <div style={{ pointerEvents: isDragging ? "none" : "auto" }} className="h-full">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
