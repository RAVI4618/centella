import React from 'react';
 
const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 shadow-inner bg-opacity-50  backdrop-filter backdrop-blur-sm">
      <div className="relative w-full h-full max-w-none max-h-none bg-white overflow-auto">
        {children}
      </div>
    </div>
  );
};
 
export default Modal;