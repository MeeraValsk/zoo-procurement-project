import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, TrendingUp, Clock } from "lucide-react";

const feedTypes = [
  "Hay", "Silage", "Green Forages", "Straw", "Pasture",
  "Fish Meal", "Meat and Bone Meal", "Groundnut Cake", "Soybean Meal"
];

const suppliers = [
  { id: "1", name: "Green Feed Co.", rating: 4.8 },
  { id: "2", name: "Animal Nutrition Ltd.", rating: 4.6 },
  { id: "3", name: "Farm Fresh Feeds", rating: 4.9 },
];

const mockOrders = [
  { id: "ZOO-001", date: "2024-01-15", supplier: "Green Feed Co.", items: "Hay, Fish Meal", total: "₹2,45,000", status: "delivered" },
  { id: "ZOO-002", date: "2024-01-10", supplier: "Animal Nutrition Ltd.", items: "Soybean Meal", total: "₹1,80,000", status: "pending" },
  { id: "ZOO-003", date: "2024-01-08", supplier: "Farm Fresh Feeds", items: "Green Forages", total: "₹95,000", status: "approved" },
];

export default function StaffDashboard() {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedFeed, setSelectedFeed] = useState("");
  const [quantity, setQuantity] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "create" | "orders">("dashboard");

  const pricePerTonne = {
    "Hay": 8500,
    "Silage": 6200,
    "Green Forages": 4800,
    "Straw": 3200,
    "Pasture": 5500,
    "Fish Meal": 45000,
    "Meat and Bone Meal": 38000,
    "Groundnut Cake": 28000,
    "Soybean Meal": 32000,
  };

  const calculateTotal = () => {
    if (selectedFeed && quantity) {
      return (pricePerTonne[selectedFeed as keyof typeof pricePerTonne] * parseFloat(quantity)).toLocaleString('en-IN');
    }
    return "0";
  };

  if (activeView === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Purchase Order</h1>
            <p className="text-muted-foreground">Submit a new order for animal feeds</p>
          </div>
          <Button variant="outline" onClick={() => setActiveView("dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-6 shadow-medium bg-gradient-subtle">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplier">Select Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{supplier.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">★ {supplier.rating}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feed-type">Feed Type</Label>
                <Select value={selectedFeed} onValueChange={setSelectedFeed}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedTypes.map((feed) => (
                      <SelectItem key={feed} value={feed}>
                        <div className="flex items-center justify-between w-full">
                          <span>{feed}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ₹{pricePerTonne[feed as keyof typeof pricePerTonne]?.toLocaleString('en-IN')}/tonne
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (tonnes)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                  <span className="text-lg font-semibold text-primary">
                    ₹{calculateTotal()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Purchase</Label>
              <Input
                id="reason"
                placeholder="Enter reason for this purchase order"
                className="bg-card"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="zoo" size="lg" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Submit Order
              </Button>
              <Button variant="outline" onClick={() => setActiveView("dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (activeView === "orders") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">Track your purchase orders</p>
          </div>
          <Button variant="outline" onClick={() => setActiveView("dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-medium">
          <Table>
            <TableHeader className="bg-table-header">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-table-row-hover">
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell className="font-semibold">{order.total}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                      order.status === "approved" ? "secondary" : "destructive"
                    }>
                      {order.status}
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-success text-success-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Delivered</p>
              <p className="text-2xl font-bold">18</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning text-warning-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold">6</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-accent text-accent-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">This Month</p>
              <p className="text-2xl font-bold">₹8.2L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium bg-gradient-subtle">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              variant="zoo" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setActiveView("create")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create New Order
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveView("orders")}
            >
              <Package className="h-4 w-4 mr-2" />
              View My Orders
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {mockOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.supplier}</p>
                </div>
                <Badge variant={
                  order.status === "delivered" ? "default" :
                  order.status === "approved" ? "secondary" : "destructive"
                }>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}