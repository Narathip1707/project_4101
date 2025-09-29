$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/login" -Method POST -Body (@{email="advisor1@rumail.ru.ac.th"; password="password"} | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Got token, testing API..."
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8081/api/advisors/students" -Method GET -Headers $headers
