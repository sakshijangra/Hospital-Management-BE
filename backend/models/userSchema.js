import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
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
    validate: [validator.isEmail, 'Please provide a valid email']
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
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minLength: [6, "Password must be at least 6 characters"],
    maxLength: [20, "Password must be at most 20 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    minLength: [6, "Confirm Password must be at least 6 characters"],
    maxLength: [20, "Confirm Password must be at most 20 characters"],
    select: false,
    validate: {
      validator: function(value) {
        // this only works on CREATE and SAVE
        return value === this.password;
      },
      message: "Passwords do not match"
    }
  },
  role: {
    type: String,
    required: [true, "Please provide your role"],
    enum: ["Admin", "Patient", "Doctor"],
  },
  doctorDepartment: {
    type: String,
    enum: [
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
      "Gynecology & Obstetrics",
      "Oncology",
      "Radiology",
      "Psychiatry",
      "General Surgery",
      "ENT",
      "Gastroenterology",
      "Urology",
      "Endocrinology",
      "Pulmonology",
      "Nephrology",
      "Emergency Medicine",
      "Anesthesiology",
      "Rheumatology",
      "Ophthalmology"
    ],
    required: function() {
      return this.role === 'Doctor';
    }
  },
  docAvatar : {
    public_id : String,
    url : String,
    
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();  // Important to return here to stop execution
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);

    // Remove confirmPassword field before saving (optional but recommended)
    this.confirmPassword = undefined;

    next();
  } catch (error) {
    next(error);  // Pass error to next middleware if hashing fails
  }
});


userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id : this._id}, process.env.JWT_SECRET_KEY,{ 
        expiresIn : process.env.JWT_EXPIRES
    });
}


export const User = mongoose.model('User', userSchema);
