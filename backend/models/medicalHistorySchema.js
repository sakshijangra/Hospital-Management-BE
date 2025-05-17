// models/medicalHistorySchema.js
import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    name: String,
    diagnosedDate: Date,
    notes: String
  }],
  surgeries: [{
    procedure: String,
    date: Date,
    surgeon: String,
    notes: String
  }],
  familyHistory: {
    type: String
  },
  immunizations: [{
    name: String,
    date: Date,
    dueDate: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);