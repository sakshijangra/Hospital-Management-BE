import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { Invoice } from "../models/invoiceSchema.js";

export const getDoctorAppointments = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId }).populate({
        path: 'patientId',
        select: 'firstName lastName email phone gender dob'
    });

    res.status(200).json({
        success: true,
        appointments
    });
});

export const getDoctorPatients = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    
    // Find unique patients from appointments
    const appointments = await Appointment.find({ doctorId });
    const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))];
    
    const patients = await User.find({
        _id: { $in: patientIds },
        role: "Patient"
    });

    res.status(200).json({
        success: true,
        patients
    });
});

export const getPatientMedicalHistory = catchAsyncError(async (req, res, next) => {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Verify this doctor has appointments with this patient
    const hasAppointment = await Appointment.findOne({ 
        doctorId, 
        patientId 
    });

    if (!hasAppointment) {
        return next(new ErrorHandler("Not authorized to view this patient's records", 403));
    }

    // Get appointments, prescriptions, and invoices for this patient
    const appointments = await Appointment.find({ patientId, doctorId });
    const prescriptions = await Prescription.find({ patientId, doctorId });
    const invoices = await Invoice.find({ patientId, doctorId });

    res.status(200).json({
        success: true,
        medicalHistory: {
            appointments,
            prescriptions,
            invoices
        }
    });
});

export const updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user._id;

    if (!status || !["Accepted", "Rejected", "Completed"].includes(status)) {
        return next(new ErrorHandler("Invalid status", 400));
    }

    let appointment = await Appointment.findById(id);
    
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    // Verify this is the doctor's appointment
    if (appointment.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized to update this appointment", 403));
    }

    appointment = await Appointment.findByIdAndUpdate(
        id, 
        { 
            status,
            // If appointment is completed, mark as visited
            ...(status === "Completed" && { hasVisited: true })
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: `Appointment ${status.toLowerCase()} successfully`,
        appointment,
    });
});

export const createPrescription = catchAsyncError(async (req, res, next) => {
    const { 
        patientId, 
        appointmentId, 
        diagnosis, 
        medications, 
        instructions, 
        followUpDate 
    } = req.body;
    
    const doctorId = req.user._id;

    if (!patientId || !appointmentId || !diagnosis || !medications || !instructions) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
        patientId
    });

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found or not authorized", 404));
    }

    // Create prescription
    const prescription = await Prescription.create({
        patientId,
        doctorId,
        appointmentId,
        diagnosis,
        medications,
        instructions,
        followUpDate
    });

    // Update appointment status to indicate prescription was given
    await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
            status: "Completed",
            hasVisited: true
        }
    );

    res.status(201).json({
        success: true,
        message: "Prescription created successfully",
        prescription
    });
});

export const getDoctorPrescriptions = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    
    const prescriptions = await Prescription.find({ doctorId })
        .populate({
            path: 'patientId',
            select: 'firstName lastName'
        })
        .populate({
            path: 'appointmentId',
            select: 'appointmentDate'
        });
    
    res.status(200).json({
        success: true,
        prescriptions
    });
});

export const getDoctorProfile = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    
    // Get doctor's profile
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
        return next(new ErrorHandler("Doctor not found", 404));
    }
    
    // Get statistics
    const totalAppointments = await Appointment.countDocuments({ doctorId });
    const pendingAppointments = await Appointment.countDocuments({ doctorId, status: "Pending" });
    const completedAppointments = await Appointment.countDocuments({ doctorId, hasVisited: true });
    
    // Get total patients treated
    const uniquePatients = await Appointment.distinct('patientId', { doctorId });
    
    // Get revenue generated
    const invoices = await Invoice.find({ doctorId });
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    res.status(200).json({
        success: true,
        doctor,
        stats: {
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            uniquePatientCount: uniquePatients.length,
            totalRevenue
        }
    });
});

export const logoutDoctor = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("doctorToken", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "Doctor logged out successfully",
    });
});