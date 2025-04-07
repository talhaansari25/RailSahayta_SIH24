
import React from 'react'

const UserProfile = ({userData}) => {
  console.log(userData);
  
  return (
    <div className="staffProfile">
    <div className="flexb1">
      <img
        src="https://cdn-icons-png.flaticon.com/128/16869/16869838.png"
        alt=""
      />
      <p>✅ Verified</p>
    </div>
  
    <div className="profDet">
      <p className="nameS">{userData.name}</p>
      <p className="emailS">Email: <span>{userData.email}</span></p>
    
      <p className="deptS">Mobile: <span>{userData.mobile}</span></p>
     

    </div>
  </div>
  )
}

export default UserProfile