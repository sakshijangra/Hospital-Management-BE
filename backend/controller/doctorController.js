// import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
// import ErrorHandler from "../middlewares/errorMiddleware.js";
// import { User } from "../models/userSchema.js";
// import { Appointment } from "../models/appointmentSchema.js";
// import { Prescription } from "../models/prescriptionSchema.js";
// import { Invoice } from "../models/invoiceSchema.js";

// export const getDoctorAppointments = catchAsyncError(async (req, res, next) => {
//     const doctorId = req.user._id;

//     const appointments = await Appointment.find({ doctorId }).populate({
//         path: 'patientId',
//         select: 'firstName lastName email phone gender dob'
//     });

//     res.status(200).json({
//         success: true,
//         appointments
//     });
// });

// export const getDoctorPatients = catchAsyncError(async (req, res, next) => {
//     const doctorId = req.user._id;
    
//     // Find unique patients from appointments
//     const appointments = await Appointment.find({ doctorId });
//     const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))];
    
//     const patients = await User.find({
//         _id: { $in: patientIds },
//         role: "Patient"
//     });

//     res.status(200).json({
//         success: true,
//         patients
//     });
// });

// export const getPatientMedicalHistory = catchAsyncError(async (req, res, next) => {
//     const { patientId } = req.params;
//     const doctorId = req.user._id;

//     // Verify this doctor has appointments with this patient
//     const hasAppointment = await Appointment.findOne({ 
//         doctorId, 
//         patientId 
//     });

//     if (!hasAppointment) {
//         return next(new ErrorHandler("Not authorized to view this patient's records", 403));
//     }

//     // Get appointments, prescriptions, and invoices for this patient
//     const appointments = await Appointment.find({ patientId, doctorId });
//     const prescriptions = await Prescription.find({ patientId, doctorId });
//     const invoices = await Invoice.find({ patientId, doctorId });

//     res.status(200).json({
//         success: true,
//         medicalHistory: {
//             appointments,
//             prescriptions,
//             invoices
//         }
//     });
// });

// export const updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const doctorId = req.user._id;

//     if (!status || !["Accepted", "Rejected", "Completed"].includes(status)) {
//         return next(new ErrorHandler("Invalid status", 400));
//     }

//     let appointment = await Appointment.findById(id);
    
//     if (!appointment) {
//         return next(new ErrorHandler("Appointment not found", 404));
//     }

//     // Verify this is the doctor's appointment
//     if (appointment.doctorId.toString() !== doctorId.toString()) {
//         return next(new ErrorHandler("Not authorized to update this appointment", 403));
//     }

//     appointment = await Appointment.findByIdAndUpdate(
//         id, 
//         { 
//             status,
//             // If appointment is completed, mark as visited
//             ...(status === "Completed" && { hasVisited: true })
//         },
//         {
//             new: true,
//             runValidators: true,
//             useFindAndModify: false,
//         }
//     );

//     res.status(200).json({
//         success: true,
//         message: `Appointment ${status.toLowerCase()} successfully`,
//         appointment,
//     });
// });

// export const createPrescription = catchAsyncError(async (req, res, next) => {
//     const { 
//         patientId, 
//         appointmentId, 
//         diagnosis, 
//         medications, 
//         instructions, 
//         followUpDate 
//     } = req.body;
    
//     const doctorId = req.user._id;

//     if (!patientId || !appointmentId || !diagnosis || !medications || !instructions) {
//         return next(new ErrorHandler("Please provide all required fields", 400));
//     }

//     // Verify appointment exists and belongs to this doctor
//     const appointment = await Appointment.findOne({
//         _id: appointmentId,
//         doctorId,
//         patientId
//     });

//     if (!appointment) {
//         return next(new ErrorHandler("Appointment not found or not authorized", 404));
//     }

//     // Create prescription
//     const prescription = await Prescription.create({
//         patientId,
//         doctorId,
//         appointmentId,
//         diagnosis,
//         medications,
//         instructions,
//         followUpDate
//     });

//     // Update appointment status to indicate prescription was given
//     await Appointment.findByIdAndUpdate(
//         appointmentId,
//         { 
//             status: "Completed",
//             hasVisited: true
//         }
//     );

//     res.status(201).json({
//         success: true,
//         message: "Prescription created successfully",
//         prescription
//     });
// });

// export const getDoctorPrescriptions = catchAsyncError(async (req, res, next) => {
//     const doctorId = req.user._id;
    
