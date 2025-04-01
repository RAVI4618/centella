
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { IoCloudDownloadSharp } from 'react-icons/io5';
import { jsPDF } from 'jspdf';

function RetroSingleTypeResults({ predictionResult, onClose }) {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [isCheckboxModalOpen, setIsCheckboxModalOpen] = useState(false);
    const [selectedResults, setSelectedResults] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (predictionResult && predictionResult.result) {
            setSelectedPrediction(predictionResult.result[0]);
        }
    }, [predictionResult]);

    const handlePredictionClick = (index) => {
        setSelectedIndex(index);
        setSelectedPrediction(predictionResult.result[index]);
    };

    const handleImageClick = (item, type) => {
        setSelectedItem(item);
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setSelectedType('');
    };

    const openCheckboxModal = () => {
        setIsCheckboxModalOpen(true);
    };

    const closeCheckboxModal = () => {
        setIsCheckboxModalOpen(false);
        setSelectAll(false);
        setSelectedResults([]);
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedResults([]);
        } else {
            setSelectedResults(predictionResult.result.map((_, index) => index));
        }
        setSelectAll(!selectAll);
    };

    const handleCheckboxChange = (index) => {
        if (selectedResults.includes(index)) {
            setSelectedResults(selectedResults.filter(i => i !== index));
        } else {
            setSelectedResults([...selectedResults, index]);
        }
    };

    // const downloadPDF = () => {
    //     const doc = new jsPDF();

    //     selectedResults.forEach((resultIndex, idx) => {
    //         const result = predictionResult.result[resultIndex];
    //         doc.text(`Single-Step Prediction Results: #${resultIndex + 1}`, 10, 10 + (idx * 60));

    //         let yOffset = 20 + (idx * 60);

    //         doc.text('Predicted Reactants:', 10, yOffset);
    //         yOffset += 10;

    //         result.predicted_reactants.forEach((reactant) => {
    //             const imgData = reactant.img; // Assuming reactant.img is a base64 encoded image
    //             if (imgData) {
    //                 doc.addImage(imgData, 'JPEG', 10, yOffset, 50, 50);
    //                 yOffset += 60;
    //             }
    //             doc.text(reactant.string, 10, yOffset);
    //             yOffset += 10;
    //         });

    //         yOffset += 20;
    //         doc.text('Predicted Reagents:', 10, yOffset);
    //         yOffset += 10;

    //         result.predicted_reagents.forEach((reagent) => {
    //             doc.text(reagent.string, 10, yOffset);
    //             yOffset += 10;
    //         });

    //         if (idx < selectedResults.length - 1) {
    //             doc.addPage();
    //         }
    //     });

    //     doc.save('prediction_results.pdf');
    //     closeCheckboxModal(); // Close the modal after downloading the PDF
    // };

    if (!predictionResult || !predictionResult.result) {
        return <div>No prediction results available.</div>;
    }

    return (


        <div className='bg-white mt-10 p-4 border rounded-lg shadow-md max-w-screen-xl mx-auto'>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Single-Step Prediction Results</h2>
                <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none" onClick={onClose}>
                    Close
                </button>
                <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none" onClick={() => navigate('/retro/single-type/Result')}>
                    Actual View
                </button>
            </div>

            <div className='flex flex-1'>
                {/* Prediction results thumbnails */}
                <div className='w-2/6 border rounded p-3 mr-3 overflow-y-auto h-[calc(100vh-100px)]'>
                    {predictionResult.result.map((prediction, index) => (
                        <div key={index} className={`m-2 cursor-pointer p-2 rounded-lg ${index === selectedIndex ? 'bg-black text-white' : 'bg-gray-100'}`} onClick={() => handlePredictionClick(index)}>
                            <div className='text-center'>
                                <img src={prediction.image_url} alt='' className='rounded' />
                            </div>
                            <div className='flex p-2'>
                                <p className='p-2 bg-[#00B719] rounded-full'>#{index + 1}</p>
                                <p className='font-semibold mt-2 ml-2'> Result {prediction.score ? prediction.score.toPrecision(3) : null}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Detailed prediction information */}
                <div className='border rounded w-full p-2'>
                    {selectedPrediction ? (
                        <>
                            <div className='flex'>
                                <p className='m-2 border-b-2 border-green-400'>#{selectedIndex + 1}</p>
                                <p className='p-2 font-semibold'> Result {selectedPrediction.score ? selectedPrediction.score.toPrecision(3) : null}</p>
                                {/* Download button */}
                                <button className='ml-auto flex items-center bg-[#4A5568] w-[103px] h-[30px] rounded-2xl px-3 py-1 focus:outline-none' onClick={openCheckboxModal}>
                                    <span className='text-white text-xs'>Download</span>
                                    <IoCloudDownloadSharp className='text-white ml-1 mt-1' />
                                </button>
                            </div>

                            {/* Predicted reactants */}
                            <div className='mt-4'>
                                <h3 className='text-lg font-bold'>Predicted Reactants</h3>
                                <div className='grid grid-cols-2 gap-2'>
                                    {selectedPrediction.predicted_reactants.map((reactant, idx) => (
                                        <div key={idx} className='text-center border pt-2'>
                                            <img src={reactant.img} alt='' className='cursor-pointer' onClick={() => handleImageClick(reactant, 'Reactant properties')} />
                                            <div className=' p-2 mt-2 w-full  whitespace-normal break-words'>
                                                {reactant.string}
                                                <FontAwesomeIcon icon={faInfoCircle} className='ml-2 text-blue-500 cursor-pointer' onClick={() => handleImageClick(reactant, 'Reactant properties')} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Predicted reagents */}
                            <div className='mt-4'>
                                <h3 className='text-lg font-bold'>Predicted Reagents</h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    {selectedPrediction.predicted_reagents.map((reagent, idx) => (
                                        <div key={idx} className='text-center border pt-2'>
                                            <div className='flex items-center justify-center mt-2 w-full whitespace-normal break-words'>
                                                {reagent.string}
                                                {/* <FontAwesomeIcon icon={faInfoCircle} className='ml-2 text-blue-500 cursor-pointer' onClick={() => handleImageClick(reagent, 'Reagent_properties')} /> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>No prediction selected.</div>
                    )}
                </div>
            </div>

            {/* Modal for detailed properties */}
            {/* Modal for detailed properties */}
            {isModalOpen && selectedItem && (
                <div className='fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center'>
                    <div className='relative bg-white p-4 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[50%] max-w-3xl h-[70%] overflow-y-auto'>
                        <button className='absolute top-2 right-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none' onClick={closeModal}>
                            Close
                        </button>
                        <h2 className='text-lg font-bold mb-4'>Properties</h2>
                        <div className='flex'>
                            <div className='w-1/2 flex justify-start items-start'>
                                <img src={selectedItem.img} alt='' className='max-h-[300px] max-w-full object-contain' />
                            </div>
                            <div className='w-1/2'>
                                <table className='w-full'>
                                    <tbody>
                                        {Object.keys(selectedPrediction[selectedType][selectedItem.string]).map((key) => (
                                            <tr key={key} className='border-b'>
                                                <td className='font-semibold px-2 py-1'>{key.replace(/_/g, ' ')}:</td>
                                                <td className='px-2 py-1'>{selectedPrediction[selectedType][selectedItem.string][key]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkbox modal */}
            {isCheckboxModalOpen && (
                <div className='fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center'>
                    <div className='relative bg-white p-4 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[50%] max-w-3xl'>
                        <button className='absolute top-2 right-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full focus:outline-none' onClick={closeCheckboxModal}>
                            X
                        </button>
                        <h3 className='text-lg font-bold mb-2'>Select Results to Download</h3>
                        <div className='mb-4'>
                            <label className='inline-flex items-center'>
                                <input type='checkbox' className='form-checkbox' checked={selectAll} onChange={handleSelectAllChange} />
                                <span className='ml-2'>Select All</span>
                            </label>
                        </div>
                        <div className='max-h-64 overflow-y-auto'>
                            {predictionResult.result.map((prediction, index) => (
                                <div key={index} className='mb-2'>
                                    <label className='inline-flex items-center'>
                                        <input type='checkbox' className='form-checkbox' checked={selectedResults.includes(index)} onChange={() => handleCheckboxChange(index)} />
                                        <span className='ml-2'>Result #{index + 1}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className='flex justify-end mt-4'>
                            <button className='px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-lg focus:outline-none' onClick={downloadPDF}>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RetroSingleTypeResults;