import React from 'react';
import { AiFillEdit } from "react-icons/ai";
import { HiUserAdd } from 'react-icons/hi';
import { MdDelete } from "react-icons/md";
 
const ActionIcons = ({ onCollaboratorClick,onEditClick, onDeleteClick }) => {
  return (
    <div className="flex h-full items-center">
      <HiUserAdd size="20px" className="mr-2 cursor-pointer" onClick={onCollaboratorClick} />
      <AiFillEdit size="20px" className="mr-2 cursor-pointer" onClick={onEditClick} />
      <MdDelete size="20px" className="cursor-pointer" onClick={onDeleteClick} />
    </div>
  );
};
 
 
 
export default ActionIcons;
 
 