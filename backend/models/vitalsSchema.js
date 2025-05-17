// models/vitalsSchema.js
import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  temperature: {
    value: Number,
    unit: {
      type: String,
      enum: ['°C', '°F'],
      default: '°C'
    }
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    unit: {
      type: String,
      default: 'mmHg'
    }
  },
  heartRate: {
    value: Number,
    unit: {
      type: String,
      default: 'bpm'
    }
  },
  respiratoryRate: {
    value: Number,
    unit: {
      type: String,
      default: 'breaths/min'
    }
  },
  oxygenSaturation: {
    value: Number,
    unit: {
      type: String,
      default: '%'
    }
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  bmi: Number,
  notes: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate BMI automatically
vitalsSchema.pre('save', function(next) {
  if (this.height && this.height.value && this.weight && this.weight.value) {
    // Convert height to meters if in cm
    let heightInMeters = this.height.unit === 'cm' ? this.height.value / 100 : this.height.value * 0.0254;
    
    // Convert weight to kg if in lb
    let weightInKg = this.weight.unit === 'lb' ? this.weight.value * 0.453592 : this.weight.value;
    
    // Calculate BMI
    this.bmi = Math.round((weightInKg / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  next();
});

export const Vitals = mongoose.model('Vitals', vitalsSchema);