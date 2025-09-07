import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react";

const pendingInvoices = [
  { 
    id: "INV-001", 
    orderId: "ZOO-003",
    date: "2024-01-16", 
    supplier: "Green Feed Co.", 
    amount: "₹2,45,000", 
    status: "pending",
    items: "Hay (50 tonnes), Fish Meal (10 tonnes)",
    priority: "high"
  },
  { 
    id: "INV-002", 
    orderId: "ZOO-004",
    date: "2024-01-15", 
    supplier: "Animal Nutrition Ltd.", 
    amount: "₹1,80,000", 
    status: "under_review",
    items: "Soybean Meal (25 tonnes)",
    priority: "medium"
  },
  { 
    id: "INV-003", 
    orderId: "ZOO-005",
    date: "2024-01-14", 
    supplier: "Farm Fresh Feeds", 
    amount: "₹95,000", 
    status: "discrepancy",
    items: "Green Forages (100 tonnes)",
    priority: "high"
  },
];

const verifiedInvoices = [
  { 
    id: "INV-004", 
    orderId: "ZOO-001",
    date: "2024-01-12", 
    supplier: "Green Feed Co.", 
    amount: "₹3,20,000", 
    status: "verified",
    processedDate: "2024-01-13"
  },
  { 
    id: "INV-005", 
    orderId: "ZOO-002",
    date: "2024-01-10", 
    supplier: "Farm Fresh Feeds", 
    amount: "₹1,50,000", 
    status: "paid",
    processedDate: "2024-01-11"
  },
];

export default function InvoiceDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-warning text-warning-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Pending Review</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-destructive text-destructive-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Discrepancies</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-success text-success-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Verified</p>
              <p className="text-2xl font-bold">52</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-medium">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Value</p>
              <p className="text-2xl font-bold">₹24.6L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Invoices */}
      <Card className="shadow-medium">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pending Invoice Verification</h3>
              <p className="text-sm text-muted-foreground">Invoices requiring your attention</p>
            </div>
            <Button variant="zoo">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-table-row-hover">
                <TableCell className="font-mono">{invoice.id}</TableCell>
                <TableCell className="font-mono">{invoice.orderId}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell className="font-medium">{invoice.supplier}</TableCell>
                <TableCell className="max-w-xs truncate">{invoice.items}</TableCell>
                <TableCell className="font-semibold">{invoice.amount}</TableCell>
                <TableCell>
                  <Badge variant={invoice.priority === "high" ? "destructive" : "secondary"}>
                    {invoice.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    invoice.status === "discrepancy" ? "destructive" :
                    invoice.status === "under_review" ? "secondary" : "default"
                  }>
                    {invoice.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                    {invoice.status === "pending" && (
                      <>
                        <Button variant="success" size="sm">Approve</Button>
                        <Button variant="destructive" size="sm">Reject</Button>
                      </>
                    )}
                    {invoice.status === "discrepancy" && (
                      <Button variant="warning" size="sm">Resolve</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Processed Invoices */}
      <Card className="shadow-medium">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Recently Processed Invoices</h3>
          <p className="text-sm text-muted-foreground">Latest verified and paid invoices</p>
        </div>
        
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Processed Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifiedInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-table-row-hover">
                <TableCell className="font-mono">{invoice.id}</TableCell>
                <TableCell className="font-mono">{invoice.orderId}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell className="font-medium">{invoice.supplier}</TableCell>
                <TableCell className="font-semibold">{invoice.amount}</TableCell>
                <TableCell>{invoice.processedDate}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium bg-gradient-subtle">
          <h3 className="text-lg font-semibold mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">3 invoices verified</p>
                <p className="text-xs text-muted-foreground">Total: ₹4,20,000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-destructive rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">1 discrepancy found</p>
                <p className="text-xs text-muted-foreground">INV-003 - Amount mismatch</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="h-2 w-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">5 invoices received</p>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-4">Verification Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Processing Time</span>
              <span className="font-semibold">2.3 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accuracy Rate</span>
              <span className="font-semibold text-success">97.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Invoices This Week</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Value Processed</span>
              <span className="font-semibold text-primary">₹15.2L</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}