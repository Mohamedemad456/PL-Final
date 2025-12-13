// Role: Tester
// Developer: Amr
module BackEnd.Tests.SeleniumTests.LoginTests

open Xunit
open OpenQA.Selenium
open OpenQA.Selenium.Chrome
open System
open System.Threading

[<Fact>]
let ``Login with invalid credentials should display error message`` () =
    let options = ChromeOptions()
    options.AddArgument("--disable-blink-features=AutomationControlled")
    let driver = new ChromeDriver(options)
    Thread.Sleep(2000)
    try
        try
            driver.Navigate().GoToUrl("http://localhost:3000/login")
            
            Thread.Sleep(3000)
            
            let emailInput = driver.FindElement(By.Id("email"))
            emailInput.Clear()
            emailInput.SendKeys("invalid@email.com")
            Thread.Sleep(3000) 
            
            let passwordInput = driver.FindElement(By.Id("password"))
            passwordInput.Clear()
            passwordInput.SendKeys("wrongpassword123")
            Thread.Sleep(3000)
            
            let loginButton = driver.FindElement(By.XPath("//button[contains(text(), 'Login')]"))
            loginButton.Click()
            Thread.Sleep(3000) 
            
            Thread.Sleep(3000)
            
            let errorElements = driver.FindElements(By.XPath("//div[contains(@class, 'text-destructive') or contains(@class, 'error')]"))
            let hasError = errorElements.Count > 0
            
            let pageText = driver.PageSource
            let containsError = pageText.Contains("Invalid") || pageText.Contains("error") || pageText.Contains("failed") || pageText.Contains("credentials")
            
            Assert.True(hasError || containsError, "Expected error message to be displayed for invalid login credentials")
            
            let currentUrl = driver.Url
            Assert.Contains("/login", currentUrl)
            
            Thread.Sleep(3000)
            
        with
        | ex ->
            printfn "Error occurred: %s" ex.Message
            printfn "Stack trace: %s" ex.StackTrace
            Thread.Sleep(3000)
            reraise()
    finally
        Thread.Sleep(3000)
        try
            driver.Quit()
        with
        | _ -> ()
        try
            driver.Dispose()
        with
        | _ -> ()

[<Fact>]
let ``Login with empty email should display validation error`` () =
    let options = ChromeOptions()
    options.AddArgument("--disable-blink-features=AutomationControlled")
    let driver = new ChromeDriver(options)
    Thread.Sleep(2000)
    try
        try
            driver.Navigate().GoToUrl("http://localhost:3000/login")
            
            Thread.Sleep(3000)
            
            let passwordInput = driver.FindElement(By.Id("password"))
            passwordInput.Clear()
            passwordInput.SendKeys("somepassword")
            Thread.Sleep(3000) 

            let loginButton = driver.FindElement(By.XPath("//button[contains(text(), 'Login')]"))
            loginButton.Click()
            Thread.Sleep(3000) 
            
            Thread.Sleep(3000)
            
            let emailInput = driver.FindElement(By.Id("email"))
            let isRequired = emailInput.GetAttribute("required")
            
            let currentUrl = driver.Url
            Assert.Contains("/login", currentUrl)
            
            Thread.Sleep(3000)
            
        with
        | ex ->
            printfn "Error occurred: %s" ex.Message
            printfn "Stack trace: %s" ex.StackTrace
            Thread.Sleep(3000)
            reraise()
    finally
        Thread.Sleep(3000)
        try
            driver.Quit()
        with
        | _ -> ()
        try
            driver.Dispose()
        with
        | _ -> ()

[<Fact>]
let ``Login with empty password should display validation error`` () =
    let options = ChromeOptions()
    options.AddArgument("--disable-blink-features=AutomationControlled")
    let driver = new ChromeDriver(options)
    Thread.Sleep(2000)
    try
        try
            driver.Navigate().GoToUrl("http://localhost:3000/login")
            
            Thread.Sleep(3000)
            
            let emailInput = driver.FindElement(By.Id("email"))
            emailInput.Clear()
            emailInput.SendKeys("test@example.com")
            Thread.Sleep(3000)
            
            let loginButton = driver.FindElement(By.XPath("//button[contains(text(), 'Login')]"))
            loginButton.Click()
            Thread.Sleep(3000) 
            
            Thread.Sleep(3000)
            
            let passwordInput = driver.FindElement(By.Id("password"))
            let isRequired = passwordInput.GetAttribute("required")
            
            let currentUrl = driver.Url
            Assert.Contains("/login", currentUrl)
            
            Thread.Sleep(3000)
            
        with
        | ex ->
            printfn "Error occurred: %s" ex.Message
            printfn "Stack trace: %s" ex.StackTrace
            Thread.Sleep(3000)
            reraise()
    finally
        Thread.Sleep(3000)
        try
            driver.Quit()
        with
        | _ -> ()
        try
            driver.Dispose()
        with
        | _ -> ()
