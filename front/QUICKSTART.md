# 🚀 Quick Start - Honeypot Frontend

## Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en: `http://localhost:5173`

## 📋 Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
npm run lint     # Ejecutar ESLint
```

## 🔍 Primeros Pasos para Exploración

### 1. Revisar el código fuente del HTML

```bash
# Ver comentarios sospechosos en index.html
cat index.html
```

### 2. Explorar configuración

```bash
# Variables de entorno expuestas
cat .env
```

### 3. Buscar backdoors en el código

```bash
# Buscar el header secreto
grep -r "X-AccessDev" src/
```

### 4. Inspeccionar API calls

Archivo: `src/service/api.js`

-   Buscar la función `getAuthHeaders()`
-   Ver cómo se agrega el header secreto

## 🎯 Vulnerabilidades a Explorar

1. **Header Backdoor**: `X-AccessDev: Testing-Mode`
2. **Variables de entorno**: `.env` con configuración sensible
3. **Comentarios HTML**: Información en `index.html`
4. **LocalStorage**: Tokens almacenados inseguramente
5. **Client-side auth**: Rutas protegidas solo en frontend

## 🐳 Próximos Pasos

El backend estará disponible próximamente con:

-   Express.js + MySQL
-   SQL Injection vulnerable
-   Credenciales débiles (admin/admin)
-   Docker Compose para ambiente aislado

## 📚 Documentación Completa

-   `README.md` - Documentación completa del proyecto
-   `VULNERABILITIES.md` - Lista detallada de vulnerabilidades
-   `../backend/README.md` - Documentación del backend (próximamente)

## ⚠️ Recordatorio de Seguridad

Este es un **HONEYPOT EDUCATIVO** con vulnerabilidades intencionales.

-   ❌ NO usar en producción
-   ❌ NO exponer a internet
-   ✅ Solo para aprendizaje
-   ✅ Usar en ambiente Docker aislado

---

**¿Listo para explorar?** 🕵️

Comienza revisando el archivo `index.html` para encontrar tu primera pista...
