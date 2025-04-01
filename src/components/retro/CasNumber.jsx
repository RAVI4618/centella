import React, { useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import { toast } from 'sonner';

const CASNumber = ({ setSmileString, setActiveTab }) => {
    const [casNumber, setCasNumber] = useState('');

   
      // Add this function to handle CAS number API call
      const handleCasNumberSearch = async () => {
        try {
            const response = await fetch(
                `https://caitapimus.azure-api.net/retro-uat/get-smile-from-cas?casNumber=${casNumber}`,
                {
                    method: 'GET',
                    headers: {
                        'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Invalid response from the server');
            }

            // Get the response as text
            const responseText = await response.text();

            if (responseText.startsWith('No SMILES found for CAS:')) {
                // Handle specific invalid CAS number response
                toast.error('Invalid CAS number');
                // Stay in CAS tab
            } else if (responseText) {
                setSmileString(responseText);

                // Update the molecule in Ketcher if available
                if (window.ketcher) {
                    try {
                        await window.ketcher.setMolecule(responseText);
                    } catch (error) {
                        console.error('Error setting molecule in Ketcher:', error);
                    }
                }

                // Show success toast and switch to the "visual" tab
                toast.success('SMILES string retrieved successfully');
                setActiveTab('visual'); // Switch to SMILE tab
            } else {
                toast.error('No SMILES string found for this CAS number');
                // Stay in CAS tab
            }
        } catch (error) {
            console.error('Error fetching SMILES from CAS:', error);
            toast.error('An error occurred while retrieving the CAS number');
            // Stay in CAS tab
        }
    };

    return (
        <div className="flex flex-row sm:flex-row items-end w-full align-bottom">
            <div className="w-full relative mt-6">
                <input
                    type="text"
                    placeholder="Enter CAS Number (e.g., 117-39-5)"
                    className="w-full h-[32px] rounded-[5px] text-sm font-semibold px-3 py-[5px] border cursor-pointer pr-10"
                    value={casNumber}
                    onChange={(e) => setCasNumber(e.target.value)}
                />
                {casNumber && (
                    <IoIosClose
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#000000] font-semibold cursor-pointer"
                        onClick={() => setCasNumber('')}
                        size={28}
                    />
                )}
            </div>
            <button
                className="text-white px-4 h-[32px] ml-2 bg-[#735AA7] hover:bg-[#8A7DB8] active:bg-[#8A7DB8] focus:outline-none focus:ring focus:ring-violet-300 rounded-md"
                onClick={handleCasNumberSearch}
                disabled={!casNumber}
            >
                Search
            </button>
        </div>
    );
};

export default CASNumber;
