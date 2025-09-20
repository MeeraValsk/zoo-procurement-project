import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Package, TrendingUp, DollarSign, Plus, Edit, FileText, CheckCircle, Clock, AlertCircle, Download, Search, Filter, RefreshCw, Trash2 } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";

// Default stats for when API data is not available
const defaultStats = [
  { title: "Total Orders", value: "0", change: "+0%", icon: Package, color: "text-blue-600" },
  { title: "Pending Orders", value: "0", change: "+0", icon: Clock, color: "text-yellow-600" },
  { title: "Approved Orders", value: "0", change: "+0", icon: CheckCircle, color: "text-green-600" },
  { title: "Total Spent", value: "₹0", change: "+0%", icon: DollarSign, color: "text-purple-600" },
];

interface StaffDashboardProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const StaffDashboard = ({ currentView = "Dashboard", onViewChange }: StaffDashboardProps) => {
  const { toast } = useToast();
  
  // Form data for creating purchase requests
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    reason: "",
    supplier: "",
    feedType: "",
    price: ""
  });
  
  // Data states
  const [suppliers, setSuppliers] = useState([]);
  const [feedTypes, setFeedTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Edit order states
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    itemName: "",
    quantity: "",
    reason: "",
    supplier: "",
    feedType: "",
    price: ""
  });

  // Load data on component mount and when view changes
  useEffect(() => {
    if (currentView) {
      loadData();
    }
  }, [currentView]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, feedTypesRes, ordersRes, statsRes] = await Promise.allSettled([
        apiService.getSuppliers(),
        apiService.getFeedTypes(),
        apiService.getMyOrders(),
        apiService.getOrderStats()
      ]);

      if (suppliersRes.status === 'fulfilled' && suppliersRes.value.success) {
        setSuppliers(suppliersRes.value.data.suppliers);
      }
      if (feedTypesRes.status === 'fulfilled' && feedTypesRes.value.success) {
        setFeedTypes(feedTypesRes.value.data.feedTypes);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setOrders(ordersRes.value.data.orders);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate price when feed type is selected
    if (field === "feedType") {
      const selectedFeed = feedTypes.find(feed => feed._id === value);
      if (selectedFeed) {
        const price = selectedFeed.pricePerTonne || selectedFeed.pricePerTon;
        setFormData(prev => ({ ...prev, price: price.toString() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.quantity || !formData.supplier || !formData.feedType || !formData.price || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const orderData = {
        itemName: formData.itemName,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        reason: formData.reason,
        supplier: formData.supplier,
        feedType: formData.feedType,
        department: "Animal Care" // Default department
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        // Reset form
        setFormData({
          itemName: "",
          quantity: "",
          reason: "",
          supplier: "",
          feedType: "",
          price: ""
        });
        
        // Reload data
        await loadData();
        
        toast({
          title: "Success",
          description: "Purchase request submitted successfully!",
          variant: "default",
        });
        
        // Switch to orders view
        if (onViewChange) {
          onViewChange("My Orders");
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Error creating order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit order handlers
  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData({
      itemName: order.itemName || "",
      quantity: order.quantity?.toString() || "",
      reason: order.reason || "",
      supplier: order.supplier?._id || order.supplier || "",
      feedType: order.feedType?._id || order.feedType || "",
      price: order.price?.toString() || ""
    });
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrder) return;
    
    if (!editFormData.itemName || !editFormData.quantity || !editFormData.supplier || !editFormData.feedType || !editFormData.price || !editFormData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const orderData = {
        itemName: editFormData.itemName,
        quantity: parseFloat(editFormData.quantity),
        price: parseFloat(editFormData.price),
        reason: editFormData.reason,
        supplier: editFormData.supplier,
        feedType: editFormData.feedType,
        department: "Animal Care"
      };

      const response = await apiService.updateOrder(editingOrder._id, orderData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order updated successfully!",
          variant: "default",
        });
        
        setEditingOrder(null);
        setEditFormData({
          itemName: "",
          quantity: "",
          reason: "",
          supplier: "",
          feedType: "",
          price: ""
        });
        
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Error updating order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiService.deleteOrder(orderId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order deleted successfully!",
          variant: "default",
        });
        
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Error deleting order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOrder = (order: any) => {
    // Create order document content
    const orderContent = `
ZOO PROCUREMENT HUB
PURCHASE ORDER

Order ID: ${order.orderId || order._id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status}

ITEM DETAILS:
- Item Name: ${order.itemName}
- Quantity: ${order.quantity} tonnes
- Price per Tonne: ₹${order.price}
- Total Amount: ₹${order.totalAmount || (order.quantity * order.price)}
- Supplier: ${order.supplier?.name || 'N/A'}
- Feed Type: ${order.feedType?.name || 'N/A'}
- Department: Animal Care

REASON FOR PURCHASE:
${order.reason}

---
Generated on: ${new Date().toLocaleString()}
    `.trim();

    // Create and download file
    const blob = new Blob([orderContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order_${order.orderId || order._id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Order document is being downloaded.",
      variant: "default",
    });
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditFormData({
      itemName: "",
      quantity: "",
      reason: "",
      supplier: "",
      feedType: "",
      price: ""
    });
  };

  // Filter and pagination functions
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && new Date(order.createdAt).toDateString() === new Date().toDateString()) ||
                       (dateFilter === "week" && new Date(order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === "month" && new Date(order.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Process stats data from API
  const processedStats = stats.length > 0 ? stats.map(stat => ({
    title: stat._id === 'Pending' ? 'Pending Orders' : 
           stat._id === 'Approved' ? 'Approved Orders' : 
           stat._id === 'Delivered' ? 'Delivered Orders' : 'Total Orders',
    value: stat.count.toString(),
    change: "+0%",
    icon: stat._id === 'Pending' ? Clock : 
          stat._id === 'Approved' ? CheckCircle : Package,
    color: stat._id === 'Pending' ? "text-yellow-600" : 
           stat._id === 'Approved' ? "text-green-600" : "text-blue-600"
  })) : defaultStats;

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalSpentStat = {
    title: "Total Spent",
    value: `₹${totalSpent.toLocaleString()}`,
    change: "+0%",
    icon: DollarSign,
    color: "text-purple-600"
  };

  // Update stats with total spent
  const finalStats = processedStats.length > 0 ? 
    [...processedStats.filter(stat => stat.title !== "Total Spent"), totalSpentStat] : 
    defaultStats;

  // Render different views based on currentView
  if (currentView === "Create Order") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Create Purchase Request
            </h1>
            <p className="text-gray-600 mt-2">Submit a new purchase request for animal feeds</p>
          </div>
          <Button onClick={() => onViewChange?.("Dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemName" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-emerald-500" />
                  Item Name
                </Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange("itemName", e.target.value)}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                  Quantity (tonnes)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2 text-emerald-500" />
                  Select Supplier
                </Label>
                <Select value={formData.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier._id} value={supplier._id}>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.speciality}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedType" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-emerald-500" />
                  Feed Type
                </Label>
                <Select value={formData.feedType} onValueChange={(value) => handleInputChange("feedType", value)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {feedTypes.map((feed) => (
                      <SelectItem key={feed._id} value={feed._id}>
                        <div>
                          <div className="font-medium">{feed.name}</div>
                          <div className="text-sm text-gray-500">₹{feed.pricePerTonne || feed.pricePerTon}/tonne • {feed.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
                  Price per Tonne (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-700 flex items-center">
                <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                Reason for Purchase
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why this purchase is needed (e.g., current stock levels, upcoming feeding requirements, seasonal needs)..."
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                className="min-h-24 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                required
              />
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{formData.quantity && formData.price ? (parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Quantity: {formData.quantity || "0"} tonnes</p>
                  <p className="text-sm text-gray-600">Price: ₹{formData.price || "0"}/tonne</p>
                  <p className="text-sm text-gray-600">Supplier: {suppliers.find(s => s._id === formData.supplier)?.name || "Not selected"}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                disabled={loading || !formData.itemName || !formData.quantity || !formData.supplier || !formData.feedType || !formData.price || !formData.reason}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 mr-2" />
                )}
                {loading ? "Submitting..." : "Submit Purchase Request"}
              </Button>
              <Button
                type="button"
                onClick={() => onViewChange?.("Dashboard")}
                variant="outline"
                className="h-12 px-8 border-2 border-gray-300 hover:border-emerald-300 rounded-xl transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (currentView === "My Orders") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              My Purchase Orders
            </h1>
            <p className="text-gray-600 mt-2">View and track your purchase requests</p>
          </div>
          <Button onClick={() => onViewChange?.("Dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                  <TableHead className="font-bold text-gray-800">Item</TableHead>
                  <TableHead className="font-bold text-gray-800">Quantity</TableHead>
                  <TableHead className="font-bold text-gray-800">Supplier</TableHead>
                  <TableHead className="font-bold text-gray-800">Total Amount</TableHead>
                  <TableHead className="font-bold text-gray-800">Status</TableHead>
                  <TableHead className="font-bold text-gray-800">Date</TableHead>
                  <TableHead className="font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Loading orders...</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order._id} className="border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <TableCell className="font-medium text-gray-800">{order.orderId || order._id}</TableCell>
                      <TableCell className="text-gray-600">{order.itemName}</TableCell>
                      <TableCell className="text-gray-600">{order.quantity} tonnes</TableCell>
                      <TableCell className="text-gray-600">{order.supplier?.name || 'N/A'}</TableCell>
                      <TableCell className="text-gray-600 font-semibold">₹{(order.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.status === "Delivered" ? "default" : order.status === "Approved" ? "secondary" : "outline"}
                          className={order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Approved" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {order.status === "Delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === "Approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === "Pending" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 hover:bg-yellow-50"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Order</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 hover:bg-green-50"
                                onClick={() => handleDownloadOrder(order)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download Order</p>
                            </TooltipContent>
                          </Tooltip>
                          {order.status === "Pending" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  onClick={() => handleDeleteOrder(order._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Order</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </TooltipProvider>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Edit Order Modal */}
        {editingOrder && (
          <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Edit Order
              </h2>
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="editItemName" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-emerald-500" />
                    Item Name
                  </Label>
                  <Input
                    id="editItemName"
                    placeholder="Enter item name"
                    value={editFormData.itemName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editQuantity" className="text-sm font-semibold text-gray-700 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                    Quantity (tonnes)
                  </Label>
                  <Input
                    id="editQuantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSupplier" className="text-sm font-semibold text-gray-700 flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2 text-emerald-500" />
                    Select Supplier
                  </Label>
                  <Select value={editFormData.supplier} onValueChange={(value) => setEditFormData(prev => ({ ...prev, supplier: value }))}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                      <SelectValue placeholder="Choose a supplier" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-gray-500">{supplier.speciality}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editFeedType" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-emerald-500" />
                    Feed Type
                  </Label>
                  <Select value={editFormData.feedType} onValueChange={(value) => {
                    setEditFormData(prev => ({ ...prev, feedType: value }));
                    const selectedFeed = feedTypes.find(feed => feed._id === value);
                    if (selectedFeed) {
                      const price = selectedFeed.pricePerTonne || selectedFeed.pricePerTon;
                      setEditFormData(prev => ({ ...prev, price: price.toString() }));
                    }
                  }}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {feedTypes.map((feed) => (
                        <SelectItem key={feed._id} value={feed._id}>
                          <div>
                            <div className="font-medium">{feed.name}</div>
                            <div className="text-sm text-gray-500">₹{feed.pricePerTonne || feed.pricePerTon}/tonne • {feed.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPrice" className="text-sm font-semibold text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
                    Price per Tonne (₹)
                  </Label>
                  <Input
                    id="editPrice"
                    type="number"
                    placeholder="Enter price"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editReason" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                  Reason for Purchase
                </Label>
                <Textarea
                  id="editReason"
                  placeholder="Explain why this purchase is needed..."
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="min-h-24 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  required
                />
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Updated Order Summary</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      ₹{editFormData.quantity && editFormData.price ? (parseFloat(editFormData.quantity) * parseFloat(editFormData.price)).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Quantity: {editFormData.quantity || "0"} tonnes</p>
                    <p className="text-sm text-gray-600">Price: ₹{editFormData.price || "0"}/tonne</p>
                    <p className="text-sm text-gray-600">Supplier: {suppliers.find(s => s._id === editFormData.supplier)?.name || "Not selected"}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  disabled={loading || !editFormData.itemName || !editFormData.quantity || !editFormData.supplier || !editFormData.feedType || !editFormData.price || !editFormData.reason}
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Edit className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Updating..." : "Update Order"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="h-12 px-8 border-2 border-gray-300 hover:border-emerald-300 rounded-xl transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    );
  }

  // Default Dashboard view
  return (
    <div className="space-y-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Staff Dashboard
        </h1>
        <p className="text-xl text-gray-600">Create and manage animal feed purchase requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {finalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={<Icon className="h-6 w-6" />}
              color={stat.color}
              delay={index * 100}
            />
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <ShoppingCart className="h-6 w-6 mr-3 text-emerald-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onViewChange?.("Create Order")} 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Purchase Request
            </Button>
            <Button 
              onClick={() => onViewChange?.("My Orders")} 
              variant="outline" 
              className="w-full h-12 border-2 border-gray-300 hover:border-emerald-300 rounded-xl transition-all duration-300"
            >
              <Package className="h-5 w-5 mr-2" />
              View My Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-500" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your latest purchase requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-gray-800">{order.itemName}</p>
                    <p className="text-sm text-gray-600">{order.supplier?.name || 'N/A'} • {order.quantity} tonnes</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={order.status === "Delivered" ? "default" : order.status === "Approved" ? "secondary" : "outline"}
                      className={order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Approved" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {order.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">₹{(order.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;