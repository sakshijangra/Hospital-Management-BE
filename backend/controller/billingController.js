import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Invoice } from "../models/invoiceSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const createInvoice = catchAsyncError(async (req, res, next) => {
    const {
        patientId,
        appointmentId,
        items,
        subTotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        dueDate,
        notes
    } = req.body;

    // Check if admin or the doctor who handled the appointment
    const isAdmin = req.user.role === 'Admin';
    let doctorId;
    
    // Validate appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    doctorId = appointment.doctorId;
    
    // If it's a doctor making the request, make sure they own this appointment
    if (!isAdmin && req.user.role === 'Doctor' && req.user._id.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized to create invoice for this appointment", 403));
    }
    
    // Make sure appointment is marked as completed
    if (!appointment.hasVisited) {
        return next(new ErrorHandler("Cannot create invoice for appointment that hasn't occurred yet", 400));
    }
    
    // Check if invoice already exists for this appointment
    const existingInvoice = await Invoice.findOne({ appointmentId });
    if (existingInvoice) {
        return next(new ErrorHandler("Invoice already exists for this appointment", 400));
    }
    
    // Create invoice
    const invoice = await Invoice.create({
        patientId,
        doctorId,
        appointmentId,
        items,
        subTotal,
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        discountAmount: discountAmount || 0,
        totalAmount,
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now by default
        notes
    });
    
    res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        invoice
    });
});

export const getInvoiceById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
        .populate({
            path: 'patientId',
            select: 'firstName lastName email phone'
        })
        .populate({
            path: 'doctorId',
            select: 'firstName lastName doctorDepartment'
        })
        .populate({
            path: 'appointmentId',
            select: 'appointmentDate'
        });

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    // Check if user is authorized to view this invoice
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    
    if (
        userRole === 'Patient' && userId !== invoice.patientId._id.toString() ||
        userRole === 'Doctor' && userId !== invoice.doctorId._id.toString()
    ) {
        return next(new ErrorHandler("Not authorized to view this invoice", 403));
    }

    res.status(200).json({
        success: true,
        invoice
    });
});

export const updateInvoicePaymentStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, paidAmount } = req.body;

    if (!paymentStatus || !['Unpaid', 'Partially Paid', 'Paid'].includes(paymentStatus)) {
        return next(new ErrorHandler("Invalid payment status", 400));
    }

    if (paymentStatus !== 'Unpaid' && !paymentMethod) {
        return next(new ErrorHandler("Payment method is required", 400));
    }

    let invoice = await Invoice.findById(id);
    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    // Only admin can update payment status
    if (req.user.role !== 'Admin') {
        return next(new ErrorHandler("Only admin can update payment status", 403));
    }

    invoice = await Invoice.findByIdAndUpdate(
        id,
        {
            paymentStatus,
            paymentMethod: paymentMethod || invoice.paymentMethod,
            paidAmount: paidAmount || invoice.paidAmount
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );

    res.status(200).json({
        success: true,
        message: "Invoice payment status updated successfully",
        invoice
    });
});

export const getAllInvoices = catchAsyncError(async (req, res, next) => {
    // Only admin can see all invoices
    if (req.user.role !== 'Admin') {
        return next(new ErrorHandler("Not authorized to view all invoices", 403));
    }
    
    const invoices = await Invoice.find()
        .populate({
            path: 'patientId',
            select: 'firstName lastName'
        })
        .populate({
            path: 'doctorId',
            select: 'firstName lastName doctorDepartment'
        });
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paidRevenue = invoices.reduce((sum, invoice) => 
        invoice.paymentStatus === 'Paid' ? sum + invoice.totalAmount : sum, 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    
    res.status(200).json({
        success: true,
        invoices,
        stats: {
            totalRevenue,
            paidRevenue,
            pendingRevenue,
            invoiceCount: invoices.length
        }
    });
});

export const getPatientInvoices = catchAsyncError(async (req, res, next) => {
    const patientId = req.user._id;
    
    const invoices = await Invoice.find({ patientId })
        .populate({
            path: 'doctorId',
            select: 'firstName lastName doctorDepartment'
        })
        .populate({
            path: 'appointmentId',
            select: 'appointmentDate'
        });
    
    const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, invoice) => 
        invoice.paymentStatus === 'Paid' ? sum + invoice.totalAmount : 
        invoice.paymentStatus === 'Partially Paid' ? sum + invoice.paidAmount : sum, 0);
    const totalDue = totalBilled - totalPaid;
    
    res.status(200).json({
        success: true,
        invoices,
        stats: {
            totalBilled,
            totalPaid,
            totalDue
        }
    });
});

export const getDoctorInvoices = catchAsyncError(async (req, res, next) => {
    const doctorId = req.user._id;
    
    const invoices = await Invoice.find({ doctorId })
        .populate({
            path: 'patientId',
            select: 'firstName lastName'
        })
        .populate({
            path: 'appointmentId',
            select: 'appointmentDate'
        });
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    res.status(200).json({
        success: true,
        invoices,
        stats: {
            totalRevenue,
            invoiceCount: invoices.length
        }
    });
});

export const getRevenueStatistics = catchAsyncError(async (req, res, next) => {
    // Only admin can access revenue statistics
    if (req.user.role !== 'Admin') {
        return next(new ErrorHandler("Not authorized to view revenue statistics", 403));
    }
    
    // Get total revenue
    const allInvoices = await Invoice.find();
    const totalRevenue = allInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paidRevenue = allInvoices.reduce((sum, invoice) => 
        invoice.paymentStatus === 'Paid' ? sum + invoice.totalAmount : 
        invoice.paymentStatus === 'Partially Paid' ? sum + invoice.paidAmount : sum, 0);
    
    // Revenue by department
    const doctors = await User.find({ role: 'Doctor' });
    const departments = [...new Set(doctors.map(doc => doc.doctorDepartment))];
    
    // Initialize department revenue data
    const departmentRevenue = {};
    for (const dept of departments) {
        departmentRevenue[dept] = 0;
    }
    
    // Calculate revenue for each department
    for (const invoice of allInvoices) {
        const doctor = await User.findById(invoice.doctorId);
        if (doctor && doctor.doctorDepartment) {
            departmentRevenue[doctor.doctorDepartment] += invoice.totalAmount;
        }
    }
    
    // Monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = Array(12).fill(0);
    
    for (const invoice of allInvoices) {
        const invoiceDate = new Date(invoice.createdAt);
        if (invoiceDate.getFullYear() === currentYear) {
            monthlyRevenue[invoiceDate.getMonth()] += invoice.totalAmount;
        }
    }
    
    res.status(200).json({
        success: true,
        statistics: {
            totalRevenue,
            paidRevenue,
            uncollectedRevenue: totalRevenue - paidRevenue,
            invoiceCount: allInvoices.length,
            departmentRevenue,
            monthlyRevenue
        }
    });
});