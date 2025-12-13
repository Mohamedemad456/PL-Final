// Role: UI Developer
// Developer: Mohamed Emad
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Book } from '@/lib/api';
import { Search, BookOpen, User, Calendar } from 'lucide-react';
import { getUserIdFromLocalStorage } from '@/lib/token-client';
import { toast } from 'sonner';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = () => {
      const id = getUserIdFromLocalStorage();
      setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async (search?: string) => {
    try {
      setLoading(true);
      const data = await api.getBooks(search);
      setBooks(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks(searchTerm || undefined);
  };

  const handleBorrow = async (bookId: string) => {
    if (!userId) {
      toast.error('Please login to borrow books');
      return;
    }

    try {
      await api.borrowBook(bookId, userId);
      toast.success('Book borrowed successfully!');
      loadBooks(searchTerm || undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to borrow book');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Browse Books
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover our extensive collection of books
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-12 text-base shadow-md border-2 focus:border-primary transition-colors"
              />
              <Button type="submit" size="lg" className="h-12 px-8 shadow-lg hover:shadow-xl transition-all">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {error && (
            <div className="max-w-2xl mx-auto p-4 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading books...
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">No books found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{book.author}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                    {book.isbn && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                        ISBN: {book.isbn}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                      <span className="flex items-center gap-2 font-medium">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {book.availableCopies} / {book.totalCopies} available
                      </span>
                    </div>
                    <Button
                      className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleBorrow(book.id)}
                      disabled={book.availableCopies === 0 || !userId}
                    >
                      {book.availableCopies === 0
                        ? 'Not Available'
                        : userId
                        ? 'Borrow Book'
                        : 'Login to Borrow'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

