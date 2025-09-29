# Get login token
$loginBody = @{
    email = "advisor1@rumail.ru.ac.th"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    
    Write-Host "Login successful, token received"
    
    # Test advisors/students API
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Testing /api/advisors/students..."
    $studentsResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/advisors/students" -Method GET -Headers $headers
    
    Write-Host "API Response:"
    $studentsResponse | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText"
    }
}