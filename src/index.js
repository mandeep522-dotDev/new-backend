// require('dotenv').config({path: './.env'});
import dotenv from 'dotenv';
import connectDB from "./db/dbConnection.js";

dotenv.config({
     path: './.env' 
    });
connectDB();




















/*
import express from 'express';
const app = express();
const port = process.env.PORT
(async ()=>{
    try {
       mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on("error", (error)=>{
            console.logI("ERROR :", error);
            throw error;
        }); 
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
})();
*/