import { API_ENDPOINTS, getAuthHeaders, handleResponse } from "./api";

const API_BASE_URL = API_ENDPOINTS.productos;

export const getAllProducts = async () => {
    try {
        const response = await fetch(API_BASE_URL, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });
        // El backend retorna directamente el array
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const searchProducts = async (searchTerm) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/search/${encodeURIComponent(searchTerm)}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // El backend retorna { success, count, searchTerm, products }
        return data.products;
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });

        if (!response.ok) {
            const errorMessages = {
                404: "Producto inexistente",
                400: "Id inválido",
            };
            throw new Error(
                errorMessages[response.status] ||
                    `Error ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();
        // El backend retorna directamente el objeto product
        return data;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Error ${response.status}: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};
export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Error ${response.status}: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};
// Importar todas las imágenes usando Vite glob import
const images = import.meta.glob("../images/*.png", {
    eager: true,
    import: "default",
});

export const getImageUrl = (imageName) => {
    const trimmedName = imageName?.trim();

    if (!trimmedName) {
        console.warn("No image name provided");
        return null;
    }

    // Si es una URL completa, retornarla directamente
    if (/^https?:\/\//i.test(trimmedName)) {
        return trimmedName;
    }

    // El backend retorna el nombre del archivo (ej: "Sofá Patagonia.png")
    const fileName = trimmedName.split("/").pop();

    if (!fileName) {
        console.warn("Invalid image name:", trimmedName);
        return null;
    }

    // Buscar la imagen en el objeto de imágenes importadas
    const imagePath = `../images/${fileName}`;
    const imageUrl = images[imagePath];

    if (!imageUrl) {
        console.warn("Image not found:", fileName);
        return null;
    }

    return imageUrl;
};
