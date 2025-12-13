// Role: UI Developer
// Developer: Mohamed Emad
import { BookOpen, Users, Target, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              About Our Library
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Connecting readers with knowledge, one book at a time.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              Our Mission
            </h2>
            <Card className="border-2 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our library management system is designed to make reading accessible to everyone.
                  We believe in the power of books to transform lives, inspire creativity, and foster
                  lifelong learning. Our mission is to provide a seamless, user-friendly platform that
                  connects readers with the books they love.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="group border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Extensive Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Browse through thousands of books across various genres and categories.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Easy Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your borrowed books, due dates, and reading history effortlessly.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Quick Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Find the books you're looking for quickly with our powerful search functionality.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">User-Friendly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Enjoy a modern, intuitive interface designed with readers in mind.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              Our Story
            </h2>
            <Card className="border-2 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Founded with a passion for making literature accessible, our library management system
                  has been serving readers for years. We continuously work to improve our platform,
                  adding new features and expanding our collection to better serve our community.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

