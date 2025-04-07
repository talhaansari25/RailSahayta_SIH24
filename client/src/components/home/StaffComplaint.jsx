import React, { useState } from 'react';
import axios from 'axios';

const StaffComplaint = ({ complaints, setCompView , onComplete, onProcess}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Open media popup
  const handleMediaClick = (media) => {
    const updatedMedia = media.startsWith("https")
    ? media
    : `http://localhost:9898/v1${media}`;
    setSelectedMedia(updatedMedia);

  };

  // Close media popup
  const closePopup = () => {
    setSelectedMedia(null);
  };

  // Determine media type
  const getMediaType = (url) => {
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const fileExtension = url.split('.').pop().toLowerCase();
    return videoExtensions.includes(fileExtension) ? 'video' : 'image';
  };

  const capitalizeFirstLetter = (str) => {
    return str
      .split(' ') // Split the string by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
      .join(' '); // Join the words back together
  };

  const updateStatus = async (complaintId, status) => {
    try {
        const response = await axios.post('http://localhost:3002/staff/updatecompstatus', {
          complaintId,
          status,
        });
        if(status == 'completed'){
            onComplete()
        }
        else{
            onProcess()
        }
        console.log(response);
        
      } catch (error) {
        console.log(error);
      }
  }

  return (
    <div className='brooo'>
      {complaints.map((complaint) => (
        <div className='ath'>
        <div key={complaint._id} className="staffCompH">

          <p> {(complaint.details)}</p>
          <p>
           {complaint.startTime}
          </p>
          <p>
            {capitalizeFirstLetter(complaint.category)} -{' '}
            {complaint.subcategory || 'N/A'}
          </p>
          
          <p>
            <strong>Status:</strong> {complaint.status}
          </p>
          <p>
            <strong>Seat: <br /></strong> {complaint.seatNo}
          </p>

          {complaint.media && (
            <button onClick={() => handleMediaClick(complaint.media)}>
              View Media
            </button>
          )}
          {(complaint.status === 'Pending' || complaint.status == "Re-Raised") && (
            <button onClick={() => {updateStatus(complaint._id, 'In Process')}}>
              Accept Complaint
            </button>
          )}
          {complaint.status === 'In Process' && (
            <button onClick={() => {updateStatus(complaint._id, 'Completed')}}>
              Mark as Completed
            </button>
          )}
        </div>
        <div className='fbbhai'>Feedback : {complaint.feedback || "No Feedback Yet" }</div>
        </div>
      ))}

      {/* Media Popup */}
      {selectedMedia && (
        <div className="popup1">
          <div className="popup-content1">
            <span className="close1" onClick={closePopup}>
              &times;
            </span>
            {getMediaType(selectedMedia) === 'video' ? (
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
};

export default StaffComplaint;
