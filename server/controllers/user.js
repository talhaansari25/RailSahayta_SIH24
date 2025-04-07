import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Cookies from "../models/Cookies.js";
import Staff from "../models/Staff.js";
import moment from "moment";
import path from "path";
import fs from "fs";
import multer from "multer";

// Multer configuration for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }).single("media");

export const addComplaint = async (req, res) => {
  try {
    const {
      category, //Done
      subcategory, //Done
      details, //Done
      ticketDetails, //Done
      pnrNo, //Done
      media, //Done
      metadata, //Done 
      dept, //Done
      severity, //Done
      dept2, //Done
      category2, //Done
      trainNo, //Done
      userId, //Done
      zonal, //Done
      division,//Done
      nextStation, //Done
      seatNo //Done
    } = req.body;

    if (details == "") {
      details = category + " - " + subcategory;
    }

    if(dept2 == dept){
      dept2 = "";
    }

    // Find users who are working in the same department and assigned to the same train
    const staff = await Staff.find({
      zonal: zonal,
      division: division,
      station: nextStation,
      dept: dept,
      isWorking: true,
      // trainNo: trainNo,
    });

    if (staff.length === 0) {
      return res.status(404).json({
        message: "No staff available for this train in the given department",
      });
    }

    // Get current time in Indian Standard Time (IST)
    let currentTimeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", // Specify the IST timezone
      hour12: false, // 24-hour format
    });
    console.log(currentTimeIST);

    currentTimeIST = String(currentTimeIST);

    // Extract the hour part from the string (index 11 to 13 gives us the hour)
    const hourString = currentTimeIST.slice(12, 14); // Extracts '12' from '12:40:46'
    console.log(hourString);

    // Convert the extracted hour string to a number
    const currentHour = parseInt(hourString, 10);
    console.log(currentHour);

    // Determine whether it's morning or night based on the hour
    const shift = currentHour >= 9 && currentHour <= 21 ? "morning" : "night";
    console.log(shift);

    // Filter available staff based on shift
    const availableStaff = staff.filter((user) => user.dutyShift === shift);

    // console.log(availableStaff);
    

    if (availableStaff.length === 0) {
      return res
        .status(404)
        .json({ message: "No staff available for the selected shift" });
    }

    // Assign to staff with the least complaints
    let staffToAssign = availableStaff.sort((a, b) => {
      // Sort by number of complaints assigned (ascending), then by rating
      return (
        a.compAssigned.length - b.compAssigned.length ||
        b.avgRating - a.avgRating
      );
    });

    // console.log(staffToAssign);
    

    // Shuffle the first half of the sorted staffToAssign array
    // const halfLength = Math.floor(staffToAssign.length / 2);
    // const firstHalf = staffToAssign.slice(0, halfLength);

    // // Shuffle the first half of the array
    // for (let i = firstHalf.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [firstHalf[i], firstHalf[j]] = [firstHalf[j], firstHalf[i]];
    // }

  
    const selectedStaff = staffToAssign[0];
    console.log(selectedStaff);
    

    // If there's a second department (dept2) provided, assign to staff in that department
    let complaint;
    if (dept2 && dept2 !== "") {
      // Find staff in dept2
      const otherDeptStaff = await Staff.find({
        zonal: zonal,
        division: division,
        station: nextStation,
        dept: dept2,
        isWorking: true,
        // trainNo: trainNo,  
      });

      if (otherDeptStaff.length === 0) {
        return res
          .status(404)
          .json({ message: "No staff available in the second department" });
      }

      const availableDept2Staff = otherDeptStaff.filter(
        (user) => user.dutyShift === shift
      );

      if (availableDept2Staff.length === 0) {
        return res.status(404).json({
          message:
            "No staff available for the selected shift in the second department",
        });
      }

      // Sort and shuffle for dept2 as well
      let dept2StaffToAssign = availableDept2Staff.sort((a, b) => {
        return (
          a.compAssigned.length - b.compAssigned.length ||
          b.avgRating - a.avgRating
        );
      });

      // const dept2HalfLength = Math.floor(dept2StaffToAssign.length / 2);
      // const dept2FirstHalf = dept2StaffToAssign.slice(0, dept2HalfLength);

      // for (let i = dept2FirstHalf.length - 1; i > 0; i--) {
      //   const j = Math.floor(Math.random() * (i + 1));
      //   [dept2FirstHalf[i], dept2FirstHalf[j]] = [
      //     dept2FirstHalf[j],
      //     dept2FirstHalf[i],
      //   ];
      // }

      const dept2Staff = dept2StaffToAssign[0];

      console.log("Selected staff:", selectedStaff);
      console.log("Department 2 staff:", dept2Staff);

      complaint = new Complaint({
        category,
        category2: category2 || "",
        subcategory,
        details,
        ticketDetails,
        pnrNo,
        media,
        metadata,
        dept,
        crossDeptAccept: 0,
        dept2: dept2 || "",
        severity,
        staffId: selectedStaff._id,
        staffId2: dept2Staff ? dept2Staff._id : null,
        startTime: currentTimeIST, // Store the current IST time
        status: "Pending",
        trainNo,
        userId,
        zonal,
        division,
        seatNo,
        nextStation
      });

      // Save the complaint
      await complaint.save();

      // Update staff assigned to this complaint
      selectedStaff.compAssigned.push(complaint._id);
      await selectedStaff.save();

      if (dept2Staff) {
        dept2Staff.compAssigned.push(complaint._id);
        await dept2Staff.save();
      }

      res
        .status(200)
        .json({ message: "Complaint assigned successfully", complaint });
    } else {
      // If no dept2, assign within the same department
      complaint = new Complaint({
        category,
        category2: category2 || "",
        subcategory,
        details,
        ticketDetails,
        pnrNo,
        media,
        metadata,
        dept,
        severity,
        staffId: selectedStaff._id,
        startTime: currentTimeIST, // Store the current IST time
        status: "Pending",
        trainNo,
        userId,
        zonal,
        division,
        seatNo,
        nextStation
      });

      await complaint.save();

      selectedStaff.compAssigned.push(complaint._id);
      await selectedStaff.save();

      const user = await User.findById(userId);
      if (user) {
        user.compId.push(complaint._id);
        await user.save();
      }

      res
        .status(200)
        .json({ message: "Complaint assigned successfully", complaint });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error assigning complaint", error: err.message });
  }
};

