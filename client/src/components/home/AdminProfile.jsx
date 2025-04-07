
import React from 'react'

const AdminProfile = ({userData}) => {
  console.log(userData);
  
  return (
    <div className="staffProfile">
    <div className="flexb1">
      <img
        src="https://cdn-icons-png.flaticon.com/128/10841/10841518.png"
        alt=""
      />
      <p>✅ Verified</p>
    </div>
  
    <div className="profDet">
      <p className="nameS">{userData.role}</p>
      <p className="emailS">Email: <span>{userData.email}</span></p>
    
      <p className="deptS">Department: <span>{userData.dept}</span></p>
      <p className="deptS">Zonal: <span>{userData.zonal}</span></p>
      <p className="deptS">Division: <span>{userData.division}</span></p>
     

    </div>
  </div>
  )
}

export default AdminProfile