//     const prescriptions = await Prescription.find({ doctorId })
//         .populate({
//             path: 'patientId',
//             select: 'firstName lastName'
//         })
//         .populate({
//             path: 'appointmentId',
//             select: 'appointmentDate'
//         });
    
//     res.status(200).json({
//         success: true,
//         prescriptions
//     });
// });

// export const getDoctorProfile = catchAsyncError(async (req, res, next) => {
//     const doctorId = req.user._id;
    
//     // Get doctor's profile
//     const doctor = await User.findById(doctorId);
    
//     if (!doctor) {
//         return next(new ErrorHandler("Doctor not found", 404));
//     }
    
//     // Get statistics
//     const totalAppointments = await Appointment.countDocuments({ doctorId });
//     const pendingAppointments = await Appointment.countDocuments({ doctorId, status: "Pending" });
//     const completedAppointments = await Appointment.countDocuments({ doctorId, hasVisited: true });
    
//     // Get total patients treated
//     const uniquePatients = await Appointment.distinct('patientId', { doctorId });
    
//     // Get revenue generated
//     const invoices = await Invoice.find({ doctorId });
//     const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
//     res.status(200).json({
//         success: true,
//         doctor,
//         stats: {
//             totalAppointments,
//             pendingAppointments,
//             completedAppointments,
//             uniquePatientCount: uniquePatients.length,
//             totalRevenue
//         }
//     });
// });

// export const logoutDoctor = catchAsyncError(async (req, res, next) => {
//     res.status(200).cookie("doctorToken", null, {
//         httpOnly: true,
//         expires: new Date(Date.now()),
//     }).json({
//         success: true,
//         message: "Doctor logged out successfully",
//     });
// });

// // controller/doctorController.js additions

// export const getDoctorDashboardStats = catchAsyncError(async (req, res, next) => {
//   const doctorId = req.user._id;
//   const today = new Date();
//   const startOfToday = new Date(today.setHours(0, 0, 0, 0));
//   const endOfToday = new Date(today.setHours(23, 59, 59, 999));
  
//   // Get today's appointments
//   const todayAppointments = await Appointment.find({
//     doctorId,
//     appointmentDate: {
//       $gte: startOfToday,
//       $lte: endOfToday
//     }
//   }).populate('patientId', 'firstName lastName gender dob');
  
//   // Get pending appointments
//   const pendingAppointments = await Appointment.find({
//     doctorId,
//     status: 'Pending'
//   }).count();
  
//   // Get recent patients (last 7 days)
//   const recentPatientsDate = new Date();
//   recentPatientsDate.setDate(recentPatientsDate.getDate() - 7);
  
//   const recentPatients = await Appointment.find({
//     doctorId,
//     hasVisited: true,
//     updatedAt: { $gte: recentPatientsDate }
//   }).distinct('patientId');
  
//   // Get pending prescriptions
//   const pendingPrescriptions = await Prescription.find({
//     doctorId,
//     createdAt: { $gte: recentPatientsDate }
//   }).count();
  
//   res.status(200).json({
//     success: true,
//     todayAppointments,
//     stats: {
//       todayAppointmentCount: todayAppointments.length,
//       pendingAppointments,
//       recentPatientCount: recentPatients.length,
//       pendingPrescriptions
//     }
//   });
// });

// // controller/doctorController.js additions

// export const generatePrescription = catchAsyncError(async (req, res, next) => {
//   const { patientId, appointmentId, diagnosis, medicationIds, instructions, followUpDate } = req.body;
  
//   const doctorId = req.user._id;
  
//   if (!patientId || !appointmentId || !diagnosis || !medicationIds || medicationIds.length === 0) {
//     return next(new ErrorHandler("Please provide all required fields", 400));
//   }
  
//   // Verify appointment exists and belongs to this doctor
//   const appointment = await Appointment.findOne({
//     _id: appointmentId,
//     doctorId,
//     patientId
//   });
  
//   if (!appointment) {
//     return next(new ErrorHandler("Appointment not found or not authorized", 404));
//   }
  
//   // Get medication details
//   const medications = [];
//   for (const med of medicationIds) {
//     const medication = await Medication.findById(med.id);
//     if (!medication) {
//       return next(new ErrorHandler(`Medication with ID ${med.id} not found`, 404));
//     }
    
//     medications.push({
//       name: medication.name,
//       dosage: med.dosage || medication.strength.value + " " + medication.strength.unit,
//       frequency: med.frequency || "As needed",
//       duration: med.duration || "7 days"
//     });
//   }
  
