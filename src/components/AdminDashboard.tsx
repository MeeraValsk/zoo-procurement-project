import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Package, AlertTriangle, Building2, FileText } from "lucide-react";
import { StatsCard } from "./StatsCard";


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
        <StatsCard 
          title="Total Orders" 
          value="1,247" 
          icon={<Package className="h-6 w-6" />} 
          variant="primary"
          subtitle="+12% this month"
        />
        <StatsCard 
          title="Revenue" 
          value="₹68.4L" 
          icon={<TrendingUp className="h-6 w-6" />} 
          variant="accent"
          subtitle="+18% this month"
        />
        <StatsCard 
          title="Active Suppliers" 
          value="24" 
          icon={<Users className="h-6 w-6" />} 
          variant="success"
          subtitle="2 new this month"
        />
        <StatsCard 
          title="Pending Issues" 
          value="8" 
          icon={<AlertTriangle className="h-6 w-6" />} 
          variant="warning"
          subtitle="3 resolved today"
        />
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

    </div>
  );
}