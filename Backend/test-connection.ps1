# Test de Conexión Backend-Frontend
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔌 VERIFICACIÓN BACKEND-FRONTEND CONNECTION     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$backend = "http://localhost:3000"
$frontend = "http://localhost:5173"

# Test 1: Backend Health
Write-Host "[1/5] Verificando Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backend/health" -TimeoutSec 5
    if ($health.status -eq "OK") {
        Write-Host "  ✅ Backend respondiendo en $backend" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Backend responde pero status no es OK" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Backend NO responde en $backend" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "     Solución: Ejecutar 'npm run dev' en carpeta Backend" -ForegroundColor Yellow
}

# Test 2: Login con usuario del schema.sql
Write-Host "`n[2/5] Testeando Login (admin/admin)..." -ForegroundColor Yellow
try {
    $body = @{
        username = "admin"
        password = "admin"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$backend/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    if ($response.token) {
        Write-Host "  ✅ Login exitoso - Token recibido" -ForegroundColor Green
        Write-Host "     Usuario: $($response.user.username)" -ForegroundColor White
        Write-Host "     Rol: $($response.user.role)" -ForegroundColor White
        $token = $response.token
    } else {
        Write-Host "  ❌ Login falló - No se recibió token" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "     Verifica que la BD esté inicializada: npm run init-db" -ForegroundColor Yellow
}

# Test 3: SQL Injection
Write-Host "`n[3/5] Testeando SQL Injection (admin'--)..." -ForegroundColor Yellow
try {
    $body = @{
        username = "admin'--"
        password = "cualquiercosa"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$backend/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    if ($response.token) {
        Write-Host "  ✅ SQL Injection FUNCIONA (vulnerable)" -ForegroundColor Green
        Write-Host "     Usuario comprometido: $($response.user.username)" -ForegroundColor White
    } else {
        Write-Host "  ⚠️  SQL Injection bloqueada" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ SQL Injection falló: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Backdoor
Write-Host "`n[4/5] Testeando Backdoor (X-AccessDev)..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-AccessDev" = "Testing-Mode"
    }
    
    $response = Invoke-RestMethod -Uri "$backend/api/admin/users" -Headers $headers
    
    if ($response.users) {
        Write-Host "  ✅ Backdoor FUNCIONA (bypass total)" -ForegroundColor Green
        Write-Host "     Usuarios accesibles: $($response.count)" -ForegroundColor White
        Write-Host "     Accedido por: $($response.accessedBy)" -ForegroundColor Red
    } else {
        Write-Host "  ⚠️  Backdoor no retornó usuarios" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Backdoor falló: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend (opcional)
Write-Host "`n[5/5] Verificando Frontend..." -ForegroundColor Yellow
try {
    $frontResponse = Invoke-WebRequest -Uri $frontend -TimeoutSec 5 -ErrorAction Stop
    if ($frontResponse.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend respondiendo en $frontend" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Frontend no responde en $frontend" -ForegroundColor Yellow
    Write-Host "     (Esto es opcional - Frontend puede no estar corriendo)" -ForegroundColor Gray
}

# Resumen
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    RESUMEN                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📍 URLs del sistema:" -ForegroundColor White
Write-Host "   Backend:    $backend" -ForegroundColor Gray
Write-Host "   Frontend:   $frontend" -ForegroundColor Gray
Write-Host "   phpMyAdmin: http://localhost:8080" -ForegroundColor Gray

Write-Host "`n👥 Credenciales disponibles (schema.sql):" -ForegroundColor White
Write-Host "   admin / admin" -ForegroundColor Gray
Write-Host "   administrator / password" -ForegroundColor Gray
Write-Host "   root / root123" -ForegroundColor Gray
Write-Host "   user / user123" -ForegroundColor Gray
Write-Host "   test / test" -ForegroundColor Gray
Write-Host "   guest / guest" -ForegroundColor Gray
Write-Host "   dev_backup / Dev@2024!" -ForegroundColor Gray
Write-Host "   service_account / ServicePass123" -ForegroundColor Gray

Write-Host "`n💉 Tests SQL Injection:" -ForegroundColor White
Write-Host "   Username: admin'--" -ForegroundColor Gray
Write-Host "   Password: (cualquier cosa)" -ForegroundColor Gray

Write-Host "`n🚪 Backdoor Header:" -ForegroundColor White
Write-Host "   X-AccessDev: Testing-Mode" -ForegroundColor Gray

Write-Host "`n📁 Archivos .rest disponibles:" -ForegroundColor White
Write-Host "   requests/auth.rest - Login normal" -ForegroundColor Gray
Write-Host "   requests/sql-injection.rest - SQL Injection" -ForegroundColor Gray
Write-Host "   requests/backdoor.rest - Backdoor tests" -ForegroundColor Gray
Write-Host "   requests/admin.rest - Admin endpoints" -ForegroundColor Gray
Write-Host "   requests/complete-tests.rest - Suite completa" -ForegroundColor Gray

Write-Host "`n═════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
