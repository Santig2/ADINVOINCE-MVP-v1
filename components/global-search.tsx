"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Calculator, Calendar, CreditCard, Settings, Smile, User, 
  FileText, FileCheck, Building2, Search 
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const [invoices, setInvoices] = React.useState([])
  const [clients, setClients] = React.useState([])
  const [quotes, setQuotes] = React.useState([])
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    
    // Load some data for search
    try {
      setInvoices(JSON.parse(localStorage.getItem("emittedInvoices") || "[]"))
      setClients(JSON.parse(localStorage.getItem("clients") || "[]"))
      setQuotes(JSON.parse(localStorage.getItem("emittedQuotes") || "[]"))
    } catch (e) {
      console.error(e)
    }
    
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-full transition-colors ml-auto md:ml-0 md:w-full md:max-w-xs md:justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden md:inline-flex">Search everything...</span>
          <span className="inline-flex md:hidden">Search</span>
        </div>
        <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/invoices/new"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create Invoice</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/quotes/new"))}>
              <FileCheck className="mr-2 h-4 w-4" />
              <span>Create Estimate</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/clients/new"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Add Client</span>
            </CommandItem>
          </CommandGroup>
          
          {invoices.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Invoices">
                {invoices.slice(0, 3).map((inv: any) => (
                  <CommandItem key={inv.id} onSelect={() => runCommand(() => router.push("/invoices"))}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{inv.invoiceNumber} - {inv.client || inv.clientName}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {clients.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clients">
                {clients.slice(0, 3).map((cli: any) => (
                  <CommandItem key={cli.id} onSelect={() => runCommand(() => router.push("/clients"))}>
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>{cli.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/configuration"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/configuration"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
