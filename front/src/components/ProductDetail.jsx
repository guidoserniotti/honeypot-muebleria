import Button from "./utils/Button";
import { getImageUrl } from "../service/products";
import { formatearPrecio, parsearPrecio } from "../utils/formatearPrecio";

// Función simple para capitalizar texto sin dependencias
const startCase = (str) => {
    return str
        .split("_")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};

const ProductDetail = ({ product, onBack, onBuy, onDelete, deleteLoading }) => {
    const imageUrl = getImageUrl(product.imagenUrl);

    return (
        <div className="product-detail">
            <div className="product-detail-left">
                <h2 className="product-detail-name">{product.nombre}</h2>
                {imageUrl && (
                    <img
                        className="product-detail-image"
                        src={imageUrl}
                        alt={product.nombre}
                    />
                )}
                <p className="product-detail-description">
                    {product.descripcion}
                </p>
                {onBack && <Button onClick={onBack} title="Volver" />}
            </div>
            <div className="product-detail-right">
                <h3 className="product-detail-title">Detalles:</h3>
                {product.detalle && (
                    <ul className="product-detail-list">
                        {Object.entries(product.detalle).map(([key, valor]) => (
                            <li
                                className={`product-detail-item ${key}`}
                                key={key}
                            >
                                <strong>{startCase(key)}:</strong>{" "}
                                {key === "precio"
                                    ? formatearPrecio(parsearPrecio(valor))
                                    : valor}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="product-detail-actions">
                    {onBuy && (
                        <Button
                            nameClass="producto-boton agregar-carrito"
                            onClick={() => onBuy(product)}
                            title="Agregar al carrito"
                        />
                    )}
                    {onDelete && (
                        <Button
                            nameClass="producto-boton"
                            onClick={onDelete}
                            title={
                                deleteLoading
                                    ? "Eliminando..."
                                    : "Eliminar producto"
                            }
                            disabled={deleteLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
