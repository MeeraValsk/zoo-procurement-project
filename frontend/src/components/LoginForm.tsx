import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section - Above the Card */}
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>Zoo Procurement</h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}>Professional procurement management system</p>
        </div>

        {/* Login Card */}
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>Welcome Back</CardTitle>
            <CardDescription className="text-gray-600 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-700" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-base"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-700" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-base"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors text-base"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;