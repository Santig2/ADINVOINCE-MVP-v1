"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTour } from "./TourContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export function TourOverlay() {
    const { isOpen, currentStepIndex, steps, nextStep, prevStep, skipTour, endTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // To handle window resize and scroll
    useEffect(() => {
        setIsMounted(true);
        const updateRect = () => {
            // Re-calculate position
            if (isOpen && steps[currentStepIndex]) {
                const el = document.getElementById(steps[currentStepIndex].targetId);
                if (el) {
                    setTargetRect(el.getBoundingClientRect());
                }
            }
        };

        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect, { capture: true, passive: true });

        // Initial calculation
        updateRect();

        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect, { capture: true });
        };
    }, [isOpen, currentStepIndex, steps]);

    // Update target rect when step changes
    useEffect(() => {
        if (isOpen && steps[currentStepIndex]) {
            // Small timeout to allow render/scroll
            setTimeout(() => {
                const el = document.getElementById(steps[currentStepIndex].targetId);
                if (el) {

                    // Check if it's a sidebar item and if mobile sidebar is closed (not implementing sidebar toggle logic here to keep simple, 
                    // assuming desktop or visible items. For mobile menu items, they might be hidden inside the sheet.)
                    // If el is null, we might need to skip or show a generic fallback.

                    setTargetRect(el.getBoundingClientRect());
                    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                } else {
                    // Fallback if element not found: just center context?
                    setTargetRect(null);
                    console.warn(`Tour target ${steps[currentStepIndex].targetId} not found`);
                }
            }, 300);
        }
    }, [isOpen, currentStepIndex, steps]);

    if (!isMounted || !isOpen) return null;

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Portal to body to ensure it's on top of everything
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Backdrop with "hole" using 4 divs strategy (guillotine) */}
            {targetRect && (
                <>
                    {/* Top */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        className="absolute bg-black/50 transition-all duration-300 ease-out"
                        style={{ top: 0, left: 0, right: 0, height: targetRect.top }}
                    />
                    {/* Bottom */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        className="absolute bg-black/50 transition-all duration-300 ease-out"
                        style={{ top: targetRect.bottom, left: 0, right: 0, bottom: 0 }}
                    />
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        className="absolute bg-black/50 transition-all duration-300 ease-out"
                        style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }}
                    />
                    {/* Right */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        className="absolute bg-black/50 transition-all duration-300 ease-out"
                        style={{ top: targetRect.top, left: targetRect.right, right: 0, height: targetRect.height }}
                    />

                    {/* Highlight Border/Glow around the target */}
                    <div
                        className="absolute border-2 border-primary rounded-md shadow-[0_0_20px_rgba(30,202,211,0.5)] pointer-events-none transition-all duration-300 ease-out"
                        style={{
                            top: targetRect.top - 4,
                            left: targetRect.left - 4,
                            width: targetRect.width + 8,
                            height: targetRect.height + 8,
                        }}
                    />
                </>
            )}

            {/* If target not found, full backdrop */}
            {!targetRect && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            )}

            {/* Tooltip Card */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center sm:block">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="pointer-events-auto absolute w-[350px] max-w-[90vw]"
                        style={{
                            // Simple positioning logic
                            ...(targetRect ? getTooltipStyle(targetRect, currentStep.position) : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" })
                        }}
                    >
                        <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold text-primary">{currentStep.title}</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={skipTour}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {currentStep.content}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-0">
                                <div className="text-xs text-muted-foreground flex items-center">
                                    Step {currentStepIndex + 1} of {steps.length}
                                </div>
                                <div className="flex gap-2">
                                    {currentStepIndex > 0 && (
                                        <Button variant="outline" size="sm" onClick={prevStep}>
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Back
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={nextStep} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                        {isLastStep ? "Finish" : "Next"} {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>,
        document.body
    );
}

// Helper to position tooltip around target
function getTooltipStyle(rect: DOMRect, position?: string): React.CSSProperties {
    const PADDING = 16;
    const CARD_WIDTH = 350; // approximate
    const CARD_HEIGHT = 200; // approximate

    // Ensure we don't go off screen
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    let top: number | string = 0;
    let left: number | string = 0;
    let transform = "";

    switch (position) {
        case "top":
            top = rect.top - CARD_HEIGHT - PADDING;
            left = rect.left + (rect.width / 2) - (CARD_WIDTH / 2);
            // Check formatted
            if (top < 0) { // flip to bottom if no space
                top = rect.bottom + PADDING;
            }
            break;
        case "bottom":
            top = rect.bottom + PADDING;
            left = rect.left + (rect.width / 2) - (CARD_WIDTH / 2);
            break;
        case "left":
            top = rect.top + (rect.height / 2) - (CARD_HEIGHT / 2);
            left = rect.left - CARD_WIDTH - PADDING;
            if (left < 0) { // flip to right
                left = rect.right + PADDING;
            }
            break;
        case "right":
            top = rect.top + (rect.height / 2) - (CARD_HEIGHT / 2); // Center vertically
            left = rect.right + PADDING;
            break;
        default: // center or fallback
            // We use fixed positioning strategy in render if no target, but if target exists and center requested:
            top = rect.top + (rect.height / 2);
            left = rect.left + (rect.width / 2);
            transform = "translate(-50%, -50%)";
            return { top, left, transform };
    }

    // Edge detection corrections
    if ((left as number) + CARD_WIDTH > windowWidth) {
        left = windowWidth - CARD_WIDTH - PADDING;
    }
    if ((left as number) < PADDING) {
        left = PADDING;
    }

    // Vertical correction
    if ((top as number) + CARD_HEIGHT > windowHeight) {
        top = windowHeight - CARD_HEIGHT - PADDING;
    }
    if ((top as number) < PADDING) {
        top = PADDING;
    }

    return { top, left };
}
