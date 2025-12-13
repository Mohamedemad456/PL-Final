# Library Management System - Architecture Documentation

## Overview

This is a full-stack Library Management System built with:
- **Backend**: F# with ASP.NET Core Minimal APIs
- **Frontend**: Next.js 14 with TypeScript and React
- **Database**: SQL Server with Entity Framework Core
- **Architecture Pattern**: Layered Architecture with Functional Programming principles

## Project Structure

```
PL project/
├── BackEnd/                    # F# Backend API
│   ├── Handlers/               # Request handlers (business logic)
│   │   ├── AuthHandler.fs     # Authentication handlers
│   │   ├── BookHandler.fs     # Book and borrowing handlers
│   │   └── Handlers.fs        # User handlers
│   ├── Program.fs             # Application entry point & routing
│   └── BackEnd.fsproj         # Project file
│
├── BackEnd.Data/               # Data Access Layer (C#)
│   ├── Models/                 # Entity models
│   │   ├── User.cs
│   │   ├── Book.cs
│   │   ├── Borrowing.cs
│   │   ├── RegisterRequest.cs
│   │   ├── LoginRequest.cs
│   │   ├── BorrowRequest.cs
│   │   └── ReturnRequest.cs
│   ├── AppDbContext.cs         # EF Core DbContext
│   └── Migrations/             # Database migrations
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── admin/          # Admin dashboard
│   │   │   ├── books/          # Books listing page
│   │   │   ├── profile/        # User profile page
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── components/         # React components
│   │   │   ├── ui/             # UI components (shadcn/ui)
│   │   │   └── nav.tsx         # Navigation component
│   │   └── lib/                # Utilities and API client
│   │       ├── api.ts          # API client
│   │       ├── auth.ts         # Authentication utilities
│   │       └── token-client.ts # Token management
│
└── BackEnd.Tests/              # Test project
```

## Backend Architecture

### Technology Stack

- **Language**: F# (Functional Programming)
- **Framework**: ASP.NET Core 8.0
- **API Style**: Minimal APIs (no controllers)
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Authentication**: JWT tokens (stored client-side)
- **Documentation**: Swagger/OpenAPI

### Architecture Layers

#### 1. Data Layer (`BackEnd.Data`)

**Purpose**: Data access and entity definitions

- **Models**: C# classes representing database entities
  - `User`: User accounts with email, name, password hash
  - `Book`: Library books with title, author, ISBN, copies
  - `Borrowing`: Borrowing records linking users and books
  - Request DTOs: `RegisterRequest`, `LoginRequest`, `BorrowRequest`, `ReturnRequest`

- **AppDbContext**: EF Core DbContext
  - Configures entity relationships
  - Sets up foreign key constraints with `DeleteBehavior.Restrict`
  - Manages database migrations

**Key Features**:
- Navigation properties with `[JsonIgnore]` to prevent circular references
- Data annotations for validation
- Unique constraints (e.g., email uniqueness)

#### 2. Handler Layer (`BackEnd/Handlers`)

**Purpose**: Business logic and request processing

**Module Structure**:

- **`Handlers.fs`**: User management
  - `getUsers`: Retrieve all users
  - `getUserById`: Get user by ID
  - `createUser`: Create new user with validation
  - Validation functions using F# Result type

- **`AuthHandler.fs`**: Authentication
  - `register`: User registration with password hashing
  - `login`: User authentication with JWT token generation
  - Password hashing using BCrypt

- **`BookHandler.fs`**: Books and borrowings
  - **Book Operations**:
    - `getBooks`: List books with optional search
    - `getBookById`: Get book details
    - `createBook`: Create new book with validation
    - `updateBook`: Update book information
    - `deleteBook`: Delete book (checks for active borrowings)
  
  - **Borrowing Operations**:
    - `borrowBook`: Borrow a book (validates availability)
    - `returnBook`: Return a borrowed book
    - `getUserBorrowings`: Get user's borrowing history
    - `getAllBorrowings`: Get all borrowings (admin)
    - `updateOverdueStatusAsync`: Background task to mark overdue books

**Design Patterns**:
- **Functional Programming**: Uses F# Result type for error handling
- **Task-based Async**: All database operations are async
- **Validation**: Input validation before database operations
- **Error Handling**: Comprehensive exception handling with meaningful messages

#### 3. API Layer (`Program.fs`)

**Purpose**: HTTP endpoint definitions and middleware configuration

**Configuration**:
- JSON serialization with cycle handling (`ReferenceHandler.IgnoreCycles`)
- CORS enabled for all origins (development)
- Swagger/OpenAPI documentation
- SQL Server connection string from configuration

**Endpoints**:

**Users**:
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user

**Authentication**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Books**:
- `GET /api/books?search={term}` - Get books (with optional search)
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

**Borrowings**:
- `GET /api/borrowings` - Get all borrowings
- `POST /api/books/{bookId}/borrow` - Borrow a book
- `POST /api/borrowings/{borrowingId}/return` - Return a book
- `GET /api/users/{userId}/borrowings` - Get user's borrowings

**Health**:
- `GET /health` - Health check endpoint

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React with shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API with custom wrapper
- **Notifications**: Sonner (toast notifications)

### Project Structure

#### Pages (`src/app/`)

