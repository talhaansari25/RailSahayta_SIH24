import React from "react";
import axios from "axios";

const StaffCookies = ({ cookies, staffId, onRemove }) => {
  console.log(cookies);

  const handleRemove = async (cookieId) => {
    try {
      // Call the API to remove the cookie
      const staffId = localStorage.getItem('userId')
      const response = await axios.post(
        "http://localhost:3002/staff/removecookie",
        {
          staffId,
          cookieId,
        }
      );
    //   alert(response.data.message);

      // Trigger the onRemove callback to refresh the cookies list
      onRemove(cookieId);
    } catch (error) {
      console.error(
        "Error removing cookie:",
        error.response?.data?.message || error.message
      );
      alert("Failed to remove cookie.");
    }
  };

  return (
    <div>
      {cookies && cookies.length > 0 ? (
        <ul>
          {cookies.map((cookie) => (
            <div className="cookieBox" style={{ marginBottom: "10px" }}>
              <p className="descBhai"><strong>⚠️ </strong> {cookie.desc}</p> 
              <p><strong>🕑{new Date(cookie.createdAt).toLocaleString()} </strong></p>

              <button onClick={() => handleRemove(cookie._id)}>Done</button>
            </div>
          ))}
        </ul>
      ) : (
        <p>No cookies available.</p>
      )}
    </div>
  );
};

export default StaffCookies;
