import mongoose from 'mongoose';
import validator from 'validator';

const messageSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true, 'Please provide your first name'],
        trim : true,
        minLength : [3, "First Name must be atlease 3 characters"]
    },
    lastName : {
        type : String,
        required : [true, 'Please provide your last name'],
        trim : true,
        minLength : [3, "Last Name must be atlease 3 characters"]
    },
    email : {
        type : String,
        required : [true, 'Please provide your email'],
        trim : true,
        validate : [validator.isEmail, 'Please provide a valid email'],
    },
    phone : {
        type : String,
        required : [true, 'Please provide your phone number'],
        trim : true,
        minLength : [10 , "Phone number must contain 10 digits"],
        maxLength : [10, "Phone number must contain 10 digits"],

    },
    message : {
        type : String,
        required : [true, "Please provide your message"],
        trim : true,
        minLength : [10, "Message must be atleast 10 characters"]
    }
});

export const Message = mongoose.model('Message', messageSchema);

