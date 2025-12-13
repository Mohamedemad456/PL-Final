// Role: API Client & Integration
// Developer: Mohamed Emad
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Borrowing {
  id: string;
  userId: string;
  bookId: string;
  borrowedDate: string;
  returnedDate?: string;
  dueDate: string;
  status: 'Active' | 'Returned' | 'Overdue';
  book?: Book;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId?: string;
  id?: string;
  email?: string;
  name?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.detail || errorText;
          } catch {
            // If not JSON, use the text as-is
            errorMessage = errorText;
          }
        }
      } catch {
        // If reading response fails, use default message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async register(data: RegisterRequest): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Books
  async getBooks(search?: string): Promise<Book[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Book[]>(`/api/books${query}`);
  }

  async getBookById(id: string): Promise<Book> {
    return this.request<Book>(`/api/books/${id}`);
  }

  async createBook(book: Partial<Book>): Promise<Book> {
    return this.request<Book>('/api/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    return this.request<Book>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  async deleteBook(id: string): Promise<void> {
    return this.request<void>(`/api/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Borrowings
  async borrowBook(bookId: string, userId: string): Promise<Borrowing> {
    return this.request<Borrowing>(`/api/books/${bookId}/borrow`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async returnBook(borrowingId: string, userId: string): Promise<Borrowing> {
    return this.request<Borrowing>(`/api/borrowings/${borrowingId}/return`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getUserBorrowings(userId: string): Promise<Borrowing[]> {
    return this.request<Borrowing[]>(`/api/users/${userId}/borrowings`);
  }

  async getAllBorrowings(): Promise<Borrowing[]> {
    return this.request<Borrowing[]>('/api/borrowings');
  }

  // Admin endpoints
  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }
}

export const api = new ApiClient();

