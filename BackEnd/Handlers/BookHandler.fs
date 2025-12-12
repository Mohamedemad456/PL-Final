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