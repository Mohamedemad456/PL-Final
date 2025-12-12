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
