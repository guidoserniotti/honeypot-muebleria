# Test Backdoor Access
# Este script prueba el acceso mediante el header secreto X-AccessDev

$baseUrl = "http://localhost:3000"
$backdoorHeader = @{ 
    "X-AccessDev" = "Testing-Mode"
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "HONEYPOT BACKDOOR TESTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Acceso a /api/admin/users SIN backdoor (debe fallar)
Write-Host "`n[Test 1] Access admin endpoint WITHOUT backdoor" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method GET
    Write-Host "Unexpected success (no auth required?)" -ForegroundColor Red
} catch {
    Write-Host "Correctly blocked (401 Unauthorized)" -ForegroundColor Green
}

# Test 2: Acceso a /api/admin/users CON backdoor (debe funcionar)
Write-Host "`n[Test 2] Access admin endpoint WITH backdoor header" -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method GET -Headers $backdoorHeader
    Write-Host "BACKDOOR SUCCESSFUL! Access granted without auth!" -ForegroundColor Red
    Write-Host "Retrieved $($response2.count) users" -ForegroundColor Red
    Write-Host "Accessed by: $($response2.accessedBy)" -ForegroundColor Red
} catch {
    Write-Host "Backdoor failed: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 3: Get database stats con backdoor
Write-Host "`n[Test 3] Get database stats with backdoor" -ForegroundColor Yellow
try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Method GET -Headers $backdoorHeader
    Write-Host "Stats retrieved via backdoor:" -ForegroundColor Red
    Write-Host "  Users: $($response3.stats.users)" -ForegroundColor White
    Write-Host "  Products: $($response3.stats.products)" -ForegroundColor White
    Write-Host "  Orders: $($response3.stats.orders)" -ForegroundColor White
    Write-Host "  Audit Logs: $($response3.stats.audit_logs)" -ForegroundColor White
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 4: Get audit logs con backdoor
Write-Host "`n[Test 4] Get audit logs with backdoor" -ForegroundColor Yellow
try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs?limit=5" -Method GET -Headers $backdoorHeader
    Write-Host "Retrieved $($response4.count) audit log entries" -ForegroundColor Red
    Write-Host "Recent activities:" -ForegroundColor Yellow
    foreach ($log in $response4.logs | Select-Object -First 3) {
        Write-Host "  - $($log.action): $($log.details)" -ForegroundColor White
    }
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 5: Verificar que el backdoor se registra en audit_log
Write-Host "`n[Test 5] Verify backdoor access is logged" -ForegroundColor Yellow
try {
    $response5 = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs?limit=10" -Method GET -Headers $backdoorHeader
    $backdoorLogs = $response5.logs | Where-Object { $_.action -eq 'backdoor_access' }
    
    if ($backdoorLogs.Count -gt 0) {
        Write-Host "Backdoor access IS being logged!" -ForegroundColor Yellow
        Write-Host "Found $($backdoorLogs.Count) backdoor access entries" -ForegroundColor Yellow
    } else {
        Write-Host "No backdoor logs found (may not have been triggered yet)" -ForegroundColor White
    }
} catch {
    Write-Host "Failed to check logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Backdoor tests completed!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
