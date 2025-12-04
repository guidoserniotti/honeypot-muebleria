# Final Complete Test Suite for Honeypot
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🍯 HONEYPOT FINAL VERIFICATION TESTS 🍯             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$backdoorHeader = @{ "X-AccessDev" = "Testing-Mode" }
$passed = 0
$failed = 0

# Test 1: Normal Login
Write-Host "[1/7] Testing normal login (admin/admin)..." -ForegroundColor Yellow
try {
    $body = @{ username = "admin"; password = "admin" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    if ($response.token) {
        Write-Host "  ✅ PASS: Normal login successful" -ForegroundColor Green
        $adminToken = $response.token
        $passed++
    } else {
        Write-Host "  ❌ FAIL: No token received" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: SQL Injection
Write-Host "`n[2/7] Testing SQL Injection (admin'--)..." -ForegroundColor Yellow
try {
    $body = @{ username = "admin'--"; password = "anything" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    if ($response.token -and $response.user.username -eq "admin") {
        Write-Host "  ✅ PASS: SQL Injection successful (VULNERABLE!)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL: SQL Injection blocked" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Protected endpoint without auth
Write-Host "`n[3/7] Testing admin endpoint WITHOUT auth..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method GET
    Write-Host "  ❌ FAIL: Endpoint should be protected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "  ✅ PASS: Correctly blocked - 401 Unauthorized" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL: Unexpected error" -ForegroundColor Red
        $failed++
    }
}

# Test 4: Backdoor - Get Users
Write-Host "`n[4/7] Testing BACKDOOR: Get all users..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method GET -Headers $backdoorHeader
    if ($response.users -and $response.users.Count -gt 0) {
        Write-Host "  ✅ PASS: Backdoor grants access! Found $($response.users.Count) users" -ForegroundColor Green
        Write-Host "     🚨 Accessed by: $($response.accessedBy)" -ForegroundColor Red
        $passed++
    } else {
        Write-Host "  ❌ FAIL: No users returned" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Backdoor - Database Stats
Write-Host "`n[5/7] Testing BACKDOOR: Database statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Method GET -Headers $backdoorHeader
    if ($response.stats) {
        Write-Host "  ✅ PASS: Stats retrieved via backdoor" -ForegroundColor Green
        Write-Host "     Users: $($response.stats.users)" -ForegroundColor White
        Write-Host "     Products: $($response.stats.products)" -ForegroundColor White
        Write-Host "     Orders: $($response.stats.orders)" -ForegroundColor White
        $passed++
    } else {
        Write-Host "  ❌ FAIL: No stats returned" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Backdoor - Audit Logs
Write-Host "`n[6/7] Testing BACKDOOR: Audit logs..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs?limit=5" -Method GET -Headers $backdoorHeader
    if ($response.logs) {
        Write-Host "  ✅ PASS: Retrieved $($response.logs.Count) audit logs" -ForegroundColor Green
        $backdoorLogs = $response.logs | Where-Object { $_.action -eq 'backdoor_access' }
        if ($backdoorLogs) {
            Write-Host "     🚨 Found $($backdoorLogs.Count) backdoor access entries in logs!" -ForegroundColor Red
        }
        $passed++
    } else {
        Write-Host "  ❌ FAIL: No logs returned" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Health Check
Write-Host "`n[7/7] Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    if ($response.status -eq "OK") {
        Write-Host "  ✅ PASS: Health check successful" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL: Health check failed" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      TEST SUMMARY                            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "  Total Tests: 7" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n  🎉 ALL TESTS PASSED! Honeypot is ready for exploitation! 🍯" -ForegroundColor Green
} else {
    Write-Host "`n  ⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
