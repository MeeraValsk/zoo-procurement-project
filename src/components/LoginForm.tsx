import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/supabase";
import { Building2, Users, FileText, Settings } from "lucide-react";

const roleIcons = {
  staff: Building2,
  supplier: Users,
  invoice_team: FileText,
  admin: Settings,
};

const roleDescriptions = {
  staff: "Place orders for animal feeds from registered suppliers",
  supplier: "Receive and fulfill orders from zoo staff",
  invoice_team: "Verify invoices and process payments",
  admin: "Manage the entire procurement system",
};

export default function LoginForm() {
  const { signIn, signUp, loading } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "staff" as UserRole,
    organization: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          role: formData.role,
          organization: formData.organization || undefined,
          phone: formData.phone || undefined,
        });
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Zoo Procurement System
          </h1>
          <p className="text-muted-foreground">
            Professional animal feed procurement management
          </p>
        </div>

        <Card className="p-6 shadow-strong">
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => updateFormData("full_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleDescriptions).map(([role, description]) => {
                        const Icon = roleIcons[role as UserRole];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium capitalize">
                                  {role === "invoice_team" ? "Invoice Team" : role}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    placeholder="Zoo name or company"
                    value={formData.organization}
                    onChange={(e) => updateFormData("organization", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="Contact number"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                  />
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                variant="zoo" 
                size="lg" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>
          </Tabs>

          {/* Demo accounts info */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Demo Accounts:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📊 <strong>Staff:</strong> staff@zoo.com / password123</p>
              <p>🏢 <strong>Supplier:</strong> supplier@feeds.com / password123</p>
              <p>📄 <strong>Invoice Team:</strong> invoice@zoo.com / password123</p>
              <p>⚙️ <strong>Admin:</strong> admin@zoo.com / password123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}