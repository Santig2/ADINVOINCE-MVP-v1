"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, Plus, Mic, Search, Filter, Edit, Trash2, MoreVertical, Building2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { motion, Variants } from "framer-motion"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

type CatalogItem = {
  id: string
  name: string
  description: string
  price: number
  companyId: number
  createdAt: string
}

type Company = {
  id: number
  name: string
  logo: string | null
}

export default function CatalogPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "price">("name")

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Form State
  const [currentItem, setCurrentItem] = useState<Partial<CatalogItem>>({
    name: "",
    description: "",
    price: 0,
    companyId: undefined,
  })
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)



  useEffect(() => {
    // Load data
    const savedItems = localStorage.getItem("catalogItems")
    const savedCompanies = localStorage.getItem("companies")

    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies))
    }
  }, [])

  useEffect(() => {
    // Filter items
    let result = [...items]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      )
    }

    if (selectedCompanyFilter !== "all") {
      result = result.filter((item) => item.companyId.toString() === selectedCompanyFilter)
    }

    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else {
        return a.price - b.price
      }
    })

    setFilteredItems(result)
  }, [items, searchQuery, selectedCompanyFilter, sortBy])

  const handleSaveItem = () => {
    if (!currentItem.name || !currentItem.price || !currentItem.companyId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (Name, Price, Company).",
        variant: "destructive",
      })
      return
    }

    const newItem: CatalogItem = {
      id: currentItem.id || Date.now().toString(),
      name: currentItem.name,
      description: currentItem.description || "",
      price: Number(currentItem.price),
      companyId: Number(currentItem.companyId),
      createdAt: currentItem.createdAt || new Date().toISOString(),
    }

    let updatedItems
    if (isEditing) {
      updatedItems = items.map((item) => (item.id === newItem.id ? newItem : item))
      toast({
        title: "Item updated",
        description: "The product/service has been updated successfully.",
      })
    } else {
      updatedItems = [...items, newItem]
      toast({
        title: "Item created",
        description: "The product/service has been added to your catalog.",
      })
    }

    setItems(updatedItems)
    localStorage.setItem("catalogItems", JSON.stringify(updatedItems))
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleDeleteItem = () => {
    if (itemToDelete) {
      const updatedItems = items.filter((item) => item.id !== itemToDelete)
      setItems(updatedItems)
      localStorage.setItem("catalogItems", JSON.stringify(updatedItems))
      toast({
        title: "Item deleted",
        description: "The product/service has been removed.",
      })
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  const resetForm = () => {
    setCurrentItem({
      name: "",
      description: "",
      price: 0,
      companyId: undefined,
    })
    setIsEditing(false)
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (item: CatalogItem) => {
    setCurrentItem(item)
    setIsEditing(true)
    setIsAddModalOpen(true)
  }

  const openDeleteModal = (id: string) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const getCompanyName = (id: number) => {
    const company = companies.find((c) => c.id === id)
    return company ? company.name : "Unknown Company"
  }



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
              Catalog
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save your products and services
            </p>
          </div>
          <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button id="catalog-create-btn" size="lg" className="gap-2 w-full hover:shadow-lg transition-all" onClick={openAddModal}>
              <Plus className="h-5 w-5" />
              Add Item
            </Button>
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
            Total Items
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            {items.length}
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start sm:grid sm:grid-cols-3 sm:overflow-visible">
            <motion.div variants={cardVariants} className="snap-start shrink-0">
              <Card className="bg-card/40 backdrop-blur-md border-border/50 min-w-[140px] sm:min-w-0 hover:bg-card/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Catalog Value</CardTitle>
                  <Package className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold">
                    ${items.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Overlapping Content Container */}
        <motion.div
          className="flex-1 bg-card sm:bg-transparent rounded-t-[2.5rem] sm:rounded-none p-5 sm:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-none border-t border-border/50 sm:border-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1" id="catalog-search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or services..."
                className="pl-11 h-12 bg-secondary/50 border-transparent focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                <SelectTrigger id="catalog-filter" className="flex-1 sm:w-[160px] h-12 bg-secondary/50 border-transparent rounded-xl">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="flex-1 sm:w-[140px] h-12 bg-secondary/50 border-transparent rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price">Price (Low - High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div id="catalog-list" className="bg-transparent sm:bg-card sm:border sm:border-border sm:rounded-xl sm:shadow-sm transition-shadow duration-300">
            <div className="mb-4 sm:px-6 sm:pt-6">
              <h3 className="text-lg font-bold text-foreground hidden sm:block">
                All Items
              </h3>
            </div>
            <div className="sm:px-6 sm:pb-6">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    No items found
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    {items.length === 0
                      ? "Your catalog is empty. Add your first product or service."
                      : "No items match your search filters."}
                  </p>
                  <Button onClick={openAddModal} className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-lg bg-background sm:bg-secondary/30 border border-border/50 sm:border-transparent hover:border-primary/30 sm:hover:bg-secondary/70 transition-all duration-300 hover:shadow-sm cursor-pointer group"
                      onClick={() => openEditModal(item)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Package className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-foreground text-base leading-none">
                              {item.name}
                            </p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {getCompanyName(item.companyId)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium truncate">
                            {item.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[64px] sm:pl-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-foreground text-base sm:text-lg leading-none">
                            ${item.price.toFixed(2)}
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
                            <DropdownMenuItem onClick={() => openEditModal(item)} className="rounded-lg py-2">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2"
                              onClick={() => openDeleteModal(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the details of your product or service."
                  : "Create a new product or service for your catalog."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Web Design Service"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product or service..."
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Select
                    value={currentItem.companyId?.toString()}
                    onValueChange={(v) => setCurrentItem({ ...currentItem, companyId: Number(v) })}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem}>{isEditing ? "Save Changes" : "Create Item"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AppLayout>
  )
}
