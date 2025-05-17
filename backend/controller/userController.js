import {catchAsyncError} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { User } from "../models/userSchema.js";
import { generateToken} from "../utils/jwtTokens.js";
import cloudinary from "cloudinary";

// export const patientRegister = catchAsyncError(async (req, res, next) => {
//     if (!req.body) {
//         return next(new ErrorHandler("Request body is missing", 400));
//     }

//     const { firstName, lastName, email, phone, password, gender, dob, role } = req.body;

//     if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !role) {
//         return next(new ErrorHandler("Please fill all the fields", 400));
//     }

//     let user = await User.findOne({ email });
//     if (user) {
//         return next(new ErrorHandler("User already exists", 400));
//     }

//     user = await User.create({
//         firstName, lastName, email, phone, password, gender, dob, role
//     });

//     res.status(200).json({
//         success: true,
//         message: "User registered successfully",
//     });
// });

export const patientRegister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, confirmPassword, gender, dob } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !gender || !dob) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const role = "Patient";

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    gender,
    dob,
    role,
  });

//   const token = user.generateJsonWebToken();
  generateToken(user, "User registered successfully", 201, res);
//   res.status(201).json({
//     success: true,
//     message: "User registered successfully",
//     token,
//     user: {
//       id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: user.role,
//     },
//   });
});


export const login = catchAsyncError(async (req,res,next) => {
    const {email, password, confirmPassword, role} = req.body;
    if (!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("Please provide all details", 400));
    }
    if (password !== confirmPassword){
        return next(new ErrorHandler("Passwords do not match", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if (!user){
        return next(new ErrorHandler("User not found", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched){
        return next(new ErrorHandler("Invalid credentials",400));
    }
    if (user.role !== role){
        return next(new ErrorHandler("User with this role not found", 400));
    }
    generateToken(user, "User logged in successfully", 201, res);
})


export const addNewAdmin = catchAsyncError(async (req,res,next) => {
	const {
		firstName,
		lastName,
		email,
		phone,
		password,
		confirmPassword,
		gender,
		dob
	} = req.body;
	if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !gender || !dob) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  	}
	const isRegistered = await User.findOne({email});
	if (isRegistered){
		return next(new ErrorHandler(`User with ${isRegistered.role} role already exists with this email`,400));
	}
	const role = "Admin";
	const admin = await User.create({
		firstName,
		lastName,
		email,
		phone,
		password,
		confirmPassword,
		gender,
		dob,
		role,
	})
	res.status(201).json({
		success : true,
		message : "Admin created successfully",
	})
})

export const getAllDoctors = catchAsyncError(async (req,res,next) => {
	const doctors = await User.find({role : 'Doctor'});
	res.status(201).json({
		success : true,
		doctors,

	})
})

export const getUserDetails = catchAsyncError(async (req,res,next) => {
	const user = req.user;
	if (!user){
		return next(new ErrorHandler("User not found",400));
	}
	res.status(201).json({
		success : true,
		user,
	})
})

export const logoutAdmin = catchAsyncError(async (req,res,next)=> {
	res.status(200).cookie("adminToken", null, {
		httpOnly : true,
		expires : new Date(Date.now()),
	}).json({
		success : true,
		message : "Admin logged out successfully",
	})
})

export const logoutPatient = catchAsyncError(async (req,res,next)=> {
	res.status(200).cookie("patientToken", null, {
		httpOnly : true,
		expires : new Date(Date.now()),
	}).json({
		success : true,
		message : "Patient logged out successfully",
	})
})

export const addNewDoctor = catchAsyncError(async (req,res,next) => {
	if (!req.files || Object.keys(req.files).length === 0){
		return next(new ErrorHandler("Doctor avatar required", 400));
	}
	const {docAvatar} = req.files;
	const allowedFormats = ["/image/jpeg", "/image/png", "/image/jpg", "/image/webp"];
	if (!allowedFormats.includes(docAvatar.mimetype)){
		return next(new ErrorHandler("Invalid file format", 400));
	}
	const {firstName, lastName, email, phone, password, gender, dob, doctorDepartment} = req.body;
	if (!firstName || !lastName || !email || !phone || !password ||!gender ||!dob || !doctorDepartment){
		return next(new ErrorHandler("Please fill all the fields", 400));
	}
	const isRegistered = await User.findOne({email});
	if (isRegistered){
		return next(new ErrorHandler(`User with ${isRegistered.role} role already exists with this email`, 400));
	}
	const cloudinaryResponse = await cloudinary.uploader.upload(
		docAvatar.tempFilePath
	)
	if (!cloudinaryResponse || cloudinaryResponse.error){
		console.error("Cloudinary Error : ", cloudinaryResponse.error || 'Unknown cloudinary error')
	}
	const doctor = await User.create({
		firstName, 
		lastName, 
		email, 
		phone, 
		password, 
		gender, 
		dob, 
		doctorDepartment,
		role : "Doctor",
		docAvatar : {
			public_id : cloudinaryResponse.public_id,
			url : cloudinaryResponse.secure_url
		}
	})
	res.status(201).json({
		success : true,
		message : "New doctor registered",
		doctor
	})
})