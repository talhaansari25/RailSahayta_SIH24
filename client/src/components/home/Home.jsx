import React, { useState, useEffect } from "react";
import satyaj from "../../assets/icons/satyamevl.webp";
import railmadadl from "../../assets/icons/railmadadl.png";
import g20l from "../../assets/icons/g20l.png";
import railsahl from "../../assets/icons/railsahl.png";
import emergencyC from "../../assets/icons/emergC.png";

import f1 from "../../assets/images/ticketbooking.png";
import f2 from "../../assets/images/trainenquiry.png";
import f3 from "../../assets/images/reservationenquiry.png";
import f4 from "../../assets/images/retiringroombooking.png";
import f5 from "../../assets/images/indianrailways.png";
import f6 from "../../assets/images/utsticketing.png";
import f7 from "../../assets/images/railwayparcelwebsite.png";
import f8 from "../../assets/images/freightbusiness.png";

import trainI from "../../assets/images/train.png";
import stationI from "../../assets/images/city-hall.png";
import trackI from "../../assets/images/writing.png";
import ticketI from "../../assets/images/tickets.png";

import Popup from "./Popup";
import Register from "../auth/Register.jsx";
import Login from "../auth/Login.jsx";
import axios from "axios";
import UserFeedback from "./UserFeedback.jsx";
import UserProfile from "./UserProfile.jsx";

import EXIF from "exif-js";
import exifParser from "exif-parser";

import stringSimilarity from "string-similarity";
import Chatbot from "../Chatbot.jsx";

// import complaintJson from '../../assets/complaintdata.json'

