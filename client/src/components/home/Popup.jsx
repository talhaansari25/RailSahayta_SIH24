import React from "react";

const Popup = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="popup-container">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
      <div className="popup-overlay" onClick={onClose}></div>
    </div>
  );
};

export default Popup;
