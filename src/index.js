// require('dotenv').config({path: './.env'});
import dotenv from 'dotenv';
import connectDB from "./db/dbConnection.js";
import { app } from './app.js';

dotenv.config({
    path: './.env' 
});


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`server is running on port : ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log('mongo db connection faild !!! ', err);
    
})



















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