//   // Create prescription
//   const prescription = await Prescription.create({
//     patientId,
//     doctorId,
//     appointmentId,
//     diagnosis,
//     medications,
//     instructions,
//     followUpDate
//   });
  
//   // Update appointment status
//   await Appointment.findByIdAndUpdate(
//     appointmentId,
//     { 
//       status: "Completed",
//       hasVisited: true
//     }
//   );
  
//   // Create medication dispense record
//   const medicationDispense = await MedicationDispense.create({
//     prescriptionId: prescription._id,
//     patientId,
//     medications: medicationIds.map(med => ({
//       medicationId: med.id,
//       quantity: med.quantity || 1,
//       instructions: med.instructions || ""
//     })),
//     status: 'Pending'
//   });
  
//   res.status(201).json({
//     success: true,
//     message: "Prescription generated successfully",
//     prescription,
//     medicationDispense
//   });
// });

import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { Invoice } from "../models/invoiceSchema.js";
import { PrescriptionTemplate } from "../models/prescriptionTemplateSchema.js";
import { Medication } from "../models/medicationSchema.js";
import { MedicationDispense } from "../models/medicationDispenseSchema.js";

// Enhanced with filtering and sorting
export const getDoctorAppointments = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { status, fromDate, toDate, patientId } = req.query;

    const filter = { doctorId };
    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (fromDate && toDate) {
        filter.appointmentDate = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
        };
    }

    const appointments = await Appointment.find(filter)
        .populate({
            path: 'patientId',
            select: 'firstName lastName email phone gender dob'
        })
        .sort({ appointmentDate: 1 });

    res.status(200).json({
        success: true,
        count: appointments.length,
        appointments
    });
});

// Enhanced with pagination and search
export const getDoctorPatients = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { page = 1, limit = 10, search } = req.query;
    
    const appointments = await Appointment.find({ doctorId });
    const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))];
    
    const filter = {
        _id: { $in: patientIds },
        role: "Patient"
    };
    
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const patients = await User.find(filter)
        .select('firstName lastName email phone gender dob bloodGroup')
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: patients.length,
        total,
        patients
    });
});

// Enhanced medical history with date filtering
export const getPatientMedicalHistory = catchAsyncError(async (req, res, next) => {
    const { patientId } = req.params;
    const doctorId = req.user._id;
    const { fromDate, toDate } = req.query;

    const hasAppointment = await Appointment.findOne({ 
        doctorId, 
        patientId 
    });

    if (!hasAppointment) {
        return next(new ErrorHandler("Not authorized to view this patient's records", 403));
    }

    const dateFilter = {};
    if (fromDate && toDate) {
        dateFilter.createdAt = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
        };
    }

    const [appointments, prescriptions, invoices] = await Promise.all([
        Appointment.find({ patientId, doctorId, ...dateFilter }),
        Prescription.find({ patientId, doctorId, ...dateFilter }),
        Invoice.find({ patientId, doctorId, ...dateFilter })
    ]);

    res.status(200).json({
        success: true,
        medicalHistory: {
            appointments,
            prescriptions,
            invoices
        }
    });
});

// Enhanced with validation and logging
export const updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user._id;

    const validStatuses = ["Pending", "Accepted", "Rejected", "Completed", "Cancelled", "Rescheduled"];
    if (!status || !validStatuses.includes(status)) {
        return next(new ErrorHandler(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    let appointment = await Appointment.findById(id);
    
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    if (appointment.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized to update this appointment", 403));
    }

    const updateData = { status };
    if (notes) updateData.doctorNotes = notes;
    if (status === "Completed") updateData.hasVisited = true;

    appointment = await Appointment.findByIdAndUpdate(
        id, 
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: `Appointment ${status.toLowerCase()} successfully`,
        appointment,
    });
});

