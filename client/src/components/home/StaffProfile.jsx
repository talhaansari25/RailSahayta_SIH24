import React, { useEffect } from "react";

const StaffProfile = ({ userData }) => {
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <div className="staffProfile">
    <div className="flexb1">
      <img
        src="https://cdn-icons-png.flaticon.com/128/6239/6239347.png"
        alt=""
      />
      <p>✅ Verified</p>
    </div>
  
    <div className="profDet">
      <p className="nameS">Mr. {userData.name}</p>
      <p className="emailS">Email: <span>{userData.email}</span></p>
      <p className="trainNoS">Train No: <span>{userData.trainNo}</span></p>
      <p className="deptS">Zonal Region: <span>{userData.zonal}</span></p>
      <p className="deptS">Division: <span>{userData.division}</span></p>
      <p className="deptS">Department: <span>{userData.dept}</span></p>
      <p className="shiftS">Duty Shift: <span>{(userData.dutyShift).charAt(0).toUpperCase() + userData.dutyShift.slice(1).toLowerCase()}</span></p>
  
      <p className="compS">Complaints Solved: <span>{userData.compSolved.length}</span></p>
      <p className="compS">Complaints Assigned: <span>{userData.compAssigned.length}</span></p>
  
      {/* Display stars based on avgRating */}
      <div className="ratingStars">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`star ${index < userData.avgRating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  </div>
  
  );
};

export default StaffProfile;
