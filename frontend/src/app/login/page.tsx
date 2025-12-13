// Role: UI Developer
// Developer: Mohamed Emad
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { saveTokenToLocalStorage } from '@/lib/token-client';
import { createToken } from '@/app/api/auth/actions';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(formData);
      
      // Get userId from response (it might be 'id' or 'userId')
      const userId = response.userId || response.id;
      
      // Check if userId exists in response
      if (!userId) {
        console.error('Login response:', response);
        throw new Error('Login response missing userId');
      }
      
      // Ensure userId is a string
      const userIdString = String(userId);
      
      // Generate token and save to cookie via Server Action
      const tokenResult = await createToken(userIdString);

      if (!tokenResult.success || !tokenResult.token) {
        throw new Error(tokenResult.error || 'Failed to create session');
      }
      
      // Also save token to localStorage for client-side access
      saveTokenToLocalStorage(tokenResult.token);
      
      // Store email in localStorage for admin check
      const userEmail = response.email || formData.email;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', userEmail);
      }

      // Show success message
      toast.success('Login successful!');
      
      // Check if admin and redirect accordingly
      if (userEmail === 'admin@admin.com') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

