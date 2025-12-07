import express from "express";
import {
    createContact,
    getContacts,
    deleteContact,
    getContactDetails,
} from "../controllers/contactController.js";

const router = express.Router();

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact message (PUBLIC - VULNERABLE TO SQL INJECTION)
 * @access  Public
 * @vulnerable ⚠️ SQL Injection in name, email, message fields
 */
router.post("/", createContact);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with optional search (VULNERABLE TO SQL INJECTION)
 * @access  Public (should be admin-only in production)
 * @vulnerable ⚠️ SQL Injection in search query parameter
 */
router.get("/", getContacts);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get contact details (VULNERABLE TO SQL INJECTION)
 * @access  Public
 * @vulnerable ⚠️ SQL Injection in id parameter
 */
router.get("/:id", getContactDetails);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact (VULNERABLE TO SQL INJECTION)
 * @access  Public (should be admin-only in production)
 * @vulnerable ⚠️ SQL Injection allows mass deletion
 */
router.delete("/:id", deleteContact);

export default router;
