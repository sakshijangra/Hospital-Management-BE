// models/scheduleSchema.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,  // 0-6 (Sunday-Saturday)
    required: true
  },
  timeSlots: [{
    startTime: {
      type: String,  // Format: "HH:MM" in 24-hour
      required: true
    },
    endTime: {
      type: String,  // Format: "HH:MM" in 24-hour
      required: true
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  isWorkingDay: {
    type: Boolean,
    default: true
  },
  specialHolidays: [{
    date: Date,
    reason: String
  }],
  maxPatientsPerSlot: {
    type: Number,
    default: 1
  }
});

export const Schedule = mongoose.model('Schedule', scheduleSchema);