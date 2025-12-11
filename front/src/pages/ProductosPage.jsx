import { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useNavigate } from "react-router-dom";
import {
    useLoadingNotification,
    useErrorNotification,
} from "../hooks/useNotifications";
import { searchProducts } from "../service/products";
import ProductList from "../components/ProductList";
import "./ProductosPage.css";

function ProductosPage() {
    const { products: allProducts, loading, messageError } = useProducts();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    // Usar hooks personalizados para manejar notificaciones
    useLoadingNotification(loading, "Cargando productos...");
    useErrorNotification(messageError, "Error");

    // Actualizar productos filtrados cuando cambian los productos
    useEffect(() => {
        setFilteredProducts(allProducts);
    }, [allProducts]);

    const handleProductClick = (product) => {
        console.log("Product clicked:", product);
        console.log("Product ID:", product.id);
        navigate(`/productos/${product.id}`);
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            setFilteredProducts(allProducts);
            return;
        }

        setIsSearching(true);
        try {
            console.log("🔍 Searching for:", searchTerm);
            const results = await searchProducts(searchTerm);
            setFilteredProducts(results);
        } catch (error) {
            console.error("Error en búsqueda:", error);
            setFilteredProducts([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setFilteredProducts(allProducts);
    };

    return (
        <div className="contenedor">
            <h1>Productos</h1>

            {/* Buscador vulnerable a SQL Injection */}
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar productos... (vulnerable a SQLi)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="search-button"
                        disabled={isSearching}
                    >
                        {isSearching ? "Buscando..." : "Buscar"}
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-button"
                            onClick={handleClearSearch}
                        >
                            Limpiar
                        </button>
                    )}
                </form>
                {searchTerm && (
                    <p className="search-info">
                        Resultados para: <strong>{searchTerm}</strong> (
                        {filteredProducts.length} productos)
                    </p>
                )}
            </div>

            {!loading && (
                <ProductList
                    catalogo={filteredProducts}
                    onClick={handleProductClick}
                />
            )}
        </div>
    );
}

export default ProductosPage;
