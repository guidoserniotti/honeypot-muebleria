# Test SQL Injection Attack
# Este script prueba diferentes payloads de SQL injection

$baseUrl = "http://localhost:3000/api/auth/login"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "HONEYPOT SQL INJECTION TESTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Login normal
Write-Host "`n[Test 1] Normal Login (admin/admin)" -ForegroundColor Yellow
$body1 = @"
{"username":"admin","password":"admin"}
"@
try {
    $response1 = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body1
    Write-Host "Success! Token received" -ForegroundColor Green
    Write-Host "User: $($response1.user.username) | Role: $($response1.user.role)" -ForegroundColor Green
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: SQL Injection - Comment bypass
Write-Host "`n[Test 2] SQL Injection: Comment Bypass" -ForegroundColor Yellow
$body2 = @"
{"username":"admin'-- ","password":"anything"}
"@
try {
    $response2 = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body2
    Write-Host "VULNERABLE! SQL Injection successful!" -ForegroundColor Red
    Write-Host "User: $($response2.user.username) | Role: $($response2.user.role)" -ForegroundColor Red
} catch {
    Write-Host "Protected: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 3: SQL Injection - Always true
Write-Host "`n[Test 3] SQL Injection: Always True" -ForegroundColor Yellow
$body3 = @"
{"username":"' OR '1'='1","password":"anything"}
"@
try {
    $response3 = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body3
    Write-Host "VULNERABLE! SQL Injection successful!" -ForegroundColor Red
    Write-Host "User: $($response3.user.username) | Role: $($response3.user.role)" -ForegroundColor Red
} catch {
    Write-Host "Protected or failed: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 4: Invalid credentials
Write-Host "`n[Test 4] Invalid Credentials" -ForegroundColor Yellow
$body4 = @"
{"username":"admin","password":"wrongpassword"}
"@
try {
    $response4 = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body4
    Write-Host "Unexpected success" -ForegroundColor Red
} catch {
    Write-Host "Correctly rejected" -ForegroundColor Green
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
