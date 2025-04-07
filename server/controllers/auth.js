import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import Staff from "../models/Staff.js";
// import faker from "faker";
// import Admin from "../models/Admin.js";

dotenv.config();

// REGISTER USER
export const register = async (req, res) => {
  try {
    const { email, name, password, currPnr, mobile } = req.body;
    // Check if user with same email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hashing using salt
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      password: passwordHash,
      email,
      name,
      currPnr,
      mobile,
    });

    // Save user data in mongoDB
    const savedUser = await newUser.save();

    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res
      .status(400)
      .json({
        message:
          err.message || "An unexpected error occurred during registration",
      });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists in the database
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ mess: "User doesn't exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ mess: "Incorrect Password!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // res.cookie("jwt", token, {
    //   httpOnly: true, // Prevents JavaScript from accessing the token
    //   secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
    //   sameSite: "Strict", // Prevents CSRF attacks by restricting cross-site requests
    //   maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    // });

    delete user.password;
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LOGOUT USER
export const logout = async (req, res) => {
  // res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

// CHECK AUTH
export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "User Not Authenticated" });
    }

    //Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Fetch User from Database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not Found" });
    }

    res.status(200).json({ user, token });
  } catch (err) {
    res
      .status(401)
      .json({ message: "Authentication failed", error: err.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Send email with reset link
    const resetLink = `http://localhost:5173/resetpassword/${resetToken}`;
    const emailSent = await sendEmail(
      user.email,
      "Password Reset Link",
      resetLink
    );

    if (emailSent) {
      res.status(200).json({ message: "Password reset link sent!" });
    } else {
      console.error("Error sending email");
      res.status(500).json({ message: "Error sending password reset link." });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Helper function for sending email
const sendEmail = async (recipientEmail, subject, text) => {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #3a3fc5;">Password Reset Request</h2>
    <p>Hi,</p>
    <p>We received a request to reset your password for your <strong>Rail Sahayta</strong> account.</p>
    <p>Please click the button below to reset your password:</p>
    <a href="${text}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: #fff; background-color: #3a3fc5; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
    <br>
    <p>Thanks,</p>
    <p>The <strong>Rail Sahayta</strong> Team</p>
  </div>
`;

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: recipientEmail,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

//Update Using Reset Password Link
export const updatePassword = async (req, res) => {
  try {
    const { token: resetToken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token!" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res
        .status(400)
        .json({ mess: "userId and userType are required!" });
    }

    let userData;
    switch (userType) {
      case "staff":
        userData = await Staff.findById(userId);
        break;
      case "user":
        userData = await User.findById(userId);
        break;
      case "admin":
        userData = await Admin.findById(userId);
        break;
      default:
        return res.status(400).json({ mess: "Invalid userType!" });
    }

    if (!userData) {
      return res.status(404).json({ mess: "User not found!" });
    }

    delete userData.password; // Ensure password is not included in the response
    res.status(200).json({ userData });
  } catch (err) {
    res.status(500).json({ mess: err.message });
  }
};

// PNR API
export const getPnrData = async (req, res) => {
  try {
    // Extract PNR number from the request body
    const { pnrNo } = req.body;

    // Check if PNR number is provided and has at least 10 characters
    if (!pnrNo ) {
      return res.status(400).json({
        message: "Invalid PNR number. It must be at least 10 characters long."
      });
    }

    // Array of allowed stations
    const stations = ["CSMT", "KJT", "LNL", "SVJR", "PUNE"];

    // Helper function to generate a random seat/berth
    const generateSeatNumber = () => {
      const berth = ["M", "U", "S", "L"]; // Common berth types
      const number = Math.floor(Math.random() * 50) + 1; // Random number between 1 and 50
      return `${berth[Math.floor(Math.random() * berth.length)]}/${number}`;
    };

    // Function to generate a random passenger name
    const generateRandomName = () => {
      const firstNames = ["John", "Jane", "Michael", "Sara", "Raj", "Anita", "Aarav", "Meera"];
      const lastNames = ["Smith", "Patel", "Singh", "Sharma", "Deshmukh", "Kumar"];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    };

    // Function to generate random passenger data
    const generatePassengerData = () => {
      return {
        name: generateRandomName(),
        age: Math.floor(Math.random() * 60) + 18, // Random age between 18 and 77
        seatNo: generateSeatNumber(),
      };
    };

    // Generate data
    const trainNo = "12123"; // Fixed train number
    const startStation = "CSMT";

    // Ensure nextStation is not the same as the current station
    let nextStation = stations[Math.floor(Math.random() * stations.length)];
    while (nextStation === startStation) {
      nextStation = stations[Math.floor(Math.random() * stations.length)];
    }

    // Set the end station as PUNE
    const endStation = "PUNE";

    // Generate a single passenger's data
    const passenger = generatePassengerData();

    const pnrData = {
      trainNo,
      startStation,
      nextStation,
      endStation,
      passenger,
      zonal : "centralrailway",
      division : "mumbai",
      pnrNo, // Include the PNR number in the response
    };

    // Send the generated data as a response
    res.status(200).json({ pnrData });
  } catch (err) {
    res.status(500).json({ message: "Error generating PNR data", error: err.message });
  }
};


