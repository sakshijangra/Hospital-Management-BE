import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment ID is required']
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required'],
        trim: true
    },
    medications: [{
        name: {
            type: String,
            required: [true, 'Medication name is required']
        },
        dosage: {
            type: String,
            required: [true, 'Dosage is required']
        },
        frequency: {
            type: String,
            required: [true, 'Frequency is required']
        },
        duration: {
            type: String,
            required: [true, 'Duration is required']
        }
    }],
    instructions: {
        type: String,
        required: [true, 'Instructions are required'],
        trim: true
    },
    followUpDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Prescription = mongoose.model('Prescription', prescriptionSchema);