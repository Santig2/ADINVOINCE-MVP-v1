"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ClipboardList,
  MoreVertical,
  Eye,
  Trash2,
  Mic,
  Calendar
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { SwipeableItem } from "@/components/ui/swipeable-item";

type AdvanceReport = {
  id: string | number;
  companyId: string | number;
  companyName?: string;
  projectName: string;
  date: string;
  notes: string;
  generatedReport: string;
  images: string[];
  createdAt: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<AdvanceReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadAdvances();
  }, []);

  const loadAdvances = () => {
    const savedAdvances = JSON.parse(
      localStorage.getItem("advancesReports") || "[]"
    );
    // Sort by date most recent first
    const sortedAdvances = savedAdvances.sort((a: AdvanceReport, b: AdvanceReport) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setAdvances(sortedAdvances);
  };

  const filteredAdvances = advances.filter((adv) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      adv.projectName.toLowerCase().includes(searchStr) ||
      (adv.companyName?.toLowerCase() || "").includes(searchStr) ||
      adv.notes.toLowerCase().includes(searchStr)
    );
  });

  const handleDelete = (advanceId: string | number) => {
    const updated = advances.filter((adv) => adv.id !== advanceId);
    localStorage.setItem("advancesReports", JSON.stringify(updated));
    setAdvances(updated);
    toast({
      title: "Report deleted",
      description: "The advance report has been deleted.",
      variant: "destructive",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-0 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 px-4 sm:px-0 pt-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Work Advances
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your field work progress reports
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/advances/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="gap-2 w-full hover:shadow-lg transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                New Advance
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Mobile Stats Hero */}
        <motion.div
          className="mb-8 px-4 sm:px-0 text-center sm:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">
            Total Reports
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            {advances.length}
          </h2>
        </motion.div>

        {/* Overlapping Content Container */}
        <motion.div
          className="flex-1 bg-card sm:bg-transparent rounded-t-[2.5rem] sm:rounded-none p-5 sm:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-none border-t border-border/50 sm:border-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {/* Search */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search advances by project or notes..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6 flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                Recent Reports
              </h3>
              {filteredAdvances.length > 0 && (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-primary/10 text-primary hover:bg-primary/20">
                  {filteredAdvances.length}
                </Badge>
              )}
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredAdvances.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gradient-to-b from-background to-secondary/20 rounded-3xl border border-dashed border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5 border border-primary/10 relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                    <ClipboardList className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">
                    {advances.length === 0 ? "No reports yet" : "No reports found"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[250px] mx-auto">
                    {advances.length === 0
                      ? "Create your first advance report using Voice Assistant."
                      : "Try adjusting your search query or create a new one."}
                  </p>
                  {advances.length === 0 && (
                    <Link href="/voice-assistant">
                      <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8 py-6 text-base">
                        <Mic className="h-5 w-5" />
                        Use Voice Assistant
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdvances.map((adv, index) => (
                    <SwipeableItem
                      key={adv.id}
                      onDelete={() => handleDelete(adv.id)}
                    >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-sm cursor-pointer group border border-border/50 sm:border-transparent"
                      onClick={() => router.push(`/advances/${adv.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <ClipboardList className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-foreground text-base leading-none">
                              {adv.projectName}
                            </h3>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                              {adv.date}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate font-medium">
                            {adv.companyName || "No Company Selected"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-[64px] sm:pl-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 justify-end">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(adv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-10 w-10 rounded-full hover:bg-secondary transition-colors duration-300"
                            >
                              <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem onClick={() => router.push(`/advances/${adv.id}`)} className="rounded-lg py-2">
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(adv.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                    </SwipeableItem>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
