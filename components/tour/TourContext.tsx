"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export type TourStep = {
    targetId: string;
    title: string;
    content: string;
    position?: "top" | "bottom" | "left" | "right" | "center";
};

type TourContextType = {
    isOpen: boolean;
    currentStepIndex: number;
    steps: TourStep[];
    startTour: (tourType?: string) => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

// General Tour - Original 7 steps
export const GENERAL_TOUR_STEPS: TourStep[] = [
    {
        targetId: "dashboard-total-invoices",
        title: "Dashboard Overview",
        content: "Welcome to AddInvoices! This dashboard gives you a quick snapshot of your business health, including total, paid, and pending invoices.",
        position: "bottom",
    },
    {
        targetId: "dashboard-revenue-chart",
        title: "Revenue Tracking",
        content: "Track your monthly revenue growth here. The chart updates automatically as you mark invoices as paid.",
        position: "top",
    },
    {
        targetId: "dashboard-create-invoice-btn",
        title: "Create Invoice",
        content: "Ready to get paid? Click this button to create a new invoice instantly. You can also use our 'Invoice by Voice' feature inside!",
        position: "left",
    },
    {
        targetId: "sidebar-nav-configuration",
        title: "Companies & Settings",
        content: "Set up your company details, logo, and taxes here. You can manage multiple companies from a single account.",
        position: "right",
    },
    {
        targetId: "sidebar-nav-catalog",
        title: "Product Catalog",
        content: "Add your products and services here once, and they'll be ready to auto-fill in your invoices.",
        position: "right",
    },
    {
        targetId: "sidebar-nav-payments",
        title: "Payments",
        content: "Keep track of all incoming payments. You can also set up Stripe integration for automatic payments.",
        position: "right",
    },
    {
        targetId: "sidebar-nav-ask-me-how",
        title: "Need Help?",
        content: "Visit the 'Ask Me How' section anytime to watch tutorials, restart this tour, or chat with our help assistant about Voice features.",
        position: "right",
    },
];

// Dashboard Tour
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
    {
        targetId: "dashboard-total-invoices",
        title: "Total Invoices",
        content: "See your total number of invoices at a glance. This includes all invoices regardless of status.",
        position: "bottom",
    },
    {
        targetId: "dashboard-paid-invoices",
        title: "Paid Invoices",
        content: "Track how many invoices have been paid. The completion rate shows your payment collection efficiency.",
        position: "bottom",
    },
    {
        targetId: "dashboard-pending-invoices",
        title: "Pending Invoices",
        content: "Monitor invoices awaiting payment. Keep an eye on these to follow up with clients.",
        position: "bottom",
    },
    {
        targetId: "dashboard-revenue-chart",
        title: "Revenue Analytics",
        content: "Visualize your monthly revenue trends. This chart helps you understand your business growth patterns.",
        position: "top",
    },
    {
        targetId: "dashboard-recent-invoices",
        title: "Recent Activity",
        content: "Quick access to your latest invoices. Click on any invoice to view details or take actions.",
        position: "top",
    },
    {
        targetId: "dashboard-create-invoice-btn",
        title: "Quick Create",
        content: "Create a new invoice from anywhere with this floating action button.",
        position: "left",
    },
];

// Invoices Tour
export const INVOICES_TOUR_STEPS: TourStep[] = [
    {
        targetId: "invoices-create-btn",
        title: "Create Invoice",
        content: "Start creating a new invoice manually. Fill in client details, add items, and send it to your client.",
        position: "bottom",
    },
    {
        targetId: "invoices-search",
        title: "Search Invoices",
        content: "Quickly find invoices by number, client name, or amount. Type to filter your results instantly.",
        position: "bottom",
    },
    {
        targetId: "invoices-tabs",
        title: "Quick Tabs",
        content: "Switch between different invoice views with these tabs for faster navigation.",
        position: "bottom",
    },
    {
        targetId: "invoices-list",
        title: "Invoice List",
        content: "All your invoices in one place. Click the menu on each invoice to view, edit, download, send, or delete.",
        position: "top",
    },
];

// Quotes Tour
export const QUOTES_TOUR_STEPS: TourStep[] = [
    {
        targetId: "quotes-create-btn",
        title: "Create Quote",
        content: "Generate professional quotes for potential clients. Once accepted, you can convert them to invoices.",
        position: "bottom",
    },
    {
        targetId: "quotes-search",
        title: "Search Quotes",
        content: "Find quotes by client name, quote number, or amount.",
        position: "bottom",
    },
    {
        targetId: "quotes-tabs",
        title: "Quick Tabs",
        content: "Switch between different quote lists (All, Sent, Accepted, etc.) for faster navigation.",
        position: "bottom",
    },
    {
        targetId: "quotes-list",
        title: "Quote Management",
        content: "View all your quotes here. Send them to clients, convert accepted quotes to invoices, or archive old ones.",
        position: "top",
    },
];

// Contracts Tour
export const CONTRACTS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "contracts-create-btn",
        title: "Create Contract",
        content: "Draft professional contracts for your clients. Add terms, conditions, and get digital signatures.",
        position: "bottom",
    },

    {
        targetId: "contracts-list",
        title: "Contract Library",
        content: "Manage all your contracts. Track signatures, send reminders, and download signed copies.",
        position: "top",
    },
];

