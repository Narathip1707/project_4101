# Complete API Test Script
Write-Host "=== Testing Student Management System ==="
Write-Host ""

# Test 1: Login
Write-Host "1. Testing Login..."
$loginBody = @{
    email = "advisor1@rumail.ru.ac.th"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "   Token received: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Health Check
Write-Host ""
Write-Host "2. Testing Health Check..."
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/health" -Method GET
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "   Database: $($healthResponse.database)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Protected Endpoint (Projects)
Write-Host ""
Write-Host "3. Testing Protected Endpoint (Projects)..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $projectsResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/projects" -Method GET -Headers $headers
    Write-Host "✅ Projects endpoint working!" -ForegroundColor Green
    Write-Host "   Found $($projectsResponse.Count) projects" -ForegroundColor Gray
} catch {
    Write-Host "❌ Projects endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "   Response: $responseText" -ForegroundColor Red
    }
}

# Test 4: Advisor Students Endpoint
Write-Host ""
Write-Host "4. Testing Advisor Students Endpoint..."
try {
    $studentsResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/advisors/students" -Method GET -Headers $headers
    Write-Host "✅ Advisor students endpoint working!" -ForegroundColor Green
    
    if ($studentsResponse -is [System.Array]) {
        Write-Host "   Found $($studentsResponse.Count) students under supervision" -ForegroundColor Gray
    } else {
        Write-Host "   Response: $studentsResponse" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Advisor students endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "   Response: $responseText" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Summary ==="
Write-Host "Backend URL: http://localhost:8081"
Write-Host "Frontend URL: http://localhost:3002"
Write-Host "Login: advisor1@rumail.ru.ac.th / password"
Write-Host "Student Management: http://localhost:3002/advisor/students"