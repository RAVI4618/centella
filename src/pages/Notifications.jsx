import React, { useState } from 'react';
import { MdDelete } from "react-icons/md";
import { IoMdArrowDropdown } from 'react-icons/io'; // Importing the dropdown icon

const notifications = [
  {
    id: 1,
    image: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
    heading: 'Team Centella at BioAsia 2024',
    description: 'Transition to a digital interface showing molecular models and AI-driven simulations.Overlay stock footage of diverse scientists collaborating in a high-tech meeting room, pointing at a digital board with molecular structures.',
    sender: 'Dr.Riyaz Syed',
    date: '13 Sep 11:05AM',
  },
  {
    id: 2,
    image: 'https://cdn-icons-png.flaticon.com/128/3135/3135789.png',
    heading: 'Team Centella at BioAsia 2024',
    description: 'Transition to a digital interface showing molecular models and AI-driven simulations.Overlay stock footage of diverse scientists collaborating in a high-tech meeting room, pointing at a digital board with molecular structures.',
    sender: 'Sender Name',
    date: '13 Sep 11:05AM',
  },
  {
    id: 3,
    image: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
    heading: 'Team Centella at BioAsia 2024',
    description: 'Transition to a digital interface showing molecular models and AI-driven simulations.Overlay stock footage of diverse scientists collaborating in a high-tech meeting room, pointing at a digital board with molecular structures.',
    sender: 'Dr.Poornachandra Yedla',
    date: '13 Sep 11:05AM',
  }
];

const Notifications = () => {
  // State to track selected checkboxes
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false); // State to track the "Select all" checkbox
  const [filter, setFilter] = useState('');

  // Handle individual checkbox selection
  const handleCheckboxChange = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Handle "Select all" checkbox
  const handleSelectAll = () => {
    if (!selectAll) {
      // Select all checkboxes
      const allIds = notifications.map(notification => notification.id);
      setSelected(allIds);
    } else {
      // Deselect all checkboxes
      setSelected([]);
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 font-segoe">
<div className='flex items-center space-x-2'>
  <h2 className="text-2xl font-semibold">Notifications</h2>
  <img src="https://cdn-icons-png.flaticon.com/128/4991/4991422.png" alt="Icon" height={20} width={20} />
</div>

      <div className="flex items-center mb-4">
        {/* "Select All" checkbox */}
        <input
          type="checkbox"
          className="mr-2"
          checked={selectAll}
          onChange={handleSelectAll}
        />
        <label className="font-medium">Select all</label>
        
        <div className="ml-auto flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by"
              value={filter}
              onChange={handleFilterChange}
              className="border p-2 rounded-lg w-full pr-10"
            />
            <IoMdArrowDropdown className="absolute h-6 w-6 right-2 top-1/2 transform -translate-y-1/2  pointer-events-none" />
          </div>
          <button className="text-2xl">
            <MdDelete />
          </button>
        </div>
      </div>

      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-start space-x-4 p-4 mb-4 bg-white shadow-md rounded-lg">
          {/* Individual notification checkbox */}
          <input
            type="checkbox"
            className="self-start mt-2"
            checked={selected.includes(notification.id)}
            onChange={() => handleCheckboxChange(notification.id)}
          />
          <img src={notification.image} alt="User" className="w-24 h-24 rounded-full object-cover" />
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{notification.heading}</h3>
            <p className="text-sm text-gray-600">{notification.description}</p>
            <div className="mt-2 text-[11px] text-dark font-semibold">
              <span>{notification.date}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right text-sm text-dark font-semibold">
            <span>{notification.sender}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
