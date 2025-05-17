// models/medicationDispenseSchema.js
import mongoose from "mongoose";

const medicationDispenseSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    instructions: String,
    batchNumber: String,
    expiryDate: Date,
    dispensedQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Partially Dispensed', 'Dispensed', 'Unavailable'],
      default: 'Pending'
    }
  }],
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Ready for Pickup', 'Dispensed', 'Partially Dispensed', 'Cancelled'],
    default: 'Pending'
  },
  dispensedDate: Date,
  notes: String,
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  totalCost: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const MedicationDispense = mongoose.model('MedicationDispense', medicationDispenseSchema);