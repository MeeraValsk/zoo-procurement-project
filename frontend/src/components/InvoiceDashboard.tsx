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
import { FileText, CheckCircle, Clock, AlertCircle, Eye, Edit, X, Search, Filter, Download, Send, DollarSign, Calendar, AlertTriangle, RefreshCw, Mail, Bell, Package, User as UserIcon, Building } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import { Invoice, Order, User } from "@/types";
import EmailService from "@/services/emailService";

interface InvoiceDashboardProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}


const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ currentView = "dashboard", onViewChange }) => {
  const [internalView, setInternalView] = useState<"dashboard" | "pending" | "verified" | "discrepancies" | "notifications">("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [verifiedInvoices, setVerifiedInvoices] = useState([]);
  const [discrepancyInvoices, setDiscrepancyInvoices] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  // Sync internal view with external currentView prop
  useEffect(() => {
    if (currentView && currentView !== internalView) {
      setInternalView(currentView as any);
    }
  }, [currentView, internalView]);

  // Load data on component mount and when view changes
  useEffect(() => {
    loadData();
  }, [internalView]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allInvoicesRes, statsRes] = await Promise.allSettled([
        apiService.getInvoices(), // Get all invoices
        apiService.getInvoiceStats()
      ]);

      if (allInvoicesRes.status === 'fulfilled' && allInvoicesRes.value.success) {
        const allInvoices = allInvoicesRes.value.data.invoices;
        
        // Categorize invoices based on verification status
        const pending = allInvoices.filter(invoice => 
          invoice.status === 'Generated' || 
          invoice.status === 'Pending Verification' ||
          invoice.status === 'Sent' ||
          !invoice.verifiedBy
        );
        
        const verified = allInvoices.filter(invoice => 
          invoice.status === 'Verified' && 
          invoice.verifiedBy
        );
        
        const discrepancies = allInvoices.filter(invoice => 
          invoice.status === 'Discrepancy' || 
          (invoice.discrepancies && invoice.discrepancies.length > 0)
        );
        
        setPendingInvoices(pending);
        setVerifiedInvoices(verified);
        setDiscrepancyInvoices(discrepancies);
      }
      
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceAction = async (invoiceId: string, action: string): Promise<boolean> => {
    try {
      setLoading(true);
      let response;
      
      if (action === 'verify') {
        // Verify the invoice - change status to "Verified"
        response = await apiService.verifyInvoice(invoiceId, verificationNotes);
        if (response?.success) {
          toast({
            title: "Success",
            description: `Invoice ${invoiceId} verified successfully! Ready for payment processing.`,
          });
        }
      } else if (action === 'discrepancy') {
        // Report discrepancy - change status to "Discrepancy"
        response = await apiService.addDiscrepancy(invoiceId, discrepancyNotes);
        if (response?.success) {
          toast({
            title: "Discrepancy Reported",
            description: `Discrepancy reported for invoice ${invoiceId}. Procurement team and supplier will be notified.`,
          });
        }
      }
      
      if (response?.success) {
        await loadData(); // Reload data to update categories
        return true;
      } else {
        toast({
          title: "Error",
          description: response?.message || 'Action failed',
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error processing invoice:', error);
      toast({
        title: "Error",
        description: 'Error processing invoice. Please try again.',
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
      setSelectedInvoice(null);
    }
  };

  const handleVerifyInvoice = async (invoiceId: string) => {
    const result = await handleInvoiceAction(invoiceId, 'verify');
    
    // Send email notification after verification
    if (result) {
      const invoice = [...pendingInvoices, ...verifiedInvoices, ...discrepancyInvoices]
        .find(inv => (inv._id || inv.id) === invoiceId);
      
      if (invoice && invoice.supplier) {
        const supplier = typeof invoice.supplier === 'string' 
          ? { email: 'supplier@example.com', name: 'Supplier' } // Fallback
          : invoice.supplier;
          
        try {
          await EmailService.sendInvoiceVerificationNotification(
            supplier.email,
            supplier.name,
            invoiceId,
            'verified',
            'Your invoice has been verified and approved for payment processing.'
          );
          
          toast({
            title: "Email Sent",
            description: "Verification notification sent to supplier via email.",
          });
        } catch (error) {
          console.error('Error sending email:', error);
          // Don't show error to user as the main action (verification) succeeded
        }
      }
    }
  };

  const handleReportDiscrepancy = async (invoiceId: string) => {
    if (!discrepancyNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide details about the discrepancy.",
        variant: "destructive"
      });
      return;
    }
    
    await handleInvoiceAction(invoiceId, 'discrepancy');
    setDiscrepancyNotes("");
    setShowDiscrepancyModal(false);
  };

  const openDiscrepancyModal = () => {
    setShowDiscrepancyModal(true);
    setDiscrepancyNotes("");
  };



  // Filter and paginate invoices based on current view
  const getFilteredInvoices = () => {
    let invoices = [];
    switch (internalView) {
      case 'pending':
        invoices = pendingInvoices;
        break;
      case 'verified':
        invoices = verifiedInvoices;
        break;
      case 'discrepancies':
        invoices = discrepancyInvoices;
        break;
      default:
        invoices = [...pendingInvoices, ...verifiedInvoices, ...discrepancyInvoices];
    }

    return invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.supplier?.name || invoice.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.invoiceId || invoice._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || (invoice.status || '').toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });
  };

  const filteredInvoices = getFilteredInvoices();
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Default stats for when API data is not available
  const defaultStats = [
    { title: "Pending Verification", value: "8", change: "+2", icon: Clock, color: "text-yellow-600" },
    { title: "Verified Invoices", value: "24", change: "+5", icon: CheckCircle, color: "text-green-600" },
    { title: "Discrepancies", value: "3", change: "+1", icon: AlertTriangle, color: "text-red-600" },
    { title: "Total Processed", value: "₹125,000", change: "+12%", icon: DollarSign, color: "text-purple-600" },
  ];

  // Process stats from API data
  const processedStats = stats.length > 0 ? [
    { title: "Pending Verification", value: pendingInvoices.length.toString(), change: "+0", icon: Clock, color: "text-yellow-600" },
    { title: "Verified Invoices", value: verifiedInvoices.length.toString(), change: "+0", icon: CheckCircle, color: "text-green-600" },
    { title: "Discrepancies", value: discrepancyInvoices.length.toString(), change: "+0", icon: AlertTriangle, color: "text-red-600" },
    { title: "Total Processed", value: `₹${(verifiedInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)).toLocaleString()}`, change: "+12%", icon: DollarSign, color: "text-purple-600" },
  ] : defaultStats;

  // Handle view changes
  const handleViewChange = (view: string) => {
    setInternalView(view as any);
    setCurrentPage(1); // Reset pagination
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Get order details if not already populated
      let orderData = invoice.orderId;
      if (typeof orderData === 'string') {
        // If orderId is just a string, we need to fetch the full order
        const orderResponse = await apiService.getOrders();
        if (orderResponse?.success) {
          orderData = orderResponse.data.orders.find((o: any) => o._id === orderData || o.orderId === orderData);
        }
      }

      // Get supplier details if not already populated
      let supplierData = invoice.supplier;
      if (typeof supplierData === 'string') {
        // If supplier is just a string, we need to fetch the full supplier
        const usersResponse = await apiService.getUsers();
        if (usersResponse?.success) {
          supplierData = usersResponse.data.users.find((u: any) => u._id === supplierData);
        }
      }

      // Ensure we have the required data
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

  const handleSendInvoiceEmail = async (invoice: any) => {
    try {
      setLoading(true);
      
      // Get supplier details if not already populated
      let supplierData = invoice.supplier;
      if (typeof supplierData === 'string') {
        const usersResponse = await apiService.getUsers();
        if (usersResponse?.success) {
          supplierData = usersResponse.data.users.find((u: any) => u._id === supplierData);
        }
      }

      if (!supplierData || !supplierData.email) {
        toast({
          title: "Error",
          description: "Supplier email not found. Cannot send invoice.",
          variant: "destructive"
        });
        return;
      }

      // Send invoice email
      const success = await EmailService.sendDeliveryNotification(
        supplierData.email,
        supplierData.name,
        invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId || 'N/A',
        invoice.invoiceId || invoice._id,
        invoice.amount || 0
      );

      if (success) {
        toast({
          title: "Success",
          description: "Invoice sent to supplier via email successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send email. Please check EmailJS configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (internalView === "pending") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Pending Verification
            </h1>
            <p className="text-gray-600 mt-2">Review auto-generated invoices from delivered orders</p>
          </div>
          <Button onClick={() => handleViewChange("dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-semibold text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by supplier, customer, or invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="filter" className="text-sm font-semibold text-gray-700">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-bold text-gray-800">Invoice ID</TableHead>
                <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                <TableHead className="font-bold text-gray-800">Supplier</TableHead>
                <TableHead className="font-bold text-gray-800">Customer</TableHead>
                <TableHead className="font-bold text-gray-800">Amount</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Due Date</TableHead>
                <TableHead className="font-bold text-gray-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice, index) => (
                <TableRow key={invoice._id || invoice.id} className="border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium text-gray-800">{invoice.invoiceId || invoice._id}</TableCell>
                  <TableCell className="text-gray-600">{invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId}</TableCell>
                  <TableCell className="text-gray-600">{invoice.supplier?.name || invoice.supplier}</TableCell>
                  <TableCell className="text-gray-600">{invoice.customer}</TableCell>
                  <TableCell className="text-gray-600 font-semibold">₹{(invoice.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        variant="outline"
                        className={(invoice.discrepancies?.length || 0) > 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {(invoice.discrepancies?.length || 0) > 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {(invoice.discrepancies?.length || 0) === 0 && <Clock className="h-3 w-3 mr-1" />}
                        {invoice.status}
                      </Badge>
                      {/* Order vs Invoice Match Indicator */}
                      <div className="text-xs">
                        {invoice.orderId?.totalAmount === invoice.amount ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Order Match
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Check Required
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleVerifyInvoice(invoice._id || invoice.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify Match
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="h-8 px-3"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          openDiscrepancyModal();
                        }}
                        title="Report Discrepancy"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Report Issue
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadInvoice(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        onClick={() => handleSendInvoiceEmail(invoice)}
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Card className="p-4 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
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
          </Card>
        )}

        {/* Invoice Details Modal with Order Comparison */}
        {selectedInvoice && (
          <Card className="p-6 shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Invoice Verification - {selectedInvoice.invoiceId || selectedInvoice._id}</h3>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
            
            {/* Order vs Invoice Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Details */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-blue-700">Order ID:</span> {selectedInvoice.orderId?.orderId || selectedInvoice.orderId?._id || selectedInvoice.orderId}</p>
                  <p><span className="font-medium text-blue-700">Item Name:</span> {selectedInvoice.orderId?.itemName || 'N/A'}</p>
                  <p><span className="font-medium text-blue-700">Quantity:</span> {selectedInvoice.orderId?.quantity || 'N/A'} tonnes</p>
                  <p><span className="font-medium text-blue-700">Price per Tonne:</span> ₹{selectedInvoice.orderId?.price || 'N/A'}</p>
                  <p><span className="font-medium text-blue-700">Total Amount:</span> ₹{selectedInvoice.orderId?.totalAmount || 'N/A'}</p>
                  <p><span className="font-medium text-blue-700">Order Date:</span> {selectedInvoice.orderId?.createdAt ? new Date(selectedInvoice.orderId.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="font-medium text-blue-700">Status:</span> {selectedInvoice.orderId?.status || 'N/A'}</p>
                  <p><span className="font-medium text-blue-700">Department:</span> {selectedInvoice.orderId?.department || 'N/A'}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoice Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-green-700">Invoice ID:</span> {selectedInvoice.invoiceId || selectedInvoice._id}</p>
                  <p><span className="font-medium text-green-700">Invoice Number:</span> {selectedInvoice.invoiceNumber || 'N/A'}</p>
                  <p><span className="font-medium text-green-700">Items:</span> {selectedInvoice.items || 'N/A'}</p>
                  <p><span className="font-medium text-green-700">Amount:</span> ₹{(selectedInvoice.amount || 0).toLocaleString()}</p>
                  <p><span className="font-medium text-green-700">Due Date:</span> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="font-medium text-green-700">Received Date:</span> {selectedInvoice.receivedDate ? new Date(selectedInvoice.receivedDate).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="font-medium text-green-700">Status:</span> {selectedInvoice.status || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Supplier & Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Supplier Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedInvoice.supplier?.name || selectedInvoice.supplier || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedInvoice.supplier?.email || 'N/A'}</p>
                  <p><span className="font-medium">Contact:</span> {selectedInvoice.supplier?.contact || 'N/A'}</p>
                  <p><span className="font-medium">Speciality:</span> {selectedInvoice.supplier?.speciality || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Customer Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedInvoice.customer || 'N/A'}</p>
                  <p><span className="font-medium">Department:</span> {selectedInvoice.orderId?.department || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Order vs Invoice Comparison Summary */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verification Summary
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Amount Comparison</h5>
                    <div className="space-y-1 text-sm">
                      <p>Order Total: ₹{(selectedInvoice.orderId?.totalAmount || 0).toLocaleString()}</p>
                      <p>Invoice Amount: ₹{(selectedInvoice.amount || 0).toLocaleString()}</p>
                      <p className={`font-medium ${selectedInvoice.orderId?.totalAmount === selectedInvoice.amount ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedInvoice.orderId?.totalAmount === selectedInvoice.amount ? '✅ Match' : '❌ Mismatch'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Item Comparison</h5>
                    <div className="space-y-1 text-sm">
                      <p>Order Item: {selectedInvoice.orderId?.itemName || 'N/A'}</p>
                      <p>Invoice Item: {selectedInvoice.items || 'N/A'}</p>
                      <p className={`font-medium ${selectedInvoice.orderId?.itemName === selectedInvoice.items ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedInvoice.orderId?.itemName === selectedInvoice.items ? '✅ Match' : '⚠️ Different Format'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancies Section */}
            {selectedInvoice.discrepancies && selectedInvoice.discrepancies.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Discrepancies Found
                </h4>
                <div className="bg-red-50 p-4 rounded-xl">
                  {selectedInvoice.discrepancies.map((discrepancy: string, index: number) => (
                    <p key={index} className="text-sm text-red-700 mb-2">• {discrepancy}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6">
              <Label htmlFor="verificationNotes" className="text-sm font-semibold text-gray-700">Verification Notes</Label>
              <Textarea
                id="verificationNotes"
                placeholder="Add verification notes or comments..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="mt-2 min-h-24 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            {/* Action Buttons */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Verification Actions</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  onClick={() => handleVerifyInvoice(selectedInvoice._id || selectedInvoice.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ✅ Verify Order Match
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={openDiscrepancyModal}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  ❌ Report Discrepancy
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Instructions:</strong> Compare the order details with invoice details above. 
                If everything matches, click "Verify Order Match". If you find any discrepancies, 
                click "Report Discrepancy" to provide details.
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (internalView === "verified") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Verified Invoices
            </h1>
            <p className="text-gray-600 mt-2">Invoices approved for payment processing</p>
          </div>
          <Button onClick={() => handleViewChange("dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-bold text-gray-800">Invoice ID</TableHead>
                <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                <TableHead className="font-bold text-gray-800">Supplier</TableHead>
                <TableHead className="font-bold text-gray-800">Customer</TableHead>
                <TableHead className="font-bold text-gray-800">Amount</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Verified Date</TableHead>
                <TableHead className="font-bold text-gray-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice, index) => (
                <TableRow key={invoice._id || invoice.id} className="border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium text-gray-800">{invoice.invoiceId || invoice._id}</TableCell>
                  <TableCell className="text-gray-600">{invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId}</TableCell>
                  <TableCell className="text-gray-600">{invoice.supplier?.name || invoice.supplier}</TableCell>
                  <TableCell className="text-gray-600">{invoice.customer}</TableCell>
                  <TableCell className="text-gray-600 font-semibold">₹{(invoice.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(invoice.updatedAt || invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadInvoice(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        onClick={() => handleSendInvoiceEmail(invoice)}
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Card className="p-4 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
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
          </Card>
        )}
      </div>
    );
  }

  if (internalView === "discrepancies") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Invoice Discrepancies
            </h1>
            <p className="text-gray-600 mt-2">Invoices with issues requiring resolution</p>
          </div>
          <Button onClick={() => handleViewChange("dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-bold text-gray-800">Invoice ID</TableHead>
                <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                <TableHead className="font-bold text-gray-800">Supplier</TableHead>
                <TableHead className="font-bold text-gray-800">Customer</TableHead>
                <TableHead className="font-bold text-gray-800">Amount</TableHead>
                <TableHead className="font-bold text-gray-800">Discrepancies</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice, index) => (
                <TableRow key={invoice._id || invoice.id} className="border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium text-gray-800">{invoice.invoiceId || invoice._id}</TableCell>
                  <TableCell className="text-gray-600">{invoice.orderId?.orderId || invoice.orderId?._id || invoice.orderId}</TableCell>
                  <TableCell className="text-gray-600">{invoice.supplier?.name || invoice.supplier}</TableCell>
                  <TableCell className="text-gray-600">{invoice.customer}</TableCell>
                  <TableCell className="text-gray-600 font-semibold">₹{(invoice.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">
                    <div className="max-w-xs">
                      {(invoice.discrepancies || []).map((discrepancy: string, idx: number) => (
                        <div key={idx} className="text-xs text-red-600 bg-red-50 p-1 rounded mb-1">
                          {discrepancy}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="destructive"
                      className="bg-red-100 text-red-800"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadInvoice(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        onClick={() => handleSendInvoiceEmail(invoice)}
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Card className="p-4 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
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
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Invoice Verification Dashboard
        </h1>
        <p className="text-xl text-gray-600">Review auto-generated invoices from delivered orders and process for payment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processedStats.map((stat, index) => {
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
              <FileText className="h-6 w-6 mr-3 text-emerald-500" />
              Invoice Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Review auto-generated invoices and process for payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleViewChange("pending")} 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Clock className="h-5 w-5 mr-2" />
              Pending Verification
            </Button>
            <Button 
              onClick={() => handleViewChange("verified")} 
              variant="outline" 
              className="w-full h-12 border-2 border-gray-300 hover:border-emerald-300 rounded-xl transition-all duration-300"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Verified Invoices
            </Button>
            <Button 
              onClick={() => handleViewChange("discrepancies")} 
              variant="outline" 
              className="w-full h-12 border-2 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 rounded-xl transition-all duration-300"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Discrepancies
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest invoice verification activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...pendingInvoices, ...discrepancyInvoices].slice(0, 3).map((invoice, index) => (
                <div key={invoice._id || invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-gray-800">{invoice.invoiceId || invoice._id}</p>
                    <p className="text-sm text-gray-600">{invoice.supplier?.name || invoice.supplier} • {invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className={(invoice.discrepancies?.length || 0) > 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {(invoice.discrepancies?.length || 0) > 0 ? "Discrepancy" : "Pending"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">₹{(invoice.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Reporting Modal */}
      {showDiscrepancyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Report Discrepancy
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please describe the discrepancy you found between the order and invoice details:
            </p>
            <Textarea
              placeholder="Describe the discrepancy in detail..."
              value={discrepancyNotes}
              onChange={(e) => setDiscrepancyNotes(e.target.value)}
              className="min-h-32 mb-4"
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDiscrepancyModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleReportDiscrepancy(selectedInvoice._id || selectedInvoice.id)}
                className="flex-1"
                disabled={!discrepancyNotes.trim()}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Discrepancy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard;