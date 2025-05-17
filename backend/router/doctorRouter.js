import express from "express";
import { body, param, query } from "express-validator";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { 
    getDoctorAppointments, 
    getDoctorPatients, 
    getPatientMedicalHistory,
    updateAppointmentStatus as doctorUpdateAppointmentStatus,
    createPrescription,
    getDoctorPrescriptions,
    getDoctorProfile,
    logoutDoctor,
    getDoctorDashboardStats,
    createPrescriptionTemplate,
    getPrescriptionTemplates
} from "../controller/doctorController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Security middleware
const doctorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP"
});

router.use(doctorLimiter);
router.use(mongoSanitize());

// Doctor routes
router.get("/appointments", 
  isDoctorAuthenticated,
  [
    query("status").optional().isIn(["Pending", "Accepted", "Rejected", "Completed", "Cancelled"]),
    query("fromDate").optional().isISO8601(),
    query("toDate").optional().isISO8601()
  ],
  getDoctorAppointments
);

router.get("/patients",
  isDoctorAuthenticated,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("search").optional().trim()
  ],
  getDoctorPatients
);

router.get("/patient/:patientId/history",
  isDoctorAuthenticated,
  [
    param("patientId").isMongoId(),
    query("fromDate").optional().isISO8601(),
    query("toDate").optional().isISO8601()
  ],
  getPatientMedicalHistory
);

router.put("/appointment/:id/status",
  isDoctorAuthenticated,
  [
    param("id").isMongoId(),
    body("status").isIn(["Pending", "Accepted", "Rejected", "Completed", "Cancelled", "Rescheduled"]),
    body("notes").optional().trim()
  ],
  doctorUpdateAppointmentStatus
);

router.post("/prescription/create",
  isDoctorAuthenticated,
  [
    body("patientId").isMongoId(),
    body("appointmentId").isMongoId(),
    body("diagnosis").notEmpty().trim(),
    body("medications").isArray({ min: 1 }),
    body("medications.*.name").notEmpty().trim(),
    body("medications.*.dosage").notEmpty().trim(),
    body("medications.*.frequency").isIn(["Once daily", "Twice daily", "Thrice daily", "Every 4 hours", "Every 6 hours", "Every 8 hours", "As needed", "Other"]),
    body("medications.*.duration").matches(/^(\d+\s(days|weeks|months)|(Until [a-zA-Z ]+))$/),
    body("instructions").notEmpty().trim(),
    body("templateId").optional().isMongoId()
  ],
  createPrescription
);

router.get("/prescriptions",
  isDoctorAuthenticated,
  getDoctorPrescriptions
);

router.get("/profile",
  isDoctorAuthenticated,
  getDoctorProfile
);

router.get("/dashboard/stats",
  isDoctorAuthenticated,
  getDoctorDashboardStats
);

router.post("/prescription/template",
  isDoctorAuthenticated,
  [
    body("name").notEmpty().trim(),
    body("diagnosis").optional().trim(),
    body("medications").isArray({ min: 1 }),
    body("instructions").optional().trim()
  ],
  createPrescriptionTemplate
);

router.get("/prescription/templates",
  isDoctorAuthenticated,
  getPrescriptionTemplates
);

router.get("/logout",
  isDoctorAuthenticated,
  logoutDoctor
);

export default router;