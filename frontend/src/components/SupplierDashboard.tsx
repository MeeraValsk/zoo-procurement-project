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
import { Package, Truck, FileText, CheckCircle, Clock, AlertCircle, Eye, Edit, Send, DollarSign, Calendar, MapPin, Search, Filter, RefreshCw, Trash2, Download } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import { Invoice, Order, User } from "@/types";

// Default stats for when API data is not available
const defaultStats = [
  { title: "Total Orders", value: "0", change: "+0", icon: Package, color: "text-blue-600" },
  { title: "Pending Orders", value: "0", change: "+0", icon: Clock, color: "text-yellow-600" },
  { title: "Delivered", value: "0", change: "+0", icon: CheckCircle, color: "text-green-600" },
  { title: "Total Revenue", value: "₹0", change: "+0%", icon: DollarSign, color: "text-purple-600" },
];

interface SupplierDashboardProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const SupplierDashboard = ({ currentView = "Dashboard", onViewChange }: SupplierDashboardProps) => {
  const { toast } = useToast();
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Invoice creation state
  const [invoiceData, setInvoiceData] = useState({
    orderId: "",
    customer: "",
    amount: "",
    items: "",
    notes: ""
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
      const [ordersRes, invoicesRes, statsRes] = await Promise.allSettled([
        apiService.getSupplierOrders(),
        apiService.getSupplierInvoices(),
        apiService.getOrderStats()
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setOrders(ordersRes.value.data.orders);
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.success) {
        setInvoices(invoicesRes.value.data.invoices);
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

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      setLoading(true);
      const newStatus = action === 'accepted' ? 'Accepted' : 'Delivered';
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        if (action === 'delivered' && response.data.invoice) {
          // Show special notification for automatic invoice creation
          toast({
            title: "Order Delivered & Invoice Created!",
            description: `Order marked as delivered and invoice ${response.data.invoice.invoiceId} created automatically.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: `Order ${action} successfully!`,
            variant: "default",
          });
        }
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
      setSelectedOrder(null);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceData.orderId || !invoiceData.customer || !invoiceData.amount || !invoiceData.items) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiService.createInvoice(invoiceData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Invoice created successfully!",
          variant: "default",
        });
        
        setInvoiceData({
          orderId: "",
          customer: "",
          amount: "",
          items: "",
          notes: ""
        });
        
        if (onViewChange) {
          onViewChange("Invoices");
        }
        
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Error creating invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Get order details if not already populated
      let orderData = invoice.orderId;
      if (typeof orderData === 'string') {
        const orderResponse = await apiService.getOrders();
        if (orderResponse?.success) {
          orderData = orderResponse.data.orders.find((o: any) => o._id === orderData || o.orderId === orderData);
        }
      }

      // Get supplier details (current user)
      const profileResponse = await apiService.getProfile();
      const supplierData = profileResponse?.data?.user;

      if (!orderData || !supplierData) {
        toast({
          title: "Error",
          description: "Unable to load complete invoice data for PDF generation.",
          variant: "destructive"
        });
        return;
      }

      // Generate PDF using the new generator
      generateInvoicePDF(invoice, orderData, supplierData);
      
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Default stats for when API data is not available
  const defaultStats = [
    { title: "Total Orders", value: "0", change: "+0", icon: Package, color: "text-blue-600" },
    { title: "Pending Orders", value: "0", change: "+0", icon: Clock, color: "text-yellow-600" },
    { title: "Delivered", value: "0", change: "+0", icon: CheckCircle, color: "text-green-600" },
    { title: "Total Revenue", value: "$0", change: "+0%", icon: DollarSign, color: "text-purple-600" },
  ];

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

  // Filter and pagination functions
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalRevenueStat = {
    title: "Total Revenue",
    value: `₹${totalRevenue.toLocaleString()}`,
    change: "+0%",
    icon: DollarSign,
    color: "text-purple-600"
  };

  // Update stats with total revenue
  const finalStats = processedStats.length > 0 ? 
    [...processedStats.filter(stat => stat.title !== "Total Revenue"), totalRevenueStat] : 
    defaultStats;

  // Render different views based on currentView
  if (currentView === "Orders") {
  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Received Orders
            </h1>
            <p className="text-gray-600 mt-2">View and manage orders from zoo customers</p>
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
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
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
                <TableHead className="font-bold text-gray-800">Customer</TableHead>
                <TableHead className="font-bold text-gray-800">Item</TableHead>
                <TableHead className="font-bold text-gray-800">Quantity</TableHead>
                <TableHead className="font-bold text-gray-800">Amount</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Priority</TableHead>
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
                        <TableCell className="text-gray-600">{order.requester?.name || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">{order.itemName}</TableCell>
                        <TableCell className="text-gray-600">{order.quantity} tonnes</TableCell>
                        <TableCell className="text-gray-600 font-semibold">₹{(order.totalAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.status === "Delivered" ? "default" : order.status === "Accepted" ? "secondary" : "outline"}
                            className={order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Accepted" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {order.status === "Delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {order.status === "Accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {order.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.priority === "High" ? "destructive" : order.priority === "Medium" ? "default" : "secondary"}
                            className={order.priority === "High" ? "bg-red-100 text-red-800" : order.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}
                          >
                            {order.priority || "Medium"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                            {order.status === "Pending" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleOrderAction(order._id, "accepted")}
                                  >
                                    Accept
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Accept Order</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {order.status === "Accepted" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleOrderAction(order._id, "delivered")}
                                  >
                                    Mark Delivered
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Mark as Delivered (Invoice will be created automatically)</p>
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

        {/* Order Details Modal */}
        {selectedOrder && (
          <Card className="p-6 shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Order Details - {selectedOrder.orderId || selectedOrder._id}</h3>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Item:</span> {selectedOrder.itemName}</p>
                  <p><span className="font-medium">Quantity:</span> {selectedOrder.quantity} tonnes</p>
                  <p><span className="font-medium">Amount:</span> ₹{(selectedOrder.totalAmount || 0).toLocaleString()}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Priority:</span> {selectedOrder.priority || "Medium"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Delivery Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Customer:</span> {selectedOrder.requester?.name || 'N/A'}</p>
                  <p><span className="font-medium">Contact:</span> {selectedOrder.contactPerson || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.phone || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress || 'N/A'}</p>
            </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (currentView === "Invoices") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-gray-600 mt-2">Manage invoices for delivered orders</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => onViewChange?.("Create Invoice")}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
            <Button onClick={() => onViewChange?.("Dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <div className="overflow-x-auto">
            <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-bold text-gray-800">Invoice ID</TableHead>
                <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                <TableHead className="font-bold text-gray-800">Customer</TableHead>
                <TableHead className="font-bold text-gray-800">Amount</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Date</TableHead>
                <TableHead className="font-bold text-gray-800">Due Date</TableHead>
                <TableHead className="font-bold text-gray-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading invoices...</p>
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No invoices found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice._id || invoice.id} className="border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <TableCell className="font-medium text-gray-800">{invoice.invoiceId || invoice._id}</TableCell>
                  <TableCell className="text-gray-600">{invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId}</TableCell>
                  <TableCell className="text-gray-600">{invoice.customer}</TableCell>
                        <TableCell className="text-gray-600 font-semibold">₹{(invoice.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={invoice.status === "Paid" ? "default" : "outline"}
                      className={invoice.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {invoice.status === "Paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {invoice.status === "Sent" && <Send className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </Badge>
                  </TableCell>
                        <TableCell className="text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                  onClick={() => setSelectedOrder(invoice)}
                                >
                        <Eye className="h-4 w-4" />
                      </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  onClick={() => handleDownloadInvoice(invoice)}
                                >
                                  <Download className="h-4 w-4" />
                      </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download Invoice</p>
                              </TooltipContent>
                            </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
            </TooltipProvider>
          </div>
        </Card>
      </div>
    );
  }

  if (currentView === "Create Invoice") {
    // Get delivered orders for invoice creation
    const deliveredOrders = orders.filter(order => order.status === "Delivered");
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Create Invoice
            </h1>
            <p className="text-gray-600 mt-2">Generate invoice for delivered order</p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Invoices are now created automatically when orders are marked as "Delivered". 
                This manual form is for special cases or corrections.
              </p>
            </div>
          </div>
          <Button onClick={() => onViewChange?.("Invoices")} variant="outline">
            Back to Invoices
          </Button>
        </div>

        <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orderId" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-emerald-500" />
                  Order ID
                </Label>
                <Select value={invoiceData.orderId} onValueChange={(value) => {
                  const selectedOrder = deliveredOrders.find(order => order._id === value);
                  setInvoiceData(prev => ({ 
                    ...prev, 
                    orderId: value,
                    customer: selectedOrder?.requester?.name || prev.customer,
                    amount: selectedOrder?.totalAmount?.toString() || prev.amount,
                    items: selectedOrder?.itemName || prev.items
                  }));
                }}>
                  <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select delivered order" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {deliveredOrders.map((order) => (
                      <SelectItem key={order._id} value={order._id}>
                        <div>
                          <div className="font-medium">{order.orderId || order._id}</div>
                          <div className="text-sm text-gray-500">{order.requester?.name} - {order.itemName}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm font-semibold text-gray-700 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-emerald-500" />
                  Customer
                </Label>
                <Input
                  id="customer"
                  placeholder="Enter customer name"
                  value={invoiceData.customer}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, customer: e.target.value }))}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-emerald-500" />
                  Items Description
                </Label>
                <Input
                  id="items"
                  placeholder="Describe items delivered"
                  value={invoiceData.items}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, items: e.target.value }))}
                  className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center">
                <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or terms..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-24 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                <FileText className="h-5 w-5 mr-2" />
                )}
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
              <Button
                type="button"
                onClick={() => onViewChange?.("Invoices")}
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

  // Default Dashboard view
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Supplier Dashboard
        </h1>
        <p className="text-xl text-gray-600">Manage orders and deliveries for zoo customers</p>
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
              <Package className="h-6 w-6 mr-3 text-emerald-500" />
              Order Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              View and manage received orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onViewChange?.("Orders")} 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Package className="h-5 w-5 mr-2" />
              View Orders
            </Button>
            <Button 
              onClick={() => onViewChange?.("Invoices")} 
              variant="outline" 
              className="w-full h-12 border-2 border-gray-300 hover:border-emerald-300 rounded-xl transition-all duration-300"
            >
              <FileText className="h-5 w-5 mr-2" />
              Manage Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Truck className="h-6 w-6 mr-3 text-blue-500" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest orders from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div>
                      <p className="font-semibold text-gray-800">{order.orderId || order._id}</p>
                      <p className="text-sm text-gray-600">{order.requester?.name || 'N/A'} • {order.itemName}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={order.status === "Delivered" ? "default" : order.status === "Accepted" ? "secondary" : "outline"}
                      className={order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Accepted" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {order.status}
                    </Badge>
                      <p className="text-sm text-gray-600 mt-1">₹{(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;