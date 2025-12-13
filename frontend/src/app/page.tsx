// Role: UI Developer
// Developer: Mohamed Emad
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, BookCheck, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Modern Library Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Our Library
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover, borrow, and manage books with our modern library management system.
            Explore our vast collection and start your reading journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/books">
              <Button size="lg" className="text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all">
                <Search className="h-5 w-5 mr-2" />
                Browse Books
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto border-2 hover:bg-primary hover:text-primary-foreground transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group text-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Search & Discover</h3>
            <p className="text-muted-foreground leading-relaxed">
              Easily search through our extensive collection of books by title, author, or ISBN.
            </p>
          </div>
          
          <div className="group text-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookCheck className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Borrow & Return</h3>
            <p className="text-muted-foreground leading-relaxed">
              Borrow books with ease and track your reading history. Return books when you're done.
            </p>
          </div>
          
          <div className="group text-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Manage Your Account</h3>
            <p className="text-muted-foreground leading-relaxed">
              Keep track of your borrowed books, active loans, and reading history all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-2xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Start Reading?</h2>
          <p className="text-lg text-muted-foreground">
            Join our library community today and get access to thousands of books.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all">
              Create Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
