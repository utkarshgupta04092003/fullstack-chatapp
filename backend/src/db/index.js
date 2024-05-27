import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () =>{
    try{
        const connectInstance = await mongoose.connect(`${process.env.MONGO_URI}`, {dbName: DB_NAME});
        console.log('DB connected host: ', connectInstance.connection.host)
    }
    catch(err){
        console.log("Error", err);
        throw err
    }
}