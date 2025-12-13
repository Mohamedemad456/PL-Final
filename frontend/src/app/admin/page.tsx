// Role: UI Developer
// Developer: Mohamed Emad
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, Book, User, Borrowing } from '@/lib/api';
import { 
  BookOpen, 
  Users, 
  BookCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allBorrowings, setAllBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'users' | 'borrowings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    totalCopies: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, usersData, borrowingsData] = await Promise.all([
        api.getBooks(),
        api.getAllUsers(),
        api.getAllBorrowings(),
      ]);
      setBooks(booksData);
      setUsers(usersData);
      setAllBorrowings(borrowingsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBook(bookForm);
      toast.success('Book created successfully!');
      setIsBookDialogOpen(false);
      setBookForm({ title: '', author: '', isbn: '', description: '', totalCopies: 1 });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create book');
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      await api.updateBook(editingBook.id, bookForm);
      toast.success('Book updated successfully!');
      setIsBookDialogOpen(false);
      setEditingBook(null);
      setBookForm({ title: '', author: '', isbn: '', description: '', totalCopies: 1 });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.deleteBook(id);
      toast.success('Book deleted successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete book');
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      description: book.description || '',
      totalCopies: book.totalCopies,
    });
    setIsBookDialogOpen(true);
  };

  const closeDialog = () => {
    setIsBookDialogOpen(false);
    setEditingBook(null);
    setBookForm({ title: '', author: '', isbn: '', description: '', totalCopies: 1 });
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalBooks: books.length,
    totalUsers: users.length,
    totalBorrowings: allBorrowings.length,
    availableBooks: books.reduce((sum, book) => sum + book.availableCopies, 0),
    borrowedBooks: books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Manage your library system</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="font-semibold"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'books' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('books')}
            className="font-semibold"
          >
            Books
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="font-semibold"
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'borrowings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('borrowings')}
            className="font-semibold"
          >
            Borrowings
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Total Books</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalBooks}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.availableBooks} available
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Total Users</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-2">Registered users</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Borrowed Books</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BookCheck className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.borrowedBooks}</div>
                <p className="text-xs text-muted-foreground mt-2">Currently borrowed</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Total Borrowings</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.totalBorrowings}</div>
                <p className="text-xs text-muted-foreground mt-2">All time</p>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-primary transition-colors shadow-md"
                />
              </div>
            </div>
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => closeDialog()} size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                  <DialogDescription>
                    {editingBook ? 'Update book information' : 'Add a new book to the library'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={bookForm.description}
                      onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCopies">Total Copies *</Label>
                    <Input
                      id="totalCopies"
                      type="number"
                      min="1"
                      value={bookForm.totalCopies}
                      onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingBook ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="border-2 hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-base font-medium">{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>ISBN:</strong> <span className="font-mono bg-muted/50 px-2 py-1 rounded">{book.isbn || 'N/A'}</span>
                    </p>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {book.availableCopies} / {book.totalCopies} available
                      </span>
                    </div>
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(book)}
                      className="flex-1 border-2 hover:border-primary transition-all"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id)}
                      className="flex-1 shadow-md hover:shadow-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                All Users
              </CardTitle>
              <CardDescription className="text-base">Manage library users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-4 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-2 hover:border-primary transition-all">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Borrowings Tab */}
      {activeTab === 'borrowings' && (
        <div className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BookCheck className="h-6 w-6 text-purple-500" />
                </div>
                All Borrowings
              </CardTitle>
              <CardDescription className="text-base">View and manage all book borrowings ({allBorrowings.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg text-muted-foreground">Loading borrowings...</p>
                </div>
              ) : allBorrowings.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">No borrowings found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBorrowings.map((borrowing) => {
                    const statusColors = {
                      Active: 'bg-green-500/10 text-green-700 border-green-500/20',
                      Returned: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
                      Overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
                    };
                    const statusColor = statusColors[borrowing.status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
                    
                    return (
                      <Card
                        key={borrowing.id}
                        className="border-2 hover:border-primary/50 hover:shadow-md transition-all"
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-foreground mb-1">
                                    {borrowing.book?.title || 'Unknown Book'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    by <span className="font-medium">{borrowing.book?.author || 'Unknown Author'}</span>
                                  </p>
                                  {borrowing.book?.isbn && (
                                    <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded inline-block mb-2">
                                      ISBN: {borrowing.book.isbn}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    <span className="font-medium">{borrowing.user?.name || 'Unknown User'}</span>
                                    <span className="text-muted-foreground ml-1">({borrowing.user?.email || 'N/A'})</span>
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Borrowed Date</p>
                                  <p className="text-sm font-medium">
                                    {new Date(borrowing.borrowedDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                  <p className="text-sm font-medium">
                                    {new Date(borrowing.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                {borrowing.returnedDate && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Returned Date</p>
                                    <p className="text-sm font-medium">
                                      {new Date(borrowing.returnedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                                    {borrowing.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </div>
  );
}

