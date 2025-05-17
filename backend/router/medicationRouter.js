import express from "express";
import {
  addMedication,
  getAllMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  dispenseMedication,
  getMedicationDispenseRecords,
  getPatientMedicationDispenseRecords,
  getLowStockMedications,
  getExpiringMedications
} from "../controller/medicationController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isDoctorAuthenticated,
  isAuthenticated
} from "../middlewares/auth.js";

const router = express.Router();

// Routes accessible by all authenticated users
router.get("/", isAuthenticated, getAllMedications);
router.get("/:id", isAuthenticated, getMedicationById);

// Admin-only routes for managing medications
router.post("/add", isAdminAuthenticated, addMedication);
router.put("/:id", isAdminAuthenticated, updateMedication);
router.delete("/:id", isAdminAuthenticated, deleteMedication);
router.get("/alerts/lowstock", isAdminAuthenticated, getLowStockMedications);
router.get("/alerts/expiring", isAdminAuthenticated, getExpiringMedications);

// Medication dispensing routes
router.put("/dispense/:dispenseId", isAdminAuthenticated, dispenseMedication);
router.get("/dispense/all", isAdminAuthenticated, getMedicationDispenseRecords);
router.get("/dispense/patient", isPatientAuthenticated, getPatientMedicationDispenseRecords);

export default router;
