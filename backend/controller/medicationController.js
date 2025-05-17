import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Medication } from "../models/medicationSchema.js";
import { MedicationDispense } from "../models/medicationDispenseSchema.js";

// Add new medication (Admin only)
export const addMedication = catchAsyncError(async (req, res, next) => {
  const {
    name,
    description,
    category,
    strength,
    form,
    stock,
    manufacturer,
    expiryDate,
    price
  } = req.body;
  
  if (
    !name ||
    !description ||
    !category ||
    !strength ||
    !strength.value ||
    !strength.unit ||
    !form ||
    !stock ||
    !manufacturer ||
    !expiryDate ||
    !price
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  
  const medication = await Medication.create({
    name,
    description,
    category,
    strength,
    form,
    stock,
    manufacturer,
    expiryDate,
    price
  });
  
  res.status(201).json({
    success: true,
    message: "Medication added successfully",
    medication
  });
});

// Get all medications
export const getAllMedications = catchAsyncError(async (req, res, next) => {
  const medications = await Medication.find();
  
  res.status(200).json({
    success: true,
    count: medications.length,
    medications
  });
});

// Get a single medication
export const getMedicationById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  
  const medication = await Medication.findById(id);
  
  if (!medication) {
    return next(new ErrorHandler("Medication not found", 404));
  }
  
  res.status(200).json({
    success: true,
    medication
  });
});

// Update medication (Admin only)
export const updateMedication = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  
  let medication = await Medication.findById(id);
  
  if (!medication) {
    return next(new ErrorHandler("Medication not found", 404));
  }
  
  medication = await Medication.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });
  
  res.status(200).json({
    success: true,
    message: "Medication updated successfully",
    medication
  });
});

// Delete medication (Admin only)
export const deleteMedication = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  
  const medication = await Medication.findById(id);
  
  if (!medication) {
    return next(new ErrorHandler("Medication not found", 404));
  }
  
  await medication.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Medication deleted successfully"
  });
});

// Dispense medication (Pharmacist/Admin only)
export const dispenseMedication = catchAsyncError(async (req, res, next) => {
  const { dispenseId } = req.params;
  const { notes } = req.body;
  
  const dispenseRecord = await MedicationDispense.findById(dispenseId)
    .populate('medications.medicationId');
  
  if (!dispenseRecord) {
    return next(new ErrorHandler("Dispensing record not found", 404));
  }
  
  if (dispenseRecord.status === 'Dispensed') {
    return next(new ErrorHandler("Medications already dispensed", 400));
  }
  
  // Check if all medications are in stock
  for (const med of dispenseRecord.medications) {
    const medication = await Medication.findById(med.medicationId);
    
    if (!medication) {
      return next(new ErrorHandler(`Medication ${med.medicationId} not found`, 404));
    }
    
    if (medication.stock < med.quantity) {
      return next(new ErrorHandler(`Insufficient stock for ${medication.name}`, 400));
    }
    
    // Update stock
    medication.stock -= med.quantity;
    if (medication.stock === 0) {
      medication.isAvailable = false;
    }
    await medication.save();
  }
  
  // Update dispense record
  dispenseRecord.status = 'Dispensed';
  dispenseRecord.dispensedBy = req.user._id;
  dispenseRecord.dispensedAt = new Date();
  if (notes) {
    dispenseRecord.notes = notes;
  }
  
  await dispenseRecord.save();
  
  res.status(200).json({
    success: true,
    message: "Medications dispensed successfully",
    dispenseRecord
  });
});

// Get medication dispense records (Admin/Pharmacist only)
export const getMedicationDispenseRecords = catchAsyncError(async (req, res, next) => {
  const dispenseRecords = await MedicationDispense.find()
    .populate('patientId', 'firstName lastName')
    .populate('prescriptionId')
    .populate('medications.medicationId', 'name form strength')
    .populate('dispensedBy', 'firstName lastName');
  
  res.status(200).json({
    success: true,
    count: dispenseRecords.length,
    dispenseRecords
  });
});

// Get medication dispense records for patient (Patient only)
export const getPatientMedicationDispenseRecords = catchAsyncError(async (req, res, next) => {
  const patientId = req.user._id;
  
  const dispenseRecords = await MedicationDispense.find({ patientId })
    .populate('prescriptionId')
    .populate('medications.medicationId', 'name form strength')
    .populate('dispensedBy', 'firstName lastName');
  
  res.status(200).json({
    success: true,
    count: dispenseRecords.length,
    dispenseRecords
  });
});

// Get low stock medication alert (Admin only)
export const getLowStockMedications = catchAsyncError(async (req, res, next) => {
  const threshold = req.query.threshold || 10; // Default threshold is 10
  
  const lowStockMedications = await Medication.find({
    stock: { $lte: threshold }
  }).sort({ stock: 1 });
  
  res.status(200).json({
    success: true,
    count: lowStockMedications.length,
    lowStockMedications
  });
});

// Get expiring medications (Admin only)
export const getExpiringMedications = catchAsyncError(async (req, res, next) => {
  const months = req.query.months || 3; // Default is 3 months
  
  const expiryDateThreshold = new Date();
  expiryDateThreshold.setMonth(expiryDateThreshold.getMonth() + parseInt(months));
  
  const expiringMedications = await Medication.find({
    expiryDate: { $lte: expiryDateThreshold }
  }).sort({ expiryDate: 1 });
  
  res.status(200).json({
    success: true,
    count: expiringMedications.length,
    expiringMedications
  });
});