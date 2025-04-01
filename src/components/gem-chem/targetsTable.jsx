import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Loader from '../../components/Loader'; // Assuming you have a Loader component
import { IoSearchOutline } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TargetsTable = () => {
    const [chemblId, setChemblId] = useState(''); // State for ChEMBL ID input
    const [loading, setLoading] = useState(false);
    const [targetData, setTargetData] = useState([]); // State for target data
    const [showData, setShowData] = useState(false); // Show table data conditionally
    const [isValidationComplete, setIsValidationComplete] = useState(false); // Track validation status
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch data based on ChEMBL ID
    const fetchTargetData = async (id) => {
        setLoading(true);
        setShowData(false);

        try {
            const response = await fetch(`https://caitapimus.azure-api.net/genchem/api/v1/targets?q=CHEMBL${id}`, {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);

                if (data && Array.isArray(data.activities)) {
                    setTargetData(data.activities); // Set the activities array
                } else {
                    toast.error('Unexpected response format');
                    setTargetData([]); // Set to empty array to avoid mapping errors
                }

                setShowData(true);
            } else {
                throw new Error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error fetching target data.', {
                className: 'mt-16'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setChemblId(event.target.value);
    };

    // Handle search button click
    const handleSearchClick = () => {
        if (chemblId.length >= 3) {
            fetchTargetData(chemblId.slice(-3)); // Extract last 3 digits and fetch data
        } else {
            toast.error('Please enter at least 3 digits of ChEMBL ID.');
        }
    };

    // Define columns for AG Grid
    const columnDefs = [
        { headerName: 'ChEMBL ID', field: 'molecule_chembl_id', width: 150 }, 
        { headerName: 'Canonical SMILES', field: 'canonical_smiles', width: 500 }, 
        { headerName: 'Target Organism', field: 'target_organism', width: 250 }, 
        { headerName: 'Target Pref Name', field: 'target_pref_name', width: 200 }, 
    ];

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
    }), []);

    // Prepare row data from targetData
    const rowData = useMemo(() => {
        if (Array.isArray(targetData)) {
            return targetData.map((item) => ({
                molecule_chembl_id: item.molecule_chembl_id,
                canonical_smiles: item.canonical_smiles,
                target_organism: item.target_organism,
                target_pref_name: item.target_pref_name,
            }));
        } else {
            return []; // Return an empty array if targetData is not an array
        }
    }, [targetData]);

    // Function to handle file download
    const handleDownloadSMI = () => {
        const smilesData = targetData.map((item) => item.canonical_smiles).join('\n');
        const blob = new Blob([smilesData], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'smiles.smi';
        link.click();
    };

    // Validate all SMILES
    const validateSmiles = async () => {
        if (!targetData.length) {
            toast.error('No SMILES data available to validate.');
            return;
        }

        setLoading(true); // Show loader when validation starts

        // Create a file from SMILES data
        const smilesData = targetData.map((item) => item.canonical_smiles).join('\n');
        const blob = new Blob([smilesData], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', blob, 'smiles.smi'); // Attach the SMILES file

        try {
            const response = await axios.post('https://caitapimus.azure-api.net/api/smiles/v1/upload_smiles', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const validationResult = response.data;
            const updatedTargetData = targetData.map((item) => {
                const validationResultItem = validationResult.find(val => val.sequence === item.canonical_smiles);
                return {
                    ...item,
                    status: validationResultItem ? (validationResultItem.result === "Valid" ? 'Valid' : 'Invalid') : 'Invalid',
                };
            });

            setTargetData(updatedTargetData);
            toast.success('Your SMILES has been successfully validated', {
                className: 'mt-16'
            });
            setIsValidationComplete(true);
        } catch (error) {
            console.error('Error validating SMILES:', error);
            toast.error('Error validating SMILES.', {
                className: 'mt-16'
            });
        } finally {
            setLoading(false); 
        }
    };

    const handleNextClick = () => {
        const path = location.pathname.split('/');
        const projectId = path[path.length - 1];
        navigate(`/projects/generativeai/select-molecule/${projectId}`);
    };

    return (
        <>
            <div className='flex flex-row mx-6 items-center mt-6'>
                <input
                    type='text'
                    placeholder='Enter ChEMBL ID'
                    value={chemblId}
                    onChange={handleSearchChange}
                    className='pl-5 py-4 rounded-l-lg text-dark  text-sm w-[70%]'
                />
                <button
                    className=' bg-[#CBD5E0] text-[#222C3D]  rounded-r-lg text-md px-4 py-3.5 hover:bg-[#CBD5E0] focus:outline-none flex items-center'
                    onClick={handleSearchClick}
                >
                    Search
                    <IoSearchOutline size={24} className='ml-2' />
                </button>
                                    {/* Validate SMILES Button */}
                    <div className='flex justify-start ml-[1%] '>
                        <button
                            className='bg-[#8D6CBB] text-white font-semibold px-4 py-3 rounded-md hover:bg-[#735AA7] focus:outline-none'
                            onClick={validateSmiles}
                        >
                            Validate SMILES
                        </button>
                    </div>
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}

            {showData && (
                <>
                    <div className='mt-12 ml-6'>
                        <div className='ag-theme-alpine' style={{ height: 400, width: '90%' }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={rowData}
                                pagination={true}
                                paginationPageSize={10}
                            />
                        </div>
                    </div>

                    {/* Download SMILES as SMI file */}
                    <div className='flex justify-start ml-[6%] mt-6'>
                        {/* <button
                            className='bg-[#6CBB8D] text-white px-6 mt-4 py-2 rounded-md hover:bg-[#58A76D] focus:outline-none'
                            onClick={handleDownloadSMI}
                        >
                            Download SMILES as SMI
                        </button> */}
                    </div>


                    {/* Render Next button conditionally after the table */}
                    <div className='flex justify-center ml-[75%]'>
                        <button
                            className='bg-[#89AF3E] text-white px-6 py-2 rounded-md hover:bg-[#76a42b] focus:outline-none'
                            onClick={handleNextClick}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default TargetsTable;
