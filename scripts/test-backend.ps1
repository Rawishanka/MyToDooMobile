# Backend API Test Script
# Run this to test if your backend is working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MyToDoo Backend API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://134.199.172.167:5001/api"
$testEmail = "janidu.ophtha@gmail.com"

# Test 1: Check if server is reachable
Write-Host "Test 1: Checking if server is reachable..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName "134.199.172.167" -Port 5001 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Server is reachable on port 5001" -ForegroundColor Green
    } else {
        Write-Host "❌ Server is NOT reachable on port 5001" -ForegroundColor Red
        Write-Host "   Make sure your backend is running!" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Failed to test connection" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Test API endpoint
Write-Host "Test 2: Testing API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/health" -Method GET -ErrorAction Stop
    Write-Host "✅ API endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health endpoint not found (this is OK if not implemented)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Test login endpoint (will fail if no user, but shows if endpoint exists)
Write-Host "Test 3: Testing login endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "test123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "$apiUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login endpoint works!" -ForegroundColor Green
    Write-Host "   Response: $($result.message)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "⚠️  Login endpoint exists but credentials are wrong" -ForegroundColor Yellow
        Write-Host "   This is OK - it means the endpoint works" -ForegroundColor Yellow
        Write-Host "   Create an account or use correct credentials" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ Login endpoint NOT FOUND" -ForegroundColor Red
        Write-Host "   Backend needs /api/auth/login endpoint" -ForegroundColor Yellow
    } elseif ($statusCode -eq 0) {
        Write-Host "❌ CORS or Network Error" -ForegroundColor Red
        Write-Host "   Backend might need CORS configuration" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: HTTP $statusCode" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 4: Check register endpoint
Write-Host "Test 4: Testing register endpoint..." -ForegroundColor Yellow
$registerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "test123"
    phone = "+1234567890"
    location = @{
        country = "Sri Lanka"
        countryCode = "LK"
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "$apiUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    
    Write-Host "✅ Register endpoint works!" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 400) {
        Write-Host "⚠️  Register endpoint exists (user might already exist)" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ Register endpoint NOT FOUND" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Register endpoint returned: HTTP $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "1. If all tests pass, you can build the APK" -ForegroundColor White
Write-Host "2. If login fails with 401, create an account first" -ForegroundColor White
Write-Host "3. If endpoints are 404, check your backend implementation" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: eas build -p android --profile preview" -ForegroundColor White
Write-Host "2. Wait for build to complete" -ForegroundColor White
Write-Host "3. Download and install APK" -ForegroundColor White
Write-Host "4. Test login with correct credentials" -ForegroundColor White
Write-Host ""
