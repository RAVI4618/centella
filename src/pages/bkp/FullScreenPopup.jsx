import React from 'react';

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed mt-[89px] ml-[17%] inset-0 flex items-center justify-center z-50  bg-opacity-50  ">
      <div className='bg-[#F4F4F4] w-[100%] h-[100%] p-4 relative overflow-auto'>
      <div className="bg-[#F4F4F4]    w-[100%] h-[95%] p-4 relative overflow-auto">
        {children}
      </div>
      </div>
    </div>
  );
};

export default Modal;
