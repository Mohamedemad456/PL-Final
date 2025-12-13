// Role: Tester
// Developer: Amr
module BackEnd.Tests.Tests

open Xunit
open BackEnd.Handlers.AuthHandler
open BackEnd.Handlers
open BackEnd.Data.Models

[<Fact>]
let ``verifyPassword returns true for correct password`` () =
    let password = "123"
    let hash = hashPassword password
    Assert.True(verifyPassword password hash)

[<Fact>]
let ``validateUser rejects invalid email`` () =
    let user = User()
    user.Name <- "Test User"
    user.Email <- "not-an-email"

    match Handlers.validateUser user with
    | Ok _ -> Assert.True(false, "Expected validation to fail for invalid email")
    | Error msg -> Assert.Contains("valid email", msg)

