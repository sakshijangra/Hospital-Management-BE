// import jwt from "jsonwebtoken";
// import { catchAsyncError } from "./catchAsyncErrors.js";
// import ErrorHandler from "./errorMiddleware.js";
// import {User} from "../models/userSchema.js";

// export const isAdminAuthenticated = catchAsyncError(async (req, res, next) => {
//     const token = req.cookies.adminToken;
//     if (!token){
//         return next(new ErrorHandler("Admin not authenticated", 401));
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     req.user = await User.findById(decoded.id);
//     if (req.user.role !== "Admin"){
//         return next(new ErrorHandler(`${req.user.role} not authorized to access this resource`, 403));
//     }
//     next();
// })

// export const isPatientAuthenticated = catchAsyncError(async (req, res, next) => {
//     const token = req.cookies.patientToken;
//     if (!token){
//         return next(new ErrorHandler("Patient not authenticated", 401));
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     req.user = await User.findById(decoded.id);
//     if (req.user.role !== "Patient"){
//         return next(new ErrorHandler(`${req.user.role} not authorized to access this resource`, 403));
//     }
//     next();
// })

import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";
import {User} from "../models/userSchema.js";

export const isAdminAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token){
        return next(new ErrorHandler("Admin not authenticated", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Admin"){
        return next(new ErrorHandler(`${req.user.role} not authorized to access this resource`, 403));
    }
    next();
});

export const isPatientAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token){
        return next(new ErrorHandler("Patient not authenticated", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Patient"){
        return next(new ErrorHandler(`${req.user.role} not authorized to access this resource`, 403));
    }
    next();
});

export const isDoctorAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.doctorToken;
    if (!token){
        return next(new ErrorHandler("Doctor not authenticated", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Doctor"){
        return next(new ErrorHandler(`${req.user.role} not authorized to access this resource`, 403));
    }
    next();
});

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.adminToken || req.cookies.doctorToken || req.cookies.patientToken;
    if (!token){
        return next(new ErrorHandler("Not authenticated", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user){
        return next(new ErrorHandler("User not found", 404));
    }
    next();
});