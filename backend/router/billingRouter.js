import express from "express";
import { 
    createInvoice,
    getInvoiceById,
    updateInvoicePaymentStatus,
    getAllInvoices,
    getPatientInvoices,
    getDoctorInvoices,
    getRevenueStatistics
} from "../controller/billingController.js";
import { 
    isAdminAuthenticated, 
    isDoctorAuthenticated, 
    isPatientAuthenticated,
    isAuthenticated 
} from "../middlewares/auth.js";

const router = express.Router();

// Create invoice - can be created by admin or the doctor who handled the appointment
router.post("/create", isAuthenticated, createInvoice);

// Get specific invoice - accessible by admin, the patient, or the doctor involved
router.get("/:id", isAuthenticated, getInvoiceById);

// Update invoice payment status - admin only
router.put("/:id/payment", isAdminAuthenticated, updateInvoicePaymentStatus);

// Get all invoices - admin only
router.get("/", isAdminAuthenticated, getAllInvoices);

// Get patient's invoices - for the patient to view their own invoices
router.get("/patient/me", isPatientAuthenticated, getPatientInvoices);

// Get doctor's invoices - for the doctor to view invoices for appointments they handled
router.get("/doctor/me", isDoctorAuthenticated, getDoctorInvoices);

// Get revenue statistics - admin only
router.get("/stats/revenue", isAdminAuthenticated, getRevenueStatistics);

export default router;