const Home = () => {
  const [popupType, setPopupType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (loading) return <div className="loader"></div>;

  const handlePopupClose = () => setPopupType(null);
  const [activeTab, setActiveTab] = useState("train");
  const [datetime, setDatetime] = useState("");

  // CHATBOT
  const [bot_view, setbot_view] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState("");

  const [field1, setField1] = useState("");
  // const [field2, setField2] = useState("");
  // const [field3, setField3] = useState("");

  //! Perform Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      const userId = localStorage.getItem("userId");
      let userType = localStorage.getItem("userType");

      userType = "user";

      if (userId && userType) {
        try {
          const response = await axios.post(
            "http://localhost:3002/auth/fetchuserdata",
            {
              userId,
              userType: "user",
            }
          );

          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserData(response.data.userData); // Store user data if needed
            console.log(userData);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem("userId");
            localStorage.removeItem("userType");
          }
        } catch (error) {
          console.error("Error validating user:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("userId");
          localStorage.removeItem("userType");
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    validateUser();
  }, []);

  //! User Complaint Data
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);

  //! Unscalable Approach
  // const fetchComplaintData = async () => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:3002/user/viewusercomp",
  //       {
  //         userId: userData._id,
  //       }
  //     );
  //     console.log(response.data);

  //     setCompData(response.data.complaints);
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const complaintsPerPage = 3;

  //! Scalable Approach
  const fetchComplaintData = async (page = 1) => {
    console.log(userData);

    try {
      const response = await axios.post(
        "http://localhost:3002/user/viewusercomp",
        {
          userId: userData._id,
          page,
          limit: complaintsPerPage,
        }
      );
      console.log(response.data);

      setCompData(response.data.complaints);
      setTotalComplaints(response.data.totalComplaints);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //! Fomat Date & Timw
  const formatDateToLocalTime = () => {
    const currentDate = new Date();

    const istOffset = 5.5 * 60;
    currentDate.setMinutes(
      currentDate.getMinutes() + currentDate.getTimezoneOffset() + istOffset
    );

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");

    // Return the formatted date and time string
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    setDatetime(formatDateToLocalTime());
  }, []);

  const [compData, setCompData] = useState([]);

  useEffect(() => {
    fetchComplaintData(currentPage);
    console.log(userData);
  }, [userData, currentPage]);

  const parseCustomDate = (dateString) => {
    const [datePart, timePart] = dateString.split(", ");
    const [day, month, year] = datePart.split("/").map(Number); // Convert to numbers
    const [hours, minutes, seconds] = timePart.split(":").map(Number); // Convert to numbers
    return new Date(year, month - 1, day, hours, minutes, seconds); // Create Date object
  };

  //! Filter Complaints
  const filterB = (filterType) => {
    if (!Array.isArray(compData)) {
      console.error("compData must be an array");
      return;
    }

    let sortedData = [...compData]; // Copy the array to avoid mutations

    switch (filterType) {
      case "EF": // Early First
        sortedData.sort(
          (a, b) => parseCustomDate(a.startTime) - parseCustomDate(b.startTime)
        );
        break;

      case "RF": // Recent First
        sortedData.sort(
          (a, b) => parseCustomDate(b.startTime) - parseCustomDate(a.startTime)
        );
        break;

      case "SE": // Severity
        sortedData.sort((a, b) => (b.severity || 0) - (a.severity || 0));
        break;

      case "ST": // Status
        sortedData.sort((a, b) => {
          const statusOrder = ["Pending", "In Process", "Completed"];
          const statusA =
            statusOrder.indexOf(a.status) >= 0 ? a.status : "Pending";
          const statusB =
            statusOrder.indexOf(b.status) >= 0 ? b.status : "Pending";
          return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
        });
        break;

      default:
        console.error("Invalid filter type");
        return;
    }

    // Debugging: Log sorted data
    console.log(sortedData);

    // Update state with sorted data (for React)
    if (typeof setCompData === "function") {
      setCompData(sortedData);
    } else {
      console.error("setCompData is not defined or not a function");
    }
  };

  //! Feedback Handle
  const handleFeedback = (complaint) => {
    console.log(complaint);
    setSelectedComplaint(complaint);
    setPopupType("feedback");
  };

  //! Delete Complaint
  const handleDeleteComplaint = async (complaintId) => {
    try {
      // Update complaint status to "Completed" instead of deleting
      const response = await axios.post(
        "http://localhost:3002/staff/updatecompstatus",
        {
          complaintId: complaintId,
          status: "Completed", // Mark as completed
        }
      );

      if (response.status === 200) {
        alert("Complaint status updated to Completed.");
        // Optionally, update the UI to reflect the change
        // e.g., remove complaint from the list or update its status
      }

      setActiveTab("train");
    } catch (error) {
      alert(
        "Error updating complaint status: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  //! Report Complaint
  const handleReportComp = async (complaintId) => {
    try {
      const status = "Pending"; // Set status to "Pending"

      const response = await axios.post(
        "http://localhost:3002/staff/updatecompstatus",
        { complaintId, status }
      );

      console.log("Response from API:", response.data);
      alert("✅ Complaint status set to Pending successfully!");
      setActiveTab("train");
    } catch (error) {
      console.error(
        "Error updating complaint status:",
        error.response?.data || error.message
      );
      alert("Failed to update complaint status.");
    }
  };

  const [selectedComplaint, setSelectedComplaint] = useState([]);

  //! Add Complaint Logic
  const [ticketDetails, setTicketDetails] = useState("");
  const [pnrNo, setPnrNo] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [media, setMedia] = useState(null);
  const [predictedCategory, setPredictedCategory] = useState("Coach - Maintenance");
  const [subcategory, setSubCategory] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [query, setQuery] = useState("");
  const [category2, setCategory2] = useState("");
  const [zonal, setZonal] = useState("");
  const [division, setDivision] = useState("");
  const [nextStation, setNextStation] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [dept, setDept] = useState("");
  const [dept2, setDept2] = useState("");
  const [severityScore, setSeverityScore] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  //! Get PNR Details if PNR Number Changes
  useEffect(() => {
    if (pnrNo.length >= 10) {
      getPnrData(pnrNo);
    }
  }, [pnrNo]);

  //! GET PNR Data API
  const getPnrData = async (pnrNo) => {
    try {
      const response = await fetch("http://localhost:3002/auth/pnrdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pnrNo }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.pnrData);
      setSeatNo(String(data.pnrData.passenger.seatNo));
      setZonal(String(data.pnrData.zonal));
      setDivision(String(data.pnrData.division));
      setNextStation(String(data.pnrData.nextStation));
      setTrainNo(String(data.pnrData.trainNo));
    } catch (err) {
      // setError(`Error: ${err.message}`);
      console.log(err);
    }
  };

  //! Complaint Recommendation
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetch("/complaintdata.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data);

        setComplaints(data);
      } catch (error) {
        console.error("Error loading complaints:", error);
      }
    };

    loadComplaints();
  }, []);

  const filterComplaints = (query) => {
    return complaints.filter((complaint) =>
      complaint.details.toLowerCase().includes(query.toLowerCase())
    );
  };

  //! Complaint Description Handle
  const handleInputChange = (e) => {
    const userInput = e.target.value;
    setQuery(userInput);
    if (userInput) {
      const matches = filterComplaints(userInput);
      setFilteredSuggestions(matches.slice(0, 5));
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.details);
    setFilteredSuggestions([]);
  };

  //! Category Mapping - Train Complaint
  const categoryMapping = {
    damage_seat: "seat",
    unhygenic_compartment: "compartment",
    unhyg_compartment: "compartment",
    unhygenic_toilet: "toilet",
    unhyg_toilet: "toilet",
    unhyg_washroom: "toilet",
    Electricity: "electricity",
    damage_window: "window",
    Security: "security",
    Medical: "medical",
    unhyg_comp: "compartment",
    charging_port: "electricity",
    fan: "electricity",
    bags: "security",
    bedroll: "seat",
    door: "compartment",
    packaged_food: "food",
    win_img: "window",
  };

  const subCM = {
    bags: "Missing Luggage",
    charging_ports: "Charging Port",
    door_raw: "Door Broken/Door Latch",
    fan: "Fan",
    food: "Food",
    medical: "Medical Assistance",
    packagedfood: "Packaged Food",
    seats: "Seat Torn/Dirty",
    toilet: "Toilet",
    violence: "Violence/Crowd",
    washbasin: "Washbasin",
    win: "Window Crack/Dirty",
    win_1: "Window Crack/Dirty",
  };
  const catM2 = {
    bags: "Security",
    charging_ports: "Electricity",
    door_raw: "Coach - Maintenance",
    fan: "Electricity",
    food: "Catering Services",
    medical: "Medical Assistance",
    packagedfood: "Catering Services",
    seats: "Coach - Maintenance",
    toilet: "Water Unavailability",
    violence: "Security",
    washbasin: "Water Unavailability",
    win: "Coach - Maintenance",
    win_1: "Coach - Maintenance",
  };

  //! Category Mapping - Station Complaint
  const categoryMapping2 = {
    benches: "seat",
    unhygenic_toilet: "toilet",
    unhyg_toilet: "toilet",
    unhyg_washroom: "toilet",
    Electricity: "electricity",
    Security: "security",
    medical: "medical",
    charging: "electricity",
    RailFan: "electricity",
    bags: "security",
    "crowded platform": "platform",
    "dirty platform": "platform",
    packagedFood: "food",
    violence: "violence",
    board: "electricity",
    esc: "electricity",
    lift: "electricity",
  };

  useEffect(() => {
    // Regular expressions
    const pnrNoPattern = /\d{10}/g; // Matches a 10-digit PNR number
    const trainPattern = /train\s*(\d{4,5})/gi;

    // Remove all spaces from the input string
    const cleanedQuery = query.replace(/\s+/g, "");

    // Extract PNR numbers (10 consecutive digits)
    const pnrNumbers = cleanedQuery.match(pnrNoPattern) || [];
    // Extract Train numbers (4 or 5 consecutive digits)
    const foundTrainNumbers = [];
    let match;
    while ((match = trainPattern.exec(cleanedQuery)) !== null) {
      foundTrainNumbers.push(match[1]); // match[1] contains the train number
    }

    // Logging PNR numbers and Train numbers for debugging
    console.log("Extracted PNR Numbers:", pnrNumbers);
    console.log("Extracted Train Numbers:", foundTrainNumbers);

    // If a PNR number is found, set it as the state
    if (pnrNumbers.length > 0) {
      if (pnrNo == "") {
        setPnrNo(pnrNumbers[0]); // Take the first PNR number found
      }
    } else {
      setPnrNo(""); // Clear the PNR number if none is found
    }
  }, [query]); // Re-run the effect when query changes

  useEffect(() => {
    console.log("hi" + pnrNo);
  }, [pnrNo]);

  //! Upload Media & Predict Category
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setFile({ file: selectedFile, type: selectedFile.type });

    setPredictedCategory("");
    // setSubCategory("");
    setCategory2("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:9898/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media.");
      }

      const data = await response.json();
      setMedia(data.image_path); // Set the image path returned by the API
      console.log("File uploaded successfully!", data.image_path);

      const isVideo = selectedFile.type.startsWith("video/");
      const predictEndpoint = isVideo
        ? "http://localhost:9898/v1/predictvideo"
        : "http://localhost:9999/predictimage";

      if (isVideo) {
        formData.append("file", selectedFile);
      }

      const predictionResponse = await fetch(predictEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!predictionResponse.ok) {
        throw new Error("Failed to predict category.");
      }

      if (predictEndpoint == "http://localhost:9999/predictimage") {
        const predictionData = await predictionResponse.json();
        console.log(predictionData);

        let predC = predictionData.blabels[0] || predictionData.blabels;

        if (predC == "washbasin") {
          const predictionResponse = await fetch(
            "http://localhost:5000/classify",
            {
              method: "POST",
              body: formData,
            }
          );

          const predD = await predictionResponse.json();
          console.log(predD);

          if (predD.class == "basin") {
            setPredictedCategory("Water Unavailability");
          } else {
            setPredictedCategory("Dirty Basin");
          }
        }

        const mappedCategory = subCM[predC] || predC;
        setPredictedCategory("Coach - Maintenance")
        setSubCategory("Seat");
        console.log("HI" + mappedCategory);
        console.log(predC + "hi");

        if (predC != "washbasin") setPredictedCategory(catM2[predC]);

        console.log(predictionData);

        document.getElementById("annotImg").src =
          "data:image/png;base64," + predictionData.image_base64;

        if (predC == "bags") {
          setSubCategory("Missing Items");
        } else if (predC == "bedroll") {
          setSubCategory("Bedroll");
        } else if (predC == "charging_port") {
          setSubCategory("Charging Port");
        } else if (predC == "door_raw") {
          setSubCategory("Door");
        } else if (predC == "fan") {
          console.log("bro");

          setSubCategory("Fan");
        }
      } else {
        const predictionData = await predictionResponse.json();
        const predictedClass = predictionData.predicted_class;
        const confidence = predictionData.confidence;

        setQuery(predictionData.transcription);

        // console.log(predictedClass + " b");

        if (predictedClass == "bag") {
          setSubCategory("Missing Items");
        } else if (predictedClass == "bedroll") {
          setSubCategory("Bedroll");
        } else if (predictedClass == "charging_port") {
          setSubCategory("Charging Port");
        } else if (predictedClass == "door") {
          setSubCategory("Door");
        } else if (predictedClass == "fan") {
          console.log("bro");

          setSubCategory("Fan");
        }

        if (predictionData.predicted_class == "medical" && confidence <= 0.5) {
          setPredictedCategory("seat");
        } else if (
          predictionData.predicted_class == "bedroll" &&
          confidence <= 0.5
        ) {
          setPredictedCategory("window");
        } else if (
          confidence >= 0.1 ||
          predictionData.predicted_class == "unhyg_comp"
        ) {
          const mappedCategory =
            categoryMapping[predictedClass] || predictedClass;
          setPredictedCategory("Coach - Maintenance");
        } else {
          setPredictedCategory("Coach - Maintenance");
        }

        console.log("Prediction response:", predictionData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      console.log(error);
      ("Failed to upload the file. Please try again.");
    } finally {
      setIsUploading(false);
    }

    getMetadata(selectedFile);
  };

  useEffect(() => {
    console.log(media);
  }, [media]);

  //! Get Metadata of FILE
  const getMetadata = (file) => {
    if (file) {
      if (file.type.startsWith("video/")) {
        // Extract video-specific metadata
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          // Extracting date/time metadata for video files
          const date = new Date(file.lastModified); // Last modified date as an approximation for video creation date
          const formattedDateTime = date.toLocaleString(); // Format as needed

          // You can extract location data if available (e.g., GPS data embedded in the file)
          const location = "Unknown Location"; // Implement location extraction if supported by the video metadata

          setMetadata({
            time: formattedDateTime,
            location: location,
            software: "Unknown Software", // Videos may not have software metadata like images
          });
        };

        video.src = URL.createObjectURL(file);
      } else {
        // Handle image metadata parsing with exif-parser for non-video files
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          try {
            const parser = exifParser.create(arrayBuffer);
            const parsedData = parser.parse();

            console.log(parsedData); // Inspect parsed metadata

            // Extract DateTimeOriginal, Software, and GPS information from parsed data
            const dateTimeOriginal = parsedData.tags.DateTimeOriginal;
            let formattedDateTime = "Unknown Date/Time";

            if (dateTimeOriginal) {
              // Convert timestamp to a Date object
              const date = new Date(dateTimeOriginal * 1000); // Convert seconds to milliseconds

              // Format the date to MM/DD/YYYY, HH:MM:SS AM/PM
              const month = date.getMonth() + 1; // Months are zero-based, so add
              const day = date.getDate();
              const year = date.getFullYear();
              const hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, "0");
              const seconds = date.getSeconds().toString().padStart(2, "0");
              const ampm = hours >= 12 ? "PM" : "AM";
              const formattedHours = hours % 12 || 12; // Convert to 12-hour format

              formattedDateTime = `${month.toString().padStart(2, "0")}/${day
                .toString()
                .padStart(
                  2,
                  "0"
                )}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
            }

            const software = parsedData.tags.Software || "Unknown Software";

            // Location extraction
            const latitude = parsedData.tags.GPSLatitude
              ? parsedData.tags.GPSLatitude.join(", ")
              : "Unknown Latitude";
            const longitude = parsedData.tags.GPSLongitude
              ? parsedData.tags.GPSLongitude.join(", ")
              : "Unknown Longitude";
            const location =
              latitude !== "Unknown Latitude" &&
              longitude !== "Unknown Longitude"
                ? `${latitude}, ${longitude}`
                : "Unknown Location";

            setMetadata({
              time: formattedDateTime,
              location: location,
              software: software,
            });
          } catch (error) {
            console.error("Error parsing EXIF data:", error);
            setMetadata({
              time: "Error parsing EXIF data",
              location: "Error parsing EXIF data",
              software: "Error parsing EXIF data",
            });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  //! Get Text Complaint Category & Subcategory
  const handleBlur = async () => {
    console.log(query);

    if (query == "") {
      console.log("No DESC");
      return;
    }

    // Call category api for text and store it into category2 if category is not an empty string else store it in category
    try {
      const response = await fetch(
        "http://localhost:9898/v1/text/text_category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ complaint: query }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let broc;

      const data = await response.json();
      console.log(data);
      
      if (data.category) {
        // Check if category is not empty and store it in category2, otherwise store in category
        if (predictedCategory == "") {
          const mappedCategory =
            categoryMapping[data.category] || data.category;
          console.log(mappedCategory);
          setPredictedCategory("Coach - Maintenance");
          broc = mappedCategory;
          // console.log(broc);
          console.log(mappedCategory);

          console.log("Category stored in category2:", data.category);
        } else {
          const mappedCategory2 =
            categoryMapping[data.category] || data.category;
          console.log(mappedCategory2);
          setCategory2(mappedCategory2);
          broc = mappedCategory2;
          console.log("Category stored in category:", data.category);
          console.log(mappedCategory2);

          
        }
      }

    } catch (error) {
      console.error("Error calling the text category API:", error);
    }
  };

  const patterns = {
    ticketNumber: /\b\d{8}\b/,
    trainNumber: /\bTRAINNO\s+(\d{4})\b/i,
    travelDate: /\bDATE\s+(\d{2}-\d{2}-\d{4})\b/i,
    distanceKm: /\b(\d+)\s*KM\b/i,
    passengerType: /\bADULT\b/i,
    class: /\bCLASS\s+([a-zA-Z\s]+)/i,
    coach: /\bCOACH\s+([a-zA-Z0-9]+)\b/i,
    seatBerth: /\bSEATBERTH\s+([a-zA-Z0-9\s]+)\b/i,
    reservationFee: /\bR\.FEE\s+(\d+)/i,
    totalAmount: /Rs\.\s*([0-9]+)/i,
    trainName: /\b([A-Z\s]+EXP)\b/,
    from: /\bFROM\s+([a-zA-Z\s]+)\b/i,
    to: /\bTO\s+([a-zA-Z\s]+)\b/i,
    via: /\bVIA\s+([a-zA-Z\s]+)\b/i,
  };

  //! Getting Subcategory of Text
  // const findSubC = async (broc, categoryMapping) => {
  //   console.log(broc);

  //   // Call subcategory API
  //   try {
  //     console.log(predictedCategory.toLowerCase());

  //     console.log(query);
  //     console.log(broc + "hihi");
  //     if (broc == "") {
  //       broc = predictedCategory;
  //     }

  //     console.log("SUmeet " + broc);
  //     broc = categoryMapping[broc] || broc;

  //     const subcategoryResponse = await fetch(
  //       "http://localhost:9898/v1/text/text_subcategory",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           description: query,
  //           category: predictedCategory || broc, // Pass the category from the first API
  //         }),
  //       }
  //     );

  //     if (!subcategoryResponse.ok) {
  //       throw new Error(`HTTP error! Status: ${subcategoryResponse.status}`);
  //     }

  //     const subcategoryData = await subcategoryResponse.json();
  //     console.log(subcategoryData);

  //     if (subcategoryData.subcategory && subcategory == "") {
  //       console.log("Predicted subcategory:", subcategoryData);
  //       setSubCategory(subcategory || subcategoryData.subcategory);
  //       // Add logic here to handle the predicted subcategory
  //     }
  //   } catch (subcategoryError) {
  //     console.error(
  //       "Error calling the text subcategory API:",
  //       subcategoryError
  //     );
  //   }
  // };

  useEffect(() => {
    if (category2 == "toilet" && predictedCategory == "seat") {
      setCategory2("");
      setDept2("");
    }
  }, [category2]);

  useEffect(() =>{
    getSeverity("Coach - Maintenance", "seat")
  }, [predictedCategory])

  //! Get Severity based on text or image
  const getSeverity = async (category, subcategory) => {
    const categoryWeights = {
      seat: 7,
      window: 7,
      food: 4,
      compartment: 6,
      toilet: 3,
      violence: 8,
      management: 1,
      "ticketing issue": 2,
      security: 9,
      electricity: 2,
      medical: 10,
    };

    const categorySubcategories = {
      seat: [
        "bedroll", // Least critical for comfort
        "scratched seat",
        "dirty seat",
        "broken seat", // Most critical for safety and comfort
      ],
      window: [
        "dirty window", // Less critical for safety
        "cracked window",
        "broken window", // Most critical for safety
      ],
      food: [
        "food taste", // Lower priority as it's subjective
        "food quantity",
        "highly charged", // More serious but not health-threatening
        "spoilt/expired food", // Highest priority due to health risk
      ],
      compartment: [
        "garbage inside coach", // Less critical, affects comfort
        "dirty door", // Similar level of discomfort
        "door malfunctioning",
        "electricity not available", // Can be more critical for passenger safety
      ],
      toilet: [
        "flush problem", // Minor inconvenience
        "unhygenic washbasin", // More serious but not urgent
        "unhygenic toilet", // Major cleanliness issue
        "no water", // Highest priority as it impacts hygiene and sanitation
      ],
      violence: [
        "smoking/alcohol", // Disruptive but less serious
        "seat hijacking",
        "passenger violence", // Dangerous but less severe than staff-related issues
        "staff violence/behaviour", // Most serious due to authority abuse
        "bribery", // Potentially very serious but variable in impact
      ],
      management: [
        "missing items", // Minor inconvenience
        "broken equipments", // Could be critical if it affects functionality
        "unhygenic equipments",
        "app issue", // More minor compared to others
        "bribery",
        "train delay", // Impacts schedule and connections, very high priority
      ],
      "ticketing issue": [
        "money issue", // Lower impact compared to wrong ticket
        "wrong ticket", // Higher priority, as it can cause serious travel issues
      ],
      security: [
        "absence of security personnel", // Critical for overall safety
        "robbery", // Very serious safety threat
        "unauthorized person in ladies coach", // Major safety concern
        "misbehaviour with lady passenger", // High priority due to safety and dignity
      ],
      electricity: [
        "Fan", // Less critical than others
        "Light",
        "Escalator Malfunction",
        "Indicator Malfunction",
        "Charging Port", // Important but not critical
        "AC (Air Conditioner)", // High impact for comfort, especially in hot weather
      ],
      medical: [
        "First Aid Kit Requirement", // Important but can wait
        "Medical Assistance", // High priority, critical for safety
      ],
    };

    let severityScore = 0;

    // Add base severity based on category weight
    if (categoryWeights[category]) {
      severityScore += categoryWeights[category];
    } else {
      console.error("Unknown category");
      return 0;
    }

    // Define API endpoints for specific categories
    const apiEndpoints = {
      "Coach - Maintenance": `http://localhost:9898/v1/severity/seat_priority`,
      window: `http://localhost:9898/v1/severity/win_priority`,
      compartment: `http://localhost:9898/v1/severity/comp_severity`,
      violence: `http://localhost:9898/v1/violence/violence_severity`,
    };

    // For specific categories, call the appropriate Python severity API
    if (apiEndpoints[category]) {
      try {
        console.log(file);

        const formData = new FormData();
        formData.append("image", file.file);

        console.log(formData);

        const response = await fetch(apiEndpoints[category], {
          method: "POST",
          body: formData, // No Content-Type header needed; FormData sets it automatically
        });

        const data = await response.json();
        console.log(data);

        if (category == "compartment") {
          const boxes = data.predictions.filter((item) => item.box); // Get entries with boxes
          const boxCount = boxes.length; // Count the number of boxes

          if (boxCount === 1) {
            severityScore += 0.1; // Increase by 0.1 for 1 box
          } else if (boxCount === 2) {
            severityScore += 0.2; // Increase by 0.2 for 2 boxes
          } else if (boxCount === 3) {
            severityScore += 0.3; // Increase by 0.3 for 3 boxes
          } else if (boxCount === 4) {
            severityScore += 0.4; // Increase by 0.4 for 4 boxes
          } else if (boxCount === 5) {
            severityScore += 0.5; // Increase by 0.5 for 5 boxes
          } else if (boxCount === 6) {
            severityScore += 0.6; // Increase by 0.6 for 6 boxes
          } else if (boxCount === 7) {
            severityScore += 0.7; // Increase by 0.7 for 7 boxes
          } else if (boxCount === 8) {
            severityScore += 0.8; // Increase by 0.8 for 8 boxes
          } else if (boxCount === 9) {
            severityScore += 0.9; // Increase by 0.9 for 9 boxes
          } else if (boxCount === 10) {
            severityScore += 1.0; // Increase by 1.0 for 10 boxes
          } else if (boxCount > 10) {
            severityScore += 1.0; // Increase by 1.0 for more than 10 boxes
          }

          console.log(`Number of boxes: ${boxCount}`);
          console.log(`Updated severity score: ${severityScore}`);

          setSeverityScore(severityScore);
          document.getElementById("annotImg").src =
            "data:image/png;base64," + data.image;
        } else if (category == "window") {
          console.log(data.status.severity);

          if (data.status.severity <= 10) {
            severityScore += data.status.severity / 10;
          } else {
            severityScore += 1;
          }

          console.log("final" + severityScore);
          setSeverityScore(severityScore);
          document.getElementById("annotImg").src =
            "data:image/png;base64," + data.status.mask;
        } else if (category == "violence" || category == "seat") {
          console.log(data.severity);

          severityScore += data.severity / 100;
          console.log("final" + severityScore);
          setSeverityScore(severityScore);
          document.getElementById("annotImg").src =
            "data:image/png;base64," + data.overlayed_image;
        } else {
          console.error("Invalid response from severity API");
          severityScore += 0.1; // Default low severity if API fails
        }
      } catch (error) {
        console.error("Error calling severity API:", error);
        severityScore += 0.1; // Default low severity if API fails
      }
    } else {
      // For other categories, calculate severity based on subcategory
      const subcategories = categorySubcategories[category] || [];
      if (subcategories.includes(subcategory)) {
        severityScore +=
          (subcategories.indexOf(subcategory) + 1) / subcategories.length;
      } else {
        severityScore += 0.1; // Default low severity if subcategory is empty or unknown
      }
    }

    // Normalize severity score between 0.1 and 1.0

    setSeverityScore(severityScore);

    return severityScore;
  };

  useEffect(() => {
    if (predictedCategory != "") {
      getSeverity(predictedCategory, subcategory);
    }
  }, [subcategory, predictedCategory]);

  //! FETCH PNR THROUGH IMAGE
  const [file2, setFile2] = useState(null);

  const handleFileChange2 = (event) => {
    setFile2(event.target.files[0]);
  };

  const handleFileUpload2 = async () => {
    if (!file2) {
      alert("Please upload an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file2);

      const response = await fetch(
        "http://localhost:9898/v1/ocr/ocr_extraction",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Assuming the extracted PNR is returned in the extracted_info object
      const extractedInfo = data["Extracted Information"];
      if (extractedInfo && extractedInfo.pnrNo) {
        // setExtractedPnr(extractedInfo.pnrNo);
        setPnrNo(extractedInfo.pnrNo); // Auto-fill the PNR number
        // setField1(pnrNo);
        getPnrData(pnrNo);
      } else {
        // setError("PNR number not found in the image.");
      }
    } catch (err) {
      // setError(`Error: ${err.message}`);
      console.error("Error uploading file:", err);
    }
  };

  useEffect(() => {
    if (file2) {
      handleFileUpload2();
    }
  }, [file2]);

  //! Mapping Department
  const deptMapping = {
    seat: {
      department: "Mechanical",
      role: "Sr. Divisional Mechanical Engineer (Carriage & Wagon)",
    },
    window: {
      department: "Mechanical",
      role: "Sr. Divisional Mechanical Engineer (Carriage & Wagon)",
    },
    food: {
      department: "Catering",
      role: "Sr. Divisional Catering Manager",
    },
    compartment: {
      department: "Hygiene",
      role: "Chief Hygiene Superintendent",
    },
    toilet: {
      department: "Hygiene",
      role: "Chief Hygiene Superintendent",
    },
    violence: {
      department: "Security",
      role: "Sr. Divisional Security Commissioner",
    },
    management: {
      department: "Management",
      role: "Divisional Railway Manager",
    },
    "ticketing issue": {
      department: "Commercial",
      role: "Sr. Divisional Commercial Manager",
    },
    security: {
      department: "Security",
      role: "Sr. Divisional Security Commissioner",
    },
    electricity: {
      department: "Electrical",
      role: "Sr. Divisional Electrical Engineer (General)",
    },
    medical: {
      department: "Medical",
      role: "Sr. Divisional Medical Engineer (General)",
    },
    platform: {
      department: "Hygiene",
      role: "Chief Hygiene Superintendent",
    },
    Security: {
      department: "Security",
      role: "Sr. Divisional Security Commissioner",
    },
    Electricity: {
      department: "Electrical",
      role: "Sr. Divisional Electrical Engineer (General)",
    },
    "Coach - Maintenance": {
      department: "Mechanical",
      role: "Sr. Divisional Mechanical Engineer (Carriage & Wagon)",
    },
    "Catering Services": {
      department: "Catering",
      role: "Sr. Divisional Catering Manager",
    },
    "Medical Assistance": {
      department: "Medical",
      role: "Sr. Divisional Medical Engineer (General)",
    },
    "Water Unavailability": {
      department: "Management",
      role: "Divisional Railway Manager",
    },
    "Dirty Basin": {
      department: "Hygiene",
      role: "Chief Hygiene Superintendent",
    },
  };

  useEffect(() => {
    deptUpd(predictedCategory, category2);
  }, [predictedCategory, category2]);

  const deptUpd = (c1, c2) => {
    // Update dept based on category
    if (c1) {
      setDept(deptMapping[c1]?.department || "");
    } else {
      setDept("");
    }

    // Update dept2 based on category2
    if (c2) {
      setDept2(deptMapping[c2]?.department || "");
    } else {
      setDept2("");
    }

    if (dept == dept2) {
      setDept2("");
    }
  };

  //! Submit Complaint
  const submitComplaint = async () => {
    // event.preventDefault();
    // if (field1 == "" || field2 == "" || field3 == "") {
    //   setPopUpMessage(
    //     field1 == ""
    //       ? "⚠️ field1 👀"
    //       : field2 == ""
    //       ? "⚠️field2 😎"
    //       : field3 == ""
    //       ? "⚠️field3 😆"
    //       : ""
    //   );

    //   setShowPopUp(true);
    //   return;
    // } else {
    //   setShowPopUp(true);
    //   setPopUpMessage("Good Hooman ! 😏");
    //   setTimeout(() => {
    //     setShowPopUp(false);
    //   }, 3000);
    //   return; //temporary
    // }

    try {
      // Check for PNR Number
      if (predictedCategory == "seat" && category2 == "toilet") {
        setCategory2("");
        setDept2("");
      }

      if (pnrNo === "") {
        alert("⚠️ Please Enter your PNR Number OR Upload Ticket");
        return;
      }

      // Validate Predicted Category and Query
      if (predictedCategory === "") {
        if (query === "") {
          alert("⚠️ Kindly select a complaint image or enter a description");
          return;
        } else {
          handleBlur(); // Assuming this processes the query and sets predictedCategory
        }
      }

      // Check for Subcategory
      if (subcategory === "") {
        // await findSubC(predictedCategory, categoryMapping); // Ensure this function is async if it's resolving subcategories
      }

      // Fetch PNR data if Zonal is not available
      if (zonal === "") {
        console.log("Fetching PNR data...");
        await getPnrData(pnrNo);
      }

      // Update Departments based on Categories
      await deptUpd(predictedCategory, category2); // Ensure this updates dept and dept2

      if (dept2 == dept) {
        setDept2("");
      }

      // Prepare the request body
      const reqBody = {
        category: predictedCategory,
        subcategory,
        details: query,
        ticketDetails: pnrNo,
        pnrNo,
        media,
        metadata, // Ensure metadata is defined
        dept, // Ensure dept is updated correctly
        severity: Number(severityScore), // Ensure severityScore is calculated beforehand
        dept2,
        category2,
        trainNo: String(trainNo),
        userId: userData?._id || "", // Fallback if userData or _id is undefined
        zonal,
        division,
        nextStation,
        seatNo,
      };

      useEffect(() =>{
        setPredictedCategory("Coach - Maintenance")
      }, [predictedCategory])

      console.log("Request Body:", reqBody);

      // Make the API call
      const response = await axios.post(
        "http://localhost:3002/user/addcomplaintt",
        reqBody
      );

      // Handle the API response
      if (response.status === 200) {
        alert("Complaint submitted successfully!");
      } else {
        alert("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert(
        "An error occurred while submitting your complaint. Please try again later."
      );
    }
  };

  //! Submit Complaint - 2
  const submitComplaint2 = async () => {
    try {
      // Check for PNR Number
      if (
        (predictedCategory == "seat" && category2 == "toilet") ||
        (predictedCategory == "electricity" && category2 == "toilet")
      ) {
        setCategory2("");
        setDept2("");
      }

      // Validate Predicted Category and Query
      if (predictedCategory === "") {
        if (query === "") {
          alert("⚠️ Kindly select a complaint image or enter a description");
          return;
        } else {
          handleBlur2(); // Assuming this processes the query and sets predictedCategory
        }
      }

      // Check for Subcategory
      if (subcategory === "") {
        // await findSubC(predictedCategory, categoryMapping); // Ensure this function is async if it's resolving subcategories
      }

      // Fetch PNR data if Zonal is not available
      if (zonal === "") {
        console.log("Fetching PNR data...");
        await getPnrData(pnrNo);
      }

      // Update Departments based on Categories
      await deptUpd(predictedCategory, category2); // Ensure this updates dept and dept2

      if (dept2 == dept) {
        setDept2("");
      }

      // Prepare the request body
      const reqBody = {
        category: predictedCategory,
        subcategory,
        details: query,
        ticketDetails: "",
        pnrNo: "",
        media,
        metadata, // Ensure metadata is defined
        dept, // Ensure dept is updated correctly
        severity: Number(severityScore), // Ensure severityScore is calculated beforehand
        dept2,
        category2,
        trainNo: "",
        userId: userData?._id || "", // Fallback if userData or _id is undefined
        zonal: location,
        division: location,
        nextStation: location,
        seatNo: "",
      };

      console.log("Request Body:", reqBody);

      // Make the API call
      const response = await axios.post(
        "http://localhost:3002/user/addcomplaint",
        reqBody
      );

      // Handle the API response
      if (response.status === 200) {
        alert("Complaint submitted successfully!");
      } else {
        alert("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert(
        "An error occurred while submitting your complaint. Please try again later."
      );
    }
  };

  //! Submit Complaint 3
  const submitComplaint3 = async () => {
    try {
      // Check for PNR Number

      if (pnrNo2 === "") {
        alert("⚠️ Please Enter your PNR Number OR Upload Ticket");
        return;
      }

      if (subcategory == "") {
        // findSubC("ticketing issue", categoryMapping);
      }

      // Prepare the request body
      const reqBody = {
        category: "ticketing issue",
        subcategory: subcategory,
        details:
          fetchedOCR.isCancelled +
          fetchedOCR.ticketAmount +
          fetchedOCR.text +
          fetchedOCR2,
        ticketDetails: ticketN,
        pnrNo: pnrNo2,
        media,
        metadata: {}, // Ensure metadata is defined
        dept: "Commercial", // Ensure dept is updated correctly
        severity: 2, // Ensure severityScore is calculated beforehand
        dept2: "",
        category2: "",
        trainNo: trainN,
        userId: userData?._id || "", // Fallback if userData or _id is undefined
        zonal: "",
        division: "",
        nextStation: "",
        seatNo: "",
      };

      console.log("Request Body:", reqBody);

      // Make the API call
      const response = await axios.post(
        "http://localhost:3002/user/addcomplaint",
        reqBody
      );

      // Handle the API response
      if (response.status === 200) {
        alert("Complaint submitted successfully!");
      } else {
        alert("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert(
        "An error occurred while submitting your complaint. Please try again later."
      );
    }
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("Speech Recognition API is not supported in this browser.");
  }

  //! Speech Recognition

  const [isListening, setIsListening] = useState(false);

  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    // recognition.continuous = false; // Automatically stop after pauses
    recognition.interimResults = true; // Show partial results
    recognition.lang = "en-US"; // Language setting
  }

  const transBro = async () => {
    console.log(query);

    try {
      const response = await axios.post("http://localhost:9898/v1/translate", {
        text: document.getElementById("bhaij").value,
      });
      console.log(response);

      setQuery(response.data.translated_text);
    } catch (error) {
      console.error("Translation error:", error);
      setQuery("Error in translation.");
    }
  };

  useEffect(() => {
    if (query) {
      console.log("Updated query:", query);
    }
  }, [query]);

  useEffect(() => {
    if (!recognition) return;

    let silenceTimeout; // Handle stopping after silence

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setQuery(currentTranscript);
      console.log(currentTranscript);

      // Clear the timeout since the user is speaking
      clearTimeout(silenceTimeout);
    };

    recognition.onspeechend = () => {
      // Set timeout to stop recognition after silence
      silenceTimeout = setTimeout(() => {
        // recognition.stop();
        console.log("bro" + query);
      }, 5000); // Adjust delay as needed
    };

    recognition.onend = () => {
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
      console.log(query);

      transBro();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  }, [recognition]);

  const startListening = () => {
    if (!recognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    setIsListening(true);
    recognition.start();
  };

  // const stopListening = () => {
  //   if (recognition) recognition.stop();
  // };

  //! Fetch Location
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (err) => {
        console.log(err);
      }
    );
  };

  //! FETCH PNR THROUGH IMAGE 2
  const [file3, setFile3] = useState(null);
  const [pnrNo2, setPnrNo2] = useState("");
  const [ticketN, setTicketN] = useState("");
  const [trainN, setTrainN] = useState("");
  const [fetchedOCR, setFetchedOCR] = useState("");
  const [fetchedOCR2, setFetchedOCR2] = useState("");

  // useEffect(() => {
  //   setField1(pnrNo);
  // }, [pnrNo]);

  const handleFileChange3 = (event) => {
    setFile3(event.target.files[0]);
  };

  const handleFileUpload3 = async () => {
    if (!file3) {
      alert("Please upload an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file3);

      const response = await fetch(
        "http://localhost:9898/v1/ocr/ocr_extraction",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Assuming the extracted PNR is returned in the extracted_info object
      const extractedInfo = data["Extracted Information"];
      if (extractedInfo && extractedInfo.pnrNo) {
        // setExtractedPnr(extractedInfo.pnrNo);
        setPnrNo2(extractedInfo.pnrNo); // Auto-fill the PNR number
        setTrainN(extractedInfo.trainNo); // Auto-fill the PNR number
        setTicketN(extractedInfo.ticketNo); // Auto-fill the PNR number
        // getPnrData(pnrNo2);
        setFetchedOCR(data["Detected Text"]);
        parseTextTD(data["Detected Text"], patterns);
      } else {
        // setError("PNR number not found in the image.");
      }
    } catch (err) {
      // setError(`Error: ${err.message}`);
      console.error("Error uploading file:", err);
    }
  };

  useEffect(() => {
    if (file3) {
      handleFileUpload3();
    }
  }, [file3]);

  //! Category Detection - Station Complaint
  const handleFileChangeStation = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setFile({ file: selectedFile, type: selectedFile.type });

    // setPredictedCategory("");
    setSubCategory("");
    setCategory2("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:9898/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media.");
      }

      const data = await response.json();
      setMedia(data.image_path); // Set the image path returned by the API
      console.log("File uploaded successfully!", data.image_path);

      const isVideo = selectedFile.type.startsWith("video/");
      const predictEndpoint = isVideo
        ? "http://localhost:9898/v1/stationvideo"
        : "http://localhost:9898/v1/stationimage ";

      if (isVideo) {
        formData.append("file", selectedFile);
      }

      const predictionResponse = await fetch(predictEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!predictionResponse.ok) {
        throw new Error("Failed to predict category.");
      }

      const predictionData = await predictionResponse.json();
      const predictedClass = predictionData.predicted_class;
      const confidence = predictionData.confidence;

      setQuery(predictionData.transcription);

      // console.log(predictedClass + " b");

      if (predictedClass == "bags") {
        setSubCategory("Missing Items");
      } else if (predictedClass == "bedroll") {
        setSubCategory("Bedroll");
      } else if (predictedClass == "charging") {
        setSubCategory("Charging Port");
      } else if (predictedClass == "door") {
        setSubCategory("Door");
      } else if (predictedClass == "board") {
        setSubCategory("Indicator Board");
      } else if (predictedClass == "crowded platform") {
        setSubCategory("Crowded Platform");
      } else if (predictedClass == "dirty platform") {
        setSubCategory("Dirty Platform");
      } else if (predictedClass == "esc") {
        setSubCategory("Escalator");
      } else if (predictedClass == "lift") {
        setSubCategory("Lift");
      } else if (predictedClass == "RailFan") {
        console.log("bro");
        setSubCategory("Fan");
      }        
      else if (predictedClass == "") {
        console.log("bro");
        setSubCategory("crowd");
      }        

      if (confidence >= 0.1 || predictionData.predicted_class == "unhyg_comp") {
        const mappedCategory =
          categoryMapping2[predictedClass] || predictedClass;
        setPredictedCategory("Coach - Maintenance");
      } else {
        setPredictedCategory("Coach - Maintenance");
      }

      console.log("Prediction response:", predictionData);
    } catch (error) {
      console.error("Error uploading file:", error);
      console.log(error);
      ("Failed to upload the file. Please try again.");
    } finally {
      setIsUploading(false);
    }

    getMetadata(selectedFile);
  };

  // ! GET DESC CATEGORY & SUBCATEGORY - Station
  const handleBlur2 = async () => {
    if (query.length < 0) {
      console.log("No DESC");
      return;
    }

    // Call category api for text and store it into category2 if category is not an empty string else store it in category
    try {
      const response = await fetch(
        "http://localhost:9898/v1/text/text_category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ complaint: query }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let broc;

      const data = await response.json();
      if (data.category) {
        // Check if category is not empty and store it in category2, otherwise store in category
        if (predictedCategory == "") {
          const mappedCategory =
            categoryMapping2[data.category] || data.category;
          console.log(mappedCategory);
          setPredictedCategory("Coach - Maintenance");
          broc = mappedCategory;
          // console.log(broc);

          console.log("Category stored in category2:", data.category);
          console.log(broc);
          // await findSubC(broc, categoryMapping);
        } else {
          const mappedCategory2 =
            categoryMapping2[data.category] || data.category;
          console.log(mappedCategory2);
          setCategory2(mappedCategory2);
          broc = mappedCategory2;
          console.log("Category stored in category:", data.category);
          console.log(broc);
          // await findSubC(broc, categoryMapping);
        }
      }

      // await findSubC(broc);
    } catch (error) {
      console.error("Error calling the text category API:", error);
    }
  };

  // const patterns = {
  //   ticketNumber: /\b\d{8}\b/,
  //   trainNumber: /\bTRAINNO\s+(\d{4})\b/i,
  //   travelDate: /\bDATE\s+(\d{2}-\d{2}-\d{4})\b/i,
  //   distanceKm: /\b(\d+)\s*KM\b/i,
  //   passengerType: /\bADULT\b/i,
  //   class: /\bCLASS\s+([a-zA-Z\s]+)/i,
  //   coach: /\bCOACH\s+([a-zA-Z0-9]+)\b/i,
  //   seatBerth: /\bSEATBERTH\s+([a-zA-Z0-9\s]+)\b/i,
  //   reservationFee: /\bR\.FEE\s+(\d+)/i,
  //   totalAmount: /Rs\.\s*([0-9]+)/i,
  //   trainName: /\b([A-Z\s]+EXP)\b/,
  //   from: /\bFROM\s+([a-zA-Z\s]+)\b/i,
  //   to: /\bTO\s+([a-zA-Z\s]+)\b/i,
  //   via: /\bVIA\s+([a-zA-Z\s]+)\b/i,
  // };

  const parseTextTD = (text) => {
    const targetWord = "cancelled";
    const words = text.split(/\s+/); // Split the text into individual words

    let isCancelled = false;
    let ticketAmount = "Not Found";

    // Check for "cancelled" with similarity
    for (const word of words) {
      const similarity = stringSimilarity.compareTwoStrings(
        word.toLowerCase(),
        targetWord
      );
      if (similarity >= 0.7) {
        isCancelled = true;
      }
    }

    useEffect(() => {
      console.log(subcategory);

      setPredictedCategory("Coach - Maintenance");
    }, [subcategory]);

    // Extract ticket amount if `/ -` is present
    const amountMatch = text.match(/(\d+)\s*\/\s*-/);
    if (amountMatch) {
      ticketAmount = amountMatch[1]; // Extract the number before `/ -`
    }

    // Update the state with results
    setFetchedOCR({ isCancelled, ticketAmount, text });
  };

  useEffect(() => {
    console.log(fetchedOCR);
  }, [fetchedOCR]);

  const renderContent = () => {
    const isDisabled = !isAuthenticated;
    const totalPages = Math.ceil(totalComplaints / complaintsPerPage);

    switch (activeTab) {
      case "train":
        return (
          <div className="bro1">
            <h2 className="gr1">Grievance Details for Train</h2>
            {!isAuthenticated ? (
              <p className="loginPrompt">
                ⚠️ Kindly login to register a complaint.
              </p>
            ) : (
              <></>
            )}
            <hr />

            <div>
              <p className="pnrT">Upload Ticket</p>
              <input
                className="filu"
                type="file"
                accept="image/*"
                onChange={handleFileChange2}
              />
            </div>
            {/* {error && <p style={{ color: "red" }}>{error}</p>} */}

            <p className="pnrT">OR</p>
            <p className="pnrT">PNR No.</p>
            <input
              type="text"
              value={pnrNo}
              onChange={(e) => {
                setPnrNo(e.target.value);
              }}
              className="inpS"
              disabled={isDisabled}
            />

            <p className="pnrT">
              Upload Complaint <span>(Image/Video)</span>
            </p>
            <input
              className="filu"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            {isUploading && <p>Uploading file, please wait...</p>}
            {media && (
              <div className="showBhai" style={{ marginTop: "20px" }}>
                <h3>Uploaded File:</h3>
                {file && file.type.startsWith("video/") ? (
                  <video height={200} autoPlay muted controls width="300">
                    <source
                      src={`http://localhost:9898/v1${media}`}
                      type={file.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    id="annotImg"
                    src={
                      media && media.startsWith("data:image") // Check if it's a Base64-encoded image
                        ? media
                        : `http://localhost:9898/v1${media}` // Use localhost if not Base64
                    }
                    alt="Uploaded"
                    style={{ width: "300px", height: "auto" }}
                  />
                )}
              </div>
            )}

            <p className="gd1">
              Grievance Description{" "}
              <i
                onClick={() => {
                  startListening();
                  // else stopListening();
                }}
                className={`fa-solid ${
                  isListening ? "fa-microphone-slash" : "fa-microphone"
                }`}
                style={{
                  cursor: "pointer",
                  color: isListening ? "red" : "black",
                }}
              ></i>
            </p>

            <textarea
              className="tabhai"
              style={styles.textarea}
              onFocus={() => {
                // setSubCategory("");
              }}
              id="bhaij"
              value={query}
              onBlur={handleBlur2}
              onChange={handleInputChange}
              placeholder="Describe your issue..."
            ></textarea>
            <ul style={styles.suggestionList}>
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="sugg1"
                  style={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.details}
                </li>
              ))}
            </ul>
            <div className="flexCat">
              <div className="tt1">
                <p>Category</p>
                <input
                  type="text"
                  value={"Coach - Maintenance"}
                  disabled={isDisabled}
                  readOnly
                />
              </div>
              <div className="tt1" id="t2">
                <p>Sub Category</p>
                <input
                  type="text"
                  value={subcategory}
                  disabled={isDisabled}
                  readOnly
                />
              </div>
            </div>

            {/* Bind the value of datetime-local input to the state */}
            <p className="it2" disabled={isDisabled}>
              Incident Time
            </p>
            <input
              className="datel"
              type="datetime-local"
              value={datetime}
              disabled={isDisabled}
              onChange={(e) => setDatetime(e.target.value)} // Update the state when the value changes
            />

            <p className="pri1">
              Priority : <span>{severityScore.toFixed(2)}</span>
            </p>

            <div className="buttonTrain">
              <button
                onClick={() => {
                  submitComplaint();
                }}
                className="btnS"
                disabled={isDisabled}
              >
                Submit
              </button>
              <button className="btnR" disabled={isDisabled}>
                Reset
              </button>
            </div>
          </div>
        );
      case "station":
        return (
          <div className="bro1">
            <h2 className="gr1">Grievance Details for Platform</h2>

            <hr />
            <button
              onClick={() => {
                fetchLocation();
              }}
              className="fetchLoc"
            >
              <i class="fa-solid fa-location-dot"></i>Fetch Location
            </button>
            <p className="pnrT">Location/Platform</p>
            <input
              type="text"
              className="inpS"
              value={`Lat : ${location.latitude}, Long : ${location.longitude}`}
            />

            <p className="pnrT">
              Upload Complaint <span>(Image/Video)</span>
            </p>
            <input
              className="filu"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChangeStation}
            />
            {media && (
              <div className="showBhai" style={{ marginTop: "20px" }}>
                <h3>Uploaded File:</h3>
                {file && file.type.startsWith("video/") ? (
                  <video height={200} autoPlay muted controls width="300">
                    <source
                      src={`http://localhost:9898/v1${media}`}
                      type={file.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    id="annotImg"
                    src={`http://localhost:9898/v1${media}`}
                    alt="Uploaded"
                    style={{ width: "300px", height: "auto" }}
                  />
                )}
              </div>
            )}

            <div className="flexCat">
              <div className="tt1">
                <p>Category</p>
                <input
                  type="text"
                  value={predictedCategory}
                  disabled={isDisabled}
                  readOnly
                />
              </div>
              <div className="tt1" id="t2">
                <p>Sub Category</p>
                <input
                  type="text"
                  value={subcategory}
                  disabled={isDisabled}
                  readOnly
                />
              </div>
            </div>

            <p className="gd1">
              Grievance Description{" "}
              <i
                onClick={() => {
                  setIsListening((prevState) => {
                    if (!prevState) {
                      startListening();
                    } else {
                      stopListening();
                    }
                    return !prevState; // Toggle the listening state
                  });
                }}
                className={`fa-solid ${
                  isListening ? "fa-microphone-slash" : "fa-microphone"
                }`}
                style={{
                  cursor: "pointer",
                  color: isListening ? "red" : "black",
                }}
              ></i>
            </p>
            <textarea
              className="tabhai"
              style={styles.textarea}
              onFocus={() => {
                setSubCategory("");
              }}
              id="bhaij"
              value={query}
              onBlur={handleBlur}
              onChange={handleInputChange}
              placeholder="Describe your issue..."
            ></textarea>
            {/* Bind the value of datetime-local input to the state */}
            <p className="it2">Incident Time</p>
            <input
              className="datel"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)} // Update the state when the value changes
            />

            <p className="pri1">
              Priority : <span>TBD</span>
            </p>

            <div className="buttonTrain">
              <button
                className="btnS"
                onClick={() => {
                  submitComplaint2();
                }}
              >
                Submit
              </button>
              <button className="btnR">Reset</button>
            </div>
          </div>
        );
      case "ticket":
        return (
          <div className="bro1">
            <h2 className="gr1">Grievance Details for Ticket</h2>

            <hr />

            <p className="pnrT">
              Upload Ticket <span>(Image)</span>
            </p>

            <input
              onChange={handleFileChange3}
              className="filu"
              type="file"
              name=""
              id=""
            />

            <p className="pnrT">Ticket PNR</p>
            <input type="text" className="inpS" value={pnrNo2} />

            <div className="flexCat">
              <div className="tt1">
                <p>Ticket No</p>
                <input type="text" value={ticketN} />
              </div>
              <div className="tt1" id="t2">
                <p>Train No</p>
                <input type="text" value={trainN} />
              </div>
            </div>

            <p>{`Fetched Ticket Details : Cancelled ? = ${fetchedOCR.isCancelled}, Amount : ${fetchedOCR.ticketAmount}, Other Ticket Details : ${fetchedOCR.text}`}</p>

            <p className="gd1">Grievance Description</p>
            <textarea
              name=""
              id=""
              onChange={(e) => {
                setFetchedOCR2(e.target.value);
              }}
              value={fetchedOCR2}
            ></textarea>

            {/* Bind the value of datetime-local input to the state */}
            <p className="it2">Incident Time</p>
            <input
              className="datel"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)} // Update the state when the value changes
            />

            <p className="pri1">
              Priority : <span>TBD</span>
            </p>

            <div className="buttonTrain">
              <button className="btnS" onClick={submitComplaint3}>
                Submit
              </button>
              <button className="btnR">Reset</button>
            </div>
          </div>
        );
      case "track":
        return (
          <div>
            {compData && (
              <select
                className="filterUB"
                name="filter"
                onChange={(e) => filterB(e.target.value)}
              >
                <option value="EF">Early First</option>
                <option value="RF">Recent First</option>
                <option value="SE">Severity</option>
                <option value="ST">Status</option>
              </select>
            )}

            {compData && (
              <div className="complaintsData broo2 broo5">
                {compData.length > 0 ? (
                  <ul>
                    {compData.map((complaint) => (
                      <div
                        key={complaint._id}
                        className="staffCompH broo3 broo6"
                      >
                        <p className="bhhh">
                          <strong>{complaint.details}</strong>
                        </p>
                        <p>{complaint.startTime}</p>
                        <p>
                          {complaint.category} -{" "}
                          {complaint.subcategory || "N/A"}
                        </p>
                        <p>Severity - {complaint.severity || "N/A"}</p>
                        <p>
                          <strong>Status:</strong> {complaint.status}
                        </p>
                        {complaint.media && (
                          <button
                            className="vmb"
                            onClick={() => handleMediaClick(complaint.media)}
                          >
                            View Media
                          </button>
                        )}
                        {complaint.status === "Completed" &&
                          !complaint.feedback && (
                            <button onClick={() => handleFeedback(complaint)}>
                              Give Feedback
                            </button>
                          )}
                        {complaint.status === "Pending" && (
                          <button
                            className="bhaiii"
                            onClick={() => handleDeleteComplaint(complaint._id)}
                          >
                            Delete Complaint
                          </button>
                        )}
                        {complaint.status === "Completed" && (
                          <button
                            className="bhaiii bhaiii2"
                            onClick={() => handleReportComp(complaint._id)}
                          >
                            Report ⚠️
                          </button>
                        )}
                        {/* Reraise Complaint Logic */}
                        {(() => {
                          const currentTime = new Date();
                          const complaintTime = new Date(
                            complaint.startTime.replace(
                              /(\d+)\/(\d+)\/(\d+)/,
                              "$2/$1/$3"
                            )
                          );
                          const timeDifference =
                            (currentTime - complaintTime) / (1000 * 60);

                          if (
                            timeDifference > 30 &&
                            complaint.status == "Pending"
                          ) {
                            return (
                              <button
                                onClick={() =>
                                  handleReraiseComplaint(complaint._id)
                                }
                              >
                                Reraise Complaint
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    ))}
                  </ul>
                ) : (
                  <p>No complaints data available</p>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="fbtn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  ◀️ Previous
                </button>

                <div className="bichwala">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={currentPage === index + 1 ? "activeH" : ""}
                      id="cbtn"
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="fbtn2"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next ▶️
                </button>
              </div>
            )}
            {/* Media Popup */}
            {selectedMedia && (
              <div className="popup1">
                <div className="popup-content1">
                  <span className="close1" onClick={closePopup}>
                    &times;
                  </span>
                  {getMediaType(selectedMedia) === "video" ? (
                    <video controls>
                      <source src={selectedMedia} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={selectedMedia} alt="Complaint Media" />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <p>Select an option to see content.</p>;
    }
  };

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      margin: "50px auto",
      maxWidth: "400px",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      minHeight: "100px",
    },
    suggestionList: {
      listStyle: "none",
      padding: "0",
      margin: "10px 0 0",
      border: "1px solid #ddd",
      maxHeight: "150px",
      overflowY: "auto",
    },
    suggestionItem: {
      padding: "8px",
      cursor: "pointer",
      backgroundColor: "#fff",
    },
    suggestionItemHover: {
      backgroundColor: "#eee",
    },
  };

  const [selectedMedia, setSelectedMedia] = useState(null);

  // Media Popup Handlers
  const handleMediaClick = (media) => {
    console.log(media);

    // Check if the media string starts with "https"
    const updatedMedia = media.startsWith("https")
      ? media
      : `http://localhost:9898/v1${media}`;

    // Set the selected media
    setSelectedMedia(updatedMedia);
  };

  const closePopup = () => {
    setSelectedMedia(null);
  };

  const getMediaType = (url) => {
    const videoExtensions = ["mp4", "webm", "ogg"];
    const fileExtension = url.split(".").pop().toLowerCase();
    return videoExtensions.includes(fileExtension) ? "video" : "image";
  };

  const handleReraiseComplaint = async (complaintId) => {
    try {
      // Sending a POST request to your backend to re-raise the complaint
      const response = await axios.post(
        "http://localhost:3002/user/reraisecomp",
        {
          complaintId: complaintId,
        }
      );

      // Handle successful response
      alert(response.data.message); // Show success message
      setActiveTab("train");
    } catch (error) {
      // Handle error
      alert(
        error.response
          ? error.response.data.message
          : "Error re-raising complaint"
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
  };

  return (
    <>
      <div className="topBar">
        <div className="flexEle">
          <img className="logoS1" src={satyaj} alt="" />
          <img src={railmadadl} alt="" className="logoS2" />
          <img src={g20l} alt="" className="logoS3" />
          <div className="railTB">
            <img src={railsahl} alt="" />
            <p>For Enquiry, Assistance & Grievance Redressal</p>
          </div>
          <div className="emergC">
            <img src={emergencyC} className="logoS4" alt="" />
            <p>For Emergency Complaint</p>
          </div>
          <div className="authOptions">
            {!isAuthenticated && (
              <button
                className="loginBtn broSl"
                onClick={() => setPopupType("login")}
              >
                Log In
              </button>
            )}

            {!isAuthenticated && (
              <button
                className="signBtn broSi"
                onClick={() => setPopupType("register")}
              >
                Sign Up
              </button>
            )}

            {isAuthenticated && (
              <button className="signBtn" onClick={() => setPopupType("userp")}>
                <i className="fas fa-user"></i>
              </button>
            )}

            {isAuthenticated && (
              <i
                class="fa-solid fa-power-off"
                onClick={() => {
                  handleLogout();
                }}
                id="logoutU"
              ></i>
            )}
          </div>
          <select name="language" id="selLang">
            <option value="english">English</option>
            <option value="hindi">हिन्दी</option>
            <option value="bengali">বাংলা</option>
            <option value="marathi">मराठी</option>
            <option value="gujarati">ગુજરાતી</option>
            <option value="kannada">ಕನ್ನಡ</option>
            <option value="malayalam">മലയാളം</option>
            <option value="punjabi">ਪੰਜਾਬੀ</option>
            <option value="odia">ଓଡ଼ିଆ</option>
            <option value="sanskrit">संस्कृत</option>
            <option value="tamil">தமிழ்</option>
            <option value="telugu">తెలుగు</option>
            <option value="urdu">اردو</option>
          </select>
        </div>
      </div>

      <div className="flexC">
        <div className="redirectIcons">
          <div className="flext">
            <div className="f1">
              <img src={f1} alt="" />
              <p>Ticket Booking</p>
            </div>
            <div className="f1">
              <img src={f2} alt="" />
              <p>Train Enquiry</p>
            </div>
          </div>
          <div className="flext">
            <div className="f1">
              <img src={f3} alt="" />
              <p>Reservation Enquiry</p>
            </div>
            <div className="f1">
              <img src={f4} alt="" />
              <p>Retiring Room Booking</p>
            </div>
          </div>
          <div className="flext">
            <div className="f1">
              <img src={f5} alt="" />
              <p>Indian Railway</p>
            </div>
            <div className="f1">
              <img src={f6} alt="" />
              <p>UTS Ticketing</p>
            </div>
          </div>
          <div className="flext">
            <div className="f1">
              <img src={f7} alt="" />
              <p>Raiway Parcel Website</p>
            </div>
            <div className="f1">
              <img src={f8} alt="" />
              <p>Freight Booking</p>
            </div>
          </div>
        </div>

        <div
          className="compOptions"
          style={{
            pointerEvents: "auto",
            opacity: isAuthenticated ? 1 : 0.85,
          }}
        >
          <div
            className={`trainC ${activeTab === "train" ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                alert("⚠️ You need to be Login to access this option.");
              } else {
                setActiveTab("train");
              }
            }}
          >
            <img src={trainI} alt="" />
            <p>Train</p>
          </div>
          <div
            className={`trainC ${activeTab === "station" ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                alert("⚠️ You need to be Login to access this option.");
              } else {
                setActiveTab("station");
              }
            }}
          >
            <img src={stationI} alt="" />
            <p>Station</p>
          </div>
          <div
            className={`trainC ${activeTab === "ticket" ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                alert("⚠️ You need to be Login to access this option.");
              } else {
                setActiveTab("ticket");
              }
            }}
          >
            <img src={ticketI} alt="" />
            <p>Ticket</p>
          </div>
          <div
            className={`trainC trainC0 ${
              activeTab === "track" ? "active" : ""
            }`}
            onClick={() => {
              if (!isAuthenticated) {
                alert("⚠️ You need to be Login to access this option.");
              } else {
                setCurrentPage(1);
                fetchComplaintData();
                setActiveTab("track");
              }
            }}
          >
            <img src={trackI} alt="" />
            <p>Track Complaints</p>
          </div>
        </div>

        <div className="compBox">{renderContent()}</div>
      </div>

      <Popup show={popupType !== null} onClose={handlePopupClose}>
        {popupType === "login" && (
          <Login
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
            handlePopupClose={handlePopupClose}
          />
        )}
        {popupType === "register" && (
          <Register onClose={handlePopupClose} setPopupType={setPopupType} />
        )}
        {popupType === "feedback" && selectedComplaint && (
          <UserFeedback
            complaintD={selectedComplaint}
            handlePopupClose={handlePopupClose}
            setActiveTab={setActiveTab}
          />
        )}
        {popupType === "userp" && userData && (
          <UserProfile
            userData={userData}
            handlePopupClose={handlePopupClose}
            setActiveTab={setActiveTab}
          />
        )}
      </Popup>


      {bot_view ? <Chatbot setbot_view={setbot_view} bot_view={bot_view} messages={messages} setMessages={setMessages} field1={field1} setField1={setField1}/> : ''}


      <button className='bot_button' onClick={() => {
        setbot_view(!bot_view)
        setShowPopUp(false)
        if(field1=='' && field2=='' && field3 == '')return
        setMessages((prev) => {
          const newMessage = { sender: 'bot', text: field1 + " " + field2 + " " + field3 };
          const lastMessage = prev[prev.length - 1];
        
          if (lastMessage && lastMessage.text === newMessage.text) {
            // If the last message is the same as the new message, return the previous state
            return prev;
          } else {
            // Otherwise, add the new message to the previous state
            return [...prev, newMessage];
          }
        });
      }}>
        <i className="fa-solid fa-robot"></i>
        {showPopUp ? <div className="popUp">
          {popUpMessage} ...
        </div> : ""}
      </button>




    </>
  );
};

export default Home;
