import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import Complaint from "../models/Complaint.js";
import Cookies from "../models/Cookies.js";

export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists in the database
    const staff = await Staff.findOne({ email: email });

    if (!staff) {
      return res.status(400).json({ mess: "Staff doesn't exist!" });
    }

    // Hardcoded password comparison
    if (password !== staff.password) {
      return res.status(400).json({ mess: "Incorrect Password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, userType: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }  // Consider making this configurable
    );

    res.status(200).json({ staff, token, userType : "staff" });
  } catch (err) {
    res.status(401).json({ message: "Authentication failed", error: err.message });
  }
};

export const assignedComp = async (req, res) => {
  try {

    const {staffId} = req.body
    // Fetch the staff member by their user ID
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    // Fetch complaints using the `compAssigned` array
    const assignedComplaints = await Complaint.find({
      _id: { $in: staff.compAssigned }, // Use $in to match multiple IDs
    });

    res.status(200).json({ assignedComplaints });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch assigned complaints",
      error: err.message,
    });
  }
};


export const solvedComp = async (req, res) => {
  try {
    const {staffId} = req.body
    // Fetch the staff member by their user ID
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    // Fetch complaints using the `compAssigned` array
    const solvedComp = await Complaint.find({
      _id: { $in: staff.compSolved }, // Use $in to match multiple IDs
    });

    res.status(200).json({ solvedComp });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch solved complaints",
      error: err.message,
    });
  }
};


export const updateCompStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    // Check if the status is valid
    const validStatuses = ["Pending", "In Process", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const { staffId, staffId2 } = complaint;

    // Update the complaint's status
    complaint.status = status;

    // Handle status-specific logic
    if (status === "Completed") {
      let currentTimeIST = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", // Specify the IST timezone
        hour12: false, // 24-hour format
      });
      console.log(currentTimeIST);

      currentTimeIST = String(currentTimeIST);

      complaint.endTime = currentTimeIST;

      // Function to update staff records
      const updateStaffRecords = async (staffId) => {
        const staff = await Staff.findById(staffId);
        if (!staff) {
          return res.status(404).json({ message: `Staff with ID ${staffId} not found` });
        }

        // Remove complaintId from compAssigned and add to compSolved
        staff.compAssigned = staff.compAssigned.filter(
          (id) => id.toString() !== complaintId.toString()
        );

        staff.compSolved.push(complaintId);

        await staff.save();
      };

      // Update records for staffId
      if (staffId) {
        await updateStaffRecords(staffId);
      }

      // Update records for staffId2 (if exists)
      if (staffId2) {
        await updateStaffRecords(staffId2);
      }
    } else if (status === "Pending") {
      // Function to update staff records for Pending status
      const revertStaffRecords = async (staffId) => {
        const staff = await Staff.findById(staffId);
        if (!staff) {
          return res.status(404).json({ message: `Staff with ID ${staffId} not found` });
        }

        // Remove complaintId from compSolved and add to compAssigned
        staff.compSolved = staff.compSolved.filter(
          (id) => id.toString() !== complaintId.toString()
        );

        if (!staff.compAssigned.includes(complaintId)) {
          staff.compAssigned.push(complaintId);
        }

        await staff.save();
      };

      // Revert records for staffId
      if (staffId) {
        await revertStaffRecords(staffId);
      }

      // Revert records for staffId2 (if exists)
      if (staffId2) {
        await revertStaffRecords(staffId2);
      }

      // Remove endTime when reverting to Pending
      complaint.endTime = null;
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: err.message,
    });
  }
};



export const getCookiesDet = async (req, res) => {
  try {
    const { staffId } = req.body; // Assuming staffId is passed as a URL parameter

    // Find the staff member by staffId
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Get cookies details from the cookiesId array in the staff document
    const cookiesDetails = await Cookies.find({
      _id: { $in: staff.cookiesId } // Use $in to find all cookies with IDs in the cookiesId array
    });

    if (!cookiesDetails || cookiesDetails.length === 0) {
      return res.status(404).json({ message: "No cookies found for this staff" });
    }

    res.status(200).json({
      message: "Cookies details fetched successfully",
      cookies: cookiesDetails,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch cookies details",
      error: err.message,
    });
  }
};

export const removeCookie = async (req, res) => {
  try {
    const { staffId, cookieId } = req.body;

    // Find the staff member by staffId
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Check if the cookieId exists in the cookiesId array
    if (!staff.cookiesId.includes(cookieId)) {
      return res.status(404).json({ message: "Cookie not found in staff's cookiesId array" });
    }

    // Remove the cookieId from the cookiesId array
    staff.cookiesId = staff.cookiesId.filter((id) => id.toString() !== cookieId.toString());

    // Save the updated staff document
    await staff.save();

    res.status(200).json({
      message: "Cookie removed successfully from staff's cookiesId array",
      updatedStaff: staff,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove cookie",
      error: err.message,
    });
  }
};


export const getStaffProfile = async (req, res) => {
  try {
    const { staffId } = req.body; // Assuming staffId is passed as a URL parameter

    // Find the staff member by staffId
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Return the full staff data
    res.status(200).json({
      message: "Staff profile fetched successfully",
      profile: staff, // Returning the full staff object
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch staff profile",
      error: err.message,
    });
  }
};


