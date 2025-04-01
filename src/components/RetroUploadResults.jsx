import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const RetroUploadResults = ({ predictions }) => {
    const location = useLocation();
    const predictionData = predictions || location.state?.predictions;

    const [activeResultIndex, setActiveResultIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedProperties, setSelectedProperties] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const predictionss = predictionData?.results || [];

    const handleViewClick = (item, properties) => {
        setSelectedItem(item);
        setSelectedProperties(properties);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setSelectedProperties(null);
    };

    return (
        <div className="bg-white mt-10 p-4 border rounded-lg shadow-md max-w-screen-xl mx-auto">
            {/* <h2 className="text-lg font-bold mb-4">Upload Prediction Results</h2> */}

            {/* Table Layout */}
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-[#000000]  text-white">
                        <th className=" py-6">Index</th>
                        <th className="p-2">Molecule</th>
                        <th className="p-2">SMILES</th>
                        <th className="p-2">Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {predictionss?.map((prediction, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-2 text-center">{index + 1}</td>
                            <td className="p-2 text-center">
                                <img
                                    src={prediction.result.result[0]?.predicted_reactants[0].img}
                                    alt="Molecular structure"
                                    className="inline-block max-h-16"
                                />
                            </td>
                            <td className="p-2 text-center">
                                {prediction.result.result[0]?.predicted_reactants[0].string}
                            </td>
                            <td className="p-2 text-center">
                                <button
                                    onClick={() =>
                                        handleViewClick(
                                            prediction.result.result[0]?.predicted_reactants[0].img,
                                            prediction.result.result[0]['Reactant properties']
                                        )
                                    }
                                    className="bg-[#735AA7] text-white px-4 py-2 rounded-lg"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Reactants and Reagents */}
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
            width: '80%',
            maxHeight: '80%',
            overflow: 'auto',
        },
    }}
>
    <button onClick={closeModal} className="absolute top-0 right-0 p-2 text-black">X</button>
    <h2 className="text-xl font-bold mb-4">Molecule Properties</h2>
    <div className="flex">
        {selectedItem && (
            <div className="w-1/2 flex justify-center p-4">
                <img src={selectedItem} alt="Selected Molecule" className="max-w-full max-h-64" />
            </div>
        )}
        <div className="w-1/2 p-4 overflow-y-auto">
            {selectedProperties ? (
                <div className="flex flex-col">
                    {/* Iterate over selectedProperties */}
                    {Object.entries(selectedProperties).map(([key, value], idx) => (
                        <div key={idx} className="flex justify-between py-1">
                            <span className="font-bold w-1/2">{key}</span>
                            <span className="w-1/2">
                                {typeof value === 'object' && value.img ? (
                                    <img src={value.img} alt={key} className="max-w-full max-h-16" />
                                ) : (
                                    value.toString()
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No properties available.</p>
            )}
        </div>
    </div>

    {/* Reagents Section */}
    <h3 className="text-lg font-bold mt-4">Reagents</h3>
    <div className="grid grid-cols-2 gap-4">
        {predictionss?.[activeResultIndex]?.result?.result?.[0]?.predicted_reagents.map((reagent, idx) => (
            <div key={idx} className="text-center border pt-2">
                <p>{reagent.string}</p>
            </div>
        ))}
    </div>
</Modal>

        </div>
    );
};

export default RetroUploadResults;