// Subscriptions Tour
export const SUBSCRIPTIONS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "subscriptions-create-btn",
        title: "New Subscription",
        content: "Set up recurring services for clients. Define frequency (monthly, biweekly) and automate invoicing.",
        position: "bottom",
    },

    {
        targetId: "subscriptions-list",
        title: "Subscription Management",
        content: "View all recurring services. Track deliveries, pause subscriptions, or generate service confirmations.",
        position: "top",
    },
];

// Payments Tour
export const PAYMENTS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "payments-balance",
        title: "Balance Overview",
        content: "See your total balance, pending payments, and overdue amounts at a glance.",
        position: "bottom",
    },
    {
        targetId: "payments-history",
        title: "Payment History",
        content: "Track all payment transactions. View payment dates, amounts, and associated invoices.",
        position: "top",
    },
];

// Expenses Tour
export const EXPENSES_TOUR_STEPS: TourStep[] = [
    {
        targetId: "expenses-create-btn",
        title: "Add Expense",
        content: "Record business expenses manually. Track spending by category and date.",
        position: "bottom",
    },

    {
        targetId: "expenses-search",
        title: "Search Expenses",
        content: "Find expenses by description, category, or amount. Filter your expense history easily.",
        position: "bottom",
    },
    {
        targetId: "expenses-list",
        title: "Expense Tracking",
        content: "View all your business expenses. Edit, delete, or export for accounting purposes.",
        position: "top",
    },
];

// Drafts Tour
export const DRAFTS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "drafts-list",
        title: "Draft Management",
        content: "All your saved invoice drafts. Continue editing, send them, or delete drafts you no longer need.",
        position: "top",
    },
];

// Clients Tour
export const CLIENTS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "clients-create-btn",
        title: "Add Client",
        content: "Add new clients to your database. Store contact info, addresses, and payment details.",
        position: "bottom",
    },
    {
        targetId: "clients-search",
        title: "Search Clients",
        content: "Quickly find clients by name, email, or phone number.",
        position: "bottom",
    },
    {
        targetId: "clients-list",
        title: "Client Directory",
        content: "Manage your client relationships. View invoices, send emails, or update client information.",
        position: "top",
    },
];

// Catalog Tour
export const CATALOG_TOUR_STEPS: TourStep[] = [
    {
        targetId: "catalog-create-btn",
        title: "Add Product/Service",
        content: "Add items to your catalog. These will auto-complete when creating invoices, saving you time.",
        position: "bottom",
    },

    {
        targetId: "catalog-list",
        title: "Product Library",
        content: "Your complete product and service catalog. Edit prices, update descriptions, or remove items.",
        position: "top",
    },
];

// Reminders Tour
export const REMINDERS_TOUR_STEPS: TourStep[] = [
    {
        targetId: "reminders-create-btn",
        title: "Mass Reminders",
        content: "Send payment reminders to all overdue clients at once with a single click.",
        position: "bottom",
    },
    {
        targetId: "reminders-list",
        title: "Reminder Lists",
        content: "Switch between Pending, Scheduled, and History tabs to manage your different reminder queues.",
        position: "top",
    },
];

// Configuration Tour
export const CONFIGURATION_TOUR_STEPS: TourStep[] = [
    {
        targetId: "config-company",
        title: "Company Settings",
        content: "Set up your company details: name, logo, address, NIT, and contact information. This appears on all your invoices.",
        position: "bottom",
    },
    {
        targetId: "config-profile",
        title: "User Profile",
        content: "Manage your personal information and login credentials.",
        position: "bottom",
    },
    {
        targetId: "config-billing",
        title: "Billing & Payments",
        content: "Manage your subscription plan and payment methods for the application.",
        position: "bottom",
    },
    {
        targetId: "config-notifications",
        title: "General Settings",
        content: "Configure default tax rates, notifications, and other application preferences.",
        position: "bottom",
    },
];

// Tour type to steps mapping
const TOUR_CONFIGS: Record<string, TourStep[]> = {
    general: GENERAL_TOUR_STEPS,
    dashboard: DASHBOARD_TOUR_STEPS,
    invoices: INVOICES_TOUR_STEPS,
    quotes: QUOTES_TOUR_STEPS,
    contracts: CONTRACTS_TOUR_STEPS,
    subscriptions: SUBSCRIPTIONS_TOUR_STEPS,
    payments: PAYMENTS_TOUR_STEPS,
    expenses: EXPENSES_TOUR_STEPS,
    drafts: DRAFTS_TOUR_STEPS,
    clients: CLIENTS_TOUR_STEPS,
    catalog: CATALOG_TOUR_STEPS,
    reminders: REMINDERS_TOUR_STEPS,
    configuration: CONFIGURATION_TOUR_STEPS,
};

