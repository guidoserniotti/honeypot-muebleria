# Honeypot Security Lab - Frontend

Frontend para un laboratorio de seguridad educativo diseñado para practicar técnicas de pentesting y análisis de vulnerabilidades.

## ADVERTENCIA DE SEGURIDAD

**ESTE ES UN ENTORNO VULNERABLE INTENCIONALMENTE**

-   **NO USAR EN PRODUCCIÓN**
-   **NO EXPONER A INTERNET**
-   **SOLO PARA AMBIENTES CONTROLADOS**
-   Solo para propósitos educativos
-   Usar en Docker/VM aislada
-   Para entrenamiento en seguridad

## Características del Honeypot

### Vulnerabilidades Implementadas (Frontend)

1. **Información Sensible en Código Fuente**

    - Comentarios HTML con credenciales de backdoor
    - Variables de entorno expuestas
    - Headers personalizados documentados

2. **Backdoor de Desarrollo**

    - Header `X-AccessDev: Testing-Mode` bypass autenticación
    - Documentado "accidentalmente" en `index.html`
    - Variable de entorno `VITE_DEV_BYPASS_ENABLED`

3. **Configuración Insegura**
    - Credenciales en archivos `.env`
    - Tokens almacenados en localStorage
    - CORS permisivo

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## Uso con Docker (Próximamente)

El backend vulnerable con Express.js y MySQL estará dockerizado para un entorno aislado.

```bash
# Iniciar todo el laboratorio
docker-compose up -d
```

## Estructura del Proyecto

```
front/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/           # Páginas de la aplicación
│   ├── service/         # API y servicios
│   │   └── api.js       # Contiene lógica de backdoor
│   ├── auth/            # Contexto de autenticación
│   ├── context/         # Providers globales
│   └── utils/           # Utilidades
├── index.html           # Contiene comentarios con info sensible
├── .env                 # Configuración vulnerable
└── README.md
```

## Pistas Ocultas para Hackers

### 1. **Comentario en HTML**

Revisa el código fuente de `index.html` para encontrar información sobre el header de backdoor.

### 2. **Variables de Entorno**

El archivo `.env` contiene configuración que podría ser útil.

### 3. **LocalStorage**

Los tokens de autenticación se almacenan en el navegador.

### 4. **Headers Personalizados**

Hay un header especial que permite bypass de autenticación.

## Objetivo Educativo

Este proyecto está diseñado para:

1. **Aprender sobre vulnerabilidades comunes**

    - Information disclosure
    - Insecure direct object references
    - Broken authentication

2. **Practicar pentesting**

    - Reconocimiento
    - Enumeración
    - Explotación

3. **Análisis forense**
    - Identificar IOCs
    - Rastrear actividad maliciosa
    - Generar reportes de incidentes

## Escenarios de Aprendizaje

### Nivel Principiante

-   [ ] Encontrar el comentario con el header secreto
-   [ ] Probar el header `X-AccessDev: Testing-Mode`
-   [ ] Inspeccionar localStorage

### Nivel Intermedio

-   [ ] Explotar SQL injection en el backend (próximamente)
-   [ ] Extraer datos de usuarios
-   [ ] Escalación de privilegios

### Nivel Avanzado

-   [ ] Análisis completo de logs
-   [ ] Mapeo MITRE ATT&CK
-   [ ] Reporte de incidente completo

## Recursos de Aprendizaje

-   [OWASP Top 10](https://owasp.org/www-project-top-ten/)
-   [MITRE ATT&CK Framework](https://attack.mitre.org/)
-   [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Próximos Pasos

El backend vulnerable incluirá:

-   SQL Injection en endpoints de login
-   Credenciales débiles (admin/admin)
-   Base de datos MySQL con datos falsos
-   Logging de actividad sospechosa
-   Docker Compose para aislamiento

## Licencia

MIT License - Solo uso educativo

## Descargo de Responsabilidad

Este software contiene vulnerabilidades intencionalmente. Los autores no se hacen responsables por el uso indebido. Solo para educación en ciberseguridad.

**NUNCA uses estas técnicas en sistemas que no te pertenezcan o sin autorización explícita.**

---

**¿Listo para hackear?**

Explora, aprende y mejora tus habilidades de seguridad de manera ética y legal.

## Estado Actual del Proyecto (resumen rápido)

-   Fecha: 2024-12-07
-   El frontend incluye el formulario de contacto (`ContactForm.jsx`) que envía peticiones `POST` a `http://localhost:3000/api/contacts`.
-   En el backend existe soporte para una tabla `contacts` y endpoints asociados; algunos de esos endpoints son intencionalmente vulnerables a SQL Injection. Durante el desarrollo se exploró añadir un modo de simulación (`?simulate=true`) para inspeccionar la SQL construida sin ejecutarla, pero esa funcionalidad quedó en pausa.
-   Para pruebas y explotación controlada revisa los ejemplos en `Backend/requests/` (por ejemplo `contact-injection.rest`).
-   Antes de probar, inicializa la base de datos y arranca el backend:

```powershell
cd Backend
npm run init-db
npm run dev
```

-   Nota: La base de datos de laboratorio contiene usuarios con contraseñas frágiles y datos de ejemplo. No reutilizar en otros entornos.
