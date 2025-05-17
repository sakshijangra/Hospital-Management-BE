import express from "express";
import { 
    getDoctorAppointments, 
    getDoctorPatients, 
    getPatientMedicalHistory, 
    updateAppointmentStatus as doctorUpdateAppointmentStatus, 
    createPrescription, 
    getDoctorPrescriptions, 
    getDoctorProfile,
    logoutDoctor
} from "../controller/doctorController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Doctor routes requiring authentication
router.get("/appointments", isDoctorAuthenticated, getDoctorAppointments);
router.get("/patients", isDoctorAuthenticated, getDoctorPatients);
router.get("/patient/:patientId/history", isDoctorAuthenticated, getPatientMedicalHistory);
router.put("/appointment/:id/status", isDoctorAuthenticated, doctorUpdateAppointmentStatus);
router.post("/prescription/create", isDoctorAuthenticated, createPrescription);
router.get("/prescriptions", isDoctorAuthenticated, getDoctorPrescriptions);
router.get("/profile", isDoctorAuthenticated, getDoctorProfile);
router.get("/logout", isDoctorAuthenticated, logoutDoctor);

export default router;