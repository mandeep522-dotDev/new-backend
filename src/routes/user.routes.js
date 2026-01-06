import { Router } from "express";
import {
  changeCurrentPassword,
  changeUserAvatar,
  changeUserCoverImage,
  getCurrentUser,
  getUserChannelProfile,
  getWatchedHistory,
  loginUser,
  logoutUser,
  refresAccessToken,
  registerUser,
  updeateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 2,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secured routes can be added here
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refresAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/updeat-details").patch(verifyJWT, updeateUserDetails);
router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), changeUserAvatar);
router
  .route("/cover-image")
  .post(verifyJWT, upload.single("coverImage"), changeUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchedHistory);

export default router;
