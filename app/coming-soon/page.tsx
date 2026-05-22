"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { motion, AnimatePresence } from "framer-motion";

export default function ComingSoonPage() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        // Target date: March 1st, 2026
        const targetDate = new Date("2026-03-01T00:00:00");

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(timer);
                // Optional: valid state if date passed
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <motion.div
            className="flex flex-col items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-card rounded-xl sm:rounded-2xl shadow-lg border-2 border-primary/10 flex items-center justify-center relative overflow-hidden group">
                {/* Decorative background blob */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={value}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ ease: "backOut", duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/70 font-mono">
                            {value.toString().padStart(2, '0')}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
            <span className="text-[10px] xs:text-xs sm:text-sm font-medium tracking-widest uppercase text-muted-foreground">
                {label}
            </span>
        </motion.div>
    );

    return (
        <AppLayout>
            <div className="container mx-auto px-4 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-8 sm:py-12">
                <motion.div
                    className="max-w-4xl w-full text-center space-y-8 sm:space-y-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Section */}
                    <div className="space-y-4 sm:space-y-6">
                        <motion.h1
                            className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase leading-tight"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Something Awesome<br />
                            Is In The Works For <span className="text-primary">AddInvoices</span>
                        </motion.h1>

                        <motion.p
                            className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            We are working on a new and exciting feature we think you'll really like!
                            Stay tuned for the big reveal.
                        </motion.p>
                    </div>

                    {/* Countdown Section */}
                    <div className="flex flex-wrap justify-center gap-3 xs:gap-4 sm:gap-8 md:gap-12">
                        <TimeUnit value={timeLeft.days} label="Days" />
                        <TimeUnit value={timeLeft.hours} label="Hours" />
                        <TimeUnit value={timeLeft.minutes} label="Minutes" />
                        <TimeUnit value={timeLeft.seconds} label="Seconds" />
                    </div>

                    {/* Footer / Coming Soon Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="pt-8 sm:pt-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Launching March 1st, 2026
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
