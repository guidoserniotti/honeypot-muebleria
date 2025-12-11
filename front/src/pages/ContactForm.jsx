import { useNotification } from "../context/NotificationContext";
import { useState } from "react";

const ContactForm = () => {
    const [dataForm, setDataForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataForm((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const addContact = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Enviar datos sin validación/sanitización al endpoint vulnerable
            // Los payloads de SQL injection se envían tal cual al backend
            const response = await fetch("http://localhost:3000/api/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: dataForm.name,      // ⚠️ VULNERABLE - sin escapar
                    email: dataForm.email,    // ⚠️ VULNERABLE - sin escapar
                    message: dataForm.message, // ⚠️ VULNERABLE - sin escapar
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Mostrar detalles del error SQL (expone información del backend)
                showNotification(
                    `Error: ${responseData.error || "Error al guardar contacto"}`,
                    "error"
                );
                console.error("API Error:", responseData);
            } else {
                showNotification("Mensaje enviado correctamente", "success");

                // Limpiar formulario
                setDataForm({
                    name: "",
                    email: "",
                    message: "",
                });
            }
        } catch (error) {
            console.error("Error al enviar contacto:", error);
            showNotification("Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact">
            <h2 className="contact-title">Contacto</h2>
            
            <form
                className="contact-form"
                id="contacto-form"
                onSubmit={addContact}
            >
                <label className="contact-label">Nombre</label>
                <input
                    className="contact-input"
                    type="text"
                    id="name_form"
                    value={dataForm.name}
                    onChange={handleChange}
                    name="name"
                    required
                />

                <label className="contact-label">Email</label>
                <input
                    className="contact-input"
                    type="email"
                    id="email_form"
                    value={dataForm.email}
                    onChange={handleChange}
                    name="email"
                    required
                />

                <label className="contact-label">Mensaje</label>
                <textarea
                    className="contact-textarea"
                    id="message"
                    name="message"
                    value={dataForm.message}
                    onChange={handleChange}
                    required
                ></textarea>
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar"}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
