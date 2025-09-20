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

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (feedTypesRes.status === 'fulfilled') setFeedTypes(feedTypesRes.value || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value || []);
      if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage all orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id || order.id}>
                    <TableCell>{order.orderId || order._id}</TableCell>
                    <TableCell>{order.itemName}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.supplier?.name || order.supplier}</TableCell>
                    <TableCell>₹{order.totalAmount?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage all invoices in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id || invoice.id}>
                    <TableCell>{invoice.invoiceId || invoice._id}</TableCell>
                    <TableCell>{invoice.orderId?.orderId || invoice.orderId}</TableCell>
                    <TableCell>{invoice.supplier?.name || invoice.supplier}</TableCell>
                    <TableCell>₹{invoice.amount?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id || user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Feed Types</CardTitle>
            <CardDescription>Manage all feed types in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price per Ton</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedTypes.map((feed) => (
                  <TableRow key={feed._id || feed.id}>
                    <TableCell>{feed.name}</TableCell>
                    <TableCell>{feed.category}</TableCell>
                    <TableCell>₹{feed.pricePerTonne?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{feed.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={feed.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {feed.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
