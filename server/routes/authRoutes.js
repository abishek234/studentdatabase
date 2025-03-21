const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.signup);
router.post("/login", authController.login);
router.get("/profile/:id", authController.getUserProfile);
router.post('/request-otp', authController.otp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/change-password', authController.changePassword);
router.get('/profile/:id', authController.getUserProfile);
router.get('/users', authController.getAllUsers);
router.put('/update-user/:id', authController.updateUser);
router.delete('/delete-user/:id', authController.deleteUser);
router.post('/verification-otp', authController.verifyOtpAndLogin);
module.exports = router;
