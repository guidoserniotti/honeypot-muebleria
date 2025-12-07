import express from "express";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

/**
 * @route POST /api/orders
 * @desc  Crear orden (recalcula precios en servidor)
 * @access Authenticated (but in this honeypot it's permissive)
 */
router.post("/", createOrder);

export default router;