// Tour type to route mapping
const TOUR_ROUTES: Record<string, string> = {
    general: "/",
    dashboard: "/",
    invoices: "/invoices",
    quotes: "/quotes",
    contracts: "/contracts",
    subscriptions: "/subscriptions",
    payments: "/payments",
    expenses: "/expenses",
    drafts: "/drafts",
    clients: "/clients",
    catalog: "/catalog",
    reminders: "/reminders",
    configuration: "/configuration",
};

export function TourProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentTourType, setCurrentTourType] = useState<string>("general");
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isAuthenticated } = useAuth();

    // Check for first-time user
    useEffect(() => {
        if (!isAuthenticated) {
            setIsOpen(false);
            return;
        }

        const tourCompleted = localStorage.getItem("tourCompleted");
        if (!tourCompleted) {
            // Only auto-start this detailed step-by-step tour on desktop
            if (window.innerWidth < 768) {
                return;
            }

            // "Shortcuts" view happens when pathname is "/" and mode is not "dashboard"
            const isShortcuts = pathname === "/" && searchParams?.get("mode") !== "dashboard";

            if (!isShortcuts) {
                // Determine WHICH tour to show based on the current page
                let tourToStart = "general";

                // If they are on a specific route defined in TOUR_ROUTES, match it
                const tourTypeMatch = Object.keys(TOUR_ROUTES).find(key =>
                    key !== "general" && key !== "dashboard" &&
                    (TOUR_ROUTES[key] === pathname || TOUR_ROUTES[key] === pathname.replace(/\/$/, ""))
                );

                if (tourTypeMatch) {
                    tourToStart = tourTypeMatch;
                } else if (pathname === "/" && searchParams?.get("mode") === "dashboard") {
                    tourToStart = "general";
                }

                const timer = setTimeout(() => {
                    setCurrentTourType(tourToStart);
                    setCurrentStepIndex(0);
                    setIsOpen(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [pathname, isAuthenticated, searchParams]);

    const [pendingTour, setPendingTour] = useState<{ type: string; active: boolean }>({ type: "", active: false });

    // Handle pending tour start after navigation
    useEffect(() => {
        if (pendingTour.active) {
            const targetRoute = TOUR_ROUTES[pendingTour.type] || "/";
            // Normalize paths for comparison (remove trailing slashes)
            const currentPath = pathname?.replace(/\/$/, "") || "/";
            const targetPath = targetRoute.replace(/\/$/, "") || "/";

            if (currentPath === targetPath) {
                // Determine a safe delay based on the tour type to ensure data loading
                // Some pages like Invoices/Quotes fetch data in useEffect, requiring a bit more time
                const delay = ["invoices", "quotes", "contracts", "subscriptions", "payments"].includes(pendingTour.type)
                    ? 800
                    : 500;

                const timer = setTimeout(() => {
                    setIsOpen(true);
                    setPendingTour({ type: "", active: false });
                }, delay);
                return () => clearTimeout(timer);
            }
        }
    }, [pathname, pendingTour]);

    // Handle abrupt navigation away from tour
    useEffect(() => {
        if (isOpen) {
            const currentRoute = TOUR_ROUTES[currentTourType] || "/";
            const currentPath = pathname?.replace(/\/$/, "") || "/";
            const targetPath = currentRoute.replace(/\/$/, "") || "/";

            // If they are on the dashboard tour but have switched to shortcuts mode, cancel tour
            if (currentPath === "/" && targetPath === "/" && searchParams?.get("mode") === "shortcuts") {
                setIsOpen(false);
                localStorage.setItem("tourCompleted", "true");
            }
            // If they navigated away to a completely different path during the tour, cancel it
            else if (currentPath !== targetPath) {
                setIsOpen(false);
                localStorage.setItem("tourCompleted", "true");
            }
        }
    }, [pathname, searchParams, isOpen, currentTourType]);

    const startTour = (tourType: string = "general") => {
        setCurrentTourType(tourType);
        setCurrentStepIndex(0);

        const targetRoute = TOUR_ROUTES[tourType] || "/";
        const currentPath = pathname?.replace(/\/$/, "") || "/";
        const targetPath = targetRoute.replace(/\/$/, "") || "/";

        if (currentPath !== targetPath) {
            // Set pending state BEFORE navigation
            setPendingTour({ type: tourType, active: true });
            router.push(targetRoute);
        } else {
            // Already on the page, start immediately
            setPendingTour({ type: "", active: false });
            setIsOpen(true);
        }
    };

    const endTour = () => {
        setIsOpen(false);
        localStorage.setItem("tourCompleted", "true");
        if (currentTourType === "general" || currentTourType === "dashboard") {
            router.push("/?mode=shortcuts");
        }
    };

    const skipTour = () => {
        endTour();
    };

    const nextStep = () => {
        const steps = TOUR_CONFIGS[currentTourType] || GENERAL_TOUR_STEPS;
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    };

    const currentSteps = TOUR_CONFIGS[currentTourType] || GENERAL_TOUR_STEPS;

    return (
        <TourContext.Provider
            value={{
                isOpen,
                currentStepIndex,
                steps: currentSteps,
                startTour,
                endTour,
                nextStep,
                prevStep,
                skipTour,
            }}
        >
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error("useTour must be used within a TourProvider");
    }
    return context;
}
