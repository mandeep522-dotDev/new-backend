import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "somthing went wrong while generating access token and refresh token");
    }
    
}

const registerUser = asyncHandler(async (req, res) => {
  // get details from frontend
  const { fullName, username, email, password } = req.body;

  // validation of data
  if (!fullName || !username || !email || !password) {
    throw new apiError(400, "all fields are required");
  }

  //email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new apiError(400, "invalid email format");
  }

  // chack if user already exists: email and username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "user already exists with email or username");
  }

  // chack image and avtar files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path; 
    }

  // console.log("avatarLocalPath :", avatarLocalPath);
  // console.log("coverImageLocalPath :", coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar files are required");
  }

  // Upload files (avatar and coverImage) to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(500, "Error uploading files to cloudinary");
  }

  // create user in db
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // remove password and refresh token fields from responce
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //chack user created or not
  if (!createdUser) {
    throw new apiError(500, "error while registring user");
  }
  //   console.log(createdUser);

  // return responce
  return res
    .status(200)
    .json(new apiResponce(201, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // get data from frontend
    const { email, username, password } = req.body;
    console.log("data is the : ",req.body);
    // validation of data
    if (!username && !email){
        throw new apiError(400, "username or email is required");
    }

    // find user from database
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new apiError(404, "user is not exists");
    }

    // chack password
    const passwordValidate = await user.isPasswordCorrect(password);
    if(!passwordValidate){
        throw new apiError(401, "invalid password");
    }

    // generate access token and refresh token
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new apiResponce(
            200,
            { user: loggedInUser, accessToken},
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) =>{
    // clear cookies
    try {
       await User.findByIdAndUpdate(req.user._id,
            {
              $set: {refreshToken: null}
            },
            {
              new: true,
            }
        )
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new apiResponce(200,{}, "user logged out"));

    } catch (error) {
        throw new apiError(500, "somthing went wrong while logout user");
    }
})

const refresAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new apiError(401, "unauthorized access, token is missing");
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken>_id);

    if(!user){
      throw new apiError(401, "invalid refresh token");
    }

    if(user?.refreshToken !== incomingRefreshToken){
      throw new apiError(401, "expired refresh token or used")
    }

    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new apiResponce(
        200,
        (accessToken),
        "access token and refresh token renew successfully"
      )
    )
  } catch (error) {
    throw new apiError(401, error?.message || "unauthorized access,invalid token")
  }
})
export { registerUser, loginUser, logoutUser, refresAccessToken };