- **`page.tsx`**: Home page
- **`login/page.tsx`**: User login
- **`register/page.tsx`**: User registration
- **`books/page.tsx`**: Browse and borrow books
- **`profile/page.tsx`**: User profile and borrowing history
- **`admin/page.tsx`**: Admin dashboard (books, users, borrowings management)

#### Components (`src/components/`)

- **`nav.tsx`**: Navigation bar with authentication state
- **`ui/`**: Reusable UI components (Button, Card, Dialog, Input, etc.)

#### Utilities (`src/lib/`)

- **`api.ts`**: API client class with typed methods
  - Handles HTTP requests
  - Manages response parsing (handles 204 No Content)
  - Error handling and message extraction

- **`auth.ts`**: Authentication utilities
- **`token-client.ts`**: JWT token management (localStorage)
- **`token.ts`**: Token encoding/decoding utilities

### Data Flow

1. **User Action** → React component
2. **API Call** → `api.ts` client method
3. **HTTP Request** → Backend endpoint
4. **Handler Processing** → Business logic execution
5. **Database Query** → EF Core operations
6. **Response** → JSON serialization
7. **State Update** → React component re-render

## Database Schema

### Tables

**Users**
- `Id` (Guid, PK)
- `Name` (string, required, max 100)
- `Email` (string, required, max 255, unique)
- `PasswordHash` (string, required)
- `CreatedAt` (DateTime)

**Books**
- `Id` (Guid, PK)
- `Title` (string, required, max 200)
- `Author` (string, required, max 100)
- `ISBN` (string, nullable, max 50)
- `Description` (string, nullable, max 1000)
- `TotalCopies` (int, required)
- `AvailableCopies` (int, required)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime, nullable)

**Borrowings**
- `Id` (Guid, PK)
- `UserId` (Guid, FK → Users)
- `BookId` (Guid, FK → Books)
- `BorrowedDate` (DateTime, required)
- `ReturnedDate` (DateTime, nullable)
- `DueDate` (DateTime, required)
- `Status` (string, required, max 50) - "Active", "Returned", "Overdue"

### Relationships

- **User** → **Borrowings**: One-to-Many (User can have multiple borrowings)
- **Book** → **Borrowings**: One-to-Many (Book can be borrowed multiple times)
- **Foreign Key Constraints**: `DeleteBehavior.Restrict` (prevents deletion if related records exist)

## Security Features

### Authentication

- **JWT Tokens**: Stored in browser localStorage
- **Password Hashing**: BCrypt with salt
- **Token Expiration**: Configurable expiration time

### Data Protection

- **Input Validation**: Both client and server-side
- **SQL Injection Prevention**: EF Core parameterized queries
- **CORS**: Configured for cross-origin requests
- **HTTPS**: Enabled in production

### Business Rules

- **Book Deletion**: Prevents deletion if active borrowings exist
- **Borrowing Validation**: 
  - Checks book availability
  - Prevents duplicate active borrowings
  - Validates user and book existence
- **Email Uniqueness**: Enforced at database level

## Error Handling

### Backend

- **Result Type**: F# Result<Ok, Error> for functional error handling
- **Exception Handling**: Try-catch blocks with detailed error messages
- **HTTP Status Codes**: 
  - 200: Success
  - 201: Created
  - 204: No Content (DELETE)
  - 400: Bad Request (validation errors)
  - 401: Unauthorized
  - 404: Not Found
  - 500: Internal Server Error

### Frontend

- **Error Messages**: Extracted from API responses
- **Toast Notifications**: User-friendly error display
- **Graceful Degradation**: Handles network errors and empty responses

## Development Workflow

### Backend

1. **Database Changes**: Create migration → Apply migration
2. **New Endpoint**: Add handler function → Register in `Program.fs`
3. **Testing**: Use Swagger UI at `/swagger`

### Frontend

1. **New Page**: Create in `src/app/`
2. **API Integration**: Use `api.ts` client methods
3. **Components**: Reuse UI components from `src/components/ui/`

## Deployment Considerations

### Backend

- **Configuration**: Connection strings in `appsettings.json`
- **Environment Variables**: Use for production secrets
- **Database Migrations**: Run on deployment
- **Port Configuration**: Configurable via `launchSettings.json`

### Frontend

- **Environment Variables**: `NEXT_PUBLIC_API_URL` for API endpoint
- **Build**: `npm run build` for production
- **Static Assets**: Handled by Next.js

## Future Enhancements

- [ ] Add authentication middleware for protected endpoints
- [ ] Implement role-based access control (Admin/User)
- [ ] Add pagination for large datasets
- [ ] Implement caching for frequently accessed data
- [ ] Add unit and integration tests
- [ ] Implement real-time notifications
- [ ] Add book reservation system
- [ ] Implement fine/penalty system for overdue books
- [ ] Add email notifications
- [ ] Implement search with advanced filters

## Dependencies

### Backend

- `FSharp.Core`
- `Microsoft.AspNetCore.*`
- `Microsoft.EntityFrameworkCore.SqlServer`
- `Swashbuckle.AspNetCore`
- `BCrypt.Net-Next` (for password hashing)
- `System.IdentityModel.Tokens.Jwt` (for JWT)

### Frontend

- `next`
- `react`
- `typescript`
- `tailwindcss`
- `shadcn/ui` components
- `sonner` (toast notifications)
- `lucide-react` (icons)

---

**Last Updated**: December 2024
**Maintainer**: Mohamed Emad

