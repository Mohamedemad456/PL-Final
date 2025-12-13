// Role: Application Setup & Configuration
// Developer: Mohamed Emad
namespace BackEnd

open System
open System.Text.Json
open System.Text.Json.Serialization
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Configuration
open Microsoft.EntityFrameworkCore
open BackEnd.Data
open BackEnd.Handlers
open Microsoft.AspNetCore.Http
open Microsoft.OpenApi.Models

module Program =

    let builder = WebApplication.CreateBuilder()

    // Configure JSON serialization to handle reference cycles
    builder.Services.ConfigureHttpJsonOptions(fun options ->
        options.SerializerOptions.ReferenceHandler <- ReferenceHandler.IgnoreCycles
        options.SerializerOptions.WriteIndented <- true
    ) |> ignore

    // Add services
    builder.Services.AddEndpointsApiExplorer() |> ignore
    builder.Services.AddSwaggerGen(fun options ->
        options.SwaggerDoc("v1", OpenApiInfo(
            Title = "Library Management API",
            Version = "v1",
            Description = "A RESTful API for managing library resources, users, and authentication",
            Contact = OpenApiContact(
                Name = "API Support",
                Email = "support@example.com"
            )
        ))
    ) |> ignore
    builder.Services.AddDbContext<AppDbContext>(fun options ->
        let connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        options.UseSqlServer(connectionString) |> ignore
    ) |> ignore

    builder.Services.AddCors(fun options ->
        options.AddDefaultPolicy(fun policy ->
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader() |> ignore
        ) |> ignore
    ) |> ignore

    let app = builder.Build()

    // Configure the HTTP request pipeline
    if app.Environment.IsDevelopment() then
        app.UseSwagger() |> ignore
        app.UseSwaggerUI() |> ignore

    app.UseCors() |> ignore
    app.UseHttpsRedirection() |> ignore

    // User endpoints
    app.MapGet("/api/users", 
        System.Func<AppDbContext, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db -> Handlers.getUsers db))
        .WithName("GetAllUsers")
        .WithTags("Users")
        .WithSummary("Get all users")
        .WithDescription("Retrieves a list of all users in the system") |> ignore
    
    app.MapGet("/api/users/{id:guid}", 
        System.Func<AppDbContext, System.Guid, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db id -> Handlers.getUserById db id))
        .WithName("GetUserById")
        .WithTags("Users")
        .WithSummary("Get user by ID")
        .WithDescription("Retrieves a specific user by their unique identifier") |> ignore
    
    app.MapPost("/api/users", 
        System.Func<AppDbContext, BackEnd.Data.Models.User, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db user -> Handlers.createUser db user))
        .WithName("CreateUser")
        .WithTags("Users")
        .WithSummary("Create a new user")
        .WithDescription("Creates a new user in the system") |> ignore

    // Authentication endpoints
    app.MapPost("/api/auth/register", 
        System.Func<AppDbContext, BackEnd.Data.Models.RegisterRequest, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db request -> AuthHandler.register db request.Email request.Username request.Password))
        .WithName("RegisterUser")
        .WithTags("Authentication")
        .WithSummary("Register a new user")
        .WithDescription("Registers a new user account with email, username, and password. The password will be hashed before storage.")
        .Accepts<BackEnd.Data.Models.RegisterRequest>("application/json")
        .Produces<{| id: System.Guid; email: string; name: string; message: string |}>(201)
        .Produces(400)
        .Produces(500) |> ignore
    
    app.MapPost("/api/auth/login", 
        System.Func<AppDbContext, BackEnd.Data.Models.LoginRequest, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db request -> AuthHandler.login db request.Email request.Password))
        .WithName("LoginUser")
        .WithTags("Authentication")
        .WithSummary("Login user")
        .WithDescription("Authenticates a user with email and password. Returns user information on successful login.")
        .Accepts<BackEnd.Data.Models.LoginRequest>("application/json")
        .Produces<{| id: System.Guid; email: string; name: string; message: string |}>(200)
        .Produces(400)
        .Produces(401) |> ignore

    // Book endpoints
    app.MapGet("/api/books", 
        System.Func<AppDbContext, Microsoft.AspNetCore.Http.HttpContext, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db ctx -> 
                let searchTerm = match ctx.Request.Query.TryGetValue("search") with
                                 | true, values when values.Count > 0 -> Some (values.[0].ToString())
                                 | _ -> None
                BookHandler.getBooks db searchTerm))
        .WithName("GetBooks")
        .WithTags("Books")
        .WithSummary("Get all books")
        .WithDescription("Retrieves a list of all books. Optionally search by title, author, or ISBN using the 'search' query parameter.") |> ignore
    
    app.MapGet("/api/books/{id:guid}", 
        System.Func<AppDbContext, System.Guid, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db id -> BookHandler.getBookById db id))
        .WithName("GetBookById")
        .WithTags("Books")
        .WithSummary("Get book by ID")
        .WithDescription("Retrieves a specific book by its unique identifier") |> ignore
    
    app.MapPost("/api/books", 
        System.Func<AppDbContext, BackEnd.Data.Models.Book, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db book -> BookHandler.createBook db book))
        .WithName("CreateBook")
        .WithTags("Books")
        .WithSummary("Create a new book")
        .WithDescription("Creates a new book in the library") |> ignore
    
    app.MapPut("/api/books/{id:guid}", 
        System.Func<AppDbContext, System.Guid, BackEnd.Data.Models.Book, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db id book -> BookHandler.updateBook db id book))
        .WithName("UpdateBook")
        .WithTags("Books")
        .WithSummary("Update a book")
        .WithDescription("Updates an existing book") |> ignore
    
    app.MapDelete("/api/books/{id:guid}", 
        System.Func<AppDbContext, System.Guid, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db id -> BookHandler.deleteBook db id))
        .WithName("DeleteBook")
        .WithTags("Books")
        .WithSummary("Delete a book")
        .WithDescription("Deletes a book from the library") |> ignore

    // Borrowing endpoints
    app.MapGet("/api/borrowings", 
        System.Func<AppDbContext, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db -> BookHandler.getAllBorrowings db))
        .WithName("GetAllBorrowings")
        .WithTags("Borrowings")
        .WithSummary("Get all borrowings")
        .WithDescription("Retrieves all borrowing records, including active, returned, and overdue books") |> ignore


    app.MapPost("/api/books/{bookId:guid}/borrow", 
        System.Func<AppDbContext, System.Guid, BackEnd.Data.Models.BorrowRequest, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db bookId request -> BookHandler.borrowBook db bookId request.UserId))
        .WithName("BorrowBook")
        .WithTags("Borrowings")
        .WithSummary("Borrow a book")
        .WithDescription("Borrows a book for a user. The book must be available.") |> ignore
    
    app.MapPost("/api/borrowings/{borrowingId:guid}/return", 
        System.Func<AppDbContext, System.Guid, BackEnd.Data.Models.ReturnRequest, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db borrowingId request -> BookHandler.returnBook db borrowingId request.UserId))
        .WithName("ReturnBook")
        .WithTags("Borrowings")
        .WithSummary("Return a borrowed book")
        .WithDescription("Returns a borrowed book and makes it available again") |> ignore
    
    app.MapGet("/api/users/{userId:guid}/borrowings", 
        System.Func<AppDbContext, System.Guid, System.Threading.Tasks.Task<Microsoft.AspNetCore.Http.IResult>>(
            fun db userId -> BookHandler.getUserBorrowings db userId))
        .WithName("GetUserBorrowings")
        .WithTags("Borrowings")
        .WithSummary("Get user's borrowings")
        .WithDescription("Retrieves all borrowing records for a specific user, including active, returned, and overdue books") |> ignore

    // Health check endpoint
    app.MapGet("/health", 
        System.Func<Microsoft.AspNetCore.Http.IResult>(
            fun () -> Microsoft.AspNetCore.Http.Results.Ok({| status = "healthy" |}) :> Microsoft.AspNetCore.Http.IResult))
        .WithName("HealthCheck")
        .WithTags("Health")
        .WithSummary("Health check")
        .WithDescription("Returns the health status of the API") |> ignore

    app.Run()
