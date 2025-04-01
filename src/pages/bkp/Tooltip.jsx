import React from 'react';
import '../../styles/editor.css';

const Tooltip = ({ property, idealRange, color, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className={`tooltip-content ${color} text-white p-2 rounded`}>
        <div className="font-semibold">{property}</div>
        <div> {idealRange ? idealRange.join(' - ') : 'N/A'}</div>
      </div>
    </div>
  );
};

export default Tooltip;
