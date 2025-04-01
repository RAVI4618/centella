// import React, { useState } from 'react';
// import { jsPDF } from "jspdf";
// import { SquareX } from "lucide-react";

// const ModalsAndPDFComponent = ({
//   predictionResult,
//   selectedReactions,
//   handleCheckboxChange,
//   generatePDF,
//   isDropdownOpen,
//   toggleDropdown,
//   isPopupOpen,
//   closePopup,
//   selectedReactantDetails,
//   yieldPercentage,
// }) => {
//   const loadLogoImage = () => {
//     return new Promise((resolve, reject) => {
//       const logoImage = new Image();
//       logoImage.src = 'https://centellaai-win.azurewebsites.net/static/media/logo.da64b828b56147fd70da.png';
//       logoImage.onload = () => resolve(logoImage);
//       logoImage.onerror = reject;
//     });
//   };

//   return (
//     <div>
//       {/* PDF Dropdown */}
//       <div className="relative">
//         <button
//           onClick={toggleDropdown}
//           className="px-3 text-md font-semibold text-white py-1 border bg-[#8A7DB8] hover:bg-[#735AA7] rounded-lg focus:outline-none"
//         >
//           Download PDF
//         </button>
//         {isDropdownOpen && (
//           <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
//             {predictionResult.result.map((_, index) => (
//               <div key={index} className="px-4 py-2">
//                 <input
//                   type="checkbox"
//                   checked={selectedReactions.includes(index)}
//                   onChange={() => handleCheckboxChange(index)}
//                   className="mr-2"
//                 />
//                 <label>Reaction {index + 1}</label>
//               </div>
//             ))}
//             <button
//               onClick={generatePDF}
//               className="block w-full text-left px-4 py-2 text-white bg-[#8A7DB8] hover:bg-[#735AA7]"
//               disabled={selectedReactions.length === 0}
//             >
//               Download Selected
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Popup Panel */}
//       {isPopupOpen && (
//      <div className="fixed right-0 top-16 border-t-4 border-[#735AA7] rounded-md h-full bg-white shadow-lg p-6 overflow-y-auto transition-transform transform translate-x-0"
//      style={{ width: '400px', height: '618px', zIndex: 50 }}>
// <div className="flex items-center justify-between mb-4">
// <h2 className="text-lg font-bold flex items-center space-x-2">Reactant Details</h2>
// <button onClick={closePopup} className="text-gray-500 hover:text-[#000000]">
// <SquareX />
// </button>
// </div>


//      {/* Render Reactants Images */}
//      <div className="flex flex-row space-x-4 items-center space-y-4">
//          <div className='border-2 border-blue-500 p-4 rounded-lg flex flex-col items-center'>
//              <div className="flex items-center space-x-12 mb-2">
//                  {selectedReactantDetails.predicted_reactants.map((reactant, idx) => (
//                      <div key={idx} className="flex flex-col items-center">
//                          <img
//                              src={reactant.img}
//                              alt='Reactant'
//                              className='w-32 h-32 object-contain'
//                          />
//                          <span className="text-xs mt-1 font-medium text-gray-600">
//                              Reactant {idx + 1}
//                          </span>
//                      </div>
//                  ))}
//              </div>
//              {/* Row for impurity and yield values */}
//              <div className="flex justify-around w-full mt-2 text-center space-x-8">
//                  <div className="flex flex-row items-center">
//                      <span className="text-sm font-semibold">Impurity</span>
//                      <span className="text-sm font-bold px-2 rounded-full ml-2  text-blue-600">--</span>
//                  </div>
//                  <div className="flex flex-row items-center">
//                      <span className="text-sm font-semibold">Yield</span>
//                      {/* Display dynamic yieldPercentage value */}
//                      <span className="text-sm font-semibold px-2  rounded-full ml-2 bg-blue-300 text-blue-600">
//                          {yieldPercentage !== null ? `${yieldPercentage}%` : "Loading..."}
//                      </span>
//                  </div>
//              </div>

//          </div>
//      </div>

//      {/* Additional Sections */}
//      <div className="mt-6">
//          <h3 className="text-md font-semibold">Reaction Details</h3>
//          <ul className="list-disc list-inside text-sm ml-4">
//              <li>
//                  <span className='font-semibold'>Reactants:</span>
//              </li>
//              {/* Map over reactants to display each one as an <li> */}
//              {selectedReactantDetails.predicted_reactants.map((reactant, idx) => (
//                  <span key={idx} className="ml-6 flex items-center space-x-1">
//                      <SmileToName smileString={reactant.string} />
//                  </span>
//              ))}
//              {/* <li>

// <span className='font-semibold'>Reagent:</span>
// {reactionConditions ? reactionConditions["Reagent(s)"] : "Loading..."}
// </li> */}
//              <li>
//                  <span className='font-semibold'>Solvent:</span> {reactionConditions ? reactionConditions["Solvent(s)"] : "Loading..."}
//              </li>
//          </ul>

//      </div>
//      <div className="mt-6">
//          <h3 className="text-md font-semibold">Reaction Conditions:</h3>
//          {loadingConditions ? (
//              <p className="text-sm">Loading...</p>
//          ) : (
//              reactionConditions && (
//                  <ul className="list-disc pl-6 text-sm">
//                      <li>
//                          <span className="font-semibold">Temperature:</span> {reactionConditions.Temperature} °C
//                      </li>
//                      <li>
//                          <span className="font-semibold">Probability:</span> {reactionConditions.Probability}
//                      </li>
//                  </ul>
//              )
//          )}
//      </div>



//      <div className="mt-6">
//          <h3 className="text-md font-semibold">Experimental Procedure</h3>
//          <ol className="list-decimal text-sm list-inside ml-4">
//              <li>
//                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
//              </li>
//              <li>
//                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
//              </li>
//              <li>
//                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
//              </li>
//          </ol>

//      </div>
//  </div>
//       )}
//     </div>
//   );
// };

// export default ModalsAndPDFComponent;
