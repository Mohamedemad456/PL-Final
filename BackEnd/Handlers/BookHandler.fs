amespace BackEnd.Handlers

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