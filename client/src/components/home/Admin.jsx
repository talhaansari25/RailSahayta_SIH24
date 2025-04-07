import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import satyaj from "../../assets/icons/satyamevl.webp";
import railmadadl from "../../assets/icons/railmadadl.png";
import g20l from "../../assets/icons/g20l.png";
import railsahl from "../../assets/icons/railsahl.png";
import emergencyC from "../../assets/icons/emergC.png";
import AdminProfile from "./AdminProfile";
import Popup from "./Popup";
import AdminLogin from "../auth/AdminLogin";
import axios from "axios";
import RecurringIssue from "../charts/RecurringIssue.jsx";
import CompCount from "../charts/CompCount.jsx";
import ComplaintRR from "../charts/ComplaintRR.jsx";
import ComplaintRR2 from "../charts/ComplaintRR2.jsx";
import StaffAvgRating from "../charts/StaffAvgRating.jsx";
import AddStaff from "./AddStaff.jsx";
import DutyShift from "../charts/DutyShift";



const Admin = () => {
  const [popupType, setPopupType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showType, setShowType] = useState("staffs");
  const [showData, setShowData] = useState([]);
  const [staffId1, setStaffId1] = useState(localStorage.getItem("userId"));
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [recIssue, setRecIssue] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [compData, setCompData] = useState([]);

  useEffect(() => {
    if (showType == "staffs") {
      setStaffData(showData);
    }
  }, [showData]);

  // Update staff ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // Fetch initial data
    if (showType == "complaints" && userData) {
      getComplaintsData();
    } else if (showType == "staffs" && userData) {
      getStaffData();
      getComplaintsData();
    }

  }, [localStorage.getItem("userId"), showType, staffId1, userData]);

  const handleStaffAdded = () => {
    getStaffData(); // Refresh the staff data
  };

  const fetchData = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:9898/v1/forecast", {
        department: userData.dept,
      });
      setRecIssue(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  // Listen for localStorage changes
  useEffect(() => {
    setStaffId1(localStorage.getItem("userId"));
  }, [localStorage.getItem("userId")]);

  // Validate user on load
  useEffect(() => {
    const validateUser = async () => {
      const userId = localStorage.getItem("userId");
      const userType = "admin"; // Hardcoded, replace with dynamic logic if required

      if (userId && userType) {
        try {
          const response = await axios.post(
            "http://localhost:3002/auth/fetchuserdata",
            {
              userId,
              userType,
            }
          );

          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserData(response.data.userData);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Error validating user:", error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
    };

    validateUser();
  }, [localStorage.getItem("userId")]);

  // Handle Logout
  const handleLogout = () => {

    setShowData([])
    setCompData([])
    setStaffData([])
    setIsAuthenticated(false);
    setPopupType("login");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
  };

  // Close popup
  const handlePopupClose = () => {
    if (popupType === "login" && !isAuthenticated) return;
    setPopupType(null);
  };

  // Fetch staff data
  const getStaffData = async () => {
    if (!userData || !userData.dept) {
      console.warn("User data or department is not available yet");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/admin/getstaffbydept",
        {
          dept: userData.dept,
        }
      );
      setShowData(response.data.staff || []);
      console.log("Fetched Staff Data:", response.data.staff);
    } catch (err) {
      console.error("Error fetching staff data:", err);
    }
  };

  // Fetch complaints data
  const getComplaintsData = async () => {
    if (!userData || !userData.dept) {
      console.warn("User data or department is not available yet");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/admin/deptcomp",
        {
          dept: userData.dept,
        }
      );
      if (showType == "complaints") {
        setShowData(response.data.complaints || []);
      }
      setCompData(response.data.complaints || []);
      console.log("Fetched Complaints Data:", response.data.complaints);
    } catch (err) {
      console.error("Error fetching complaints data:", err);
    }
  };

  // Media Popup Handlers
  const handleMediaClick = (media) => {
    const updatedMedia = media.startsWith("https")
    ? media
    : `http://localhost:9898/v1${media}`;
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

  const [morningCount, setMorningCount] = useState(0);
  const [nightCount, setNightCount] = useState(0);

  useEffect(() => {
    const morning = staffData.filter(
      (staff) => staff.dutyShift === "morning"
    ).length;
    const night = staffData.filter(
      (staff) => staff.dutyShift === "night"
    ).length;

    setMorningCount(morning);
    setNightCount(night);
  }, [staffData]);

  // Capitalize the first letter of each word
  const capitalizeFirstLetter = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const parseCustomDate = (dateString) => {
    const [datePart, timePart] = dateString.split(", ");
    const [day, month, year] = datePart.split("/").map(Number); // Convert to numbers
    const [hours, minutes, seconds] = timePart.split(":").map(Number); // Convert to numbers
    return new Date(year, month - 1, day, hours, minutes, seconds); // Create Date object
  };

  const filterB = (filterType) => {
    if (!Array.isArray(showData)) {
      console.error("showData must be an array");
      return;
    }

    let sortedData = [...showData]; // Copy the array to avoid mutations

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
    if (typeof setShowData === "function") {
      setShowData(sortedData);
    } else {
      console.error("setShowData is not defined or not a function");
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="topBar">
        <div className="flexEle">
          <img className="logoS1" src={satyaj} alt="" />
          <img src={railmadadl} alt="" className="logoS2" />
          <img src={g20l} alt="" className="logoS3" />
          <div className="railTB">
            <img src={railsahl} alt="" />
            <p>For Admin</p>
          </div>
          <div className="emergC">
            <img src={emergencyC} className="logoS4" alt="" />
            <p>For Emergency Issue</p>
          </div>
          <div className="authOptions">
            {!isAuthenticated && (
              <button
                className="loginBtn"
                onClick={() => setPopupType("login")}
              >
                Admin Log In
              </button>
            )}
            {isAuthenticated && (
              <button
                className="signBtn"
                onClick={() => setPopupType("profile")}
              >
                Admin Profile
              </button>
            )}
            {isAuthenticated && <button className="signBtn" onClick={() => setPopupType("addstaff")}>Add Staff</button>}
          </div>
          <i class="fa-solid fa-power-off" onClick={() => {handleLogout()}} id="logoutAdmin"></i>
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

      {/* Dashboard Content */}
      <div className="flexAdminD">
        <div className="adminDashboard">
          <h2>Dashboard</h2>
          <div className="scrollDB">
            {userData && (
              <RecurringIssue chartData={recIssue} department={userData.dept} />
            )}

            <div className="flexCt">
              {staffData && <CompCount staffData={staffData} />}
              {nightCount && (
                <DutyShift
                  morningCount={morningCount}
                  nightCount={nightCount}
                />
              )}
            </div>

            {compData && <ComplaintRR complaintsData={compData} />}
            {compData && <ComplaintRR2 complaintsData={compData} />}

            {staffData && <StaffAvgRating staffData={staffData} />}
          </div>
        </div>
        <div className="adminControls">
          {/* Tabs for switching views */}
          <div className="controlTabs">
            <button
              className={`controlButton ${
                showType === "staffs" ? "activez" : ""
              }`}
              onClick={() => setShowType("staffs")}
            >
              Staffs
            </button>
            <button
              className={`controlButton ${
                showType === "complaints" ? "activez" : ""
              }`}
              onClick={() => setShowType("complaints")}
            >
              Complaints
            </button>

            {showType === "complaints" && (
              <select name="filter" onChange={(e) => filterB(e.target.value)}>
                <option value="EF">Early First</option>
                <option value="RF">Recent First</option>
                <option value="SE">Severity</option>
                <option value="ST">Status</option>
              </select>
            )}
          </div>

          {/* Dynamic content display */}
          <div className="controlContent">
            {showType === "staffs" && (
              <div className="staffsData">
                {showData.length > 0 ? (
                  <div>
                    {showData.map((staff, index) => (
                      <div className="staffDetails" key={index}>
                        <div className="flexBrr">
                          <img
                            src="https://cdn-icons-png.flaticon.com/128/2534/2534879.png"
                            alt=""
                          />
                        </div>
                        <div>
                          <p>
                            <strong>{staff.name} </strong>({staff.email})
                          </p>

                          <p>
                            Duty Shift :{" "}
                            {staff.dutyShift === "morning" ? "🌤️" : "🌙"}{" "}
                            {staff.dutyShift}
                          </p>
                          <p>Avg Rating : ⭐ {staff.avgRating || "N/A"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No staff data available</p>
                )}
              </div>
            )}
            {showType === "complaints" && (
              <div className="complaintsData broo2 bhaisun">
                {showData.length > 0 ? (
                  <ul>
                    {showData.map((complaint, index) => (
                      <div key={complaint._id} className="staffCompH broo3">
                        <p>
                          {" "}
                          <strong>{complaint.details}</strong>
                        </p>
                        <p>{complaint.startTime}</p>
                        <p>
                          {complaint.category} -{" "}
                          {complaint.subcategory || "N/A"}
                        </p>

                        <p>
                          <strong>Status:</strong> {complaint.status}
                        </p>
                        {/* <p>
                          <strong>
                            Seat: <br />
                          </strong>{" "}
                          M2/32
                        </p> */}

                        {complaint.media && (
                          <button
                            onClick={() => handleMediaClick(complaint.media)}
                          >
                            View Media
                          </button>
                        )}
                      </div>
                    ))}
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
                  </ul>
                ) : (
                  <p>No complaints data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Component */}
      <Popup show={popupType !== null} onClose={handlePopupClose}>
        {popupType === "login" && !isAuthenticated && (
          <AdminLogin
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
            handlePopupClose={handlePopupClose}
            setPopupType={setPopupType}
          />
        )}
        {popupType === "profile" && isAuthenticated && (
          <AdminProfile userData={userData} />
        )}
        {popupType === "addstaff" && isAuthenticated && (
          <AddStaff userData={userData} setShowType={setShowType} handlePopupClose={handlePopupClose} onStaffAdded={handleStaffAdded} />
        )}
      </Popup>
    </div>
  );
};

export default Admin;
