import { apiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization").replace(" Bearer ", "");
    
        if(!token){
            throw new apiError(401, "unauthorized access, token is missing");
        }
        //verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new apiError(404, "user is not found");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "unauthorized access, invalid token")
    }

})