// Enhanced with template support
export const createPrescription = catchAsyncError(async (req, res, next) => {
    const { 
        patientId, 
        appointmentId, 
        diagnosis, 
        medications, 
        instructions, 
        followUpDate,
        templateId 
    } = req.body;
    
    const doctorId = req.user._id;

    // Validate required fields
    if (!patientId || !appointmentId || !diagnosis || !medications || medications.length === 0 || !instructions) {
        return next(new ErrorHandler("Please provide all required fields: patientId, appointmentId, diagnosis, medications[], and instructions", 400));
    }

    // Verify the appointment exists and belongs to this doctor-patient pair
    const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
        patientId,
        status: { $ne: "Cancelled" } // Can't create prescription for cancelled appointments
    });

    if (!appointment) {
        return next(new ErrorHandler("Valid appointment not found or not authorized", 404));
    }

    // Validate medications array
    const invalidMedications = medications.filter(med => 
        !med.name || !med.dosage || !med.frequency || !med.duration
    );
    
    if (invalidMedications.length > 0) {
        return next(new ErrorHandler(
            `Medications must include name, dosage, frequency and duration. Invalid medications at positions: ${invalidMedications.map((_, i) => i).join(', ')}`,
            400
        ));
    }

    // If using template, verify it belongs to this doctor
    let template = null;
    if (templateId) {
        template = await PrescriptionTemplate.findOne({
            _id: templateId,
            doctorId
        });
        
        if (!template) {
            return next(new ErrorHandler("Prescription template not found or not authorized", 404));
        }
    }

    // Prepare medications array with both references and direct data
    const preparedMedications = await Promise.all(
        medications.map(async med => {
            const medicationObj = {
                name: med.name.trim(),
                dosage: med.dosage.trim(),
                frequency: med.frequency.trim(),
                duration: med.duration.trim(),
                instructions: med.instructions?.trim() || ""
            };

            // If medicationId is provided, validate it exists
            if (med.medicationId) {
                const existingMed = await Medication.findById(med.medicationId);
                if (!existingMed) {
                    throw new ErrorHandler(`Medication with ID ${med.medicationId} not found`, 404);
                }
                medicationObj.medicationId = med.medicationId;
            }

            return medicationObj;
        })
    );

    // Create the prescription
    const prescription = await Prescription.create({
        patientId,
        doctorId,
        appointmentId,
        diagnosis: diagnosis.trim(),
        medications: preparedMedications,
        instructions: instructions.trim(),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        templateUsed: templateId || null,
        status: 'Active'
    });

    // Update appointment status
    await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
            status: "Completed",
            hasVisited: true,
            endTime: new Date() // Record when appointment was completed
        }
    );

    // Create initial medication dispense records
    const dispense = await MedicationDispense.create({
        prescriptionId: prescription._id,
        patientId,
        doctorId,
        medications: preparedMedications
            .filter(med => med.medicationId) // Only for medications that exist in inventory
            .map(med => ({
                medicationId: med.medicationId,
                quantity: 1, // Default quantity
                instructions: med.instructions || `Take as prescribed: ${med.dosage} ${med.frequency} for ${med.duration}`
            })),
        status: preparedMedications.some(med => med.medicationId) 
            ? 'Pending' 
            : 'No Inventory' // If no actual medication references
    });

    res.status(201).json({
        success: true,
        message: "Prescription created successfully",
        prescription,
        dispense // Include dispense information in response
    });
});

// New: Search patient records
export const searchPatientRecords = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { query } = req.query;

    if (!query || query.length < 3) {
        return next(new ErrorHandler("Search query must be at least 3 characters", 400));
    }

    const patients = await User.find({
        $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
        ],
        role: "Patient"
    }).select('_id firstName lastName');

    const results = await Promise.all(
        patients.map(async (patient) => {
            const hasAccess = await Appointment.exists({ 
                doctorId, 
                patientId: patient._id 
            });

            if (!hasAccess) return null;

            const [appointments, prescriptions] = await Promise.all([
                Appointment.countDocuments({ patientId: patient._id, doctorId }),
                Prescription.countDocuments({ patientId: patient._id, doctorId })
            ]);

            return {
                patient,
                appointmentCount: appointments,
                prescriptionCount: prescriptions
            };
        })
    );

    res.status(200).json({
        success: true,
        results: results.filter(r => r !== null)
    });
});

// New: Reschedule appointment
export const rescheduleAppointment = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;
    const doctorId = req.user._id;

    if (!newDate || !newTime || !newTime.start || !newTime.end) {
        return next(new ErrorHandler("New date and time range required", 400));
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    if (appointment.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized", 403));
    }

    const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(newDate), // Ensure date is properly cast
    $or: [
        { 
            // Case 1: Existing appointment starts before new one ends
            startTime: { $lt: newTime.end },
            endTime: { $gt: newTime.start } 
        },
        { 
            // Case 2: Existing appointment ends after new one starts
            startTime: { $lt: newTime.end },
            endTime: { $gt: newTime.start } 
        }
    ],
    _id: { $ne: id }, // Exclude current appointment
    status: { $nin: ["Cancelled", "Rejected"] } // Ignore cancelled/rejected appointments
});

    if (conflict) {
        return next(new ErrorHandler("Time slot already booked", 400));
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        {
            appointmentDate: newDate,
            startTime: newTime.start,
            endTime: newTime.end,
            status: "Rescheduled",
            rescheduleReason: reason || "Doctor requested reschedule"
        },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: "Appointment rescheduled",
        appointment: updatedAppointment
    });
});

