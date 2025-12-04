# 🔓 Vulnerabilidades Intencionadas

Este documento lista todas las vulnerabilidades implementadas intencionalmente en el honeypot para propósitos educativos.

## 🎯 Frontend (React + Vite)

### 1. Information Disclosure - HTML Comments

**Ubicación**: `index.html`
**Severidad**: 🔴 CRÍTICA
**OWASP**: A01:2021 - Broken Access Control

```html
<!-- Comentario revelando backdoor de desarrollo -->
X-AccessDev: Testing-Mode
```

**Explotación**:
Los atacantes pueden ver el código fuente HTML y descubrir el header secreto que permite bypass de autenticación.

**Impacto**:

-   Acceso completo sin credenciales
-   Bypass de todos los controles de acceso
-   Exposición de funcionalidad administrativa

---

### 2. Insecure Configuration - Environment Variables Exposed

**Ubicación**: `.env`, `.env.example`
**Severidad**: 🟠 ALTA
**OWASP**: A05:2021 - Security Misconfiguration

```env
VITE_API_URL=http://localhost:3000/api
VITE_DEV_BYPASS_ENABLED=true
```

**Explotación**:
Variables de entorno con configuración sensible expuestas en el repositorio.

**Impacto**:

-   Revelar URLs del backend
-   Confirmar existencia de backdoor
-   Mapeo de infraestructura

---

### 3. Insecure Storage - Tokens in LocalStorage

**Ubicación**: `src/auth/`, `src/service/`
**Severidad**: 🟠 ALTA
**OWASP**: A07:2021 - Identification and Authentication Failures

```javascript
localStorage.setItem("authToken", token);
```

**Explotación**:

-   XSS puede robar tokens fácilmente
-   No hay expiración automática
-   Tokens persisten después de logout

**Impacto**:

-   Robo de sesión
-   Persistencia de acceso
-   Escalación de privilegios

---

### 4. Custom Backdoor Header

**Ubicación**: `src/service/api.js`
**Severidad**: 🔴 CRÍTICA
**OWASP**: A01:2021 - Broken Access Control

```javascript
if (import.meta.env.VITE_DEV_BYPASS_ENABLED === "true") {
    headers["X-AccessDev"] = "Testing-Mode";
}
```

**Explotación**:

```bash
curl -H "X-AccessDev: Testing-Mode" http://localhost:3000/api/admin/users
```

**Impacto**:

-   Bypass completo de autenticación
-   Acceso a endpoints protegidos
-   Enumeración de usuarios

---

### 5. Client-Side Security Controls

**Ubicación**: `src/routes/ProtectedRoute.js`, `src/routes/AdminRoute.js`
**Severidad**: 🟡 MEDIA
**OWASP**: A04:2021 - Insecure Design

**Explotación**:
Controles de acceso implementados solo en frontend pueden ser bypasseados manipulando el código JavaScript o usando herramientas como DevTools.

**Impacto**:

-   Acceso a rutas "protegidas"
-   Visualización de componentes admin
-   False sense of security

---

### 6. Verbose Error Messages

**Ubicación**: `src/service/*.js`
**Severidad**: 🟡 MEDIA
**OWASP**: A09:2021 - Security Logging and Monitoring Failures

```javascript
const errorMessage = errorData.message || `Error ${response.status}`;
throw new Error(errorMessage);
```

**Explotación**:
Mensajes de error detallados pueden revelar:

-   Estructura de base de datos
-   Stack traces
-   Versiones de software
-   Rutas de archivos internos

---

## 🎓 Objetivos de Aprendizaje

### Para Atacantes (Red Team)

1. Realizar reconocimiento del código fuente
2. Identificar comentarios y configuraciones inseguras
3. Explotar backdoors documentados
4. Bypass de autenticación client-side

### Para Defensores (Blue Team)

1. Identificar information disclosure
2. Detectar uso de headers no estándar
3. Analizar patrones de acceso sospechosos
4. Implementar controles de seguridad apropiados

---

## 🛡️ Remediación (NO Implementar en Honeypot)

### Correcciones Recomendadas (Para Aprendizaje)

1. **Eliminar comentarios sensibles del HTML**

    ```html
    <!-- NO incluir información de configuración -->
    ```

2. **Nunca exponer .env en repositorios**

    ```gitignore
    .env
    .env.local
    ```

3. **Usar httpOnly cookies para tokens**

    ```javascript
    // En lugar de localStorage
    document.cookie = "token=...; httpOnly; secure; sameSite=strict";
    ```

4. **Validación server-side obligatoria**

    - Nunca confiar en controles client-side
    - Implementar autenticación y autorización en backend

5. **Eliminar headers de desarrollo en producción**

    ```javascript
    // NO incluir backdoors en código productivo
    ```

6. **Logging apropiado sin información sensible**
    ```javascript
    console.error("Authentication failed"); // Generic
    // NO: console.error('User admin@example.com password incorrect')
    ```

---

## 📊 MITRE ATT&CK Mapping

| Técnica                       | ID        | Implementado           |
| ----------------------------- | --------- | ---------------------- |
| Valid Accounts                | T1078     | ✅ Backdoor header     |
| Web Service                   | T1102     | ✅ API calls           |
| Browser Session Hijacking     | T1185     | ✅ LocalStorage tokens |
| Credentials from Web Browsers | T1555.003 | ✅ Token theft         |

---

## ⚠️ Disclaimer

Estas vulnerabilidades son **INTENCIONADAS** para propósitos educativos.

**NO implementar en aplicaciones reales.**

El backend (próximamente) incluirá vulnerabilidades adicionales:

-   SQL Injection
-   Weak passwords (admin/admin)
-   Missing rate limiting
-   No input validation
-   Insecure direct object references

---

**Fecha de creación**: Diciembre 2025  
**Propósito**: Laboratorio de Seguridad Educativo  
**Ambiente**: Docker aislado únicamente
