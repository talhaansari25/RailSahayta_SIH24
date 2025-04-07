import React, { useState } from "react";

const Register = ({ setPopupType }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    currPnr: "",
    mobile: "", // Added mobile number to the state
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add client-side validation if needed
    const response = await fetch("http://localhost:3002/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registration Successful");
      setPopupType("login");
    } else {
      alert(data.error || "Error during registration");
    }
  };

  return (
    <div className="regForm">
      <h3>Create an Account</h3>
      <form onSubmit={handleSubmit}>
        <input
        className="pri12"
          type="text"
          name="name"
          value={formData.name}
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <p>*Please Enter a Password with more than 6 Characters</p>
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <p>Enter a Mobile No. (Optional)</p>
        <input
          type="number"
          name="mobile"
          value={formData.mobile}
          placeholder="Phone No."
          onChange={handleChange}
        />
        <p>Enter a Current PNR No. (If Available)</p>
        <input
          type="number"
          name="currPnr"
          value={formData.currPnr}
          placeholder="PNR No"
          onChange={handleChange}
        />
        <button type="submit">Register Now</button>
      </form>
    </div>
  );
};

export default Register;