// ! Not Scalable
// export const viewUserComplaint = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const complaints = await Complaint.find({ _id: { $in: user.compId } });

//     res.status(200).json({ complaints });
//   } catch (err) {
//     res.status(401).json({ message: "Retrieve failed", error: err.message });
//   }
// };

// ! Scalable

export const viewUserComplaint = async (req, res) => {
  try {
    const { userId, page = 1, limit = 3 } = req.body; // Default page = 1, limit = 3

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch complaints with pagination
    const complaints = await Complaint.find({ _id: { $in: user.compId } })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination info
    const totalComplaints = await Complaint.countDocuments({
      _id: { $in: user.compId },
    });

    res.status(200).json({ complaints, totalComplaints });
  } catch (err) {
    res.status(401).json({ message: "Retrieve failed", error: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { complaintId, feedback, rating, sentiment, level, desc } = req.body;

    // Validate required fields
    if (!feedback || !rating || !sentiment || !level || !desc) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Fetch the complaint by ID
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    // Ensure the complaint is marked as "Completed"
    if (complaint.status !== "Completed") {
      return res.status(400).json({
        message: "Feedback can only be submitted for completed complaints.",
      });
    }

    // Update complaint with feedback, rating, and sentiment
    complaint.feedback = feedback;
    complaint.rating = rating;
    complaint.sentiment = sentiment;
    await complaint.save();

    // Create and save a new cookies document
    const newCookies = new Cookies({ level, desc });
    const savedCookies = await newCookies.save();

    // Update primary staff's details
    const primaryStaff = await Staff.findById(complaint.staffId);

    if (primaryStaff) {
      primaryStaff.cookiesId = primaryStaff.cookiesId || [];
      primaryStaff.cookiesId.push(savedCookies._id);

      // Calculate updated avgRating dynamically
      const totalComplaintsSolvedPrimary = primaryStaff.compSolved.length + 1; // Including this completed complaint
      primaryStaff.avgRating =
        (primaryStaff.avgRating * primaryStaff.compSolved.length + rating) /
        totalComplaintsSolvedPrimary;

      await primaryStaff.save();
    }

    // Update secondary staff's details if exists
    if (complaint.staffId2) {
      const secondaryStaff = await Staff.findById(complaint.staffId2);

      if (secondaryStaff) {
        secondaryStaff.cookiesId = secondaryStaff.cookiesId || [];
        secondaryStaff.cookiesId.push(savedCookies._id);

        const totalComplaintsSolvedSecondary =
          secondaryStaff.compSolved.length + 1; // Including this completed complaint
        secondaryStaff.avgRating =
          (secondaryStaff.avgRating * secondaryStaff.compSolved.length +
            rating) /
          totalComplaintsSolvedSecondary;

        await secondaryStaff.save();
      }
    }

    res.status(200).json({
      message: "Feedback and cookies submitted successfully.",
      complaint,
      cookies: savedCookies,
    });
  } catch (err) {
    res.status(500).json({ message: "Submit failed", error: err.message });
  }
};

export const reraiseComplaint = async (req, res) => {
  try {
    // Find the complaint by ID
    const complaint = await Complaint.findById(req.body.complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    // Complaint start time in the given format (DD/MM/YYYY, HH:mm:ss)
    const complaintStartTime = complaint.startTime; // Example: "22/11/2024, 13:02:03"

    // Parse the complaint's start time into a Date object
    const [date, time] = complaintStartTime.split(", ");
    const [day, month, year] = date.split("/");

    const formattedStartTime = `${year}-${month}-${day}T${time}`; // Reformat to "YYYY-MM-DDTHH:mm:ss"
    const startTime = new Date(formattedStartTime); // Now we can create a Date object

    // Get the current time
    const currentTime = new Date(); // Current system time (local time)

    // Calculate the time difference in milliseconds
    const diffInMilliseconds = currentTime - startTime;

    // Convert the difference to minutes
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60)); // Convert ms to minutes

    // Check if the complaint can be re-raised (only within 30 minutes of start time)
    if (diffInMinutes < 30) {
      return res.status(400).json({
        message:
          "Complaint can only be re-raised within 30 minutes of the start time.",
      });
    }

    complaint.severity = 9;
    complaint.status = "Re-Raised"; // Change status to "Re-raised"
    await complaint.save();

    res
      .status(200)
      .json({ message: "Complaint re-raised successfully.", complaint });
  } catch (err) {
    res.status(500).json({ message: "Reraise failed", error: err.message });
  }
};

// API to upload media
export const uploadMedia = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Media upload failed", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No media file uploaded" });
    }

    const mediaLink = `${req.protocol}://${req.get("host")}/user/media/${
      req.file.filename
    }`;
    res.status(201).json({ message: "Media uploaded successfully", mediaLink });
  });
};

// API to access media
export const accessMedia = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join("uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Media file not found" });
  }

  // Set appropriate headers to allow cross-origin access
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.resolve(filePath));
};
