import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  Users, 
  Package, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from "lucide-react";

const monthlyData = [
  { month: "Jan", orders: 45, revenue: 850000 },
  { month: "Feb", orders: 52, revenue: 920000 },
  { month: "Mar", orders: 48, revenue: 780000 },
  { month: "Apr", orders: 61, revenue: 1100000 },
  { month: "May", orders: 55, revenue: 980000 },
  { month: "Jun", orders: 67, revenue: 1250000 },
];

const feedTypeData = [
  { name: "Hay", value: 35, fill: "hsl(var(--primary))" },
  { name: "Fish Meal", value: 25, fill: "hsl(var(--accent))" },
  { name: "Soybean Meal", value: 20, fill: "hsl(var(--success))" },
  { name: "Green Forages", value: 12, fill: "hsl(var(--warning))" },
  { name: "Others", value: 8, fill: "hsl(var(--muted))" },
];

const suppliers = [
  { id: "1", name: "Green Feed Co.", rating: 4.8, orders: 156, revenue: "₹24.5L", status: "active" },
  { id: "2", name: "Animal Nutrition Ltd.", rating: 4.6, orders: 134, revenue: "₹18.9L", status: "active" },
  { id: "3", name: "Farm Fresh Feeds", rating: 4.9, orders: 98, revenue: "₹15.2L", status: "active" },
  { id: "4", name: "Natural Feed Corp", rating: 4.4, orders: 67, revenue: "₹9.8L", status: "pending" },
];

const recentOrders = [
  { id: "ZOO-045", zoo: "Central Zoo", supplier: "Green Feed Co.", amount: "₹2,45,000", status: "delivered", date: "2024-01-15" },
  { id: "ZOO-046", zoo: "Wildlife Park", supplier: "Animal Nutrition Ltd.", amount: "₹1,80,000", status: "in_transit", date: "2024-01-14" },
  { id: "ZOO-047", zoo: "Safari Park", supplier: "Farm Fresh Feeds", amount: "₹95,000", status: "approved", date: "2024-01-14" },
  { id: "ZOO-048", zoo: "Marine World", supplier: "Green Feed Co.", amount: "₹3,20,000", status: "pending", date: "2024-01-13" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs opacity-75">+12% this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-accent text-accent-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Revenue</p>
              <p className="text-2xl font-bold">₹68.4L</p>
              <p className="text-xs opacity-75">+18% this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-success text-success-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Active Suppliers</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs opacity-75">2 new this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning text-warning-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Pending Issues</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs opacity-75">3 resolved today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">Monthly Orders & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">Feed Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={feedTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {feedTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Suppliers Management */}
      <Card className="shadow-medium">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Supplier Management</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage supplier performance</p>
            </div>
            <Button variant="zoo">
              <Building2 className="h-4 w-4 mr-2" />
              Add New Supplier
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Revenue Generated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-table-row-hover">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-1">⭐</span>
                    <span className="font-semibold">{supplier.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{supplier.orders}</TableCell>
                <TableCell className="font-semibold">{supplier.revenue}</TableCell>
                <TableCell>
                  <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button variant="secondary" size="sm">Manage</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Orders */}
      <Card className="shadow-medium">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <p className="text-sm text-muted-foreground">Latest procurement activities</p>
            </div>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Zoo/Park</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-table-row-hover">
                <TableCell className="font-mono">{order.id}</TableCell>
                <TableCell className="font-medium">{order.zoo}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="font-semibold">{order.amount}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === "delivered" ? "default" :
                    order.status === "in_transit" ? "secondary" :
                    order.status === "approved" ? "secondary" : "destructive"
                  }>
                    {order.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Quick Actions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium bg-gradient-subtle">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="zoo" className="h-16 flex-col">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="accent" className="h-16 flex-col">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Export Data</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <AlertTriangle className="h-5 w-5 mb-1" />
              <span className="text-xs">System Alerts</span>
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Order Processing</span>
              </div>
              <span className="text-sm font-medium text-success">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Invoice System</span>
              </div>
              <span className="text-sm font-medium text-success">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm">Email Notifications</span>
              </div>
              <span className="text-sm font-medium text-warning">Delayed</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Database</span>
              </div>
              <span className="text-sm font-medium text-success">Operational</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}