// New: Prescription template management
export const createPrescriptionTemplate = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { name, diagnosis, medications, instructions, isFavorite } = req.body;

    if (!name || !diagnosis || !medications || medications.length === 0) {
        return next(new ErrorHandler("Name, diagnosis and at least one medication required", 400));
    }

    const template = await PrescriptionTemplate.create({
        doctorId,
        name,
        diagnosis,
        medications,
        instructions,
        isFavorite
    });

    res.status(201).json({
        success: true,
        template
    });
});

export const getPrescriptionTemplates = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { favoriteOnly } = req.query;

    const filter = { doctorId };
    if (favoriteOnly === 'true') filter.isFavorite = true;

    const templates = await PrescriptionTemplate.find(filter).sort({ isFavorite: -1, name: 1 });
    res.status(200).json({ success: true, templates });
});

export const updatePrescriptionTemplate = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    const template = await PrescriptionTemplate.findOneAndUpdate(
        { _id: id, doctorId },
        updateData,
        { new: true }
    );

    if (!template) {
        return next(new ErrorHandler("Template not found or not authorized", 404));
    }

    res.status(200).json({
        success: true,
        template
    });
});

export const deletePrescriptionTemplate = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const { id } = req.params;

    const result = await PrescriptionTemplate.deleteOne({ _id: id, doctorId });

    if (result.deletedCount === 0) {
        return next(new ErrorHandler("Template not found or not authorized", 404));
    }

    res.status(200).json({
        success: true,
        message: "Template deleted successfully"
    });
});

// Enhanced doctor profile with more stats
export const getDoctorProfile = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    
    const doctor = await User.findById(doctorId);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        uniquePatients,
        invoices,
        recentPrescriptions,
        availableTemplates
    ] = await Promise.all([
        Appointment.countDocuments({ doctorId }),
        Appointment.countDocuments({ doctorId, status: "Pending" }),
        Appointment.countDocuments({ doctorId, hasVisited: true }),
        Appointment.distinct('patientId', { doctorId }),
        Invoice.find({ doctorId }),
        Prescription.countDocuments({ doctorId, createdAt: { $gte: thirtyDaysAgo } }),
        PrescriptionTemplate.countDocuments({ doctorId })
    ]);

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    res.status(200).json({
        success: true,
        doctor,
        stats: {
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            uniquePatientCount: uniquePatients.length,
            totalRevenue,
            recentPrescriptions,
            availableTemplates
        }
    });
});

// Enhanced dashboard stats
export const getDoctorDashboardStats = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [
        todayAppointments,
        pendingAppointments,
        recentPatients,
        pendingPrescriptions,
        completedAppointments,
        revenueData
    ] = await Promise.all([
        Appointment.find({
            doctorId,
            appointmentDate: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        }).populate('patientId', 'firstName lastName gender dob'),
        Appointment.countDocuments({ doctorId, status: 'Pending' }),
        Appointment.find({
            doctorId,
            hasVisited: true,
            updatedAt: { $gte: sevenDaysAgo }
        }).distinct('patientId'),
        Prescription.countDocuments({
            doctorId,
            followUpDate: { $lte: new Date() },
            isFulfilled: false
        }),
        Appointment.countDocuments({
            doctorId,
            status: "Completed",
            createdAt: { $gte: sevenDaysAgo }
        }),
        Invoice.aggregate([
            { $match: { doctorId } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ])
    ]);
    
    res.status(200).json({
        success: true,
        todayAppointments,
        stats: {
            todayAppointmentCount: todayAppointments.length,
            pendingAppointments,
            recentPatientCount: recentPatients.length,
            pendingPrescriptions,
            completedAppointments,
            totalRevenue: revenueData[0]?.total || 0
        }
    });
});

export const logoutDoctor = catchAsyncError(async (req, res, next) => {
    res.status(200)
        .cookie("doctorToken", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        .json({
            success: true,
            message: "Doctor logged out successfully",
        });
});