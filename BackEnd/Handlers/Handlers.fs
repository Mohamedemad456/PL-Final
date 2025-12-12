namespace BackEnd.Handlers

open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Http.HttpResults
open Microsoft.EntityFrameworkCore
open BackEnd.Data
open BackEnd.Data.Models
open System.Text.Json
open System.Text.Json.Serialization
open FSharp.SystemTextJson
open System.Linq

module Handlers =

    let jsonOptions = 
        let opts = JsonSerializerOptions()
        opts.PropertyNamingPolicy <- JsonNamingPolicy.CamelCase
        opts.Converters.Add(JsonFSharpConverter())
        opts

    let toOption (value: 'a when 'a : null) : 'a option =
        if isNull value then None else Some value



    /// Validates user input - returns Result type (functional error handling)
    let validateUser (user: User) : Microsoft.FSharp.Core.Result<User, string> =
        if System.String.IsNullOrWhiteSpace(user.Name) then
            Microsoft.FSharp.Core.Error "Name is required and cannot be empty"
        elif System.String.IsNullOrWhiteSpace(user.Email) then
            Microsoft.FSharp.Core.Error "Email is required and cannot be empty"
        elif not (user.Email.Contains("@")) then
            Microsoft.FSharp.Core.Error "Email must be a valid email address"
        else
            Microsoft.FSharp.Core.Ok user


    // ============================================
    // Database Query Functions (Async, Functional)
    // ============================================

    /// Async query to find user by ID - returns Option type
    let findUserByIdAsync (db: AppDbContext) (id: System.Guid) =
        task {
            let! user = db.Users.FirstOrDefaultAsync(fun u -> u.Id = id)
            return toOption user
        }



    /// Get all users - returns list
    let getAllUsersAsync (db: AppDbContext) =
        db.Users.ToListAsync()



    // ============================================
    // Business Logic Functions (Composition)
    // ============================================

    /// Creates a user with CreatedAt timestamp (functional approach)
    let prepareUserForCreation (user: User) : User =
        // Note: We still need to mutate C# objects for EF Core,
        // but we isolate this in a single function
        user.CreatedAt <- System.DateTime.UtcNow
        user



    /// Saves user to database - returns Result type
    let saveUserAsync (db: AppDbContext) (user: User) =
        task {
            try
                db.Users.Add(user) |> ignore
                let! _ = db.SaveChangesAsync()
                return Microsoft.FSharp.Core.Ok user
            with
            | :? DbUpdateException as ex ->
                return Microsoft.FSharp.Core.Error $"Failed to save user: {ex.Message}"
            | ex ->
                return Microsoft.FSharp.Core.Error $"Unexpected error: {ex.Message}"
        }



    // ============================================
    // Handler Functions (Composed from Pure Functions)
    // ============================================

    /// Get all users - uses pattern matching and Option types
    let getUsers (db: AppDbContext) =
        task {
            try
                let! users = getAllUsersAsync db
                return Results.Json(users, jsonOptions)
            with
            | ex ->
                return Results.Problem(
                    title = "Error retrieving users",
                    detail = ex.Message,
                    statusCode = 500
                )
        }

    /// Get user by ID - uses Option type and pattern matching
    let getUserById (db: AppDbContext) (id: System.Guid) =
        task {
            try
                let! userOption = findUserByIdAsync db id
                
                // Pattern matching on Option type (functional approach)
                return match userOption with
                       | Some user -> Results.Json(user, jsonOptions)
                       | None -> Results.NotFound()
            with
            | ex ->
                return Results.Problem(
                    title = "Error retrieving user",
                    detail = ex.Message,
                    statusCode = 500
                )
        }

    /// Create user - uses Result type and function composition
    let createUser (db: AppDbContext) (user: User) =
        task {
            // Function composition: validate -> prepare -> save
            match validateUser user with
            | Microsoft.FSharp.Core.Error validationError ->
                return Results.BadRequest(validationError)
            | Microsoft.FSharp.Core.Ok validUser ->
                let preparedUser = prepareUserForCreation validUser
                let! saveResult = saveUserAsync db preparedUser
                
                // Pattern matching on Result type
                return match saveResult with
                       | Microsoft.FSharp.Core.Ok savedUser ->
                           Results.Created($"/api/users/{savedUser.Id}", savedUser)
                       | Microsoft.FSharp.Core.Error errorMsg ->
                           Results.Problem(
                               title = "Failed to create user",
                               detail = errorMsg,
                               statusCode = 500
                           )
        }