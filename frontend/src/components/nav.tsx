// Role: UI Developer
// Developer: Mohamed Emad
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { getUserIdFromLocalStorage, removeTokenFromLocalStorage } from '@/lib/token-client';
import { deleteToken } from '@/app/api/auth/actions';
import { Shield } from 'lucide-react';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userId = getUserIdFromLocalStorage();
      setIsAuthenticated(!!userId);
      
      // Check if user is admin
      if (typeof window !== 'undefined') {
        const userEmail = localStorage.getItem('userEmail');
        setIsAdmin(userEmail === 'admin@admin.com');
      }
    };
    checkAuth();
  }, [pathname]); // Re-check on route change

  const handleLogout = async () => {
    // Remove token from localStorage
    removeTokenFromLocalStorage();
    
    // Remove email from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
    }
    
    // Remove token from cookie via Server Action
    await deleteToken();
    
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/books', label: 'Books' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Library System
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all relative py-2 ${
                  pathname === link.href 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-md hover:shadow-lg transition-all">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

