// import express from "express";
// import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus } from "../controller/appointmentController.js";
// import {isAdminAuthenticated, isPatientAuthenticated} from "../middlewares/auth.js";

// const router = express.Router();

// router.post("/post",isPatientAuthenticated, postAppointment)
// router.get("/getall", isAdminAuthenticated, getAllAppointments)
// router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus)
// router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment)

// export default router;

import express from "express";
import { 
    deleteAppointment, 
    getAllAppointments, 
    postAppointment, 
    updateAppointmentStatus,
    getPatientAppointments,
    checkInAppointment 
} from "../controller/appointmentController.js";
import { 
    isAdminAuthenticated, 
    isPatientAuthenticated, 
    isDoctorAuthenticated 
} from "../middlewares/auth.js";

const router = express.Router();

// Patient routes
router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/patient/me", isPatientAuthenticated, getPatientAppointments);
router.put("/checkin/:id", isPatientAuthenticated, checkInAppointment);

// Admin routes
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;