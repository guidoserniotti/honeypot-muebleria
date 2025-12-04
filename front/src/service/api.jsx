// Configuración centralizada de la API
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Función para obtener headers de autenticación desde localStorage
export const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // ⚠️ BACKDOOR DE DESARROLLO - NUNCA EN PRODUCCIÓN ⚠️
    // Si está habilitado el bypass de dev, agregar el header secreto
    if (import.meta.env.VITE_DEV_BYPASS_ENABLED === "true") {
        // Este header permite bypass de autenticación en el backend
        headers["X-AccessDev"] = "Testing-Mode";
    }

    return headers;
};

// Función helper para manejar errores HTTP
export const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
            errorData.message ||
            `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return await response.json();
};

// URLs de endpoints
export const API_ENDPOINTS = {
    productos: `${API_BASE_URL}/productos`,
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
    },
    user: {
        base: `${API_BASE_URL}/user`,
        register: `${API_BASE_URL}/user/register`,
        login: `${API_BASE_URL}/user/login`,
        logout: `${API_BASE_URL}/user/logout`,
    },
    orders: `${API_BASE_URL}/orders`,
};

export default API_BASE_URL;
