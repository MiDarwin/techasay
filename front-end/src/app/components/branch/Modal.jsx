import React from "react";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null; // Modal açık değilse hiçbir şey render etme

  const handleModalClick = (e) => {
    e.stopPropagation(); // Tıklamayı durdur
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          &times; {/* Kapatma butonu */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
