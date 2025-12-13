// Role: UI Developer
// Developer: Mohamed Emad
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Borrowing } from '@/lib/api';
import { getUserIdFromLocalStorage } from '@/lib/token-client';
import { BookOpen, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const id = getUserIdFromLocalStorage();
      if (!id) {
        router.push('/login');
        return;
      }
      setUserId(id);
      loadBorrowings(id);
    };
    checkAuth();
  }, [router]);

  const loadBorrowings = async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await api.getUserBorrowings(id);
      setBorrowings(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowingId: string) => {
    if (!userId) return;

    try {
      await api.returnBook(borrowingId, userId);
      toast.success('Book returned successfully!');
      loadBorrowings(userId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to return book');
    }
  };

  const activeBorrowings = borrowings.filter((b) => b.status === 'Active');
  const returnedBorrowings = borrowings.filter((b) => b.status === 'Returned');
  const overdueBorrowings = borrowings.filter((b) => b.status === 'Overdue');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (!userId && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your borrowed books and reading history
            </p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto p-4 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card className="border-2 hover:border-blue-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      Active Borrowings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">{activeBorrowings.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-red-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      Overdue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-red-600">{overdueBorrowings.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-green-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      Returned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">{returnedBorrowings.length}</p>
                  </CardContent>
                </Card>
              </div>

            {/* Active Borrowings */}
            {activeBorrowings.length > 0 && (
              <section className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  Active Borrowings
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {activeBorrowings.map((borrowing) => (
                    <Card key={borrowing.id} className="border-2 hover:shadow-xl transition-all hover:-translate-y-1 group">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {borrowing.book?.title || 'Unknown Book'}
                        </CardTitle>
                        <CardDescription className="text-base">
                          by {borrowing.book?.author || 'Unknown Author'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Borrowed: <span className="font-medium">{formatDate(borrowing.borrowedDate)}</span>
                          </span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Due: <span className="font-medium">{formatDate(borrowing.dueDate)}</span>
                          </span>
                        </div>
                        {isOverdue(borrowing.dueDate) && (
                          <div className="p-3 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20 font-medium">
                            ⚠️ Overdue
                          </div>
                        )}
                        <Button
                          onClick={() => handleReturn(borrowing.id)}
                          className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          Return Book
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Overdue Borrowings */}
            {overdueBorrowings.length > 0 && (
              <section className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-red-600">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  Overdue Books
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {overdueBorrowings.map((borrowing) => (
                    <Card key={borrowing.id} className="border-2 border-red-500/50 bg-red-50/50 hover:shadow-xl transition-all hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl text-red-900">
                          {borrowing.book?.title || 'Unknown Book'}
                        </CardTitle>
                        <CardDescription className="text-base">
                          by {borrowing.book?.author || 'Unknown Author'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due: <span className="font-medium text-red-600">{formatDate(borrowing.dueDate)}</span>
                        </div>
                        <div className="p-3 bg-red-500/20 text-red-800 rounded-lg border border-red-500/30 font-medium">
                          ⚠️ This book is overdue. Please return it as soon as possible.
                        </div>
                        <Button
                          onClick={() => handleReturn(borrowing.id)}
                          className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-all bg-red-600 hover:bg-red-700"
                        >
                          Return Book
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Returned Borrowings */}
            {returnedBorrowings.length > 0 && (
              <section className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  Returned Books
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {returnedBorrowings.map((borrowing) => (
                    <Card key={borrowing.id} className="border-2 opacity-75 hover:opacity-100 transition-opacity">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl">{borrowing.book?.title || 'Unknown Book'}</CardTitle>
                        <CardDescription className="text-base">
                          by {borrowing.book?.author || 'Unknown Author'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Returned: <span className="font-medium">{borrowing.returnedDate ? formatDate(borrowing.returnedDate) : 'N/A'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {borrowings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't borrowed any books yet.</p>
                <Button className="mt-4" onClick={() => router.push('/books')}>
                  Browse Books
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}
