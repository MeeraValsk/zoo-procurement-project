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
import { Package, Users, FileText, CheckCircle, Clock, AlertCircle, Eye, Edit, X, Search, Filter, Download, Plus, Shield, TrendingUp, DollarSign, UserPlus, Wheat } from "lucide-react";
import { StatsCard } from "./StatsCard";
import apiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const AdminDashboard = ({ currentView = "dashboard", onViewChange }: AdminDashboardProps) => {
  const { toast } = useToast();
  
  const [internalView, setInternalView] = useState<"dashboard" | "orders" | "invoices" | "userManagement" | "feedManagement">(currentView as any);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [feedTypes, setFeedTypes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // User Management States
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "staff"
  });
  const [userFormErrors, setUserFormErrors] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: ""
  });
  
  // Supplier Feed Form States
  const [supplierFeedForm, setSupplierFeedForm] = useState({
    name: "",
    pricePerTon: "",
    description: "",
    category: ""
  });
  const [supplierFeedFormErrors, setSupplierFeedFormErrors] = useState({
    name: "",
    pricePerTon: "",
    description: "",
    category: ""
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Feed Management States
  const [feedForm, setFeedForm] = useState({
    name: "",
    pricePerTon: "",
    description: "",
    category: ""
  });
  const [feedFormErrors, setFeedFormErrors] = useState({
    name: "",
    pricePerTon: "",
    description: "",
    category: ""
  });
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [feedSearchTerm, setFeedSearchTerm] = useState("");
  const [feedFilterCategory, setFeedFilterCategory] = useState("all");
  const [feedPage, setFeedPage] = useState(1);
  const [feedsPerPage] = useState(10);

  // Sync external currentView with internal view
  useEffect(() => {
    setInternalView(currentView as any);
  }, [currentView]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, feedTypesRes, ordersRes, invoicesRes] = await Promise.allSettled([
        apiService.getUsers(),
        apiService.getFeedTypes(),
        apiService.getOrders(),
        apiService.getInvoices()
      ]);

      if (usersRes.status === 'fulfilled') {
        const usersData = usersRes.value?.data?.users || usersRes.value || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
      if (feedTypesRes.status === 'fulfilled') {
        const feedTypesData = feedTypesRes.value?.data?.feedTypes || feedTypesRes.value || [];
        setFeedTypes(Array.isArray(feedTypesData) ? feedTypesData : []);
      }
      if (ordersRes.status === 'fulfilled') {
        const ordersData = ordersRes.value?.data?.orders || ordersRes.value || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
      if (invoicesRes.status === 'fulfilled') {
        const invoicesData = invoicesRes.value?.data?.invoices || invoicesRes.value || [];
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const validateUserForm = () => {
    const errors = { username: "", email: "", name: "", password: "", role: "" };
    let isValid = true;

    if (!userForm.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }
    if (!userForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }
    if (!userForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    // Password is only required when creating a new user, not when editing
    if (!editingUser && !userForm.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (userForm.password.trim() && userForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    if (!userForm.role) {
      errors.role = "Role is required";
      isValid = false;
    }

    setUserFormErrors(errors);
    return isValid;
  };

  const validateFeedForm = () => {
    const errors = { name: "", pricePerTon: "", description: "", category: "" };
    let isValid = true;

    if (!feedForm.name.trim()) {
      errors.name = "Feed name is required";
      isValid = false;
    }
    if (!feedForm.pricePerTon.trim()) {
      errors.pricePerTon = "Price is required";
      isValid = false;
    } else if (isNaN(Number(feedForm.pricePerTon)) || Number(feedForm.pricePerTon) <= 0) {
      errors.pricePerTon = "Price must be a valid positive number";
      isValid = false;
    }
    if (!feedForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }
    if (!feedForm.category.trim()) {
      errors.category = "Category is required";
      isValid = false;
    }

    setFeedFormErrors(errors);
    return isValid;
  };

  const validateSupplierFeedForm = () => {
    const errors = { name: "", pricePerTon: "", description: "", category: "" };
    let isValid = true;

    if (!supplierFeedForm.name.trim()) {
      errors.name = "Feed name is required";
      isValid = false;
    }
    if (!supplierFeedForm.pricePerTon.trim()) {
      errors.pricePerTon = "Price is required";
      isValid = false;
    } else if (isNaN(Number(supplierFeedForm.pricePerTon)) || Number(supplierFeedForm.pricePerTon) <= 0) {
      errors.pricePerTon = "Price must be a valid positive number";
      isValid = false;
    }
    if (!supplierFeedForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }
    if (!supplierFeedForm.category.trim()) {
      errors.category = "Category is required";
      isValid = false;
    }

    setSupplierFeedFormErrors(errors);
    return isValid;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) {
      return;
    }

    // If role is supplier, validate feed form as well
    if (userForm.role === "supplier" && !validateSupplierFeedForm()) {
      return;
    }

    try {
      setLoading(true);
      const userData = {
        username: userForm.username,
        email: userForm.email,
        name: userForm.name,
        password: userForm.password,
        role: userForm.role
      };

      const response = await apiService.createUser(userData);
      if (response?.success) {
        // If role is supplier, also create the feed type
        if (userForm.role === "supplier") {
          try {
            const feedData = {
              name: supplierFeedForm.name,
              pricePerTon: Number(supplierFeedForm.pricePerTon),
              description: supplierFeedForm.description,
              category: supplierFeedForm.category,
              isActive: true
            };

            const feedResponse = await apiService.createFeedType(feedData);
            if (feedResponse?.success) {
              toast({
                title: "Success",
                description: "Supplier user and feed type created successfully!",
              });
            } else {
              toast({
                title: "Partial Success",
                description: "User created but failed to create feed type. Please add feed manually.",
                variant: "destructive"
              });
            }
          } catch (feedError) {
            console.error('Error creating feed type:', feedError);
            toast({
              title: "Partial Success",
              description: "User created but failed to create feed type. Please add feed manually.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Success",
            description: "User created successfully!",
          });
        }
        
        // Reset forms
        setUserForm({ username: "", email: "", name: "", password: "", role: "staff" });
        setSupplierFeedForm({ name: "", pricePerTon: "", description: "", category: "" });
        setSupplierFeedFormErrors({ name: "", pricePerTon: "", description: "", category: "" });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      name: user.name,
      password: "",
      role: user.role
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) {
      return;
    }

    try {
      setLoading(true);
      const userData: any = {
        username: userForm.username,
        email: userForm.email,
        name: userForm.name,
        role: userForm.role
      };

      if (userForm.password.trim()) {
        userData.password = userForm.password;
      }

      const response = await apiService.updateUser(editingUser._id || editingUser.id, userData);
      if (response?.success) {
        toast({
          title: "Success",
          description: "User updated successfully!",
        });
        setEditingUser(null);
        setUserForm({ username: "", email: "", name: "", password: "", role: "staff" });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.deleteUser(userId);
      if (response?.success) {
        toast({
          title: "Success",
          description: "User deleted successfully!",
        });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to delete user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUserEdit = () => {
    setEditingUser(null);
    setUserForm({ username: "", email: "", name: "", password: "", role: "staff" });
    setUserFormErrors({ username: "", email: "", name: "", password: "", role: "" });
    setSupplierFeedForm({ name: "", pricePerTon: "", description: "", category: "" });
    setSupplierFeedFormErrors({ name: "", pricePerTon: "", description: "", category: "" });
  };

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFeedForm()) {
      return;
    }

    try {
      setLoading(true);
      const feedData = {
        name: feedForm.name,
        pricePerTon: Number(feedForm.pricePerTon),
        description: feedForm.description,
        category: feedForm.category,
        isActive: true
      };

      const response = await apiService.createFeedType(feedData);
      if (response?.success) {
        toast({
          title: "Success",
          description: "Feed type created successfully!",
        });
        setFeedForm({ name: "", pricePerTon: "", description: "", category: "" });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to create feed type",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating feed type:', error);
      toast({
        title: "Error",
        description: "Failed to create feed type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeed = (feed: any) => {
    setEditingFeed(feed);
    setFeedForm({
      name: feed.name,
      pricePerTon: feed.pricePerTonne ? feed.pricePerTonne.toString() : "",
      description: feed.description,
      category: feed.category
    });
  };

  const handleUpdateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFeedForm()) {
      return;
    }

    try {
      setLoading(true);
      const feedData = {
        name: feedForm.name,
        pricePerTon: Number(feedForm.pricePerTon),
        description: feedForm.description,
        category: feedForm.category
      };

      const response = await apiService.updateFeedType(editingFeed._id || editingFeed.id, feedData);
      if (response?.success) {
        toast({
          title: "Success",
          description: "Feed type updated successfully!",
        });
        setEditingFeed(null);
        setFeedForm({ name: "", pricePerTon: "", description: "", category: "" });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update feed type",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating feed type:', error);
      toast({
        title: "Error",
        description: "Failed to update feed type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm("Are you sure you want to delete this feed type?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.deleteFeedType(feedId);
      if (response?.success) {
        toast({
          title: "Success",
          description: "Feed type deleted successfully!",
        });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to delete feed type",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting feed type:', error);
      toast({
        title: "Error",
        description: "Failed to delete feed type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFeedEdit = () => {
    setEditingFeed(null);
    setFeedForm({ name: "", pricePerTon: "", description: "", category: "" });
    setFeedFormErrors({ name: "", pricePerTon: "", description: "", category: "" });
  };


  // Filtering and pagination logic
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  ).filter(user => userFilterRole === "all" || user.role === userFilterRole);

  const filteredFeeds = feedTypes.filter(feed => 
    feed.name.toLowerCase().includes(feedSearchTerm.toLowerCase()) ||
    feed.description.toLowerCase().includes(feedSearchTerm.toLowerCase())
  ).filter(feed => feedFilterCategory === "all" || feed.category === feedFilterCategory);

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage
  );

  const paginatedFeeds = filteredFeeds.slice(
    (feedPage - 1) * feedsPerPage,
    feedPage * feedsPerPage
  );

  // Default stats
  const defaultStats = [
    { title: "Total Users", value: users.length.toString(), change: "+0", icon: Users, color: "text-blue-600" },
    { title: "Feed Types", value: feedTypes.length.toString(), change: "+0", icon: Wheat, color: "text-green-600" },
    { title: "Total Orders", value: orders.length.toString(), change: "+0", icon: Package, color: "text-purple-600" },
    { title: "Total Invoices", value: invoices.length.toString(), change: "+0", icon: FileText, color: "text-orange-600" },
  ];

  // Render different views based on internalView
  if (internalView === "orders") {
  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Orders Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage all orders</p>
          </div>
        </div>
        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Package className="h-6 w-6 mr-3 text-emerald-500" />
              Orders Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage all orders in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
              <Table>
                <TableHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span>Order ID</span>
              </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-emerald-600" />
                        <span>Item</span>
            </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span>Quantity</span>
            </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>Supplier</span>
          </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span>Total Amount</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span>Date</span>
                      </div>
                    </TableHead>
            </TableRow>
          </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-100">
                  {orders.map((order, index) => (
                    <TableRow 
                      key={order._id || order.id} 
                      className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderId || order._id}</div>
                        <div className="text-sm text-gray-500">Order ID</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.itemName}</div>
                        <div className="text-sm text-gray-500">Item Name</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.quantity}</div>
                        <div className="text-sm text-gray-500">Quantity</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.supplier?.name || order.supplier}</div>
                        <div className="text-sm text-gray-500">Supplier</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-emerald-600">
                          ₹{order.totalAmount?.toLocaleString() || 'N/A'}
                    </div>
                        <div className="text-sm text-gray-500">Total Amount</div>
                  </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant="outline"
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            order.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.status === 'Delivered' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {order.status}
                  </Badge>
                </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">Created Date</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
            </div>
          </CardContent>
      </Card>
            </div>
    );
  }

  if (internalView === "invoices") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
              <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Invoices Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage all invoices</p>
                </div>
              </div>
        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <FileText className="h-6 w-6 mr-3 text-emerald-500" />
              Invoices Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage all invoices in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
              <Table>
                <TableHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span>Invoice ID</span>
                </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-emerald-600" />
                        <span>Order ID</span>
                </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>Supplier</span>
              </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span>Amount</span>
            </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span>Date</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-100">
                  {invoices.map((invoice, index) => (
                    <TableRow 
                      key={invoice._id || invoice.id} 
                      className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceId || invoice._id}</div>
                        <div className="text-sm text-gray-500">Invoice ID</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.orderId?.orderId || invoice.orderId}</div>
                        <div className="text-sm text-gray-500">Order ID</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.supplier?.name || invoice.supplier}</div>
                        <div className="text-sm text-gray-500">Supplier</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-emerald-600">
                          ₹{invoice.amount?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">Total Amount</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            invoice.status === 'Verified' ? 'bg-green-100 text-green-800 border-green-200' :
                            invoice.status === 'Discrepancy' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">Created Date</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          </Card>
      </div>
    );
  }

  if (internalView === "userManagement") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-2">Manage users and their roles</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Creation Form */}
          <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <UserPlus className="h-6 w-6 mr-3 text-emerald-500" />
                {editingUser ? "Edit User" : "Create New User"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {editingUser ? "Update user information" : "Add a new user to the system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</Label>
                    <Input
                      id="username"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter username"
                    />
                    {userFormErrors.username && <p className="text-red-500 text-sm">{userFormErrors.username}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter email"
                    />
                    {userFormErrors.email && <p className="text-red-500 text-sm">{userFormErrors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter full name"
                    />
                    {userFormErrors.name && <p className="text-red-500 text-sm">{userFormErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                    <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                      <SelectTrigger className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="invoice">Invoice Verification</SelectItem>
                      </SelectContent>
                    </Select>
                    {userFormErrors.role && <p className="text-red-500 text-sm">{userFormErrors.role}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password {editingUser && <span className="text-emerald-600 font-medium">(Optional - leave blank to keep current password)</span>}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder={editingUser ? "Enter new password (optional)" : "Enter password (required)"}
                  />
                  {userFormErrors.password && <p className="text-red-500 text-sm">{userFormErrors.password}</p>}
                  {editingUser && (
                    <p className="text-xs text-gray-500">
                      💡 Leave password field empty to keep the current password unchanged
                    </p>
                  )}
                </div>

                {/* Supplier Feed Form - Only show when role is supplier and not editing */}
                {userForm.role === "supplier" && !editingUser && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center mb-4">
                      <Wheat className="h-5 w-5 mr-2 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800">Feed Information</h3>
                      <p className="text-sm text-blue-600 ml-2">(Required for suppliers)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplierFeedName" className="text-sm font-semibold text-gray-700">Feed Name</Label>
                        <Input
                          id="supplierFeedName"
                          value={supplierFeedForm.name}
                          onChange={(e) => setSupplierFeedForm({ ...supplierFeedForm, name: e.target.value })}
                          className="bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter feed name"
                        />
                        {supplierFeedFormErrors.name && <p className="text-red-500 text-sm">{supplierFeedFormErrors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplierFeedPrice" className="text-sm font-semibold text-gray-700">Price per Ton (₹)</Label>
                        <Input
                          id="supplierFeedPrice"
                          type="text"
                          value={supplierFeedForm.pricePerTon}
                          onChange={(e) => {
                            // Only allow numbers and decimal point
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setSupplierFeedForm({ ...supplierFeedForm, pricePerTon: value });
                            }
                          }}
                          className="bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter price per ton"
                        />
                        {supplierFeedFormErrors.pricePerTon && <p className="text-red-500 text-sm">{supplierFeedFormErrors.pricePerTon}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplierFeedCategory" className="text-sm font-semibold text-gray-700">Category</Label>
                        <Select value={supplierFeedForm.category} onValueChange={(value) => setSupplierFeedForm({ ...supplierFeedForm, category: value })}>
                          <SelectTrigger className="bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hay">Hay</SelectItem>
                            <SelectItem value="Grain">Grain</SelectItem>
                            <SelectItem value="Fish Meal">Fish Meal</SelectItem>
                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Meat">Meat</SelectItem>
                            <SelectItem value="Supplements">Supplements</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {supplierFeedFormErrors.category && <p className="text-red-500 text-sm">{supplierFeedFormErrors.category}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplierFeedDescription" className="text-sm font-semibold text-gray-700">Description</Label>
                        <Input
                          id="supplierFeedDescription"
                          value={supplierFeedForm.description}
                          onChange={(e) => setSupplierFeedForm({ ...supplierFeedForm, description: e.target.value })}
                          className="bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter description"
                        />
                        {supplierFeedFormErrors.description && <p className="text-red-500 text-sm">{supplierFeedFormErrors.description}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (editingUser ? "Updating..." : "Creating...") : (editingUser ? "Update User" : "Create User")}
          </Button>
                  {editingUser && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelUserEdit}
                      className="px-6 py-2 rounded-xl"
                    >
                      Cancel
                    </Button>
                  )}
        </div>
              </form>
            </CardContent>
          </Card>
        
          {/* Users Table */}
        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Users className="h-6 w-6 mr-3 text-emerald-500" />
                All Users
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage existing users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <Select value={userFilterRole} onValueChange={setUserFilterRole}>
                    <SelectTrigger className="w-48 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="invoice">Invoice Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <Table>
                    <TableHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            <span>Username</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <span>Email</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <UserPlus className="h-4 w-4 text-emerald-600" />
                            <span>Full Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-emerald-600" />
                            <span>Role</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>Status</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Edit className="h-4 w-4 text-emerald-600" />
                            <span>Actions</span>
                          </div>
                        </TableHead>
            </TableRow>
          </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                      {paginatedUsers.map((user, index) => (
                        <TableRow 
                          key={user._id || user.id} 
                          className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">ID: {user._id || user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">Email address</div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">Full name</div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                              variant="outline" 
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                user.role === 'supplier' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                user.role === 'invoice' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                user.isActive ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                              <Badge 
                                variant="outline" 
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }`}
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 w-9 p-0 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200"
                                onClick={() => handleEditUser(user)}
                                title="Edit user"
                              >
                        <Edit className="h-4 w-4" />
                      </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                title="Delete user"
                              >
                                <X className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Showing <span className="font-bold text-emerald-600">{Math.min((userPage - 1) * usersPerPage + 1, filteredUsers.length)}</span> to <span className="font-bold text-emerald-600">{Math.min(userPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-bold text-emerald-600">{filteredUsers.length}</span> users
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUserPage(Math.max(1, userPage - 1))}
                      disabled={userPage <= 1}
                      className="h-8 px-3 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <div className="px-4 py-1 text-sm font-semibold bg-white rounded-lg border border-gray-200 shadow-sm">
                      Page {userPage} of {Math.ceil(filteredUsers.length / usersPerPage)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUserPage(Math.min(Math.ceil(filteredUsers.length / usersPerPage), userPage + 1))}
                      disabled={userPage >= Math.ceil(filteredUsers.length / usersPerPage)}
                      className="h-8 px-3 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <Clock className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
      </Card>
        </div>
      </div>
    );
  }

  if (internalView === "feedManagement") {
    return (
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Feed Management
            </h1>
            <p className="text-gray-600 mt-2">Manage feed types and suppliers</p>
            </div>
        </div>

        <div className="space-y-6">
          {/* Feed Type Creation Form */}
          <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Wheat className="h-6 w-6 mr-3 text-emerald-500" />
                {editingFeed ? "Edit Feed Type" : "Create New Feed Type"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {editingFeed ? "Update feed type information" : "Add a new feed type to the system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingFeed ? handleUpdateFeed : handleCreateFeed} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedName" className="text-sm font-semibold text-gray-700">Feed Name</Label>
                    <Input
                      id="feedName"
                      value={feedForm.name}
                      onChange={(e) => setFeedForm({ ...feedForm, name: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter feed name"
                    />
                    {feedFormErrors.name && <p className="text-red-500 text-sm">{feedFormErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedPrice" className="text-sm font-semibold text-gray-700">Price per Ton (₹)</Label>
                    <Input
                      id="feedPrice"
                      type="text"
                      value={feedForm.pricePerTon}
                      onChange={(e) => {
                        // Only allow numbers and decimal point
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setFeedForm({ ...feedForm, pricePerTon: value });
                        }
                      }}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter price per ton"
                    />
                    {feedFormErrors.pricePerTon && <p className="text-red-500 text-sm">{feedFormErrors.pricePerTon}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedCategory" className="text-sm font-semibold text-gray-700">Category</Label>
                    <Select value={feedForm.category} onValueChange={(value) => setFeedForm({ ...feedForm, category: value })}>
                      <SelectTrigger className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hay">Hay</SelectItem>
                        <SelectItem value="Grain">Grain</SelectItem>
                        <SelectItem value="Fish Meal">Fish Meal</SelectItem>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Supplements">Supplements</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {feedFormErrors.category && <p className="text-red-500 text-sm">{feedFormErrors.category}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedDescription" className="text-sm font-semibold text-gray-700">Description</Label>
                    <Input
                      id="feedDescription"
                      value={feedForm.description}
                      onChange={(e) => setFeedForm({ ...feedForm, description: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter description"
                    />
                    {feedFormErrors.description && <p className="text-red-500 text-sm">{feedFormErrors.description}</p>}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (editingFeed ? "Updating..." : "Creating...") : (editingFeed ? "Update Feed Type" : "Create Feed Type")}
            </Button>
                  {editingFeed && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelFeedEdit}
                      className="px-6 py-2 rounded-xl"
                    >
                      Cancel
            </Button>
                  )}
          </div>
              </form>
            </CardContent>
          </Card>
        
          {/* Feed Types Table */}
        <Card className="p-6 shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Wheat className="h-6 w-6 mr-3 text-emerald-500" />
                All Feed Types
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage existing feed types in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search feed types..."
                      value={feedSearchTerm}
                      onChange={(e) => setFeedSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <Select value={feedFilterCategory} onValueChange={setFeedFilterCategory}>
                    <SelectTrigger className="w-48 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Hay">Hay</SelectItem>
                      <SelectItem value="Grain">Grain</SelectItem>
                      <SelectItem value="Fish Meal">Fish Meal</SelectItem>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Supplements">Supplements</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <Table>
                    <TableHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Wheat className="h-4 w-4 text-emerald-600" />
                            <span>Feed Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-emerald-600" />
                            <span>Category</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span>Price per Ton</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <span>Description</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>Status</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 px-6 text-sm uppercase tracking-wider text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Edit className="h-4 w-4 text-emerald-600" />
                            <span>Actions</span>
                          </div>
                        </TableHead>
            </TableRow>
          </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                      {paginatedFeeds.map((feed, index) => (
                        <TableRow 
                          key={feed._id || feed.id} 
                          className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                                {feed.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{feed.name}</div>
                                <div className="text-sm text-gray-500">Feed Type</div>
                              </div>
                    </div>
                  </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline" 
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                feed.category === 'Hay' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                feed.category === 'Grain' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                feed.category === 'Fish Meal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                feed.category === 'Vegetables' ? 'bg-green-100 text-green-800 border-green-200' :
                                feed.category === 'Fruits' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                                feed.category === 'Meat' ? 'bg-red-100 text-red-800 border-red-200' :
                                feed.category === 'Supplements' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {feed.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-emerald-600">
                                ₹{feed.pricePerTonne?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="ml-2 text-xs text-gray-500">per ton</div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={feed.description}>
                              {feed.description}
                            </div>
                            <div className="text-sm text-gray-500">Description</div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                feed.isActive ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                              <Badge 
                                variant="outline" 
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  feed.isActive 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }`}
                              >
                                {feed.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 w-9 p-0 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200"
                                onClick={() => handleEditFeed(feed)}
                                title="Edit feed type"
                              >
                        <Edit className="h-4 w-4" />
                      </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                                onClick={() => handleDeleteFeed(feed._id || feed.id)}
                                title="Delete feed type"
                              >
                                <X className="h-4 w-4" />
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Wheat className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Showing <span className="font-bold text-emerald-600">{Math.min((feedPage - 1) * feedsPerPage + 1, filteredFeeds.length)}</span> to <span className="font-bold text-emerald-600">{Math.min(feedPage * feedsPerPage, filteredFeeds.length)}</span> of <span className="font-bold text-emerald-600">{filteredFeeds.length}</span> feed types
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFeedPage(Math.max(1, feedPage - 1))}
                      disabled={feedPage <= 1}
                      className="h-8 px-3 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <div className="px-4 py-1 text-sm font-semibold bg-white rounded-lg border border-gray-200 shadow-sm">
                      Page {feedPage} of {Math.ceil(filteredFeeds.length / feedsPerPage)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFeedPage(Math.min(Math.ceil(filteredFeeds.length / feedsPerPage), feedPage + 1))}
                      disabled={feedPage >= Math.ceil(filteredFeeds.length / feedsPerPage)}
                      className="h-8 px-3 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <Clock className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
      </Card>
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600">Manage procurement requests, approvals, and suppliers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {defaultStats.map((stat, index) => {
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
              <Shield className="h-6 w-6 mr-3 text-emerald-500" />
              Management Tools
            </CardTitle>
            <CardDescription className="text-gray-600">
              Administrative functions and controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onViewChange?.("orders")} 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              View Orders
            </Button>
            <Button 
              onClick={() => onViewChange?.("invoices")} 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Users className="h-6 w-6 mr-3 text-blue-500" />
              User & Feed Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage users and feed types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onViewChange?.("userManagement")} 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Manage Users
            </Button>
            <Button 
              onClick={() => onViewChange?.("feedManagement")} 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Wheat className="h-5 w-5 mr-2" />
              Manage Feed Types
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
