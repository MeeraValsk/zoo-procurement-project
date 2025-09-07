import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Clock, CheckCircle, FileText } from "lucide-react";

const receivedOrders = [
  { 
    id: "ZOO-001", 
    date: "2024-01-15", 
    zoo: "Central Zoo", 
    items: "Hay (50 tonnes), Fish Meal (10 tonnes)", 
    total: "₹2,45,000", 
    status: "new",
    deliveryDate: "2024-01-20"
  },
  { 
    id: "ZOO-002", 
    date: "2024-01-10", 
    zoo: "Wildlife Park", 
    items: "Soybean Meal (25 tonnes)", 
    total: "₹1,80,000", 
    status: "accepted",
    deliveryDate: "2024-01-18"
  },
  { 
    id: "ZOO-003", 
    date: "2024-01-08", 
    zoo: "Safari Park", 
    items: "Green Forages (100 tonnes)", 
    total: "₹95,000", 
    status: "delivered",
    deliveryDate: "2024-01-15"
  },
];

export default function SupplierDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-accent text-accent-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">New Orders</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning text-warning-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-success text-success-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Delivered</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Revenue</p>
              <p className="text-2xl font-bold">₹12.8L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-medium">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Received Orders</h3>
              <p className="text-sm text-muted-foreground">Manage your incoming orders</p>
            </div>
            <Button variant="zoo">
              <FileText className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Zoo/Park</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivedOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-table-row-hover">
                <TableCell className="font-mono">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="font-medium">{order.zoo}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell className="font-semibold">{order.total}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === "delivered" ? "default" :
                    order.status === "accepted" ? "secondary" : "destructive"
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status === "new" && (
                      <>
                        <Button variant="success" size="sm">Accept</Button>
                        <Button variant="outline" size="sm">Decline</Button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <Button variant="zoo" size="sm">Mark Delivered</Button>
                    )}
                    {order.status === "delivered" && (
                      <Button variant="accent" size="sm">Send Invoice</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium bg-gradient-subtle">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Order ZOO-003 delivered successfully</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New order ZOO-001 received</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Invoice sent for ZOO-002</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On-time Delivery</span>
              <span className="font-semibold text-success">98.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Acceptance Rate</span>
              <span className="font-semibold text-primary">95.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Customer Rating</span>
              <span className="font-semibold text-accent">4.8/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Orders This Month</span>
              <span className="font-semibold">32</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}