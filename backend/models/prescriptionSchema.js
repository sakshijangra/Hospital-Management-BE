// import mongoose from "mongoose";

// const prescriptionSchema = new mongoose.Schema({
//     patientId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: [true, 'Patient ID is required']
//     },
//     doctorId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: [true, 'Doctor ID is required']
//     },
//     appointmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Appointment',
//         required: [true, 'Appointment ID is required']
//     },
//     diagnosis: {
//         type: String,
//         required: [true, 'Diagnosis is required'],
//         trim: true
//     },
//     medications: [{
//         name: {
//             type: String,
//             required: [true, 'Medication name is required']
//         },
//         dosage: {
//             type: String,
//             required: [true, 'Dosage is required']
//         },
//         frequency: {
//             type: String,
//             required: [true, 'Frequency is required']
//         },
//         duration: {
//             type: String,
//             required: [true, 'Duration is required']
//         }
//     }],
//     instructions: {
//         type: String,
//         required: [true, 'Instructions are required'],
//         trim: true
//     },
//     followUpDate: {
//         type: Date
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// }, { timestamps: true });

// export const Prescription = mongoose.model('Prescription', prescriptionSchema);

import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required'],
        index: true  // Added for better query performance
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required'],
        index: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment ID is required']
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required'],
        trim: true,
        maxLength: [500, "Diagnosis cannot exceed 500 characters"]
    },
    medications: [{
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    validate: {
      validator: async function(v) {
        if (!v) return true; // Optional if medicationId not provided
        const med = await mongoose.model('Medication').findById(v);
        return med !== null;
      },
      message: 'Medication with ID {VALUE} not found'
    }
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxLength: [100, 'Medication name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxLength: [50, 'Dosage cannot exceed 50 characters']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: {
      values: ['Once daily', 'Twice daily', 'Thrice daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'As needed', 'Other'],
      message: '{VALUE} is not a valid frequency. Valid options are: Once daily, Twice daily, Thrice daily, Every 4/6/8 hours, As needed, Other'
    }
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    validate: {
      validator: function(v) {
        return /^(\d+\s(days|weeks|months)|(Until finished)|(Until [a-zA-Z ]+))$/.test(v);
      },
      message: 'Duration must be in format like "7 days", "2 weeks", "Until finished", or "Until next visit"'
    }
  },
  instructions: {
    type: String,
    trim: true,
    maxLength: [200, 'Instructions cannot exceed 200 characters']
  },
  isDispensed: {
    type: Boolean,
    default: false
  }
}],
    instructions: {
        type: String,
        required: [true, 'Instructions are required'],
        trim: true,
        maxLength: [1000, "Instructions cannot exceed 1000 characters"]
    },
    followUpDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || v > new Date();
            },
            message: 'Follow-up date must be in the future'
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    templateUsed: {  // Reference to template if one was used
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrescriptionTemplate'
    },
    isFulfilled: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },  // Include virtuals when converted to JSON
    toObject: { virtuals: true }
});

// Add text index for search functionality
prescriptionSchema.index({
    diagnosis: 'text',
    instructions: 'text',
    'medications.name': 'text'
});

// Virtual populate with MedicationDispense
prescriptionSchema.virtual('dispenses', {
    ref: 'MedicationDispense',
    localField: '_id',
    foreignField: 'prescriptionId',
    justOne: false
});

// Pre-save hook to validate medication references
prescriptionSchema.pre('save', async function(next) {
    if (this.medications.some(m => m.medicationId)) {
        const meds = await mongoose.model('Medication').find({
            _id: { $in: this.medications.map(m => m.medicationId).filter(Boolean) }
        });
        
        if (meds.length !== this.medications.filter(m => m.medicationId).length) {
            throw new Error('One or more medications not found');
        }
    }
    next();
});

export const Prescription = mongoose.model('Prescription', prescriptionSchema);