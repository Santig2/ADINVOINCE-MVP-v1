"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, ClipboardList, Users, FileCheck, LayoutGrid } from "lucide-react";

export function ShortcutInterface() {
    const router = useRouter();
    const [expanding, setExpanding] = useState(false);
    const [clickedPos, setClickedPos] = useState({ x: 0, y: 0 });

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        // Center of the clicked button
        setClickedPos({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
        setExpanding(true);
        setTimeout(() => {
            router.push(path);
        }, 800);
    };

    const handleMoreClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setClickedPos({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
        setExpanding(true);

        const isMobile = window.innerWidth < 768;
        const path = isMobile ? "/?mode=dashboard&openMenu=true" : "/?mode=dashboard";

        setTimeout(() => {
            router.push(path);
        }, 800);
    };

    const userName = "Santi";

    return (
        <div className="relative w-full min-h-[100dvh] md:min-h-screen overflow-hidden flex flex-col items-center justify-start bg-slate-900 bg-cover bg-center bg-no-repeat bg-[url('/images/fondo%20de%20shortcust%20movil.png')] md:bg-[url('/images/fondo%20shortcuts%20pc.png')] text-white">

            {/* Header section */}
            <div className="w-full flex flex-col items-center pt-10 sm:pt-16 md:pt-20 z-10 px-4 mt-8 md:mt-0">
                <Image
                    src="/images/addinvoices iconlogo.png"
                    alt="AddInvoices"
                    width={500}
                    height={100}
                    className="h-16 sm:h-16 md:h-16 w-auto mb-6 sm:mb-8"
                />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center drop-shadow-md">
                    Ready To <span className="text-[#1bb5b3]">Hear</span> you <span className="text-[#1bb5b3]">!</span> {userName}
                </h1>
            </div>

            {/* Buttons Radial & Grid Container */}
            <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center mt-4 sm:mt-10 mb-20 md:mb-8 z-10 transition-all duration-300 px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 sm:gap-10 md:gap-16">
                    {/* Voice */}
                    <button
                        onClick={(e) => handleNavigation(e, "/voice-assistant")}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(27,181,179,0.5)] transition-transform hover:scale-105 z-20 mx-auto"
                    >
                        <div className="relative w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mb-1 md:mb-2">
                            <Image src="/images/adstrategic-icon.png" alt="Voice" width={80} height={80} className="relative z-10 w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm md:text-lg text-slate-800 uppercase tracking-wider">Voice</span>
                    </button>

                    {/* Invoices */}
                    <button
                        onClick={(e) => handleNavigation(e, "/invoices")}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center text-slate-800 shadow-xl transition-transform hover:scale-105 z-10 mx-auto"
                    >
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 text-[#1bb5b3]" strokeWidth={1.5} />
                        <span className="font-semibold text-xs sm:text-sm md:text-lg uppercase tracking-wider">Invoices</span>
                    </button>

                    {/* Quotes */}
                    <button
                        onClick={(e) => handleNavigation(e, "/quotes")}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center text-slate-800 shadow-xl transition-transform hover:scale-105 z-10 mx-auto"
                    >
                        <FileCheck className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 text-[#1bb5b3]" strokeWidth={1.5} />
                        <span className="font-semibold text-xs sm:text-sm md:text-lg uppercase tracking-wider">Quotes</span>
                    </button>

                    {/* Expenses */}
                    <button
                        onClick={(e) => handleNavigation(e, "/expenses")}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center text-slate-800 shadow-xl transition-transform hover:scale-105 z-10 mx-auto"
                    >
                        <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 text-[#1bb5b3]" strokeWidth={1.5} />
                        <span className="font-semibold text-xs sm:text-sm md:text-lg uppercase tracking-wider">Expenses</span>
                    </button>

                    {/* Clients */}
                    <button
                        onClick={(e) => handleNavigation(e, "/clients")}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center text-slate-800 shadow-xl transition-transform hover:scale-105 z-10 mx-auto"
                    >
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 text-[#1bb5b3]" strokeWidth={1.5} />
                        <span className="font-semibold text-xs sm:text-sm md:text-lg uppercase tracking-wider">Clients</span>
                    </button>

                    {/* More */}
                    <button
                        onClick={handleMoreClick}
                        className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-white rounded-full flex flex-col items-center justify-center text-slate-800 shadow-xl transition-transform hover:scale-105 z-10 mx-auto"
                    >
                        <LayoutGrid className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 text-[#1bb5b3]" strokeWidth={1.5} />
                        <span className="font-semibold text-xs sm:text-sm md:text-lg uppercase tracking-wider">More</span>
                    </button>
                </div>
            </div>

            {/* Expand Animation Overlay */}
            <AnimatePresence>
                {expanding && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0,
                            x: clickedPos.x - window.innerWidth / 2,
                            y: clickedPos.y - window.innerHeight / 2,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 50, // Massive scale to cover screen
                            x: 0,
                            y: 0
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        {/* We scale the container which has the SVG so it stays crisp, or just use CSS circle */}
                        <div className="w-full h-full rounded-full bg-[#1bb5b3] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-[#1bb5b3]/50">
                            <Image src="/images/adstrategic-icon.png" alt="" width={80} height={80} className="w-[80%] h-[80%] opacity-20" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
