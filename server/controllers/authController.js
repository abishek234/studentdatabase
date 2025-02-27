const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { sendOtp } = require("../utils/mailer");


exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use the comparePassword method from the schema
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token,id:user.id,email:user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const user = await User.findById(userId).select('-password');

     if (!user) return res.status(404).json({ message: 'User not found' });

     res.json(user);
  }catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
};

let otp;

exports.otp = async (req, res) => {
  try {
      const { email } = req.body;
  
      // Generate a random OTP
      otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  
      try {

          // Send the OTP to the user's email
          await sendOtp(email, otp);

          res.status(200).json({ message: 'OTP sent to your email.' });
      } catch (error) {
          console.error("Error sending email:", error);
          res.status(500).json({ message: 'Error sending OTP.' });
      }
  }
  catch (error) {
      res.status(500).json({ message: 'Error generating OTP', error });
  }
}

exports.verifyOtp = async (req, res) => {
  try {
      const { userOtp } = req.body;
  
      if (userOtp === otp) {
          res.status(200).json({ message: 'OTP verified successfully.' });
      } else {
          res.status(400).json({ message: 'Invalid OTP.' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP', error });
  }
}

exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword, otp } = req.body;

  if (otp !== req.body.otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
  }

  try {
      // Find the user by email
      const user = await User.findOne({ email });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      // Update the user's password
      user.password = newPassword; // Hashing will be handled in pre-save hook
      await user.save();

      res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: 'Error changing password.' });
  }
};

//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    //exclude role admin and password
    const users = await User.find({ role: { $ne: 'admin' }}).select('-password');
    res.json(users);
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
};

//Delete user
exports.deleteUser = async (req, res) => {
  try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
  }
  catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
}

//Update user
exports.updateUser = async (req, res) => {
  try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User updated successfully' });
  }
  catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
}