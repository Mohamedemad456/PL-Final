# Library Management System - Backend API

A RESTful API for managing library resources, users, and book borrowings built with F# and ASP.NET Core.

## Quick Start

### Prerequisites

- .NET 8.0 SDK
- SQL Server (or SQL Server Express)
- Visual Studio 2022 or VS Code with Ionide extension

### Setup

1. **Configure Database Connection**
   ```json
   // appsettings.json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=LibrarySystemDB;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

2. **Run Database Migrations**
   ```bash
   cd BackEnd.Data
   dotnet ef database update
   ```

3. **Run the API**
   ```bash
   cd BackEnd
   dotnet run
   ```

4. **Access Swagger UI**
   - Navigate to `http://localhost:5000/swagger`

## Project Structure

```
BackEnd/
├── Handlers/           # Business logic handlers
│   ├── AuthHandler.fs # Authentication (register/login)
│   ├── BookHandler.fs # Books & borrowings management
│   └── Handlers.fs    # User management
├── Program.fs        # API endpoints & configuration
└── BackEnd.fsproj   # Project file

BackEnd.Data/
├── Models/           # Entity models (C#)
├── AppDbContext.cs  # EF Core context
└── Migrations/      # Database migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user

### Books
- `GET /api/books?search={term}` - List books (optional search)
- `GET /api/books/{id}` - Get book details
- `POST /api/books` - Create book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Borrowings
- `GET /api/borrowings` - Get all borrowings
- `POST /api/books/{bookId}/borrow` - Borrow a book
- `POST /api/borrowings/{borrowingId}/return` - Return a book
- `GET /api/users/{userId}/borrowings` - Get user's borrowings

### Health
- `GET /health` - Health check

## Technology Stack

- **Language**: F# (Functional Programming)
- **Framework**: ASP.NET Core 8.0 Minimal APIs
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Authentication**: JWT tokens
- **Documentation**: Swagger/OpenAPI

## Key Features

- ✅ Functional programming with F# Result types
- ✅ Async/await for all database operations
- ✅ Input validation and error handling
- ✅ JWT-based authentication
- ✅ Book borrowing with availability checks
- ✅ Automatic overdue status updates
- ✅ Foreign key constraints with safe deletion
- ✅ CORS enabled for frontend integration
- ✅ Swagger API documentation

## Database Models

- **User**: Email, name, password hash
- **Book**: Title, author, ISBN, copies (total/available)
- **Borrowing**: Links users to books with dates and status

## Development

### Adding a New Endpoint

1. Create handler function in appropriate handler file
2. Register endpoint in `Program.fs`:
   ```fsharp
   app.MapGet("/api/endpoint", 
       System.Func<AppDbContext, Task<IResult>>(
           fun db -> HandlerFunction db))
   ```

### Database Migrations

```bash
# Create migration
dotnet ef migrations add MigrationName --project BackEnd.Data

# Apply migration
dotnet ef database update --project BackEnd.Data
```

## Configuration

- **JSON Serialization**: Configured to handle circular references
- **CORS**: Allows all origins (configure for production)
- **Connection String**: Set in `appsettings.json`

## Error Handling

- Uses F# `Result<Ok, Error>` type for functional error handling
- Returns appropriate HTTP status codes (200, 201, 400, 404, 500)
- Detailed error messages in responses

## Security

- Password hashing with BCrypt
- JWT token authentication
- Input validation on all endpoints
- SQL injection prevention via EF Core
- Foreign key constraints prevent orphaned records

## Testing

Use Swagger UI at `/swagger` for interactive API testing.

## Frontend Integration

The API is designed to work with the Next.js frontend. Ensure CORS is properly configured for your frontend URL in production.

## Documentation

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

**Developer**: Mohamed Emad  
**Last Updated**: December 2024

