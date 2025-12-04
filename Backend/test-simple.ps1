# Simple backdoor test
$headers = @{ "X-AccessDev" = "Testing-Mode" }

Write-Host "`n=== Testing Backdoor ===" -ForegroundColor Cyan

try {
    $users = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users" -Headers $headers
    Write-Host "✅ Users endpoint: SUCCESS" -ForegroundColor Green
    Write-Host "   Found $($users.count) users" -ForegroundColor White
} catch {
    Write-Host "❌ Users endpoint: FAILED" -ForegroundColor Red
}

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/stats" -Headers $headers
    Write-Host "✅ Stats endpoint: SUCCESS" -ForegroundColor Green
    Write-Host "   Users: $($stats.stats.users)" -ForegroundColor White
} catch {
    Write-Host "❌ Stats endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $logs = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/audit-logs?limit=3" -Headers $headers
    Write-Host "✅ Logs endpoint: SUCCESS" -ForegroundColor Green
    Write-Host "   Found $($logs.count) logs" -ForegroundColor White
} catch {
    Write-Host "❌ Logs endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
