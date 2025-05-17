import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI ,{
        dbName : "Hospital-Management"
    }).then(()=>{
        console.log("Connected to Database");
    }).catch((err) => {
        console.log("Error connecting to Database");
        console.log(err);
    })
}