import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import Modal from 'react-modal';
import { CircleCheck, Star, Info, ShoppingCart, Copy, Maximize, HelpCircle, CircleChevronRight, SquarePlus } from 'lucide-react';
import { GrFormView } from "react-icons/gr";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import SmileViewer from '../smileViewer';
import SmileToName from '../SmileToName';
import { useAtom } from 'jotai';
import { base_api_url, post_api_headers } from "../../utils/Store";
import { toast } from 'sonner';
import { SquareX } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import '../../styles/editor.css'
import { Plus } from 'lucide-react';
import { ArrowDownToLine, X } from "lucide-react";

Modal.setAppElement('#root');

function RetroSingleTypeResults({ predictionResult, onClose, smileString }) {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedProperties, setSelectedProperties] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [yieldPercentage, setYieldPercentage] = useState(null);
    const [reactionConditions, setReactionConditions] = useState(null);
    const [selectedReactantDetails, setSelectedReactantDetails] = useState(null);
    const [loadingConditions, setLoadingConditions] = useState(false)
    const [storedPrediction, setStoredPrediction] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedReactions, setSelectedReactions] = useState([]);
    const baseurl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Handle "Select All" functionality
    const handleSelectAll = () => {
        setSelectedReactions(prevSelected =>
            prevSelected.length === predictionResult.result.length
                ? [] // Deselect all if all are already selected
                : predictionResult.result.map((_, index) => index) // Select all
        );
    };

    // Handle checkbox change
    const handleCheckboxChange = (index) => {
        setSelectedReactions(prevSelected => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter(i => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    // Load the logo image asynchronously
  
    const generatePDF = async () => {
        const doc = new jsPDF();
        let yOffset = 30; // Initial Y position for content after header
        const columnPadding = 20; // Space between the two tables
        // Show toast indicating download is in progress
        const toastId = toast.loading('Download is in progress...');

        
        const loadLogoImage = () => {
            return new Promise((resolve, reject) => {
                const logoImage = new Image();
                logoImage.src = 'https://centellaai-win.azurewebsites.net/static/media/logo.da64b828b56147fd70da.png';
                logoImage.onload = () => resolve(logoImage);
                logoImage.onerror = reject;
            });
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Replace with your actual download logic
            // Update toast to success once download is complete
            toast.success('Download completed successfully!', {
                id: toastId, // Reuse the same toast ID
            });


            const logoImage = await loadLogoImage();
            // Centered, bold heading
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("SINGLE-STEP RESULTS", doc.internal.pageSize.width / 2, 15, { align: 'center' });

            // Add logo in the top-right corner
            const logoWidth = 10;
            const logoHeight = 12;
            doc.addImage(logoImage, 'PNG', doc.internal.pageSize.width - logoWidth - 10, 5, logoWidth, logoHeight);

            selectedReactions.forEach((reactionIndex, idx) => {
                const reaction = predictionResult.result[reactionIndex];
                const { predicted_reactants, predicted_product } = reaction;

                // Divider for each reaction section
                yOffset += 10;
                doc.setDrawColor(200, 200, 200);
                doc.line(10, yOffset, doc.internal.pageSize.width - 10, yOffset);
                yOffset += 10;

                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`RESULT ${reactionIndex + 1}`, 10, yOffset);
                yOffset += 10;

                  // Add Reaction Properties (Yield, Solvents, Temperature)
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Yield: undefined`, 10, yOffset);
            yOffset += 6;
            doc.text(`Solvents: undefined`, 10, yOffset);
            yOffset += 6;
            doc.text(`Temperature: undefined °C`, 10, yOffset);
            yOffset += 10;

                // Define starting positions for each table column
                const leftColumnX = 10;
                const rightColumnX = doc.internal.pageSize.width / 2 + columnPadding;

                // Loop through each reactant for structured layout in separate columns
                predicted_reactants.forEach((reactant, ridx) => {
                    let currentX = ridx % 2 === 0 ? leftColumnX : rightColumnX;
                    let tableYOffset = yOffset;

                    // Reactant label and SMILES string in column
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Reactant ${ridx + 1}`, currentX, tableYOffset);
                    doc.setFont("helvetica", "normal");
                    // doc.text(`SMILES: ${reactant.string ?? "N/A"}`, currentX, tableYOffset + 6);

                    // Move yOffset down for images
                    tableYOffset += 15;

                    if (reactant.img) {
                        // Add reactant image with border
                        doc.setDrawColor(150, 150, 150);
                        doc.rect(currentX, tableYOffset, 40, 40);
                        doc.addImage(reactant.img, 'JPEG', currentX, tableYOffset, 40, 40);

                        // Table-style layout for properties below the image
                        const properties = reaction['Reactant properties']?.[reactant.string];
                        if (properties) {
                            const startY = tableYOffset + 45;
                            const cellWidth = 70;
                            const cellHeight = 8; // Fit more text per row
                            let rowYOffset = startY;

                            Object.entries(properties).forEach(([property, value], i) => {
                                if (property !== 'img') {
                                    // Background color for alternating rows
                                    doc.setFillColor(i % 2 === 0 ? 245 : 255);
                                    doc.rect(currentX, rowYOffset, cellWidth, cellHeight, 'F');

                                    // Property name and value with centered padding
                                    doc.setTextColor(50, 50, 50);
                                    doc.text(
                                        `${property}: ${value || "N/A"}`,
                                        currentX + 3,  // Adjust padding to center text
                                        rowYOffset + 5
                                    );

                                    rowYOffset += cellHeight;
                                }
                            });

                            tableYOffset += Object.keys(properties).length * cellHeight + 10;
                        }
                    }
                });

                // Display product image and label if available in right column
                if (predicted_product && predicted_product.img) {
                    yOffset += 20;
                    doc.setDrawColor(150, 150, 150);
                    doc.rect(rightColumnX, yOffset, 40, 40);
                    doc.addImage(predicted_product.img, 'JPEG', rightColumnX, yOffset, 40, 40);

                    yOffset += 45;
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(60, 60, 60);
                    doc.text(`Product: ${predicted_product.string ?? "N/A"}`, rightColumnX, yOffset);
                }

                // Page break for additional reactions
                if (idx < selectedReactions.length - 1) {
                    doc.addPage();
                    yOffset = 30;
                }
            });

            // Save the PDF
            doc.save("Single_Step_Results.pdf");
        } catch (error) {
            console.error("Error loading logo image:", error);
            // Update toast to indicate an error
            toast.error('Failed to download. Please try again.', {
                id: toastId, // Reuse the same toast ID
            });
        }
    };

    useEffect(() => {
        if (selectedReactantDetails) {
            fetchYieldPercentage();
        }
    }, [selectedReactantDetails]);

    const fetchYieldPercentage = async () => {
        try {
            const reactantStrings = selectedReactantDetails.predicted_reactants
                .map(reactant => reactant.string)
                .join('.');

            const reactionString = `${reactantStrings}>>${smileString}`;

            const response = await fetch(baseurl + "retro-uat/yield-prediction", {
                method: "POST",
                headers: {
                    ...postapi_header,
                },
                body: JSON.stringify({
                    sequence: reactionString,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            // Extract the yield value from the response object
            const yieldValue = data[reactionString]; // Adjust if necessary, depending on API structure
            setYieldPercentage(yieldValue); // Set the yield value in the state
        } catch (error) {
            console.error("Error fetching yield percentage:", error);
        }
    };


    useEffect(() => {
        if (selectedReactantDetails) {
            fetchReactionConditions();
        }
    }, [selectedReactantDetails]);

    const fetchReactionConditions = async () => {
        try {
            setLoadingConditions(true)
            // Construct reactant strings concatenated with a dot
            const reactantStrings = selectedReactantDetails.predicted_reactants
                .map(reactant => reactant.string)
                .join('.');

            // Form the full reaction string
            const reactionString = `${reactantStrings}>>${smileString}`;

            const response = await fetch(baseurl + "retro-uat/reaction-conditions", {
                method: "POST",
                headers: {
                    ...postapi_header,
                },
                body: JSON.stringify({
                    reaction: reactionString
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            const reactionData = data[reactionString];
            setReactionConditions(reactionData);
        } catch (error) {
            console.error("Error fetching reaction conditions:", error);
        } finally {
            setLoadingConditions(false); // End loading for yield percentage
        }
    };




    const handleArrowClick = (prediction, selectedReactantDetails) => {
        setStoredPrediction(prediction);
        setSelectedReactantDetails(prediction);
        setIsPopupOpen(true);
    };







    const closePopup = () => {
        setIsPopupOpen(false); // Close the popup
        setSelectedReactantDetails(null); // Clear reactant details
        setYieldPercentage(null); // Clear yield percentage
        setReactionConditions(null); // Clear reaction conditions
        setLoadingConditions(true); // Reset loading state
    };


    useEffect(() => {
        if (predictionResult && Array.isArray(predictionResult.result)) {
            setSelectedPrediction(predictionResult.result[0]);
            // Log the properties structure to debug
            console.log('Prediction Result:', predictionResult.result[0]);
        }
    }, [predictionResult]);

    const handleImageClick = (item, reactantString, prediction) => {
        // Get properties for the specific reactant
        const properties = prediction['Reactant properties'] &&
            prediction['Reactant properties'][reactantString];

        console.log('Clicked reactant string:', reactantString);
        console.log('Found properties:', properties);

        setSelectedItem(item);
        setSelectedProperties(properties);
        setIsModalOpen(true);
    };

    const handleReactantClick = (reactantString) => {
        navigate('/retrosynthesis/vendor', { state: { reactantString } });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setSelectedProperties(null);
    };

    if (!predictionResult || !Array.isArray(predictionResult.result)) {
        return <div>No prediction results available.</div>;
    }
    return (
        <div className="bg-[#F4F4F4] mt-10 p-4 rounded-lg w-full">
            <div className="flex justify-between mt-2 flex-wrap">
                <div className="flex items-center justify-between w-full">
                    <div className="text-lg text-[#2D3748] font-bold">
                        Single-Step Retrosynthetic Route
                    </div>
                    <button

                        onClick={toggleDropdown}
                        className="flex items-center px-3 text-sm text-white py-1 border bg-[#735AA7] hover:bg-[#8A7DB8] rounded-md focus:outline-none"
                    >
                        Download
                        <ArrowDownToLine className="w-4 h-4 ml-1" />
                    </button>
                </div>

                <div className="relative w-full lg:w-auto">
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                            onMouseLeave={() => setIsDropdownOpen(false)} // Close the dropdown on mouse leave
                        >
                            {/* Select All Option */}
                            <div
                                className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                onClick={handleSelectAll}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedReactions.length === predictionResult.result.length}
                                    onChange={handleSelectAll}
                                    className="mr-3 text-[#735AA7] focus:ring-0 focus:ring-offset-0 rounded-full"
                                />
                                <span className="text-gray-700 font-medium">Select All</span>
                            </div>

                            {/* Individual Reactions */}
                            {predictionResult.result.map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleCheckboxChange(index)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedReactions.includes(index)}
                                        onChange={() => handleCheckboxChange(index)}
                                        className="mr-3 text-[#735AA7] focus:ring-0 focus:ring-offset-0 rounded-full"
                                    />
                                    <span className="text-gray-700 font-medium">Reaction {index + 1}</span>
                                </div>
                            ))}

                            {/* Download Selected Button */}
                            <button
                                onClick={generatePDF}
                                className={`block w-full text-center px-4 py-3 mt-2 text-white font-semibold bg-[#735AA7] hover:bg-[#8A7DB8] transition-colors duration-200 rounded-b-lg ${selectedReactions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                disabled={selectedReactions.length === 0}
                            >
                                Download Selected
                            </button>
                        </div>
                    )}
                </div>
            </div>


            <div className="flex flex-wrap lg:flex-nowrap justify-between">
                {predictionResult.result.map((prediction, index) => (
                    <div
                        key={index}
                        className="my-6 bg-white rounded-lg border-gray-400 p-4 shadow-lg w-full lg:w-1/2 xl:w-1/3"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <CircleCheck size={24} fill="#0C9245" color="white" />
                                <div className="text-lg font-semibold">Reaction {index + 1}</div>
                            </div>
                            <button
                                className="p-2 rounded-full text-xs font-semibold cursor-pointer bg-[#735AA7] hover:bg-[#8A7DB8] text-white flex items-center justify-center"
                                onClick={() => handleArrowClick(prediction)}
                                title="Procedure"
                            >
                                Reaction Details
                                <CircleChevronRight className="h-4 w-4 ml-2" />
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center  justify-between w-full">
                            {/* Combined Reagents, Reactants, and Products Container */}
                            <div className="w-full lg:flex lg:flex-row items-center space-x-6">
                                {/* Reagents Section */}
                                <div className="md:w-[660px] sm:w-[480px] lg:w-1/2 flex flex-col space-y-4">
                                    <div className="font-semibold text-md mb-4">Reagents</div>
                                    {prediction.predicted_reagents.map((reagent, idx) => (
                                        <div
                                            key={idx}
                                            className="w-44 lg:w-44 sm:w-[95%] md:w-[85%] h-10 border rounded-full bg-[#bbd0ff] flex items-center justify-center relative group"
                                        >
                                            <span className="text-xs cursor-pointer font-semibold truncate uppercase px-1 text-[#004aad]">
                                                <SmileToName smileString={reagent.string} />
                                            </span>
                                        </div>

                                    ))}
                                </div>

                                {/* Reactants and Products Section - Row Layout */}
                                <div className="w-full lg:w-1/2 md:w-[40%] md:pt-6 sm:pt-6 flex flex-row flex-wrap items-center space-x-2 md:space-x-6 mr-4">
                                    {/* Reactants */}
                                    {prediction.predicted_reactants.map((reactant, idx) => (
                                        <React.Fragment key={idx}>
                                            <div className="w-40 h-56 md:w-48 md:h-64 lg:w-56 lg:h-72 text-center border-2 border-dashed border-[#4A90E2] p-4 shadow-md rounded-lg flex flex-col items-center justify-between overflow-hidden mb-4 animate-dashed-border">
                                                <img
                                                    src={reactant.img}
                                                    alt="Reactant"
                                                    className="cursor-pointer w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain transition-transform mt-[10%] duration-300 hover:scale-150"
                                                // onClick={() => handleImageClick(reactant.img, reactant.string, prediction)}
                                                />
                                                <span
                                                    className="text-sm font-semibold cursor-pointer uppercase text-[#004aad] relative top-6 sm:mb-6"
                                                    style={{ display: "inline-block", whiteSpace: "nowrap", maxWidth: "120px" }}
                                                // title={reactant.string}
                                                >


                                                    <SmileToName smileString={reactant.string} />
                                                </span>

                                                <div className="flex justify-center space-x-3 sm:mt-2">
                                                    <ShoppingCart
                                                        className="h-5 w-5 hover:text-blue-500 cursor-pointer"
                                                        onClick={() => handleReactantClick(reactant.string)}
                                                        data-tooltip-id="cart-tooltip"  // Tooltip ID for the cart icon
                                                    />
                                                    <Info
                                                        className="cursor-pointer hover:text-blue-500 h-5 w-5"
                                                        onClick={() => handleImageClick(reactant.img, reactant.string, prediction)}
                                                        data-tooltip-id="info-tooltip"  // Tooltip ID for the info icon
                                                    />
                                                    <Copy
                                                        className="cursor-pointer hover:text-blue-500 h-5 w-5"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(reactant.string);
                                                            toast.success("SMILE string copied to clipboard!", {
                                                                className: "mt-[20%]",
                                                            });
                                                        }}
                                                        data-tooltip-id="copy-tooltip"  // Tooltip ID for the copy icon
                                                    />
                                                </div>

                                                {/* Add Tooltip components below your JSX */}
                                                <Tooltip id="cart-tooltip" content="View Vendors" place="top" />
                                                <Tooltip id="info-tooltip" content="View Molecular Descriptors" place="top" />
                                                <Tooltip id="copy-tooltip" content="Copy SMILES" place="top" />
                                            </div>




                                            {idx < prediction.predicted_reactants.length - 1 && (
                                                <div className="flex items-center justify-center h-full">
                                                    <Plus className='w-8 h-8' />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {/* Arrow to indicate reaction direction */}
                                    <div className="flex items-center justify-center h-full ">
                                        <FiArrowRight className="h-8 w-8 md:h-8 font-semibold  md:w-8 text-dark cursor-pointer" />
                                    </div>

                                    {/* Products */}
                                    <div className="w-40 h-56 md:w-48 md:h-64 lg:w-56 lg:h-72 text-center border-2 border-dashed animate-dashed-border border-[#80AA3E] p-4 shadow-md rounded-lg flex flex-col items-center justify-between overflow-hidden mb-4">
                                        <div className="transition-transform duration-300 hover:scale-150">
                                            <SmileViewer smileString={smileString} imgwidth={110} imgheight={110} />
                                        </div>

                                        <span className="text-sm font-semibold break-words uppercase text-[#004aad]  truncate">
                                            <SmileToName smileString={smileString} />
                                        </span>
                                        <div className="flex justify-center space-x-3 mt-2">
                                            <Copy
                                                className="cursor-pointer hover:text-blue-500 h-5 w-5"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(smileString);
                                                    toast.success("SMILE string copied to clipboard!", {
                                                        className: "mt-[20%]",
                                                    });
                                                }}
                                                title="Copy"
                                                data-tooltip-id="copy-tooltip"  // Tooltip ID for the copy icon
                                            />

                                        </div>
                                    </div>
                                </div>
                                {/* Popup Panel */}
                                {isPopupOpen && (
                                    <div className="fixed right-2 top-2 border-t-4 border-b-4 border-[#735AA7] rounded-lg h-full bg-white shadow-sm p-6 overflow-y-auto transition-transform transform translate-x-0"
                                        style={{ width: '400px', height: '99vh', zIndex: 50 }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-bold flex items-center space-x-2">Reactant Details</h2>
                                            <button onClick={closePopup} className="text-white hover:text-gray-600 bg-red-400 px-2 py-1 rounded-md">
                                                <X className='h-4 w-4' />
                                            </button>
                                        </div>

                                        {/* Render Reactants Images */}
                                        <div className="flex flex-row space-x-4 items-center space-y-4">
                                            <div className='border-2 border-blue-500 p-4 rounded-lg flex flex-col items-center'>
                                                <div className="flex items-center space-x-12 mb-2">
                                                    {selectedReactantDetails.predicted_reactants.map((reactant, idx) => (
                                                        <div key={idx} className="flex flex-col items-center">
                                                            <img
                                                                src={reactant.img}
                                                                alt='Reactant'
                                                                className='w-32 h-32 object-contain'
                                                            />
                                                            <span className="text-xs mt-1 font-medium text-gray-600">
                                                                Reactant {idx + 1}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Row for impurity and yield values */}
                                                <div className="flex justify-around w-full mt-2 text-center space-x-8">
                                                    <div className="flex flex-row items-center mr-6">
                                                        <span className="text-sm font-semibold">Yield</span>
                                                        {/* Display dynamic yieldPercentage value */}
                                                        <span className="text-sm font-semibold px-2  rounded-full ml-2 bg-blue-300 text-blue-600">
                                                            {yieldPercentage !== null ? `${yieldPercentage}%` : "Loading..."}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-row items-center">
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Additional Sections */}

                                        <div className="mt-6">
                                            <h3 className="text-md font-semibold">Reaction Details</h3>
                                            <ul className="list-disc list-inside text-sm ml-4">
                                                <li>
                                                    <span className='font-semibold'>Reactants:</span>
                                                </li>
                                                {/* Map over reactants to display each one as an <li> */}
                                                {selectedReactantDetails.predicted_reactants.map((reactant, idx) => (
                                                    <span key={idx} className="ml-6 flex items-center space-x-1">
                                                        <SmileToName smileString={reactant.string} />
                                                    </span>
                                                ))}
                                                <li>
                                                    <span className='font-semibold'>Solvent:</span> {reactionConditions ? reactionConditions["Solvent(s)"] : "Loading..."}
                                                </li>
                                            </ul>

                                        </div>
                                        <div className="mt-6">
                                            <h3 className="text-md font-semibold">Reaction Conditions:</h3>
                                            {loadingConditions ? (
                                                <p className="text-sm">Loading...</p>
                                            ) : (
                                                reactionConditions && (
                                                    <ul className="list-disc pl-6 text-sm">
                                                        <li>
                                                            <span className="font-semibold">Temperature:</span> {reactionConditions.Temperature} °C
                                                        </li>
                                                        <li>
                                                            <span className="font-semibold">Probability:</span> {reactionConditions.Probability}
                                                        </li>
                                                    </ul>
                                                )
                                            )}
                                        </div>



                                        <div className="mt-6"> 
                                            <h3 className="text-md font-semibold">Experimental Procedure</h3>
                                            <ol className="list-decimal text-sm list-inside ml-4">
                                                {/* <li>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
                                                </li>
                                                <li>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
                                                </li>
                                                <li>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.
                                                </li> */}
                                                <li>Currenlty Under Development.</li>
                                            </ol>

                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Properties Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Molecule Properties"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 1000,
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '60%',
                        maxHeight: '80%',
                        overflow: 'auto',
                        borderRadius: '10px',
                        padding: '0',
                    },
                }}
            >
                <div className="relative p-6">     {/* Header with Title */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Molecular Descriptors</h2>
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-5 bg-red-400 text-white hover:text-gray-600 px-2 py-1 rounded-md flex items-center justify-center text-sm"
                        >
                            <X className='h-6 w-6' />
                        </button>
                    </div>


                    {/* Properties Table */}
                    <div className="border-2 border-gray-300 rounded-lg">

                        {/* Structure Image */}
                        {selectedItem && (
                            <div className="flex justify-center items-center mb-4">
                                <img
                                    src={selectedItem}
                                    alt="Selected Molecule"
                                    className="w-auto h-48"
                                />
                            </div>
                        )}
                        <hr />
                        <table className="w-full  border-collapse capitalize">
                            <tbody>
                                {selectedProperties ? (
                                    (() => {
                                        const entries = Object.entries(selectedProperties).filter(([key]) => key !== 'img');
                                        const half = Math.ceil(entries.length / 2);
                                        const leftColumn = entries.slice(0, half);
                                        const rightColumn = entries.slice(half);

                                        return leftColumn.map(([keyLeft, valueLeft], index) => {
                                            const [keyRight, valueRight] = rightColumn[index] || [];

                                            return (
                                                <tr key={index} className="border-b text-sm border-gray-200">
                                                    {/* Left Column Property */}
                                                    <td className="py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">
                                                        {keyLeft}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-900 border-r border-gray-200">
                                                        {typeof valueLeft === 'number' ? valueLeft.toFixed(3) : valueLeft}
                                                    </td>

                                                    {/* Right Column Property */}
                                                    {keyRight ? (
                                                        <>
                                                            <td className="py-3 px-4 font-semibold text-gray-700 border-l border-gray-200">
                                                                {keyRight}
                                                            </td>
                                                            <td className="py-3 px-4 text-right  text-gray-900 border-l border-gray-200 text-gray-900">
                                                                {typeof valueRight === 'number' ? valueRight.toFixed(3) : valueRight}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-3 px-4 border-l border-gray-200"></td>
                                                            <td className="py-3 px-4"></td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        });
                                    })()
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-gray-500">
                                            No properties available for this molecule.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

        </div>

    );
}
export default RetroSingleTypeResults;






