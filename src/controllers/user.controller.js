import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/ApiResponce.js";

const registerUser = asyncHandler(async (req, res) => {
  // get details from frontend
  const { fullName, username, email, password } = req.body;
  console.log("password is :", password);

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
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "user already exists with email or username");
  }

  // chack image and avtar files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("avatarLocalPath :", avatarLocalPath);
  console.log("coverImageLocalPath :", coverImageLocalPath);
  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new apiError(400, "Avatar or coverImage files are required");
  }

  // Upload files (avatar and coverImage) to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar || !coverImage) {
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
    throw new apiError(500, "error by while registring user");
  }
  console.log(createdUser);

  // return responce
  return res
    .status(200)
    .json(new apiResponce(201, createdUser, "user registered successfully"));
});

export { registerUser };
