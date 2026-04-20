# Detailed Login Test Script
# This will show exactly what's being sent to the backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Detailed Login Request Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://134.199.172.167:5001/api/auth/login"
$testEmail = "janidu.ophtha@gmail.com"

Write-Host "Testing different request formats..." -ForegroundColor Yellow
Write-Host ""

# Test Format 1: {email, password}
Write-Host "Test 1: Standard format {email, password}" -ForegroundColor Cyan
$body1 = @{
    email = $testEmail
    password = "test123"
} | ConvertTo-Json

Write-Host "Request Body: $body1" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest `
        -Uri $apiUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    exit 0
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Failed with HTTP $statusCode" -ForegroundColor Red
    
    # Try to get response body
    $responseBody = $null
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test Format 2: {username, password} (some APIs use username instead of email)
Write-Host "Test 2: Username format {username, password}" -ForegroundColor Cyan
$body2 = @{
    username = $testEmail
    password = "test123"
} | ConvertTo-Json

Write-Host "Request Body: $body2" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest `
        -Uri $apiUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $body2 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    exit 0
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Failed with HTTP $statusCode" -ForegroundColor Red
    
    $responseBody = $null
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test Format 3: Form data
Write-Host "Test 3: Form data format" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest `
        -Uri $apiUrl `
        -Method POST `
        -Body @{email=$testEmail; password="test123"} `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    exit 0
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Failed with HTTP $statusCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All formats failed!" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Possible issues:" -ForegroundColor Yellow
Write-Host "1. User doesn't exist in database (create account first)" -ForegroundColor White
Write-Host "2. Password is incorrect" -ForegroundColor White
Write-Host "3. Backend requires additional fields" -ForegroundColor White
Write-Host "4. Backend validation is rejecting the request" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check backend logs to see exact error" -ForegroundColor White
Write-Host "2. Verify user account exists in database" -ForegroundColor White
Write-Host "3. Check backend API documentation for required fields" -ForegroundColor White
Write-Host ""
