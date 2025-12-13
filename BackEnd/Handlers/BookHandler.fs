namespace BackEnd.Handlers

open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Http.HttpResults
open Microsoft.EntityFrameworkCore
open BackEnd.Data
open BackEnd.Data.Models
open System
open System.Linq
open System.Threading.Tasks
open Microsoft.FSharp.Core

namespace BackEnd.Handlers

open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Http.HttpResults
open Microsoft.EntityFrameworkCore
open BackEnd.Data
open BackEnd.Data.Models
open System
open System.Linq
open System.Threading.Tasks
open Microsoft.FSharp.Core

module BookHandler =

    let private validateBook (title: string) (author: string) (totalCopies: int) : Result<unit, string> =
        if String.IsNullOrWhiteSpace(title) then Error "Title is required"
        elif String.IsNullOrWhiteSpace(author) then Error "Author is required"
        elif totalCopies < 1 then Error "Total copies must be at least 1"
        else Ok ()

    let private findBookByIdAsync (db: AppDbContext) (bookId: Guid) : Task<Option<Book>> =
        task {
            let! book = db.Books.FirstOrDefaultAsync(fun b -> b.Id = bookId)
            return match book with
                   | null -> None
                   | _ -> Some book
        }

    let private getAllBooksAsync (db: AppDbContext) (searchTerm: string option) : Task<System.Collections.Generic.List<Book>> =
        task {
            let mutable query = db.Books.AsQueryable()
            query <- match searchTerm with
                        | Some term when not (String.IsNullOrWhiteSpace(term)) ->
                            let termLower = term.ToLower()
                            query.Where(fun b -> 
                                b.Title.ToLower().Contains(termLower) || 
                                b.Author.ToLower().Contains(termLower) ||
                                (b.ISBN <> null && b.ISBN.ToLower().Contains(termLower)))
                        | _ -> query
            let query = query.OrderBy(fun b -> b.Title)
            return! query.ToListAsync()
        }

    let private createBookInDbAsync (db: AppDbContext) (book: Book) : Task<Result<Book, string>> =
        task {
            try
                db.Books.Add(book) |> ignore
                let! _ = db.SaveChangesAsync()
                return Ok book
            with
            | :? DbUpdateException as ex ->
                return Error $"Failed to create book: {ex.Message}"
            | ex ->
                return Error $"Unexpected error: {ex.Message}"
        }        

    let private updateBookInDbAsync (db: AppDbContext) (book: Book) : Task<Result<Book, string>> =
        task {
            try
                // Check if entity is already tracked
                let entry = db.Entry(book)
                if entry.State = EntityState.Detached then
                    db.Books.Update(book) |> ignore
                // If already tracked, changes are automatically detected
                let! _ = db.SaveChangesAsync()
                return Ok book
            with
            | :? DbUpdateException as ex ->
                let innerMsg = if ex.InnerException <> null then ex.InnerException.Message else ""
                return Error $"Failed to update book: {ex.Message}. Inner: {innerMsg}"
            | ex ->
                return Error $"Unexpected error: {ex.Message}. Type: {ex.GetType().Name}"
        }

    let private deleteBookFromDbAsync (db: AppDbContext) (bookId: Guid) : Task<Result<unit, string>> =
        task {
            try
                let! bookOpt = findBookByIdAsync db bookId
                match bookOpt with
                | None -> return Error "Book not found"
                | Some book ->
                    db.Books.Remove(book) |> ignore
                    let! _ = db.SaveChangesAsync()
                    return Ok ()
            with
            | :? DbUpdateException as ex ->
                return Error $"Failed to delete book: {ex.Message}"
            | ex ->
                return Error $"Unexpected error: {ex.Message}"
        }

    let getBooks (db: AppDbContext) (searchTerm: string option) : Task<IResult> =
        task {
            let! books = getAllBooksAsync db searchTerm
            return Results.Ok(books)
        }      

    // CRUD

    let getBookById (db: AppDbContext) (bookId: Guid) : Task<IResult> =
        task {
            let! bookOpt = findBookByIdAsync db bookId
            return match bookOpt with
                   | None -> Results.NotFound("Book not found")
                   | Some book -> Results.Ok(book)
        }

    let createBook (db: AppDbContext) (book: Book) : Task<IResult> =
        task {
            match validateBook book.Title book.Author book.TotalCopies with
            | Error msg -> return Results.BadRequest(msg)
            | Ok _ ->
                let newBook = Book()
                newBook.Id <- Guid.NewGuid()
                newBook.Title <- book.Title
                newBook.Author <- book.Author
                newBook.ISBN <- book.ISBN
                newBook.Description <- book.Description
                newBook.TotalCopies <- book.TotalCopies
                newBook.AvailableCopies <- book.TotalCopies
                newBook.CreatedAt <- DateTime.UtcNow
                newBook.UpdatedAt <- Nullable<DateTime>()
                
                let! result = createBookInDbAsync db newBook
                return match result with
                       | Ok createdBook -> Results.Created($"/api/books/{createdBook.Id}", createdBook)
                       | Error errorMsg -> Results.Problem(title = "Failed to create book", detail = errorMsg, statusCode = 500)
        }

    let updateBook (db: AppDbContext) (bookId: Guid) (book: Book) : Task<IResult> =
        task {
            let! bookOpt = findBookByIdAsync db bookId
            match bookOpt with
            | None -> return Results.NotFound("Book not found")
            | Some existingBook ->
                match validateBook book.Title book.Author book.TotalCopies with
                | Error msg -> return Results.BadRequest(msg)
                | Ok _ ->
                    existingBook.Title <- book.Title
                    existingBook.Author <- book.Author
                    existingBook.ISBN <- book.ISBN
                    existingBook.Description <- book.Description
                    existingBook.TotalCopies <- book.TotalCopies
                    existingBook.UpdatedAt <- Nullable<DateTime>(DateTime.UtcNow)
                    
                    // Adjust available copies if total copies changed
                    let diff = book.TotalCopies - existingBook.TotalCopies
                    existingBook.AvailableCopies <- existingBook.AvailableCopies + diff
                    if existingBook.AvailableCopies < 0 then
                        existingBook.AvailableCopies <- 0
                    
                    let! result = updateBookInDbAsync db existingBook
                    return match result with
                           | Ok updated -> Results.Ok(existingBook)
                           | Error errorMsg -> Results.Problem(title = "Failed to update book", detail = errorMsg, statusCode = 500)
        }

    let deleteBook (db: AppDbContext) (bookId: Guid) : Task<IResult> =
        task {
            let! result = deleteBookFromDbAsync db bookId
            return match result with
                   | Ok _ -> Results.NoContent()
                   | Error errorMsg -> Results.NotFound(errorMsg)
        }

    // Borrowing handlers MS
    let private hasActiveBorrowingAsync (db: AppDbContext) (userId: Guid) (bookId: Guid) : Task<bool> =
        task {
            let query = db.Borrowings.Where(fun b -> 
                b.UserId = userId && 
                b.BookId = bookId && 
                (b.Status = "Active" || b.Status = "Overdue"))
            let! existingBorrowing = query.FirstOrDefaultAsync()
            return existingBorrowing <> null
        }

    let private validateBorrowRequest (book: Book option) (userId: Guid) (hasActiveBorrowing: bool) : Result<unit, string> =
        match book with
        | None -> Error "Book not found"
        | Some b ->
            if hasActiveBorrowing then Error "You already have an active borrowing for this book. Please return it before borrowing again."
            elif b.AvailableCopies < 1 then Error "No copies available"
            else Ok ()

    let private createBorrowingAsync (db: AppDbContext) (userId: Guid) (bookId: Guid) : Task<Result<Borrowing, string>> =
        task {
            try
                let! bookOpt = findBookByIdAsync db bookId
                match bookOpt with
                | None -> return Error "Book not found"
                | Some book ->
                    let borrowing = Borrowing()
                    borrowing.Id <- Guid.NewGuid()
                    borrowing.UserId <- userId
                    borrowing.BookId <- bookId
                    borrowing.BorrowedDate <- DateTime.UtcNow
                    borrowing.ReturnedDate <- Nullable<DateTime>()
                    borrowing.DueDate <- DateTime.UtcNow.AddDays(14)
                    borrowing.Status <- "Active"
                    
                    book.AvailableCopies <- book.AvailableCopies - 1
                    db.Borrowings.Add(borrowing) |> ignore
                    let! _ = db.SaveChangesAsync()
                    return Ok borrowing
            with
            | :? DbUpdateException as ex ->
                let innerMsg = if ex.InnerException <> null then ex.InnerException.Message else ""
                return Error $"Failed to borrow book: {ex.Message}. Inner: {innerMsg}"
            | ex ->
                return Error $"Unexpected error: {ex.Message}. Type: {ex.GetType().Name}"
        }

    let private returnBorrowingAsync (db: AppDbContext) (borrowingId: Guid) (userId: Guid) : Task<Result<Borrowing, string>> =
        task {
            try
                let query = db.Borrowings.Include(fun b -> b.Book)
                let! borrowing = query.FirstOrDefaultAsync(fun b -> b.Id = borrowingId && b.UserId = userId)
                
                match borrowing with
                | null -> return Error "Borrowing record not found"
                | b when b.Status = "Returned" -> return Error "Book already returned"
                | b ->
                    b.ReturnedDate <- Nullable<DateTime>(DateTime.UtcNow)
                    b.Status <- "Returned"
                    
                    match b.Book with
                    | null -> return Error "Book not found"
                    | book ->
                        book.AvailableCopies <- book.AvailableCopies + 1
                        let! _ = db.SaveChangesAsync()
                        return Ok b
            with
            | :? DbUpdateException as ex ->
                let innerMsg = if ex.InnerException <> null then ex.InnerException.Message else ""
                return Error $"Failed to return book: {ex.Message}. Inner: {innerMsg}"
            | ex ->
                return Error $"Unexpected error: {ex.Message}. Type: {ex.GetType().Name}"
        }

    let private getUserBorrowingsAsync (db: AppDbContext) (userId: Guid) : Task<System.Collections.Generic.List<Borrowing>> =
        task {
            let query = db.Borrowings.Include(fun b -> b.Book)
            let query = query.Where(fun b -> b.UserId = userId)
            let query = query.OrderByDescending(fun b -> b.BorrowedDate)
            return! query.ToListAsync()
        }

    let private updateOverdueStatusAsync (db: AppDbContext) : Task<unit> =
        task {
            try
                let query = db.Borrowings.Where(fun b -> b.Status = "Active" && b.DueDate < DateTime.UtcNow)
                let! overdueBorrowings = query.ToListAsync()
                
                for borrowing in overdueBorrowings do
                    borrowing.Status <- "Overdue"
                
                if overdueBorrowings.Count > 0 then
                    let! _ = db.SaveChangesAsync()
                    ()
            with
            | ex ->
                System.Diagnostics.Debug.WriteLine($"Error updating overdue status: {ex.Message}")
                ()
        }

    let getAllBorrowingsAsync (db: AppDbContext) : Task<System.Collections.Generic.List<Borrowing>> =
        task {
            let query = db.Borrowings.Include(fun b -> b.Book).Include(fun b -> b.User)
            let query = query.OrderByDescending(fun b -> b.BorrowedDate)
            return! query.ToListAsync()
        }

    let borrowBook (db: AppDbContext) (bookId: Guid) (userId: Guid) : Task<IResult> =
        task {
            let! bookOpt = findBookByIdAsync db bookId
            let! hasActiveBorrowing = hasActiveBorrowingAsync db userId bookId
            match validateBorrowRequest bookOpt userId hasActiveBorrowing with
            | Error msg -> return Results.BadRequest(msg)
            | Ok _ ->
                let! result = createBorrowingAsync db userId bookId
                return match result with
                       | Ok borrowing -> Results.Created($"/api/borrowings/{borrowing.Id}", borrowing)
                       | Error errorMsg -> Results.Problem(title = "Failed to borrow book", detail = errorMsg, statusCode = 500)
        }

    let returnBook (db: AppDbContext) (borrowingId: Guid) (userId: Guid) : Task<IResult> =
        task {
            let! result = returnBorrowingAsync db borrowingId userId
            return match result with
                   | Ok borrowing -> Results.Ok(borrowing)
                   | Error errorMsg -> Results.BadRequest(errorMsg)
        }

    let getUserBorrowings (db: AppDbContext) (userId: Guid) : Task<IResult> =
        task {
            try
                do! updateOverdueStatusAsync db
                let! borrowings = getUserBorrowingsAsync db userId
                return Results.Ok(borrowings)
            with
            | :? DbUpdateException as ex ->
                let innerMsg = if ex.InnerException <> null then ex.InnerException.Message else ""
                return Results.Problem(
                    title = "Failed to retrieve borrowings",
                    detail = $"Database error: {ex.Message}. Inner: {innerMsg}",
                    statusCode = 500
                )
            | ex ->
                return Results.Problem(
                    title = "Failed to retrieve borrowings",
                    detail = $"Unexpected error: {ex.Message}. Type: {ex.GetType().Name}",
                    statusCode = 500
                )
        }
    
    let getAllBorrowings (db: AppDbContext) : Task<IResult> =
        task {
            let! borrowings = getAllBorrowingsAsync db
            return Results.Ok(borrowings)
        }