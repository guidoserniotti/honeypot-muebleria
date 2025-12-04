# 📧 Credenciales para Login con Email

## 🎯 Usuarios Disponibles (schema.sql)

Todos estos usuarios pueden usar **email** o **username** para login.

### 👑 Usuarios Admin

```javascript
// Usuario 1 - Super Admin
email: "admin@honeypot.com";
password: "admin";

// Usuario 2 - Administrator
email: "administrator@honeypot.com";
password: "password";

// Usuario 3 - Root
email: "root@honeypot.com";
password: "root123";

// Usuario 4 - Dev Backup (Backdoor Account)
email: "dev@honeypot.com";
password: "Dev@2024!";

// Usuario 5 - Service Account
email: "service@honeypot.com";
password: "ServicePass123";
```

### 👤 Usuarios Normales

```javascript
// Usuario 6 - User
email: "user@honeypot.com";
password: "user123";

// Usuario 7 - Test User
email: "test@honeypot.com";
password: "test";

// Usuario 8 - Guest
email: "guest@honeypot.com";
password: "guest";
```

---

## 🔧 Uso desde el Frontend

### Ejemplo 1: Login con Admin

```javascript
// En el formulario de login
email: "admin@honeypot.com"
password: "admin"

// Request enviado al backend:
{
  "email": "admin@honeypot.com",
  "password": "admin"
}
```

### Ejemplo 2: Login con Usuario Normal

```javascript
email: "user@honeypot.com"
password: "user123"

// Request enviado:
{
  "email": "user@honeypot.com",
  "password": "user123"
}
```

### Ejemplo 3: SQL Injection con Email

```javascript
email: "admin@honeypot.com'--"
password: "cualquiercosa"

// Request enviado:
{
  "email": "admin@honeypot.com'--",
  "password": "cualquiercosa"
}

// Query ejecutada (VULNERABLE):
// SELECT * FROM users WHERE (username = 'admin@honeypot.com'--' OR email = 'admin@honeypot.com'--') AND password = 'cualquiercosa'
// El '--' comenta el resto, ignorando la validación de password
```

---

## ✅ Formato de Request

El backend ahora acepta **3 formatos**:

### Formato 1: Con username

```json
{
    "username": "admin",
    "password": "admin"
}
```

### Formato 2: Con email (usado por el frontend)

```json
{
    "email": "admin@honeypot.com",
    "password": "admin"
}
```

### Formato 3: Con ambos (email tiene prioridad)

```json
{
    "username": "admin",
    "email": "admin@honeypot.com",
    "password": "admin"
}
```

---

## 🧪 Testing Rápido

### Desde VS Code REST Client

Abrir el archivo: `requests/frontend-login.rest`

Ejecutar cualquier test haciendo click en "Send Request"

### Desde cURL

```bash
# Login con email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@honeypot.com",
    "password": "admin"
  }'
```

### Desde PowerShell

```powershell
$body = @{
    email = "admin@honeypot.com"
    password = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

---

## 📊 Tabla Completa de Credenciales

| #   | Username        | Email                      | Password       | Rol   |
| --- | --------------- | -------------------------- | -------------- | ----- |
| 1   | admin           | admin@honeypot.com         | admin          | admin |
| 2   | administrator   | administrator@honeypot.com | password       | admin |
| 3   | root            | root@honeypot.com          | root123        | admin |
| 4   | user            | user@honeypot.com          | user123        | user  |
| 5   | test            | test@honeypot.com          | test           | user  |
| 6   | guest           | guest@honeypot.com         | guest          | user  |
| 7   | dev_backup      | dev@honeypot.com           | Dev@2024!      | admin |
| 8   | service_account | service@honeypot.com       | ServicePass123 | admin |

---

## 💡 Respuesta Esperada

### Login Exitoso

```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@honeypot.com",
        "role": "admin"
    }
}
```

### Login Fallido

```json
{
    "error": "Invalid credentials",
    "message": "Username or password incorrect"
}
```

### Error de Validación

```json
{
    "error": "Username/Email and password are required"
}
```

---

## 🔥 Casos de Uso Comunes

### 1. Login Normal desde Frontend

```javascript
// En tu LoginForm component
const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
        email: "admin@honeypot.com", // Del input type="email"
        password: "admin", // Del input type="password"
    };

    const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.token) {
        // Guardar token
        localStorage.setItem("authToken", data.token);
        // Redirigir
        navigate("/dashboard");
    }
};
```

### 2. Probar SQL Injection desde Frontend

```javascript
// En el formulario, escribir:
Email: admin@honeypot.com'--
Password: cualquiercosa

// Esto debería loguearte como admin SIN necesitar la password correcta
```

### 3. Probar todos los usuarios programáticamente

```javascript
const usuarios = [
    { email: "admin@honeypot.com", password: "admin" },
    { email: "user@honeypot.com", password: "user123" },
    { email: "test@honeypot.com", password: "test" },
    // ... etc
];

for (const user of usuarios) {
    const response = await loginRequest(user);
    console.log(`✅ Login exitoso: ${user.email}`);
}
```

---

## 🚨 Troubleshooting

### Error: "Username/Email and password are required"

**Causa:** El formulario no está enviando el campo `email` o `password`

**Solución:** Verificar que los inputs tengan:

```jsx
<input name="email" type="email" />
<input name="password" type="password" />
```

### Error: "Invalid credentials" con credenciales correctas

**Causa:** La base de datos no está inicializada

**Solución:**

```bash
npm run init-db
```

### El SQL Injection no funciona

**Causa:** Puede que haya validación adicional

**Solución:** Verificar que el backend use `executeRawQuery()` en el login

---

## 📁 Archivos Relacionados

-   `requests/frontend-login.rest` - Tests con email
-   `requests/auth.rest` - Tests con username y email
-   `FRONTEND_GUIDE.md` - Guía completa de frontend
-   `src/controllers/authController.js` - Lógica de login

---

**¡Ahora el backend acepta login con email como espera el frontend! ✅**
