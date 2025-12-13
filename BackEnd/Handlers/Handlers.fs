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



    let validateUser (user: User) : Microsoft.FSharp.Core.Result<User, string> =
        if System.String.IsNullOrWhiteSpace(user.Name) then
            Microsoft.FSharp.Core.Error "Name is required and cannot be empty"
        elif System.String.IsNullOrWhiteSpace(user.Email) then
            Microsoft.FSharp.Core.Error "Email is required and cannot be empty"
        elif not (user.Email.Contains("@")) then
            Microsoft.FSharp.Core.Error "Email must be a valid email address"
        else
            Microsoft.FSharp.Core.Ok user


    let findUserByIdAsync (db: AppDbContext) (id: System.Guid) =
        task {
            let! user = db.Users.FirstOrDefaultAsync(fun u -> u.Id = id)
            return toOption user
        }



    let getAllUsersAsync (db: AppDbContext) =
        db.Users.ToListAsync()



    let prepareUserForCreation (user: User) : User =
        user.CreatedAt <- System.DateTime.UtcNow
        user



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

    let getUserById (db: AppDbContext) (id: System.Guid) =
        task {
            try
                let! userOption = findUserByIdAsync db id
                
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

    let createUser (db: AppDbContext) (user: User) =
        task {
            match validateUser user with
            | Microsoft.FSharp.Core.Error validationError ->
                return Results.BadRequest(validationError)
            | Microsoft.FSharp.Core.Ok validUser ->
                let preparedUser = prepareUserForCreation validUser
                let! saveResult = saveUserAsync db preparedUser
                
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