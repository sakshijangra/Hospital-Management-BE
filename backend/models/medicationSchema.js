// models/medicationSchema.js
import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  form: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Other'],
    required: true
  },
  strength: {
    value: Number,
    unit: String,
    required: true
  },
  manufacturer: String,
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'units'
    },
    batchNumber: String,
    expiryDate: Date
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  price: {
    type: Number,
    required: true
  },
  prescription: {
    required: {
      type: Boolean,
      default: true
    },
    controlledSubstance: {
      type: Boolean,
      default: false
    }
  },
  sideEffects: [String],
  contraindications: [String],
  dosageInstructions: String,
  storageInstructions: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Medication = mongoose.model('Medication', medicationSchema);