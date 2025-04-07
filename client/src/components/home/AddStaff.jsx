import React, { useState } from "react";
import axios from "axios";

const AddStaff = ({ userData, setShowType, handlePopupClose, onStaffAdded  }) => {
  const [formData, setFormData] = useState({
    name: "",
    password: userData.dept.toLowerCase() + "123",
    dept: userData.dept,
    trainNo: "",
    dutyShift: "morning",
    station : "",
    zonal : userData.zonal,
    division : userData.division
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = formData.name.split(" ")[0].toLowerCase();
    const email = `${firstName}.${userData.dept.toLowerCase()}@gmail.com`;

    try {
      const response = await axios.post("http://localhost:3002/admin/addstaff", {
        ...formData,
        email,
      });

      setMessage(response.data.message);
      setError("");

      // Notify parent about the new staff
      if (onStaffAdded) {
        onStaffAdded();
      }

      // Reset form fields
      setFormData({
        name: "",
        password: userData.dept.toLowerCase() + "123",
        dept: userData.dept,
        trainNo: "",
        dutyShift: "morning",
        station : ""
      });
      setShowType("staffs");
      handlePopupClose();
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.error || "An unexpected error occurred");
    }
  };
  

  return (
    <div className="regForm">
      <h3>Add New Staff</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <p className="firstC1">Name:</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
         
            required
          />
        </div>
        <div>
          <p className="">Email:</p>
          <input
            type="email"
            name="email"
            value={
              formData.name.split(" ")[0].toLowerCase() + "." + userData.dept.toLowerCase() + "@gmail.com"
            }
            readOnly
            required
          />
        </div>
        <div>
          <p>Train No:</p>
          <input
            type="text"
            name="trainNo"
            value={formData.trainNo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <p>Station</p>
          <input
            type="text"
            name="station"
            value={formData.station}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="firstC1">Duty Shift:</label>
          <select
            name="dutyShift" // Corrected name attribute
            value={formData.dutyShift}
            onChange={handleChange}
          >
            <option value="morning">Morning</option>
            <option value="night">Night</option>
          </select>
        </div>
        <button className="bh11" type="submit">
          Add Staff
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddStaff;
