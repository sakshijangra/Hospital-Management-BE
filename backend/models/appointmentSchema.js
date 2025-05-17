import mongoose, { mongo } from "mongoose";
import validate from "validator";

const appointmentSchema = new mongoose.Schema({
        firstName: {
        type: String,
        required: [true, 'Please provide your first name'],
        trim: true,
        minLength: [3, "First Name must be at least 3 characters"]
      },
      lastName: {
        type: String,
        required: [true, 'Please provide your last name'],
        trim: true,
        minLength: [3, "Last Name must be at least 3 characters"]
      },
      email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        validate: [validate.isEmail, 'Please provide a valid email']
      },
      phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        trim: true,
        minLength: [10, "Phone number must contain 10 digits"],
        maxLength: [10, "Phone number must contain 10 digits"],
      },
      dob: {
        type: Date,
        required: [true, 'Please provide your date of birth'],
        validate: {
          validator: function(value) {
            return value < new Date();
          },
          message: 'Date of birth must be in the past'
        }
      },
      gender: {
        type: String,
        required: [true, 'Please provide your gender'],
        enum: ["Male", "Female", "Others", "Prefer not to say"],
        default: "Male"
      },
      appintmentDate : {
        type : String,
        required : true
      },
      department : {
        type : String,
        required : true,
      },
      doctor : {
        firstName : {
            type : String,
            required : true
        },
        lastName : {
            type : String,
            required : true
        }
      },
      hasVisited : {
        type : Boolean,
        default : false
      },
      doctorId : {
        type : mongoose.Schema.ObjectId,
        required : true
      },
      patientId : {
        type : mongoose.Schema.ObjectId,
        required : true
      },
      address : {
        type : String, 
        required : true
      },
      status : {
        type : String,
        enum : ["Pending", "Accepted", "Rejected"],
        default : "Pending"
      }
})

// Enhanced appointment model with waiting time calculations
// models/appointmentSchema.js additions

// Add fields for time tracking
appointmentSchema.add({
  scheduledTime: {
    type: String,  // Format: "HH:MM" in 24-hour
    required: true
  },
  checkInTime: Date,
  startTime: Date,  // When doctor started the appointment
  endTime: Date,    // When appointment ended
  waitingTime: Number,  // In minutes
  consultationDuration: Number  // In minutes
});

// Add method to calculate waiting time
appointmentSchema.methods.recordStart = async function() {
  this.startTime = new Date();
  if (this.checkInTime) {
    this.waitingTime = Math.round((this.startTime - this.checkInTime) / 60000);
  }
  await this.save();
};

appointmentSchema.methods.recordEnd = async function() {
  this.endTime = new Date();
  if (this.startTime) {
    this.consultationDuration = Math.round((this.endTime - this.startTime) / 60000);
  }
  await this.save();
};

export const Appointment = mongoose.model("Appointment", appointmentSchema)