namespace BackEnd.Handlers

open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Http.HttpResults
open Microsoft.EntityFrameworkCore
open BackEnd.Data
open BackEnd.Data.Models
open System.Text.Json
open System.Text.Json.Serialization
open FSharp.SystemTextJson
open System
open System.Security.Cryptography
open System.Text

module AuthHandler =


    let hashPassword (password: string) : string =
        use sha256 = SHA256.Create()
        let bytes = Encoding.UTF8.GetBytes(password)
        let hash = sha256.ComputeHash(bytes)
        Convert.ToBase64String(hash)

    let verifyPassword (password: string) (hash: string) : bool =
        let passwordHash = hashPassword password
        passwordHash = hash


    let validateRegistration (email: string) (username: string) (password: string) : Result<string * string * string, string> =
        if System.String.IsNullOrWhiteSpace(email) then
            Microsoft.FSharp.Core.Error "Email is required"
        elif not (email.Contains("@")) then
            Microsoft.FSharp.Core.Error "Email must be a valid email address"
        elif System.String.IsNullOrWhiteSpace(username) then
            Microsoft.FSharp.Core.Error "Username is required"
        elif username.Length < 3 then
            Microsoft.FSharp.Core.Error "Username must be at least 3 characters"
        elif System.String.IsNullOrWhiteSpace(password) then
            Microsoft.FSharp.Core.Error "Password is required"
        elif password.Length < 6 then
            Microsoft.FSharp.Core.Error "Password must be at least 6 characters"
        else
            Microsoft.FSharp.Core.Ok (email, username, password)

    let validateLogin (email: string) (password: string) : Result<string * string, string> =
        if System.String.IsNullOrWhiteSpace(email) then
            Microsoft.FSharp.Core.Error "Email is required"
        elif System.String.IsNullOrWhiteSpace(password) then
            Microsoft.FSharp.Core.Error "Password is required"
        else
            Microsoft.FSharp.Core.Ok (email, password)



    let findUserByEmailAsync (db: AppDbContext) (email: string) =
        task {
            let! user = db.Users.FirstOrDefaultAsync(fun u -> u.Email = email)
            return if isNull (box user) then None else Some user
        }

    let emailExistsAsync (db: AppDbContext) (email: string) =
        task {
            let! exists = db.Users.AnyAsync(fun u -> u.Email = email)
            return exists
        }



    let createUser (email: string) (username: string) (password: string) : User =
        let user = User()
        user.Id <- Guid.NewGuid()
        user.Email <- email
        user.Name <- username
        user.PasswordHash <- hashPassword password
        user.CreatedAt <- DateTime.UtcNow
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



    /// Register a new user
    let register (db: AppDbContext) (email: string) (username: string) (password: string) =
        task {
            match validateRegistration email username password with
            | Microsoft.FSharp.Core.Error validationError ->
                return Results.BadRequest(validationError)
            | Microsoft.FSharp.Core.Ok (validEmail, validUsername, validPassword) ->
                let! emailExists = emailExistsAsync db validEmail
                if emailExists then
                    return Results.BadRequest("Email is already registered")
                else
                    let newUser = createUser validEmail validUsername validPassword
                    
                    let! saveResult = saveUserAsync db newUser
                    
                    return match saveResult with
                           | Microsoft.FSharp.Core.Ok savedUser ->
                               Results.Created(
                                   $"/api/users/{savedUser.Id}",
                                   {| 
                                       id = savedUser.Id
                                       email = savedUser.Email
                                       name = savedUser.Name
                                       message = "User registered successfully"
                                   |}
                               )
                           | Microsoft.FSharp.Core.Error errorMsg ->
                               Results.Problem(
                                   title = "Failed to register user",
                                   detail = errorMsg,
                                   statusCode = 500
                               )
        }

    let login (db: AppDbContext) (email: string) (password: string) =
        task {
            match validateLogin email password with
            | Microsoft.FSharp.Core.Error validationError ->
                return Results.BadRequest(validationError)
            | Microsoft.FSharp.Core.Ok (validEmail, validPassword) ->
                let! userOption = findUserByEmailAsync db validEmail
                
                return match userOption with
                       | None ->
                           Results.Json(
                               {| message = "Invalid email or password" |},
                               statusCode = 401
                           )
                       | Some user ->
                           if verifyPassword validPassword user.PasswordHash then
                               Results.Ok({|
                                   userId = user.Id
                                   id = user.Id
                                   email = user.Email
                                   name = user.Name
                                   message = "Login successful"
                               |})
                           else
                               Results.Json(
                                   {| message = "Invalid email or password" |},
                                   statusCode = 401
                               )
        }

