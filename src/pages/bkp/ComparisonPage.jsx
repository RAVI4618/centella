import React, { useState, useEffect, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';
import CompareResult from '../../json/CompareResult.json'
const ComparisonPage = () => {
    const [smileString, setSmileString] = useState('');
    const smilesRef = useRef(null); 
    const filterCategories = [
        { name: 'Physicochemical properties', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
        { name: 'Medicinal Chemistry', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
        { name: 'Absorption', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
        { name: 'Metabolism', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
        { name: 'Excretion', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
        { name: 'Toxicity', options: ['nHD', 'Volume', 'nRot', 'nRing'] },
      ];

      const [openDropdowns, setOpenDropdowns] = useState({});
      const [activeBox, setActiveBox] = useState(null);
  const toggleDropdown = (name) => {
    setOpenDropdowns((prevOpenDropdowns) => ({
      ...prevOpenDropdowns,
      [name]: !prevOpenDropdowns[name],
    }));
  };

  const boxNames = ["Physicochemical properties", "Medicinal Chemistry", "Absorption"];


  const renderTable = () => (
    <div className="p-4 overflow-auto rounded-md bg-white mt-2">
        <table className="table-auto w-full">
            <thead>
                <tr>
                    <th>Property</th>
                    {CompareResult.properties[0].values && Object.keys(CompareResult.properties[0].values).map((valueHeader) => (
                        <th key={valueHeader}>{valueHeader}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {CompareResult.properties.map((prop) => (
                    <tr key={prop.property} style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
                        <td>{prop.property}</td>
                        {Object.values(prop.values).map((value, index) => (
                            <td key={index}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


useEffect(() => {
    // Draw the SMILES string as a structure
    if (smileString && smilesRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      smilesRef.current.innerHTML = ''; // Clear previous canvas
      smilesRef.current.appendChild(canvas); // Append new canvas

      const options = { width: 300, height: 300 };
      const smilesDrawer = new SmilesDrawer.Drawer(options);

      SmilesDrawer.parse(smileString, (tree) => {
        smilesDrawer.draw(tree, canvas, 'light', false);
      }, (err) => {
        console.error('Error parsing SMILES string:', err);
      });
    }
  }, [smileString]); // Redraw when smileString changes

  return (
    <div className="flex flex-col h-screen overflow-auto">
      <div className="p-4 flex justify-between">
        <h1 className="text-xl font-bold">Comparison</h1>
        <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition duration-150">Compare</button>
      </div>
      <h2 className="text-lg p-4">Choose a molecule</h2>
      <div className="bg-white p-4 rounded-lg mb-4"> {/* Boxes container */}
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((number) => (
            <div key={number} className="w-64 h-72 bg-white border border-gray-200 p-4 flex flex-col justify-between rounded-md">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="ml-2">{number}</span>
                </label>
                <p className="mt-1">{smileString}</p>
                <div ref={smilesRef}></div>
                {/* Inner box with image */}
                <div className="w-52 h-44 bg-gray-100 mt-4 flex justify-center items-center rounded" >
                  
                </div>
              </div>
              <i className="far fa-star self-end"></i>
            </div>
          ))}
        </div>
      </div>
      {/* Filters container */}
      <div className=" flex w-full p-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg w-80">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          {filterCategories.map((category) => (
            <div key={category.name} className="mb-2">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleDropdown(category.name)}
              >
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  {category.name}
                </label>
                <span>{openDropdowns[category.name] ? '∧' : '∨'}</span>
              </button>
              {openDropdowns[category.name] && (
                <div className="pl-6 mt-2">
                  {category.options.map((option) => (
                    <label key={option} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex-grow  bg-white flex flex-col ml-4">
                    {boxNames.map((boxName, index) => (
                        <React.Fragment key={boxName}>
                            <div className="bg-white w-full h-16 rounded-md border border-gray-200 mb-2 flex items-center pl-4 cursor-pointer"
                                onClick={() => setActiveBox(index === activeBox ? null : index)}>
                                <span className="flex-grow text-left">{boxName}</span>
                                <span className="mr-4">▼</span>
                            </div>
                            {activeBox === index && renderTable()}
                        </React.Fragment>
                    ))}
                </div>
        {/* New Table View for JSON Data */}
        {/* <div className="flex-grow p-4 overflow-auto ml-4 rounded-md bg-white">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>Property</th>
                {CompareResult.properties[0].values && Object.keys(CompareResult.properties[0].values).map((valueHeader) => (
                  <th key={valueHeader}>{valueHeader}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CompareResult.properties.map((prop) => (
                <tr key={prop.property}>
                  <td>{prop.property}</td>
                  {Object.values(prop.values).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>
      
    </div>
  );
};

export default ComparisonPage;
